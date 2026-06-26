const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  sources: [{
    document: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    excerpt: String,
    page: Number,
    relevanceScore: Number,
  }],
  suggestedFollowUps: [String],
  tokens: { type: Number, default: 0 },
  model: { type: String, default: 'ai' },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
