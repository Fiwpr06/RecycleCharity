// Helper functions để tạo response thống nhất

const successResponse = (res, data = null, message = 'Thành công', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, message = 'Có lỗi xảy ra', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: 'Dữ liệu không hợp lệ',
    errors
  });
};

const notFoundResponse = (res, message = 'Không tìm thấy tài nguyên') => {
  return res.status(404).json({
    success: false,
    message
  });
};

const unauthorizedResponse = (res, message = 'Không có quyền truy cập') => {
  return res.status(401).json({
    success: false,
    message
  });
};

const forbiddenResponse = (res, message = 'Bị cấm truy cập') => {
  return res.status(403).json({
    success: false,
    message
  });
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse
};
