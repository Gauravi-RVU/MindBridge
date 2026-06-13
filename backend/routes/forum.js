const express = require('express');
const router = express.Router();
const ForumPost = require('../models/ForumPost');
const { protect, authorize } = require('../middleware/auth');

// GET /api/forum
router.get('/', protect, async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { isModerated: false };
    if (category) query.category = category;
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { content: { $regex: search, $options: 'i' } }];
    const posts = await ForumPost.find(query)
      .populate('author', 'name avatar')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(50);

    // Hide author if anonymous
    const sanitized = posts.map(p => {
      const post = p.toObject();
      if (post.isAnonymous) post.author = { name: 'Anonymous Student' };
      return post;
    });
    res.json(sanitized);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/forum
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, category, isAnonymous, tags } = req.body;
    const post = await ForumPost.create({ title, content, category, isAnonymous, tags, author: req.user._id });
    res.status(201).json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/forum/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true })
      .populate('author', 'name avatar')
      .populate('replies.author', 'name avatar');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/forum/:id/reply
router.post('/:id/reply', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.replies.push({ author: req.user._id, content: req.body.content, isAnonymous: req.body.isAnonymous });
    await post.save();
    res.json(post);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/forum/:id/like
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    const liked = post.likes.includes(req.user._id);
    if (liked) post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
    else post.likes.push(req.user._id);
    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
