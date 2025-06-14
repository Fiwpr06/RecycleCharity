const express = require('express');
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
  getUserStats
} = require('../controllers/userController');
const { protect, adminOnly, resourceOwner } = require('../middleware/auth');
const {
  validateUserManagement,
  validateCreateUser
} = require('../middleware/validation');

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(protect);

// Admin only routes
router.get('/', adminOnly, getUsers);
router.post('/', adminOnly, validateCreateUser, createUser);
router.get('/stats', adminOnly, getUserStats);

// Routes cho cả admin và resource owner
router.get('/:id', resourceOwner, getUserById);

// Admin only routes với ID
router.put('/:id', adminOnly, validateUserManagement, updateUser);
router.delete('/:id', adminOnly, deleteUser);

module.exports = router;
