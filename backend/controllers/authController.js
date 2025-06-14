const { validationResult } = require('express-validator');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse
} = require('../utils/responseHelper');

// @desc    Đăng ký user mới
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array());
    }

    const { name, username, email, password, phone, address } = req.body;

    // Kiểm tra email đã tồn tại
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return errorResponse(res, 'Email đã được sử dụng', 400);
    }

    // Kiểm tra username đã tồn tại
    const usernameExists = await User.findOne({ username: username.toLowerCase() });
    if (usernameExists) {
      return errorResponse(res, 'Tên tài khoản đã được sử dụng', 400);
    }

    // Tạo user mới
    const user = await User.create({
      name,
      username: username.toLowerCase(),
      email,
      password,
      phone,
      address
    });

    // Tạo token
    const token = generateToken(user._id);

    // Trả về thông tin user và token
    successResponse(res, {
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        isActive: user.isActive,
        createdAt: user.createdAt
      },
      token
    }, 'Đăng ký thành công', 201);

  } catch (error) {
    console.error('Register error:', error);
    errorResponse(res, 'Lỗi server khi đăng ký');
  }
};

// @desc    Đăng nhập user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array());
    }

    const { login: loginField, password } = req.body;

    // Tìm user theo email hoặc username và include password để so sánh
    const user = await User.findOne({
      $or: [
        { email: loginField.toLowerCase() },
        { username: loginField.toLowerCase() }
      ]
    }).select('+password');

    if (!user) {
      return unauthorizedResponse(res, 'Tên đăng nhập/Email hoặc mật khẩu không đúng');
    }

    // Kiểm tra tài khoản có active không
    if (!user.isActive) {
      return unauthorizedResponse(res, 'Tài khoản đã bị vô hiệu hóa');
    }

    // Kiểm tra password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
      return unauthorizedResponse(res, 'Tên đăng nhập/Email hoặc mật khẩu không đúng');
    }

    // Cập nhật lastLogin
    const currentTime = new Date();
    await User.findByIdAndUpdate(user._id, { lastLogin: currentTime });

    // Tạo token
    const token = generateToken(user._id);

    // Trả về thông tin user và token (không bao gồm password)
    successResponse(res, {
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        avatar: user.avatar,
        isActive: user.isActive,
        lastLogin: currentTime,
        createdAt: user.createdAt
      },
      token
    }, 'Đăng nhập thành công');

  } catch (error) {
    console.error('Login error:', error);
    errorResponse(res, 'Lỗi server khi đăng nhập');
  }
};

// @desc    Lấy thông tin user hiện tại
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return notFoundResponse(res, 'Không tìm thấy thông tin người dùng');
    }

    successResponse(res, { user }, 'Lấy thông tin thành công');
  } catch (error) {
    console.error('Get me error:', error);
    errorResponse(res, 'Lỗi server khi lấy thông tin');
  }
};

// @desc    Cập nhật thông tin user hiện tại
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array());
    }

    const { name, phone, address } = req.body;

    // Build update object - only include fields that are provided
    const updateData = {};
    if (name !== undefined && name.trim() !== '') updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (address !== undefined) updateData.address = address.trim();

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return validationErrorResponse(res, [{ msg: 'Không có thông tin nào để cập nhật' }]);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return notFoundResponse(res, 'Không tìm thấy người dùng');
    }

    successResponse(res, { user }, 'Cập nhật thông tin thành công');
  } catch (error) {
    console.error('Update me error:', error);
    errorResponse(res, 'Lỗi server khi cập nhật thông tin');
  }
};

// @desc    Đổi mật khẩu
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array());
    }

    const { currentPassword, newPassword } = req.body;

    // Lấy user với password
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return notFoundResponse(res, 'Không tìm thấy người dùng');
    }

    // Kiểm tra mật khẩu hiện tại
    const isCurrentPasswordMatch = await user.matchPassword(currentPassword);
    if (!isCurrentPasswordMatch) {
      return unauthorizedResponse(res, 'Mật khẩu hiện tại không đúng');
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    successResponse(res, null, 'Đổi mật khẩu thành công');
  } catch (error) {
    console.error('Change password error:', error);
    errorResponse(res, 'Lỗi server khi đổi mật khẩu');
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  changePassword
};
