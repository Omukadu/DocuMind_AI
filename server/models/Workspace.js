const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500 },
  slug: { type: String, unique: true, lowercase: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  logo: { type: String, default: null },
  settings: {
    allowPublicSharing: { type: Boolean, default: true },
    defaultRole: { type: String, enum: ['editor', 'viewer'], default: 'viewer' },
    maxStorage: { type: Number, default: 107374182400 },
    aiQueriesLimit: { type: Number, default: 1000 },
  },
  storage: {
    used: { type: Number, default: 0 },
  },
  aiQueriesUsed: { type: Number, default: 0 },
  plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

workspaceSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Workspace', workspaceSchema);
