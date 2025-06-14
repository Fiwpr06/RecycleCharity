const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực token
const protect = async (req, res, next) => {
  let token;

  // Kiểm tra token trong header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Lấy thông tin user từ token (không bao gồm password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Không tìm thấy người dùng với token này'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Tài khoản đã bị vô hiệu hóa'
        });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không có quyền truy cập, token bị thiếu'
    });
  }
};

// Middleware phân quyền
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Vai trò ${req.user.role} không có quyền truy cập tài nguyên này`
      });
    }
    next();
  };
};

// Middleware kiểm tra quyền admin
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Chỉ admin mới có quyền truy cập'
    });
  }
  next();
};

// Middleware kiểm tra quyền sở hữu tài nguyên
const resourceOwner = (req, res, next) => {
  // Cho phép admin truy cập tất cả tài nguyên
  if (req.user.role === 'admin') {
    return next();
  }

  // Kiểm tra xem user có phải là chủ sở hữu tài nguyên không
  const resourceUserId = req.params.userId || req.params.id;
  
  if (req.user._id.toString() !== resourceUserId) {
    return res.status(403).json({
      success: false,
      message: 'Bạn chỉ có thể truy cập tài nguyên của chính mình'
    });
  }

  next();
};

module.exports = {
  protect,
  authorize,
  adminOnly,
  resourceOwner
};
