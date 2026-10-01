const Comment = require('../models/Comment');
const Post = require('../models/Post');

exports.createComment = async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ message: 'Comment is required' });
  if (content.trim().length > 1000) return res.status(400).json({ message: 'Comment must be 1000 characters or fewer' });
  const post = await Post.findById(req.params.postId);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const comment = await Comment.create({ post: post._id, author: req.user.id, content: content.trim(), status: 'pending' });
  res.status(201).json({ message: 'Comment submitted for moderation', comment });
};

async function setStatus(req, res, status) {
  const comment = await Comment.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('author', 'name email role');
  if (!comment) return res.status(404).json({ message: 'Comment not found' });
  res.json({ message: `Comment ${status}`, comment });
}
exports.approve = (req, res) => setStatus(req, res, 'approved');
exports.reject = (req, res) => setStatus(req, res, 'rejected');

exports.pending = async (req, res) => {
  const comments = await Comment.find({ status: 'pending' }).populate('author', 'name email role').populate('post', 'title author').sort({ createdAt: -1 });
  res.json(comments);
};
