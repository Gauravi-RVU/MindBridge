const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['video', 'audio', 'article', 'guide', 'exercise'], required: true },
  category: {
    type: String,
    enum: ['anxiety', 'depression', 'stress', 'sleep', 'mindfulness', 'relationships', 'academic', 'general'],
    required: true
  },
  language: { type: String, default: 'en' },
  url: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  duration: { type: String, default: '' },
  tags: [String],
  isFeatured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
