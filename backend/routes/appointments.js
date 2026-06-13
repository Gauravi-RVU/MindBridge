const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/appointments - Get user's appointments
router.get('/', protect, async (req, res) => {
  try {
    const query = req.user.role === 'counsellor'
      ? { counsellor: req.user._id }
      : { student: req.user._id };
    const appointments = await Appointment.find(query)
      .populate('student', 'name email college department')
      .populate('counsellor', 'name email')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/appointments - Book appointment
router.post('/', protect, async (req, res) => {
  try {
    const { counsellorId, date, timeSlot, type, reason, isAnonymous } = req.body;
    const counsellor = await User.findById(counsellorId);
    if (!counsellor || counsellor.role !== 'counsellor') {
      return res.status(404).json({ message: 'Counsellor not found' });
    }
    // Check slot availability
    const existing = await Appointment.findOne({ counsellor: counsellorId, date: new Date(date), timeSlot, status: { $ne: 'cancelled' } });
    if (existing) return res.status(400).json({ message: 'This time slot is already booked' });

    const appointment = await Appointment.create({
      student: req.user._id, counsellor: counsellorId, date, timeSlot, type, reason, isAnonymous
    });
    res.status(201).json(appointment);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/appointments/:id - Update status
router.put('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    Object.assign(appointment, req.body);
    await appointment.save();
    res.json(appointment);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/appointments/counsellors - List all counsellors
router.get('/counsellors/list', protect, async (req, res) => {
  try {
    const counsellors = await User.find({ role: 'counsellor', isActive: true }).select('-password');
    res.json(counsellors);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
