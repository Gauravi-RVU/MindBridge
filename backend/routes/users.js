const express = require('express');
const router = express.Router();
const User = require('../models/User'); // ← just import it, never redefine
const { protect } = require('../middleware/auth');

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, college, department, year, preferredLanguage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, college, department, year, preferredLanguage },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/users/mood
router.post('/mood', protect, async (req, res) => {
  try {
    const { mood, note } = req.body;
    const user = await User.findById(req.user._id);
    user.moodLogs.push({ mood, note });
    await user.save();
    res.json({ message: 'Mood logged', moodLogs: user.moodLogs.slice(-7) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/users/mood
router.get('/mood', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('moodLogs');
    res.json(user.moodLogs.slice(-30));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;