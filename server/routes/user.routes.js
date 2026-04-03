const express = require('express');
const { getAllUsers, verifyUser, updateProfile, getUserStats } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getAllUsers);
router.get('/stats', authorize('admin'), getUserStats);
router.patch('/profile', updateProfile);
router.patch('/:id/verify', authorize('admin'), verifyUser);

module.exports = router;
