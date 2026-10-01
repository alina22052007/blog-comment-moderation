const Post = require('../models/Post');
const Comment = require('../models/Comment');

exports.listPosts = async (req, res) => {
  const posts = await Post.find().populate('author', 'name email').sort({ createdAt: -1 });
  res.json(posts);
};

exports.getPost = async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'name email');
  if (!post) return res.status(404).json({ message: 'Post not found' });
  res.json(post);
};

exports.createPost = async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });
  const post = await Post.create({ title, content, author: req.user.id });
  res.status(201).json(await post.populate('author', 'name email'));
};

exports.getComments = async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const isOwner = req.user && req.user.id === post.author.toString();
  const status = isOwner ? req.query.status : 'approved';
  const filter = { post: post._id };
  if (status) filter.status = status;
  const comments = await Comment.find(filter).populate('author', 'name email role').sort({ createdAt: -1 });
  res.json(comments);
};
