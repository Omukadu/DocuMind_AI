const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 255 },
  originalName: { type: String, required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileType: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  filePath: { type: String, required: true },
  status: { type: String, enum: ['uploading', 'processing', 'ready', 'failed'], default: 'processing' },
  processingError: String,
  tags: [{ type: String, trim: true, maxlength: 50 }],
  description: { type: String, maxlength: 1000 },
  content: { type: String },
  notes: { type: String, maxlength: 5000, default: '' },
  metadata: {
    pageCount: Number,
    wordCount: Number,
    author: String,
    createdDate: Date,
    modifiedDate: Date,
    language: String,
  },
  aiSummary: {
    executive: String,
    keyInsights: [String],
    risks: [String],
    importantDates: [String],
    actionItems: [String],
    generatedAt: Date,
    model: { type: String, default: 'ai' },
  },
  versions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DocumentVersion' }],
  currentVersion: { type: Number, default: 1 },
  isShared: { type: Boolean, default: false },
  shareSettings: {
    isPublic: { type: Boolean, default: false },
    password: String,
    expiresAt: Date,
    allowDownload: { type: Boolean, default: true },
  },
  viewCount: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  isFavorited: { type: Boolean, default: false },
  favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

documentSchema.index({ workspace: 1, folder: 1 });
documentSchema.index({ workspace: 1, status: 1 });
documentSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Document', documentSchema);
