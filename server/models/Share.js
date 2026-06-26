const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const shareSchema = new mongoose.Schema({
  token: { type: String, default: uuidv4, unique: true },
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: true },
  password: { type: String, select: false },
  hasPassword: { type: Boolean, default: false },
  expiresAt: { type: Date, default: null },
  allowDownload: { type: Boolean, default: true },
  allowComments: { type: Boolean, default: false },
  accessLog: [{
    accessedAt: { type: Date, default: Date.now },
    ip: String,
    userAgent: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  viewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Share', shareSchema);
