const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' },
  type: {
    type: String,
    enum: ['team_activity', 'document_activity', 'ai_activity', 'security', 'system'],
    required: true,
  },
  category: {
    type: String,
    enum: [
      'member_joined', 'member_left', 'role_changed',
      'document_uploaded', 'document_shared', 'document_deleted', 'document_commented',
      'ai_summary_ready', 'ai_chat_response',
      'login_new_device', 'password_changed',
      'workspace_updated', 'invitation_received',
    ],
    required: true,
  },
  title: { type: String, required: true, maxlength: 255 },
  message: { type: String, required: true, maxlength: 1000 },
  link: String,
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetDocument: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
  isRead: { type: Boolean, default: false },
  readAt: Date,
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
