const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Document = require('../models/Document');
const Workspace = require('../models/Workspace');
const aiService = require('../services/aiService');
const { logAction } = require('../utils/auditLogger');

// @desc  Generate document summary from document.content
const generateSummary = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.documentId);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const summary = await aiService.generateSummary(doc);

    doc.aiSummary = summary;
    await doc.save();

    await Workspace.findByIdAndUpdate(doc.workspace, { $inc: { aiQueriesUsed: 1 } });
    await logAction({ workspace: doc.workspace, user: req.user._id, action: 'AI_SUMMARY', resource: 'Document', resourceId: doc._id, req });

    res.json({ success: true, summary });
  } catch (err) { next(err); }
};

// @desc  Get AI summary for document
const getSummary = async (req, res, next) => {
  try {
    const doc = await Document.findById(req.params.documentId);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, summary: doc.aiSummary || null });
  } catch (err) { next(err); }
};

// @desc  Create chat
const createChat = async (req, res, next) => {
  try {
    const { workspaceId, mode = 'workspace', targetDocumentId, targetFolderId, title } = req.body;
    const chat = await Chat.create({
      workspace: workspaceId, user: req.user._id, mode,
      targetDocument: targetDocumentId || null,
      targetFolder: targetFolderId || null,
      title: title || 'New Chat',
    });
    res.status(201).json({ success: true, chat });
  } catch (err) { next(err); }
};

// @desc  Get chats
const getChats = async (req, res, next) => {
  try {
    const { workspaceId } = req.query;
    const chats = await Chat.find({ workspace: workspaceId, user: req.user._id, isArchived: false })
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .populate('targetDocument', 'name fileType')
      .populate('targetFolder', 'name');
    res.json({ success: true, chats });
  } catch (err) { next(err); }
};

// @desc  Get single chat with messages
const getChat = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('targetDocument', 'name fileType').populate('targetFolder', 'name');
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });
    const messages = await Message.find({ chat: chat._id }).sort({ createdAt: 1 });
    res.json({ success: true, chat, messages });
  } catch (err) { next(err); }
};

/**
 * Build the context object passed to aiService.chat().
 * For document mode  → load the specific document with full content.
 * For folder mode    → load all documents in that folder, concatenate content.
 * For workspace mode → load up to 5 most-recently-updated docs with content.
 * The returned object shape: { name, fileType, content, description }
 */
async function buildChatContext(chat) {
  if (chat.mode === 'document' && chat.targetDocument) {
    const doc = await Document.findById(chat.targetDocument);
    if (!doc) return null;
    return {
      name: doc.name,
      originalName: doc.originalName,
      fileType: doc.fileType,
      description: doc.description,
      content: doc.content || '',
      metadata: doc.metadata,
    };
  }

  if (chat.mode === 'folder' && chat.targetFolder) {
    const docs = await Document.find({
      folder: chat.targetFolder,
      workspace: chat.workspace,
      isDeleted: false,
    }).limit(10).select('name content fileType');

    const combined = docs
      .filter(d => d.content)
      .map(d => `=== ${d.name} ===\n${d.content}`)
      .join('\n\n');

    return {
      name: `Folder (${docs.length} documents)`,
      fileType: 'folder',
      content: combined,
    };
  }

  // Workspace mode — grab up to 5 docs that have extracted content
  const docs = await Document.find({
    workspace: chat.workspace,
    isDeleted: false,
    content: { $exists: true, $ne: '' },
  }).sort({ updatedAt: -1 }).limit(5).select('name content fileType');

  if (docs.length === 0) {
    // Fallback: any doc even without content
    const anyDoc = await Document.findOne({ workspace: chat.workspace, isDeleted: false }).select('name fileType description');
    return anyDoc ? { name: anyDoc.name, fileType: anyDoc.fileType, content: '' } : null;
  }

  const combined = docs
    .map(d => `=== ${d.name} ===\n${d.content || '(no extracted text)'}`)
    .join('\n\n');

  return {
    name: `Workspace (${docs.length} documents)`,
    fileType: 'workspace',
    content: combined,
  };
}

// @desc  Send message — loads document.content and injects into AI prompt
const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ success: false, message: 'Chat not found' });

    const userMessage = await Message.create({ chat: chatId, role: 'user', content });

    // Build rich context with document content
    const context = await buildChatContext(chat);

    const history = await Message.find({ chat: chatId }).sort({ createdAt: 1 }).limit(10);
    const aiResponse = await aiService.chat(content, chat.mode, context, history);

    const assistantMessage = await Message.create({
      chat: chatId, role: 'assistant',
      content: aiResponse.content,
      sources: aiResponse.sources,
      suggestedFollowUps: aiResponse.suggestedFollowUps,
      tokens: aiResponse.tokens,
      model: aiResponse.model,
    });

    await Chat.findByIdAndUpdate(chatId, {
      $push: { messages: { $each: [userMessage._id, assistantMessage._id] } },
      $inc: { messageCount: 2 },
      lastMessageAt: new Date(),
    });

    await Workspace.findByIdAndUpdate(chat.workspace, { $inc: { aiQueriesUsed: 1 } });
    await logAction({ workspace: chat.workspace, user: req.user._id, action: 'AI_CHAT', resource: 'Chat', resourceId: chat._id, resourceName: chat.title, req });

    res.json({ success: true, userMessage, assistantMessage });
  } catch (err) { next(err); }
};

// @desc  Delete chat
const deleteChat = async (req, res, next) => {
  try {
    await Message.deleteMany({ chat: req.params.chatId });
    await Chat.findByIdAndDelete(req.params.chatId);
    res.json({ success: true, message: 'Chat deleted' });
  } catch (err) { next(err); }
};

module.exports = { generateSummary, getSummary, createChat, getChats, getChat, sendMessage, deleteChat };
