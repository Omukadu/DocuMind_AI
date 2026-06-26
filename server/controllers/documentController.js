const Document = require('../models/Document');
const DocumentVersion = require('../models/DocumentVersion');
const Workspace = require('../models/Workspace');
const Folder = require('../models/Folder');
const path = require('path');
const fs = require('fs');
const { logAction } = require('../utils/auditLogger');
const { createNotification } = require('../services/notificationService');
const { extractText } = require('../services/textExtractor');

const getFileType = (mimeType, originalName) => {
  const ext = path.extname(originalName).slice(1).toLowerCase();
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || ['doc', 'docx'].includes(ext)) return 'word';
  if (mimeType.includes('excel') || ['xls', 'xlsx'].includes(ext)) return 'excel';
  if (mimeType.includes('powerpoint') || ['ppt', 'pptx'].includes(ext)) return 'powerpoint';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('csv') || ext === 'csv') return 'csv';
  if (mimeType.includes('text')) return 'text';
  return 'other';
};

// @desc  Upload documents
//        Pipeline: uploading → processing → extract text → save content → ready
const uploadDocuments = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const { workspaceId, folderId } = req.body;
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ success: false, message: 'Workspace not found' });

    const documents = [];
    let totalSize = 0;

    for (const file of req.files) {
      const fileType = getFileType(file.mimetype, file.originalname);

      // 1. Create with status 'processing'
      const doc = await Document.create({
        name: path.parse(file.originalname).name,
        originalName: file.originalname,
        workspace: workspaceId,
        folder: folderId || null,
        uploadedBy: req.user._id,
        fileType,
        mimeType: file.mimetype,
        size: file.size,
        filePath: file.path,
        status: 'processing',
        metadata: { wordCount: 0 },
      });

      // 2. Extract text content
      try {
        const { text, wordCount, pageCount } = await extractText(file.path, file.mimetype, file.originalname);
        await Document.findByIdAndUpdate(doc._id, {
          content: text || '',
          status: 'ready',
          metadata: {
            wordCount,
            ...(pageCount !== null ? { pageCount } : {}),
          },
        });
        doc.content = text || '';
        doc.status = 'ready';
        doc.metadata = { wordCount, ...(pageCount !== null ? { pageCount } : {}) };
      } catch (extractErr) {
        console.error(`Text extraction failed for ${file.originalname}:`, extractErr.message);
        await Document.findByIdAndUpdate(doc._id, {
          status: 'failed',
          processingError: extractErr.message,
          metadata: { wordCount: 0 },
        });
        doc.status = 'failed';
        doc.processingError = extractErr.message;
      }

      await DocumentVersion.create({
        document: doc._id, version: 1,
        filePath: file.path, size: file.size, uploadedBy: req.user._id,
      });

      totalSize += file.size;
      documents.push(doc);
    }

    await Workspace.findByIdAndUpdate(workspaceId, { $inc: { 'storage.used': totalSize } });
    if (folderId) await Folder.findByIdAndUpdate(folderId, { $inc: { documentCount: documents.length } });

    await logAction({
      workspace: workspaceId, user: req.user._id,
      action: 'UPLOAD_DOCUMENTS', resource: 'Document',
      details: { count: documents.length, totalSize }, req,
    });

    res.status(201).json({ success: true, documents, count: documents.length });
  } catch (err) { next(err); }
};

// @desc  Reprocess an already-uploaded document — extract/re-extract text content
const reprocessDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    if (!fs.existsSync(doc.filePath)) {
      return res.status(400).json({ success: false, message: 'File not found on disk — cannot reprocess' });
    }

    await Document.findByIdAndUpdate(doc._id, { status: 'processing' });

    try {
      const { text, wordCount, pageCount } = await extractText(doc.filePath, doc.mimeType, doc.originalName);
      const updated = await Document.findByIdAndUpdate(doc._id, {
        content: text || '',
        status: 'ready',
        processingError: null,
        metadata: {
          ...doc.metadata,
          wordCount,
          ...(pageCount !== null ? { pageCount } : {}),
        },
      }, { new: true });

      res.json({
        success: true,
        message: 'Document reprocessed successfully',
        document: updated,
        wordCount,
        contentLength: (text || '').length,
      });
    } catch (extractErr) {
      await Document.findByIdAndUpdate(doc._id, {
        status: 'failed',
        processingError: extractErr.message,
      });
      return res.status(500).json({ success: false, message: `Extraction failed: ${extractErr.message}` });
    }
  } catch (err) { next(err); }
};

