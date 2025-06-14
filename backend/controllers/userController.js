const { validationResult } = require('express-validator');
const User = require('../models/User');
const {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse
} = require('../utils/responseHelper');

// @desc    Lấy danh sách tất cả users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Tìm kiếm theo tên hoặc email
    const search = req.query.search || '';
    const searchQuery = search ? {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    } : {};

    // Lọc theo role
    const role = req.query.role;
    if (role && ['user', 'admin'].includes(role)) {
      searchQuery.role = role;
    }

    // Lọc theo trạng thái active
    const isActive = req.query.isActive;
    if (isActive !== undefined) {
      searchQuery.isActive = isActive === 'true';
    }

    const users = await User.find(searchQuery)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(searchQuery);

    successResponse(res, {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    }, 'Lấy danh sách người dùng thành công');

  } catch (error) {
    console.error('Get users error:', error);
    errorResponse(res, 'Lỗi server khi lấy danh sách người dùng');
  }
};

// @desc    Lấy thông tin user theo ID
// @route   GET /api/users/:id
// @access  Private/Admin hoặc chính user đó
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return notFoundResponse(res, 'Không tìm thấy người dùng');
    }

    successResponse(res, { user }, 'Lấy thông tin người dùng thành công');
  } catch (error) {
    console.error('Get user by id error:', error);
    if (error.name === 'CastError') {
      return notFoundResponse(res, 'ID người dùng không hợp lệ');
    }
    errorResponse(res, 'Lỗi server khi lấy thông tin người dùng');
  }
};

// @desc    Cập nhật thông tin user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array());
    }

    const { name, email, phone, address, role, isActive } = req.body;

    // Kiểm tra email đã tồn tại (ngoại trừ user hiện tại)
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingUser) {
        return errorResponse(res, 'Email đã được sử dụng bởi người dùng khác', 400);
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address, role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return notFoundResponse(res, 'Không tìm thấy người dùng');
    }

    successResponse(res, { user }, 'Cập nhật thông tin người dùng thành công');
  } catch (error) {
    console.error('Update user error:', error);
    if (error.name === 'CastError') {
      return notFoundResponse(res, 'ID người dùng không hợp lệ');
    }
    errorResponse(res, 'Lỗi server khi cập nhật thông tin người dùng');
  }
};

// @desc    Xóa user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return notFoundResponse(res, 'Không tìm thấy người dùng');
    }

    // Không cho phép admin xóa chính mình
    if (user._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 'Bạn không thể xóa chính mình', 400);
    }

    await User.findByIdAndDelete(req.params.id);

    successResponse(res, null, 'Xóa người dùng thành công');
  } catch (error) {
    console.error('Delete user error:', error);
    if (error.name === 'CastError') {
      return notFoundResponse(res, 'ID người dùng không hợp lệ');
    }
    errorResponse(res, 'Lỗi server khi xóa người dùng');
  }
};

// @desc    Tạo user mới (Admin only)
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    // Kiểm tra validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array());
    }

    const { name, email, password, phone, address, role } = req.body;

    // Kiểm tra user đã tồn tại
    const userExists = await User.findOne({ email });
    if (userExists) {
      return errorResponse(res, 'Email đã được sử dụng', 400);
    }

    // Tạo user mới
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role: role || 'user'
    });

    // Trả về thông tin user (không bao gồm password)
    const userResponse = await User.findById(user._id).select('-password');

    successResponse(res, { user: userResponse }, 'Tạo người dùng thành công', 201);

  } catch (error) {
    console.error('Create user error:', error);
    errorResponse(res, 'Lỗi server khi tạo người dùng');
  }
};

// @desc    Thống kê users (Admin only)
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });

    // Thống kê user đăng ký theo tháng (6 tháng gần nhất)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    successResponse(res, {
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      regularUsers,
      monthlyRegistrations: monthlyStats
    }, 'Lấy thống kê người dùng thành công');

  } catch (error) {
    console.error('Get user stats error:', error);
    errorResponse(res, 'Lỗi server khi lấy thống kê người dùng');
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  createUser,
  getUserStats
};
