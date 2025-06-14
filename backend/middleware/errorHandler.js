const { errorResponse } = require('../utils/responseHelper');

// Middleware xử lý lỗi chung
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log lỗi
  console.error('Error:', err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Tài nguyên không tìm thấy';
    return errorResponse(res, message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Dữ liệu đã tồn tại';
    return errorResponse(res, message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    return errorResponse(res, message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token không hợp lệ';
    return errorResponse(res, message, 401);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token đã hết hạn';
    return errorResponse(res, message, 401);
  }

  // Default error
  errorResponse(res, error.message || 'Lỗi server', error.statusCode || 500);
};

// Middleware xử lý route không tồn tại
const notFound = (req, res, next) => {
  const error = new Error(`Không tìm thấy route ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};
