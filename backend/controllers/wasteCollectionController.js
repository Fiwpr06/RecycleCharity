const { validationResult } = require('express-validator');
const WasteCollection = require('../models/WasteCollection');
const User = require('../models/User');
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  validationErrorResponse
} = require('../utils/responseHelper');

// @desc    Tạo yêu cầu thu gom rác mới
// @route   POST /api/waste-collection
// @access  Private (User)
const createRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array());
    }

    const {
      contactInfo,
      wasteTypes,
      scheduledDate,
      notes
    } = req.body;

    // Tạo yêu cầu thu gom mới
    const wasteCollection = await WasteCollection.create({
      user: req.user._id,
      contactInfo,
      wasteTypes,
      scheduledDate,
      notes
    });

    // Thêm trạng thái ban đầu vào lịch sử
    wasteCollection.updateStatus('pending', req.user._id, 'Yêu cầu thu gom được tạo');
    await wasteCollection.save();

    // Populate user info
    await wasteCollection.populate('user', 'name email');

    successResponse(res, { wasteCollection }, 'Tạo yêu cầu thu gom thành công', 201);
  } catch (error) {
    console.error('Create waste collection error:', error);
    errorResponse(res, 'Lỗi server khi tạo yêu cầu thu gom');
  }
};

// @desc    Lấy danh sách yêu cầu thu gom của user hiện tại
// @route   GET /api/waste-collection/my-requests
// @access  Private (User)
const getMyRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const status = req.query.status;
    const query = { user: req.user._id };

    if (status && ['pending', 'confirmed', 'collected', 'completed', 'cancelled'].includes(status)) {
      query.status = status;
    }

    const wasteCollections = await WasteCollection.find(query)
      .populate('statusHistory.updatedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await WasteCollection.countDocuments(query);

    successResponse(res, {
      wasteCollections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Lấy danh sách yêu cầu thu gom thành công');
  } catch (error) {
    console.error('Get my requests error:', error);
    errorResponse(res, 'Lỗi server khi lấy danh sách yêu cầu thu gom');
  }
};

// @desc    Lấy chi tiết yêu cầu thu gom
// @route   GET /api/waste-collection/:id
// @access  Private (User - chỉ yêu cầu của mình, Admin - tất cả)
const getRequestById = async (req, res) => {
  try {
    const wasteCollection = await WasteCollection.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('statusHistory.updatedBy', 'name role');

    if (!wasteCollection) {
      return notFoundResponse(res, 'Không tìm thấy yêu cầu thu gom');
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && wasteCollection.user._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Bạn không có quyền xem yêu cầu này', 403);
    }

    successResponse(res, { wasteCollection }, 'Lấy thông tin yêu cầu thu gom thành công');
  } catch (error) {
    console.error('Get request by id error:', error);
    if (error.name === 'CastError') {
      return notFoundResponse(res, 'ID yêu cầu thu gom không hợp lệ');
    }
    errorResponse(res, 'Lỗi server khi lấy thông tin yêu cầu thu gom');
  }
};

// @desc    Cập nhật yêu cầu thu gom (chỉ khi status = pending)
// @route   PUT /api/waste-collection/:id
// @access  Private (User - chỉ yêu cầu của mình)
const updateRequest = async (req, res) => {
  try {
    const wasteCollection = await WasteCollection.findById(req.params.id);

    if (!wasteCollection) {
      return notFoundResponse(res, 'Không tìm thấy yêu cầu thu gom');
    }

    // Kiểm tra quyền sở hữu
    if (wasteCollection.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Bạn không có quyền sửa yêu cầu này', 403);
    }

    // Chỉ cho phép sửa khi status = pending
    if (wasteCollection.status !== 'pending') {
      return errorResponse(res, 'Chỉ có thể sửa yêu cầu đang chờ xử lý', 400);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return validationErrorResponse(res, errors.array());
    }

    const {
      contactInfo,
      wasteTypes,
      scheduledDate,
      notes
    } = req.body;

    // Cập nhật thông tin
    if (contactInfo) wasteCollection.contactInfo = contactInfo;
    if (wasteTypes) wasteCollection.wasteTypes = wasteTypes;
    if (scheduledDate) wasteCollection.scheduledDate = scheduledDate;
    if (notes !== undefined) wasteCollection.notes = notes;

    await wasteCollection.save();
    await wasteCollection.populate('user', 'name email');

    successResponse(res, { wasteCollection }, 'Cập nhật yêu cầu thu gom thành công');
  } catch (error) {
    console.error('Update request error:', error);
    if (error.name === 'CastError') {
      return notFoundResponse(res, 'ID yêu cầu thu gom không hợp lệ');
    }
    errorResponse(res, 'Lỗi server khi cập nhật yêu cầu thu gom');
  }
};

// @desc    Hủy yêu cầu thu gom
// @route   DELETE /api/waste-collection/:id
// @access  Private (User - chỉ yêu cầu của mình)
const cancelRequest = async (req, res) => {
  try {
    const wasteCollection = await WasteCollection.findById(req.params.id);

    if (!wasteCollection) {
      return notFoundResponse(res, 'Không tìm thấy yêu cầu thu gom');
    }

    // Kiểm tra quyền sở hữu
    if (wasteCollection.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 'Bạn không có quyền hủy yêu cầu này', 403);
    }

    // Chỉ cho phép hủy khi status = pending hoặc confirmed
    if (!['pending', 'confirmed'].includes(wasteCollection.status)) {
      return errorResponse(res, 'Không thể hủy yêu cầu ở trạng thái hiện tại', 400);
    }

    wasteCollection.updateStatus('cancelled', req.user._id, 'Người dùng hủy yêu cầu');
    await wasteCollection.save();

    successResponse(res, { wasteCollection }, 'Hủy yêu cầu thu gom thành công');
  } catch (error) {
    console.error('Cancel request error:', error);
    if (error.name === 'CastError') {
      return notFoundResponse(res, 'ID yêu cầu thu gom không hợp lệ');
    }
    errorResponse(res, 'Lỗi server khi hủy yêu cầu thu gom');
  }
};

