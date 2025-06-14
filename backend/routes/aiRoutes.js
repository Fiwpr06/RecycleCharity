const express = require('express');
const { body } = require('express-validator');
const { chatWithAI, getSuggestedQuestions } = require('../controllers/aiController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for AI chat - more restrictive to prevent abuse
const aiChatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ IP này. Vui lòng thử lại sau 1 phút',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for suggested questions - less restrictive
const suggestedQuestionsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ IP này. Vui lòng thử lại sau',
    error: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AI about recycling topics
 * @access  Public
 */
router.post('/chat',
  aiChatLimiter,
  [
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Câu hỏi không được để trống')
      .isLength({ min: 1, max: 1000 })
      .withMessage('Câu hỏi phải từ 1 đến 1000 ký tự')
      .escape() // Sanitize input to prevent XSS
  ],
  chatWithAI
);

/**
 * @route   GET /api/ai/suggested-questions
 * @desc    Get suggested questions for users
 * @access  Public
 */
router.get('/suggested-questions',
  suggestedQuestionsLimiter,
  getSuggestedQuestions
);

module.exports = router;
