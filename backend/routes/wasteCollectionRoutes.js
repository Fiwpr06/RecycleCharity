const express = require('express');
const {
  createRequest,
  getMyRequests,
  getRequestById,
  updateRequest,
  cancelRequest,
  getMyStats,
  getAllRequests,
  updateStatus,
  completeCollection,
  getAdminStats
} = require('../controllers/wasteCollectionController');
const { protect, adminOnly } = require('../middleware/auth');
const {
  validateWasteCollection,
  validateStatusUpdate,
  validateCompleteCollection
} = require('../middleware/validation');

const router = express.Router();

// ===== USER ROUTES =====

// @route   POST /api/waste-collection
// @desc    Tạo yêu cầu thu gom mới
// @access  Private (User)
router.post('/', protect, validateWasteCollection, createRequest);

// @route   GET /api/waste-collection/my-requests
// @desc    Lấy danh sách yêu cầu thu gom của user hiện tại
// @access  Private (User)
router.get('/my-requests', protect, getMyRequests);

// @route   GET /api/waste-collection/my-stats
// @desc    Lấy thống kê yêu cầu thu gom của user
// @access  Private (User)
router.get('/my-stats', protect, getMyStats);

// @route   GET /api/waste-collection/:id
// @desc    Lấy chi tiết yêu cầu thu gom
// @access  Private (User - chỉ yêu cầu của mình, Admin - tất cả)
router.get('/:id', protect, getRequestById);

// @route   PUT /api/waste-collection/:id
// @desc    Cập nhật yêu cầu thu gom (chỉ khi status = pending)
// @access  Private (User - chỉ yêu cầu của mình)
router.put('/:id', protect, validateWasteCollection, updateRequest);

// @route   DELETE /api/waste-collection/:id
// @desc    Hủy yêu cầu thu gom
// @access  Private (User - chỉ yêu cầu của mình)
router.delete('/:id', protect, cancelRequest);

// ===== ADMIN ROUTES =====

// @route   GET /api/waste-collection/admin/all
// @desc    Lấy tất cả yêu cầu thu gom (Admin only)
// @access  Private (Admin)
router.get('/admin/all', protect, adminOnly, getAllRequests);

// @route   GET /api/waste-collection/admin/stats
// @desc    Lấy thống kê tổng quan (Admin only)
// @access  Private (Admin)
router.get('/admin/stats', protect, adminOnly, getAdminStats);

// @route   PUT /api/waste-collection/admin/:id/status
// @desc    Cập nhật trạng thái yêu cầu thu gom (Admin only)
// @access  Private (Admin)
router.put('/admin/:id/status', protect, adminOnly, validateStatusUpdate, updateStatus);

// @route   PUT /api/waste-collection/admin/:id/complete
// @desc    Hoàn thành thu gom và tính điểm xu (Admin only)
// @access  Private (Admin)
router.put('/admin/:id/complete', protect, adminOnly, validateCompleteCollection, completeCollection);

module.exports = router;
