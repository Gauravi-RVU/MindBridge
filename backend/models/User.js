const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['student', 'counsellor', 'admin'], default: 'student' },
  college: { type: String, default: '' },
  department: { type: String, default: '' },
  year: { type: String, default: '' },
  avatar: { type: String, default: '' },
  isAnonymous: { type: Boolean, default: false },
  preferredLanguage: { type: String, default: 'en' },
  screeningScores: [{
    tool: { type: String, enum: ['PHQ-9', 'GAD-7', 'GHQ'] },
    score: Number,
    severity: String,
    date: { type: Date, default: Date.now }
  }],
  moodLogs: [{
    mood: { type: Number, min: 1, max: 5 },
    note: String,
    date: { type: Date, default: Date.now }
  }],
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
