const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  resourceName: String,
  details: { type: mongoose.Schema.Types.Mixed },
  ip: String,
  userAgent: String,
  success: { type: Boolean, default: true },
  errorMessage: String,
}, { timestamps: true });

auditLogSchema.index({ workspace: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
