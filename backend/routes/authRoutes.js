const express = require('express');
const {
  register,
  login,
  getMe,
  updateMe,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, validateUpdateProfile, updateMe);
router.put('/change-password', protect, validateChangePassword, changePassword);

module.exports = router;
