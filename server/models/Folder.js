const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 255 },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  color: { type: String, default: '#6366f1' },
  description: { type: String, maxlength: 500 },
  isShared: { type: Boolean, default: false },
  path: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Folder' }],
  documentCount: { type: Number, default: 0 },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
}, { timestamps: true });

folderSchema.index({ workspace: 1, parent: 1 });

module.exports = mongoose.model('Folder', folderSchema);