// @desc    Lấy thống kê yêu cầu thu gom của user
// @route   GET /api/waste-collection/my-stats
// @access  Private (User)
const getMyStats = async (req, res) => {
  try {
    const stats = await WasteCollection.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          pendingRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          collectedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'collected'] }, 1, 0] }
          },
          completedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalPointsEarned: { $sum: '$totalPoints' }
        }
      }
    ]);

    const result = stats[0] || {
      totalRequests: 0,
      pendingRequests: 0,
      confirmedRequests: 0,
      collectedRequests: 0,
      completedRequests: 0,
      cancelledRequests: 0,
      totalPointsEarned: 0
    };

    successResponse(res, { stats: result }, 'Lấy thống kê thành công');
  } catch (error) {
    console.error('Get my stats error:', error);
    errorResponse(res, 'Lỗi server khi lấy thống kê');
  }
};

// ===== ADMIN FUNCTIONS =====

// @desc    Lấy tất cả yêu cầu thu gom (Admin only)
// @route   GET /api/waste-collection/admin/all
// @access  Private (Admin)
const getAllRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const status = req.query.status;
    const search = req.query.search || '';

    const query = {};
    if (status && ['pending', 'confirmed', 'collected', 'completed', 'cancelled'].includes(status)) {
      query.status = status;
    }

    // Tìm kiếm theo tên hoặc địa chỉ
    if (search) {
      query.$or = [
        { 'contactInfo.name': { $regex: search, $options: 'i' } },
        { 'contactInfo.address': { $regex: search, $options: 'i' } },
        { requestId: { $regex: search, $options: 'i' } }
      ];
    }

    const wasteCollections = await WasteCollection.find(query)
      .populate('user', 'name email')
      .populate('statusHistory.updatedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await WasteCollection.countDocuments(query);

    successResponse(res, {
      wasteCollections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Lấy danh sách yêu cầu thu gom thành công');
  } catch (error) {
    console.error('Get all requests error:', error);
    errorResponse(res, 'Lỗi server khi lấy danh sách yêu cầu thu gom');
  }
};

// @desc    Cập nhật trạng thái yêu cầu thu gom (Admin only)
// @route   PUT /api/waste-collection/admin/:id/status
// @access  Private (Admin)
const updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!['confirmed', 'collected', 'completed', 'cancelled'].includes(status)) {
      return errorResponse(res, 'Trạng thái không hợp lệ', 400);
    }

    const wasteCollection = await WasteCollection.findById(req.params.id);
    if (!wasteCollection) {
      return notFoundResponse(res, 'Không tìm thấy yêu cầu thu gom');
    }

    // Cập nhật trạng thái
    wasteCollection.updateStatus(status, req.user._id, note || '');

    if (status === 'confirmed') {
      wasteCollection.scheduledDate = req.body.scheduledDate || wasteCollection.scheduledDate;
    }

    await wasteCollection.save();
    await wasteCollection.populate(['user', 'statusHistory.updatedBy']);

    successResponse(res, { wasteCollection }, 'Cập nhật trạng thái thành công');
  } catch (error) {
    console.error('Update status error:', error);
    if (error.name === 'CastError') {
      return notFoundResponse(res, 'ID yêu cầu thu gom không hợp lệ');
    }
    errorResponse(res, 'Lỗi server khi cập nhật trạng thái');
  }
};

