const router = require('express').Router();
const protect = require('../middleware/authMiddleware');
const roles = require('../middleware/roleMiddleware');
const { approve, reject, pending } = require('../controllers/commentController');
router.get('/pending', protect, roles('moderator'), pending);
router.patch('/:id/approve', protect, roles('moderator'), approve);
router.patch('/:id/reject', protect, roles('moderator'), reject);
module.exports = router;
