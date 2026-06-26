/**
 * AI Service — Production Mode
 *
 * Supported providers (set in server/.env):
 *   AI_PROVIDER=gemini   GEMINI_API_KEY=...
 *   AI_PROVIDER=openai   OPENAI_API_KEY=...
 *
 * If no valid provider is configured the service throws an ApiError so the
 * caller can return a proper 503 instead of silently generating fake data.
 *
 * document.content is populated by textExtractor.js during upload / reprocess.
 * selectRelevantContent() picks the most relevant sections for large documents
 * instead of blindly truncating to a fixed character limit.
 */

// ─── Content selection for large documents ────────────────────────────────────
/**
 * Split content into paragraphs, score each by query relevance, return the
 * highest-scoring sections up to maxChars.
 *
 * @param {string} content   Full document text
 * @param {string} query     User question / keyword hint
 * @param {number} maxChars  Max characters to include (default 6 000)
 * @returns {{ selectedText: string, sections: Array<{title,text}> }}
 */
function selectRelevantContent(content, query = "", maxChars = 6000) {
  if (!content) return { selectedText: "", sections: [] };
  if (content.length <= maxChars) {
    return {
      selectedText: content,
      sections: [{ title: "Full document", text: content }],
    };
  }

  const queryTerms = query
    .toLowerCase()
    .split(/\W+/)
    .filter((t) => t.length > 3);

  const rawSections = content
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30);

  const scored = rawSections.map((text, idx) => {
    const lower = text.toLowerCase();
    const score = queryTerms.reduce((acc, term) => {
      return acc + (lower.match(new RegExp(term, "g")) || []).length;
    }, 0);
    const positionalBoost = idx === 0 || idx === rawSections.length - 1 ? 2 : 0;
    const firstLine = text.split("\n")[0].trim();
    const isHeading = /^[A-Z\d]/.test(firstLine) && firstLine.length < 100;
    return {
      title: isHeading ? firstLine : `Section ${idx + 1}`,
      text,
      score: score + positionalBoost,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const selected = [];
  let total = 0;
  for (const section of scored) {
    if (total + section.text.length > maxChars) {
      const remaining = maxChars - total;
      if (remaining > 200)
        selected.push({
          ...section,
          text: section.text.substring(0, remaining) + "...",
        });
      break;
    }
    selected.push(section);
    total += section.text.length;
  }

  return {
    selectedText: selected.map((s) => s.text).join("\n\n"),
    sections: selected,
  };
}

/**
 * Build structured citation objects from selected sections.
 */
function buildSources(documentName, sections = [], pageCount = null) {
  return sections.slice(0, 3).map((s, i) => ({
    documentName,
    section: s.title,
    excerpt: s.text.substring(0, 120).replace(/\s+/g, " ").trim() + "...",
    page: pageCount
      ? Math.max(
          1,
          Math.ceil((i + 1) * (pageCount / Math.max(sections.length, 1))),
        )
      : null,
    relevanceScore: Math.max(0.6, 0.98 - i * 0.08),
  }));
}

// ─── Provider guard ───────────────────────────────────────────────────────────
function noProviderError() {
  const err = new Error(
    "AI provider not configured. Set AI_PROVIDER=gemini and GEMINI_API_KEY in server/.env, " +
      "or AI_PROVIDER=openai and OPENAI_API_KEY.",
  );
  err.statusCode = 503;
  err.code = "AI_PROVIDER_NOT_CONFIGURED";
  return err;
}

// ─── AI Service ───────────────────────────────────────────────────────────────
class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || "";
  }

  async generateSummary(document) {
    switch (this.provider) {
      case "gemini":
        return this._geminiSummary(document);
      case "openai":
        return this._openaiSummary(document);
      default:
        throw noProviderError();
    }
  }

  async chat(message, mode, context, chatHistory = []) {
    switch (this.provider) {
      case "gemini":
        return this._geminiChat(message, mode, context, chatHistory);
      case "openai":
        return this._openaiChat(message, mode, context, chatHistory);
      default:
        throw noProviderError();
    }
  }

  // ─── Gemini ─────────────────────────────────────────────────────────────────

  async _geminiSummary(document) {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const { selectedText } = selectRelevantContent(
      document.content || "",
      "summary executive key insights risks action items dates",
      8000,
    );

    const contentSection = selectedText
      ? `Document content:\n${selectedText}`
      : `Document: "${document.name}" (${document.fileType}). No text was extracted from this file — the document may be image-based or in an unsupported format.`;

    const prompt = `You are a professional document analyst. Analyze the document below and return a JSON summary.

${contentSection}

Return valid JSON only with these exact fields:
{
  "executive": "2-3 sentence executive summary drawn from actual document content",
  "keyInsights": ["5 specific insights from the document"],
  "risks": ["3 specific risks identified in the document"],
  "importantDates": ["specific dates or deadlines mentioned"],
  "actionItems": ["5 specific action items from the document"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response
      .text()
      .replace(/```json\n?|\n?```/g, "")
      .trim();
    const parsed = JSON.parse(text);
    return { ...parsed, generatedAt: new Date(), model: "gemini-3.5-flash" };
  }

  async _geminiChat(message, mode, context, chatHistory) {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const { selectedText, sections } = selectRelevantContent(
      context?.content || "",
      message,
      6000,
    );

    const history = (chatHistory || [])
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-8)
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const contextBlock = selectedText
      ? `Document: "${context?.name || "unknown"}"\n\nRelevant content:\n${selectedText}`
      : `Document: "${context?.name}" — no extracted text available. Answer from document name and metadata only.`;

    const prompt = `You are DocuMind AI, an intelligent document assistant. Answer questions ONLY from the document content provided.

${contextBlock}

${history ? `Conversation history:\n${history}\n` : ""}
User: ${message}

Rules:
- Quote or paraphrase directly from the document content when possible
- If the content does not contain the answer, say so clearly
- Never claim you have no access to the document — content is provided above
- Cite section titles when relevant`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return {
      content: responseText,
      sources: buildSources(
        context?.name || "Document",
        sections,
        context?.metadata?.pageCount,
      ),
      suggestedFollowUps: this._followUps(message),
      tokens: Math.ceil(responseText.length / 4),
      model: "gemini-3.5-flash",
    };
  }

  // ─── OpenAI ──────────────────────────────────────────────────────────────────

  async _openaiSummary(document) {
    const OpenAI = require("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { selectedText } = selectRelevantContent(
      document.content || "",
      "summary executive key insights risks action items",
      8000,
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a professional document analyst. Return only valid JSON.",
        },
        {
          role: "user",
          content: `Analyze this document and return JSON with: executive, keyInsights (array 5), risks (array 3), importantDates (array), actionItems (array 5).\n\n${selectedText ? `Content:\n${selectedText}` : `File: "${document.name}" (${document.fileType}) — no extracted text.`}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    return {
      ...parsed,
      generatedAt: new Date(),
      model: completion.model,
      tokens: completion.usage?.total_tokens,
    };
  }

  async _openaiChat(message, mode, context, chatHistory) {
    const OpenAI = require("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const { selectedText, sections } = selectRelevantContent(
      context?.content || "",
      message,
      6000,
    );

    const systemContent = selectedText
      ? `You are DocuMind AI analyzing:\nDocument: "${context?.name}"\n\nContent:\n${selectedText}\n\nAnswer ONLY from the above content.`
      : `You are DocuMind AI analyzing "${context?.name || "workspace documents"}". No text content is available — be transparent about this.`;

    const messages = [
      { role: "system", content: systemContent },
      ...(chatHistory || [])
        .slice(-8)
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });
    const responseText = completion.choices[0].message.content;

    return {
      content: responseText,
      sources: buildSources(
        context?.name || "Document",
        sections,
        context?.metadata?.pageCount,
      ),
      suggestedFollowUps: this._followUps(message),
      tokens: completion.usage?.total_tokens || 0,
      model: completion.model,
    };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  _followUps(message) {
    const lc = (message || "").toLowerCase();
    if (lc.includes("risk"))
      return [
        "What mitigation strategies exist?",
        "Which risks are highest priority?",
        "Are there compliance risks?",
      ];
    if (lc.includes("summar"))
      return [
        "What are the key action items?",
        "What risks are mentioned?",
        "What are the important dates?",
      ];
    if (lc.includes("date"))
      return [
        "What happens after this deadline?",
        "Who is responsible for these dates?",
        "What are the milestones?",
      ];
    if (lc.includes("action"))
      return [
        "Who owns these action items?",
        "What are the deadlines?",
        "What risks are mentioned?",
      ];
    return [
      "Summarize this document",
      "What are the main risks?",
      "What are the action items?",
      "Are there any important dates?",
    ];
  }
}

module.exports = new AIService();
