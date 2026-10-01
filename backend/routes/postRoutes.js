const router = require('express').Router();
const protect = require('../middleware/authMiddleware');
const roles = require('../middleware/roleMiddleware');
const { listPosts, getPost, createPost, getComments } = require('../controllers/postController');
const { createComment } = require('../controllers/commentController');

router.get('/', listPosts);
router.get('/:id', getPost);
router.post('/', protect, roles('author'), createPost);
router.get('/:id/comments', getComments);
router.post('/:postId/comments', protect, createComment);
module.exports = router;
