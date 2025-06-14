const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Cho phép guest gửi tin nhắn
  },
  name: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên'],
    trim: true,
    maxlength: [100, 'Họ tên không được vượt quá 100 ký tự']
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Vui lòng nhập email hợp lệ'
    ]
  },
  phone: {
    type: String,
    match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
  },
  subject: {
    type: String,
    required: [true, 'Vui lòng nhập chủ đề'],
    trim: true,
    maxlength: [200, 'Chủ đề không được vượt quá 200 ký tự']
  },
  message: {
    type: String,
    required: [true, 'Vui lòng nhập nội dung tin nhắn'],
    trim: true,
    maxlength: [2000, 'Nội dung tin nhắn không được vượt quá 2000 ký tự']
  },
  category: {
    type: String,
    enum: [
      'general', // Tổng quát
      'support', // Hỗ trợ
      'complaint', // Khiếu nại
      'suggestion', // Góp ý
      'partnership', // Hợp tác
      'waste_collection', // Thu gom rác
      'technical', // Kỹ thuật
      'other' // Khác
    ],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['new', 'read', 'in_progress', 'resolved', 'closed'],
    default: 'new'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  readAt: {
    type: Date
  },
  adminNotes: {
    type: String,
    maxlength: [1000, 'Ghi chú admin không được vượt quá 1000 ký tự'],
    trim: true
  },
  response: {
    type: String,
    maxlength: [2000, 'Phản hồi không được vượt quá 2000 ký tự'],
    trim: true
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  },
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware để update updatedAt
contactMessageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Tự động set readAt khi isRead = true
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  
  // Tự động set respondedAt khi có response
  if (this.isModified('response') && this.response && !this.respondedAt) {
    this.respondedAt = new Date();
    this.status = 'resolved';
  }
  
  next();
});

// Virtual để format category
contactMessageSchema.virtual('categoryDisplay').get(function() {
  const categoryMap = {
    general: 'Tổng quát',
    support: 'Hỗ trợ',
    complaint: 'Khiếu nại',
    suggestion: 'Góp ý',
    partnership: 'Hợp tác',
    waste_collection: 'Thu gom rác',
    technical: 'Kỹ thuật',
    other: 'Khác'
  };
  return categoryMap[this.category];
});

// Virtual để format priority
contactMessageSchema.virtual('priorityDisplay').get(function() {
  const priorityMap = {
    low: 'Thấp',
    medium: 'Trung bình',
    high: 'Cao',
    urgent: 'Khẩn cấp'
  };
  return priorityMap[this.priority];
});

// Virtual để format status
contactMessageSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    new: 'Mới',
    read: 'Đã đọc',
    in_progress: 'Đang xử lý',
    resolved: 'Đã giải quyết',
    closed: 'Đã đóng'
  };
  return statusMap[this.status];
});

// Method để đánh dấu đã đọc
contactMessageSchema.methods.markAsRead = function(adminId) {
  this.isRead = true;
  this.readBy = adminId;
  this.readAt = new Date();
  if (this.status === 'new') {
    this.status = 'read';
  }
  return this.save();
};

// Method để phản hồi
contactMessageSchema.methods.respond = function(response, adminId) {
  this.response = response;
  this.respondedBy = adminId;
  this.respondedAt = new Date();
  this.status = 'resolved';
  return this.save();
};

// Static method để lấy thống kê tin nhắn
contactMessageSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalMessages: { $sum: 1 },
        newMessages: {
          $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] }
        },
        readMessages: {
          $sum: { $cond: [{ $eq: ['$isRead', true] }, 1, 0] }
        },
        resolvedMessages: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        categoryStats: {
          $push: '$category'
        },
        priorityStats: {
          $push: '$priority'
        }
      }
    }
  ]);
};

// Index để tối ưu query
contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ category: 1, createdAt: -1 });
contactMessageSchema.index({ priority: 1, createdAt: -1 });
contactMessageSchema.index({ isRead: 1, createdAt: -1 });
contactMessageSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
