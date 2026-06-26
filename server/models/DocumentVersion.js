const mongoose = require('mongoose');

const documentVersionSchema = new mongoose.Schema({
  document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  version: { type: Number, required: true },
  filePath: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changeNote: { type: String, maxlength: 500 },
}, { timestamps: true });

module.exports = mongoose.model('DocumentVersion', documentVersionSchema);
