const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const { protect, authorize } = require('../middleware/auth');

// GET /api/resources
router.get('/', protect, async (req, res) => {
  try {
    const { category, type, language, search } = req.query;
    const query = {};
    if (category) query.category = category;
    if (type) query.type = type;
    if (language) query.language = language;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
    const resources = await Resource.find(query).sort({ isFeatured: -1, createdAt: -1 });
    res.json(resources);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/resources - Admin only
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json(resource);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/resources/:id/view
router.put('/:id/view', protect, async (req, res) => {
  try {
    await Resource.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
