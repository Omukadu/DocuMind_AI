/**
 * Text Extraction Service
 * Extracts plain text from PDF, DOCX, and TXT files.
 * Extraction occurs during upload and on /reprocess.
 */

const fs = require('fs');
const path = require('path');

/**
 * Extract text content from a file on disk.
 * @param {string} filePath  — absolute path to the file
 * @param {string} mimeType  — MIME type of the file
 * @param {string} originalName — original file name (used as extension fallback)
 * @returns {{ text: string, wordCount: number, pageCount: number|null }}
 */
async function extractText(filePath, mimeType, originalName) {
  const ext = path.extname(originalName).slice(1).toLowerCase();

  // ── PDF ──────────────────────────────────────────────────────────────────────
  if (mimeType.includes('pdf') || ext === 'pdf') {
    const pdfParse = require('pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    const text = (data.text || '').trim();
    const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
    return { text, wordCount, pageCount: data.numpages || null };
  }

  // ── DOCX / DOC ───────────────────────────────────────────────────────────────
  if (
    mimeType.includes('word') ||
    mimeType.includes('officedocument.wordprocessingml') ||
    ext === 'docx' || ext === 'doc'
  ) {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ path: filePath });
    const text = (result.value || '').trim();
    const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
    return { text, wordCount, pageCount: null };
  }

  // ── Plain text / CSV / Markdown ───────────────────────────────────────────────
  if (
    mimeType.includes('text/') ||
    ['txt', 'md', 'csv', 'json', 'xml', 'html', 'htm', 'log'].includes(ext)
  ) {
    const text = fs.readFileSync(filePath, 'utf8').trim();
    const wordCount = text ? text.split(/\s+/).filter(Boolean).length : 0;
    return { text, wordCount, pageCount: null };
  }

  // ── Unsupported type — no text extraction ─────────────────────────────────────
  return { text: '', wordCount: 0, pageCount: null };
}

module.exports = { extractText };
