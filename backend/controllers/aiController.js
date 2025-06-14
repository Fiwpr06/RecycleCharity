const { GoogleGenerativeAI } = require('@google/generative-ai');
const { validationResult } = require('express-validator');
const { successResponse, errorResponse, validationErrorResponse } = require('../utils/responseHelper');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the generative model
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

// System prompt for recycling context
const SYSTEM_PROMPT = `Bạn là AI Tái Chế Thông Minh, một trợ lý AI chuyên về tái chế và bảo vệ môi trường tại Việt Nam.

Nhiệm vụ của bạn:
- Trả lời các câu hỏi về tái chế, phân loại rác, bảo vệ môi trường
- Đưa ra lời khuyên thực tế về cách tái chế các loại vật liệu
- Giải thích lợi ích của việc tái chế
- Hướng dẫn cách phân loại rác đúng cách
- Gợi ý các hoạt động bảo vệ môi trường

Quy tắc trả lời:
- Luôn trả lời bằng tiếng Việt
- Giữ câu trả lời ngắn gọn, dễ hiểu (tối đa 300 từ)
- Sử dụng ngôn ngữ thân thiện, tích cực
- Đưa ra thông tin chính xác và hữu ích

Format trình bày:
- Sử dụng ## để tạo tiêu đề phần (ví dụ: ## Các loại nhựa tái chế)
- Sử dụng **text** để nhấn mạnh từ khóa quan trọng
- Sử dụng bullet points (*) để liệt kê thông tin
- Sử dụng numbered lists (1. 2. 3.) cho các bước thực hiện
- Sử dụng backticks cho các ký hiệu hoặc mã số (ví dụ: PET, HDPE)
- Sử dụng ! để tạo ghi chú quan trọng (ví dụ: ! Lưu ý quan trọng)
- Sử dụng > để tạo tips hữu ích (ví dụ: > Mẹo: Rửa sạch trước khi tái chế)
- Chia nhỏ thông tin thành các đoạn ngắn dễ đọc
- Nếu không biết câu trả lời, hãy thừa nhận và gợi ý tìm hiểu thêm

Nếu câu hỏi không liên quan đến tái chế hoặc môi trường, hãy lịch sự chuyển hướng về chủ đề tái chế.`;

/**
 * Chat with AI about recycling topics
 */
const chatWithAI = async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array());
    }

    const { message } = req.body;

    // Check if Gemini API key is configured
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return errorResponse(res, 'AI service chưa được cấu hình. Vui lòng liên hệ quản trị viên', 500);
    }

    // Prepare the prompt with system context
    const fullPrompt = `${SYSTEM_PROMPT}\n\nCâu hỏi của người dùng: ${message.trim()}`;

    // Generate response from Gemini
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    // Return successful response
    return successResponse(res, {
      message: aiResponse,
      timestamp: new Date().toISOString()
    }, 'Phản hồi từ AI thành công');

  } catch (error) {
    console.error('AI Chat Error:', error);

    // Handle specific Gemini API errors
    if (error.message && error.message.includes('API_KEY')) {
      return errorResponse(res, 'Khóa API không hợp lệ. Vui lòng liên hệ quản trị viên', 500);
    }

    if (error.message && error.message.includes('SAFETY')) {
      return errorResponse(res, 'Câu hỏi của bạn có thể chứa nội dung không phù hợp. Vui lòng thử lại với câu hỏi khác', 400);
    }

    if (error.message && error.message.includes('QUOTA_EXCEEDED')) {
      return errorResponse(res, 'Dịch vụ AI tạm thời quá tải. Vui lòng thử lại sau', 503);
    }

    // Generic error response
    return errorResponse(res, 'Có lỗi xảy ra khi xử lý câu hỏi. Vui lòng thử lại sau', 500);
  }
};

/**
 * Get suggested questions for users
 */
const getSuggestedQuestions = async (req, res) => {
  try {
    const suggestedQuestions = [
      "Làm thế nào để phân loại rác đúng cách?",
      "Những loại nhựa nào có thể tái chế?",
      "Tái chế giấy có lợi ích gì?",
      "Cách xử lý rác thải điện tử an toàn?",
      "Làm sao để giảm rác thải nhựa hàng ngày?",
      "Rác hữu cơ có thể tái chế như thế nào?",
      "Lợi ích của việc tái chế đối với môi trường?",
      "Cách làm phân compost từ rác thải hữu cơ?"
    ];

    return successResponse(res, {
      questions: suggestedQuestions
    }, 'Lấy danh sách câu hỏi gợi ý thành công');

  } catch (error) {
    console.error('Get Suggested Questions Error:', error);
    return errorResponse(res, 'Có lỗi xảy ra khi lấy câu hỏi gợi ý', 500);
  }
};

module.exports = {
  chatWithAI,
  getSuggestedQuestions
};