// @desc    Hoàn thành thu gom và tính điểm xu (Admin only)
// @route   PUT /api/waste-collection/admin/:id/complete
// @access  Private (Admin)
const completeCollection = async (req, res) => {
  try {
    const { wasteTypes, adminNotes } = req.body;

    const wasteCollection = await WasteCollection.findById(req.params.id);
    if (!wasteCollection) {
      return notFoundResponse(res, 'Không tìm thấy yêu cầu thu gom');
    }

    if (wasteCollection.status !== 'collected') {
      return errorResponse(res, 'Chỉ có thể hoàn thành yêu cầu đã thu gom', 400);
    }

    // Cập nhật khối lượng thực tế cho từng loại rác
    if (wasteTypes) {
      Object.keys(wasteTypes).forEach(type => {
        if (wasteCollection.wasteTypes[type] && wasteTypes[type].actual !== undefined) {
          wasteCollection.wasteTypes[type].actual = wasteTypes[type].actual;
        }
      });
    }

    // Tính tổng điểm xu
    const totalPoints = wasteCollection.calculateTotalPoints();

    // Cập nhật trạng thái
    wasteCollection.updateStatus('completed', req.user._id, 'Thu gom hoàn thành');
    wasteCollection.adminNotes = adminNotes;
    wasteCollection.collectedDate = new Date();

    await wasteCollection.save();

    // Cộng điểm cho user
    if (totalPoints > 0) {
      await User.findByIdAndUpdate(
        wasteCollection.user,
        { $inc: { points: totalPoints } }
      );
    }

    await wasteCollection.populate(['user', 'statusHistory.updatedBy']);

    successResponse(res, {
      wasteCollection,
      pointsAwarded: totalPoints
    }, 'Hoàn thành thu gom và tính điểm thành công');
  } catch (error) {
    console.error('Complete collection error:', error);
    if (error.name === 'CastError') {
      return notFoundResponse(res, 'ID yêu cầu thu gom không hợp lệ');
    }
    errorResponse(res, 'Lỗi server khi hoàn thành thu gom');
  }
};

// @desc    Lấy thống kê tổng quan (Admin only)
// @route   GET /api/waste-collection/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    const stats = await WasteCollection.aggregate([
      {
        $group: {
          _id: null,
          totalRequests: { $sum: 1 },
          pendingRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          collectedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'collected'] }, 1, 0] }
          },
          completedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          },
          totalPointsAwarded: { $sum: '$totalPoints' },
          totalMetalWeight: { $sum: '$wasteTypes.metal.actual' },
          totalPlasticWeight: { $sum: '$wasteTypes.plastic.actual' },
          totalPaperWeight: { $sum: '$wasteTypes.paper.actual' },
          totalGlassWeight: { $sum: '$wasteTypes.glass.actual' }
        }
      }
    ]);

    const result = stats[0] || {
      totalRequests: 0,
      pendingRequests: 0,
      confirmedRequests: 0,
      collectedRequests: 0,
      completedRequests: 0,
      cancelledRequests: 0,
      totalPointsAwarded: 0,
      totalMetalWeight: 0,
      totalPlasticWeight: 0,
      totalPaperWeight: 0,
      totalGlassWeight: 0
    };

    // Tính tổng khối lượng
    result.totalWeight = result.totalMetalWeight + result.totalPlasticWeight +
                        result.totalPaperWeight + result.totalGlassWeight;

    successResponse(res, { stats: result }, 'Lấy thống kê thành công');
  } catch (error) {
    console.error('Get admin stats error:', error);
    errorResponse(res, 'Lỗi server khi lấy thống kê');
  }
};

module.exports = {
  // User functions
  createRequest,
  getMyRequests,
  getRequestById,
  updateRequest,
  cancelRequest,
  getMyStats,

  // Admin functions
  getAllRequests,
  updateStatus,
  completeCollection,
  getAdminStats
};