// @desc  Get documents
const getDocuments = async (req, res, next) => {
  try {
    const { workspaceId, folderId, search, tags, fileType, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const query = { isDeleted: false };
    if (workspaceId) query.workspace = workspaceId;
    if (folderId === 'root') query.folder = null;
    else if (folderId) query.folder = folderId;
    if (search) query.$text = { $search: search };
    if (tags) query.tags = { $in: tags.split(',') };
    if (fileType) query.fileType = fileType;

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      Document.find(query).sort(sort).skip(skip).limit(Number(limit))
        .populate('uploadedBy', 'name avatar').populate('folder', 'name'),
      Document.countDocuments(query),
    ]);

    res.json({ success: true, documents: docs, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// @desc  Get single document
const getDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id)
      .populate('uploadedBy', 'name email avatar')
      .populate('folder', 'name');
    if (!doc || doc.isDeleted) return res.status(404).json({ success: false, message: 'Document not found' });
    await Document.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
    res.json({ success: true, document: doc });
  } catch (err) { next(err); }
};

// @desc  Update document
const updateDocument = async (req, res, next) => {
  try {
    const { name, description, tags, folder } = req.body;
    const doc = await Document.findByIdAndUpdate(
      req.params.id, { name, description, tags, folder }, { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    await logAction({ workspace: doc.workspace, user: req.user._id, action: 'UPDATE_DOCUMENT', resource: 'Document', resourceId: doc._id, resourceName: doc.name, req });
    res.json({ success: true, document: doc });
  } catch (err) { next(err); }
};

// @desc  Save document notes
const saveNotes = async (req, res, next) => {
  try {
    const { notes } = req.body;
    if (typeof notes !== 'string') {
      return res.status(400).json({ success: false, message: 'Notes must be a string' });
    }
    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { notes: notes.substring(0, 5000) },
      { new: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, notes: doc.notes });
  } catch (err) { next(err); }
};

// @desc  Delete document
const deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findByIdAndUpdate(req.params.id, { isDeleted: true, deletedAt: new Date() }, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    await logAction({ workspace: doc.workspace, user: req.user._id, action: 'DELETE_DOCUMENT', resource: 'Document', resourceId: doc._id, resourceName: doc.name, req });
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) { next(err); }
};

// @desc  Bulk delete
const bulkDelete = async (req, res, next) => {
  try {
    const { ids } = req.body;
    await Document.updateMany({ _id: { $in: ids } }, { isDeleted: true, deletedAt: new Date() });
    res.json({ success: true, message: `${ids.length} documents deleted` });
  } catch (err) { next(err); }
};

// @desc  Download document
const downloadDocument = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    if (!fs.existsSync(doc.filePath)) return res.status(404).json({ success: false, message: 'File not found on disk' });
    await Document.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });
    res.download(doc.filePath, doc.originalName);
  } catch (err) { next(err); }
};

// @desc  Toggle favorite
const toggleFavorite = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    const isFav = doc.favoritedBy.includes(req.user._id);
    const update = isFav
      ? { $pull: { favoritedBy: req.user._id } }
      : { $addToSet: { favoritedBy: req.user._id } };
    const updated = await Document.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, isFavorited: !isFav, document: updated });
  } catch (err) { next(err); }
};

// @desc  Move documents
const moveDocuments = async (req, res, next) => {
  try {
    const { ids, folderId } = req.body;
    await Document.updateMany({ _id: { $in: ids } }, { folder: folderId || null });
    res.json({ success: true, message: 'Documents moved' });
  } catch (err) { next(err); }
};

module.exports = {
  uploadDocuments, reprocessDocument,
  getDocuments, getDocument, updateDocument, saveNotes,
  deleteDocument, bulkDelete, downloadDocument, toggleFavorite, moveDocuments,
};
