const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const phq9Questions = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure",
  "Trouble concentrating on things, such as reading or watching TV",
  "Moving or speaking so slowly that other people could have noticed",
  "Thoughts that you would be better off dead or hurting yourself"
];

const gad7Questions = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen"
];

const getSeverity = (tool, score) => {
  if (tool === 'PHQ-9') {
    if (score <= 4) return 'Minimal';
    if (score <= 9) return 'Mild';
    if (score <= 14) return 'Moderate';
    if (score <= 19) return 'Moderately Severe';
    return 'Severe';
  }
  if (tool === 'GAD-7') {
    if (score <= 4) return 'Minimal';
    if (score <= 9) return 'Mild';
    if (score <= 14) return 'Moderate';
    return 'Severe';
  }
  return 'Unknown';
};

// GET /api/screening/questions/:tool
router.get('/questions/:tool', protect, (req, res) => {
  const tool = req.params.tool.toUpperCase();
  const questions = tool === 'PHQ-9' ? phq9Questions : tool === 'GAD-7' ? gad7Questions : null;
  if (!questions) return res.status(400).json({ message: 'Invalid screening tool' });
  res.json({ tool, questions });
});

// POST /api/screening/submit
router.post('/submit', protect, async (req, res) => {
  try {
    const { tool, answers } = req.body;
    const score = answers.reduce((sum, val) => sum + Number(val), 0);
    const severity = getSeverity(tool, score);
    const user = await User.findById(req.user._id);
    user.screeningScores.push({ tool, score, severity });
    await user.save();
    res.json({ tool, score, severity, recommendation: severity === 'Severe' || severity === 'Moderately Severe' ? 'Please book an appointment with a counsellor immediately.' : severity === 'Moderate' ? 'Consider speaking with a counsellor.' : 'Continue monitoring your wellbeing.' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
