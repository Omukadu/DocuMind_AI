const mongoose = require('mongoose');

const workspaceMemberSchema = new mongoose.Schema({
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['owner', 'admin', 'editor', 'viewer'], default: 'viewer' },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  invitedAt: { type: Date, default: Date.now },
  joinedAt: { type: Date },
  status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'active' },
  permissions: {
    canUpload: { type: Boolean, default: true },
    canDelete: { type: Boolean, default: false },
    canShare: { type: Boolean, default: true },
    canInvite: { type: Boolean, default: false },
    canManageWorkspace: { type: Boolean, default: false },
  },
}, { timestamps: true });

workspaceMemberSchema.index({ workspace: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('WorkspaceMember', workspaceMemberSchema);
