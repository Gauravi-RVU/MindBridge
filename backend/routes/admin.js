const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const ForumPost = require('../models/ForumPost');
const ChatSession = require('../models/ChatSession');
const { protect, authorize } = require('../middleware/auth');

// GET /api/admin/dashboard - Anonymous analytics
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const totalForumPosts = await ForumPost.countDocuments();
    const crisisChats = await ChatSession.countDocuments({ crisisDetected: true });

    // Screening severity distribution (anonymous aggregation)
    const screeningData = await User.aggregate([
      { $unwind: '$screeningScores' },
      { $group: { _id: { tool: '$screeningScores.tool', severity: '$screeningScores.severity' }, count: { $sum: 1 } } }
    ]);

    // Mood trends (anonymous)
    const moodTrends = await User.aggregate([
      { $unwind: '$moodLogs' },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$moodLogs.date' } }, avgMood: { $avg: '$moodLogs.mood' }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    // Appointments by month
    const appointmentTrends = await Appointment.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    res.json({ totalStudents, totalAppointments, pendingAppointments, totalForumPosts, crisisChats, screeningData, moodTrends, appointmentTrends });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/admin/users
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Users route
router.get('/users/all', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
