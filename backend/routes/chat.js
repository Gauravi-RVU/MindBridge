const express = require('express');
const router = express.Router();
const ChatSession = require('../models/ChatSession');
const { protect } = require('../middleware/auth');

// Crisis keywords detection
const crisisKeywords = ['suicide', 'kill myself', 'end my life', 'want to die', 'self harm', 'hurt myself', 'no reason to live'];

const detectCrisis = (text) => crisisKeywords.some(kw => text.toLowerCase().includes(kw));

// AI response logic (rule-based for demo — replace with real AI API in production)
const getAIResponse = (message, history) => {
  const msg = message.toLowerCase();
  const isCrisis = detectCrisis(message);

  if (isCrisis) {
    return {
      content: "I'm very concerned about what you've shared. You're not alone, and help is available right now. Please reach out to iCall: 9152987821 or Vandrevala Foundation: 1860-2662-345 (24/7). Would you like me to help you book an appointment with a counsellor immediately?",
      sentiment: 'crisis'
    };
  }

  const responses = {
    anxious: { content: "It sounds like you're feeling anxious. That's really tough. Try the 4-7-8 breathing technique: breathe in for 4 counts, hold for 7, exhale for 8. Would you like to explore more coping strategies or talk to a counsellor?", sentiment: 'negative' },
    depressed: { content: "I hear you, and I'm glad you reached out. Feeling low is hard but you don't have to face it alone. Small steps matter — even getting outside for 5 minutes can help. Would you like to try a mood check-in or connect with a counsellor?", sentiment: 'negative' },
    stressed: { content: "Academic stress is real and valid. Let's break it down — what's the biggest thing weighing on you right now? Sometimes naming it helps. I can also suggest some focus techniques or connect you with peer support.", sentiment: 'negative' },
    sleep: { content: "Sleep issues often connect with stress and anxiety. Try a consistent bedtime, no screens 1 hour before bed, and a short body scan meditation. Would you like a guided relaxation audio from our resources?", sentiment: 'neutral' },
    lonely: { content: "Feeling lonely at college is more common than you think, and it's okay to admit it. Our peer support forum has students who truly understand. Would you like to explore it or chat more?", sentiment: 'negative' },
    good: { content: "That's wonderful to hear! 😊 Keeping a gratitude journal or mood log can help you maintain this positive energy. Is there anything on your mind you'd like to talk through?", sentiment: 'positive' },
    help: { content: "I'm here to help. You can: 1) Chat with me anytime 2) Book a counsellor appointment 3) Try our mental wellness resources 4) Join the peer support forum. What would you like to do?", sentiment: 'neutral' },
  };

  for (const [key, val] of Object.entries(responses)) {
    if (msg.includes(key)) return val;
  }

  return {
    content: "Thank you for sharing that with me. I want to make sure you feel supported. Can you tell me a bit more about what you're experiencing? I'm here to listen and help you find the right support.",
    sentiment: 'neutral'
  };
};

// POST /api/chat/message
router.post('/message', protect, async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    const isCrisis = detectCrisis(message);
    const aiResponse = getAIResponse(message);

    let session;
    if (sessionId) {
      session = await ChatSession.findById(sessionId);
    }
    if (!session) {
      session = await ChatSession.create({ user: req.user._id, messages: [], crisisDetected: isCrisis });
    }

    session.messages.push({ sender: 'user', content: message, sentiment: isCrisis ? 'crisis' : 'neutral' });
    session.messages.push({ sender: 'ai', content: aiResponse.content, sentiment: aiResponse.sentiment });
    if (isCrisis) session.crisisDetected = true;
    await session.save();

    res.json({ response: aiResponse.content, sessionId: session._id, crisisDetected: isCrisis, sentiment: aiResponse.sentiment });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/chat/sessions
router.get('/sessions', protect, async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(10);
    res.json(sessions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/chat/session/:id
router.get('/session/:id', protect, async (req, res) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
