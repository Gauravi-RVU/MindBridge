const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'ai'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative', 'crisis'], default: 'neutral' }
});

const chatSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [messageSchema],
  sessionType: { type: String, enum: ['ai-support', 'crisis'], default: 'ai-support' },
  isActive: { type: Boolean, default: true },
  crisisDetected: { type: Boolean, default: false },
  summary: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
