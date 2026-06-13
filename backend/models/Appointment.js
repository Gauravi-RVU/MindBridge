const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  counsellor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  type: { type: String, enum: ['in-person', 'online', 'phone'], default: 'in-person' },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  reason: { type: String, default: '' },
  notes: { type: String, default: '' },
  isAnonymous: { type: Boolean, default: false },
  meetingLink: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
