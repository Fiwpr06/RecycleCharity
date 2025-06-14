const { body } = require('express-validator');

// Validation cho đăng ký
const validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tên hiển thị không được để trống')
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên hiển thị phải từ 2-50 ký tự'),

  body('username')
    .trim()
    .notEmpty()
    .withMessage('Tên tài khoản không được để trống')
    .isLength({ min: 3, max: 30 })
    .withMessage('Tên tài khoản phải từ 3-30 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Tên tài khoản chỉ được chứa chữ cái, số và dấu gạch dưới'),

  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),

  body('phone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại không hợp lệ'),

  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Địa chỉ không được vượt quá 200 ký tự')
];

// Validation cho đăng nhập
const validateLogin = [
  body('login')
    .notEmpty()
    .withMessage('Tên đăng nhập hoặc email không được để trống')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Tên đăng nhập hoặc email phải có ít nhất 3 ký tự'),

  body('password')
    .notEmpty()
    .withMessage('Mật khẩu không được để trống')
];

// Validation cho cập nhật thông tin cá nhân
const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên tài khoản phải từ 2-50 ký tự'),

  body('phone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại không hợp lệ'),

  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Địa chỉ không được vượt quá 200 ký tự')
];

// Validation cho đổi mật khẩu
const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mật khẩu hiện tại không được để trống'),

  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu mới phải có ít nhất 6 ký tự'),

  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Xác nhận mật khẩu không khớp');
      }
      return true;
    })
];

// Validation cho tạo/cập nhật user (Admin)
const validateUserManagement = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tên tài khoản không được để trống')
    .isLength({ min: 2, max: 50 })
    .withMessage('Tên tài khoản phải từ 2-50 ký tự'),

  body('email')
    .isEmail()
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('phone')
    .optional()
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại không hợp lệ'),

  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Địa chỉ không được vượt quá 200 ký tự'),

  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Vai trò phải là user hoặc admin'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Trạng thái active phải là true hoặc false')
];

// Validation cho tạo user mới (Admin) - bao gồm password
const validateCreateUser = [
  ...validateUserManagement,
  body('password')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự')
];

// Validation cho tạo yêu cầu thu gom
const validateWasteCollection = [
  body('contactInfo.name')
    .notEmpty()
    .withMessage('Tên liên hệ không được để trống')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tên liên hệ không được vượt quá 100 ký tự'),

  body('contactInfo.phone')
    .notEmpty()
    .withMessage('Số điện thoại không được để trống')
    .matches(/^[0-9]{10,11}$/)
    .withMessage('Số điện thoại không hợp lệ'),

  body('contactInfo.address')
    .notEmpty()
    .withMessage('Địa chỉ thu gom không được để trống')
    .trim()
    .isLength({ max: 500 })
    .withMessage('Địa chỉ không được vượt quá 500 ký tự'),

  body('wasteTypes.metal.estimated')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Khối lượng kim loại ước tính phải là số dương'),

  body('wasteTypes.plastic.estimated')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Khối lượng nhựa ước tính phải là số dương'),

  body('wasteTypes.paper.estimated')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Khối lượng giấy ước tính phải là số dương'),

  body('wasteTypes.glass.estimated')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Khối lượng thủy tinh ước tính phải là số dương'),

  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Ngày hẹn không hợp lệ'),

  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Ghi chú không được vượt quá 1000 ký tự')
];

// Validation cho cập nhật trạng thái (Admin)
const validateStatusUpdate = [
  body('status')
    .notEmpty()
    .withMessage('Trạng thái không được để trống')
    .isIn(['confirmed', 'collected', 'completed', 'cancelled'])
    .withMessage('Trạng thái không hợp lệ'),

  body('note')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Ghi chú không được vượt quá 1000 ký tự'),

  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Ngày hẹn không hợp lệ')
];

// Validation cho hoàn thành thu gom (Admin)
const validateCompleteCollection = [
  body('wasteTypes.metal.actual')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Khối lượng kim loại thực tế phải là số dương'),

  body('wasteTypes.plastic.actual')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Khối lượng nhựa thực tế phải là số dương'),

  body('wasteTypes.paper.actual')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Khối lượng giấy thực tế phải là số dương'),

  body('wasteTypes.glass.actual')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Khối lượng thủy tinh thực tế phải là số dương'),

  body('adminNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Ghi chú admin không được vượt quá 1000 ký tự')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateUserManagement,
  validateCreateUser,
  validateWasteCollection,
  validateStatusUpdate,
  validateCompleteCollection
};
