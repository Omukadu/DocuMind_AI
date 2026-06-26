const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 255, default: 'New Chat' },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mode: { type: String, enum: ['document', 'folder', 'workspace'], default: 'workspace' },
  targetDocument: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null },
  targetFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  messageCount: { type: Number, default: 0 },
  isArchived: { type: Boolean, default: false },
  lastMessageAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);
