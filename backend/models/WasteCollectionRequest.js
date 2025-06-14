const mongoose = require('mongoose');

const wasteCollectionRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: [true, 'Vui lòng nhập họ tên'],
    trim: true,
    maxlength: [100, 'Họ tên không được vượt quá 100 ký tự']
  },
  phone: {
    type: String,
    required: [true, 'Vui lòng nhập số điện thoại'],
    match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
  },
  address: {
    type: String,
    required: [true, 'Vui lòng nhập địa chỉ thu gom'],
    trim: true,
    maxlength: [300, 'Địa chỉ không được vượt quá 300 ký tự']
  },
  wasteTypes: [{
    type: String,
    enum: [
      'plastic', // Nhựa
      'paper', // Giấy
      'metal', // Kim loại
      'glass', // Thủy tinh
      'electronic', // Điện tử
      'organic', // Hữu cơ
      'other' // Khác
    ],
    required: true
  }],
  estimatedWeight: {
    type: Number,
    required: [true, 'Vui lòng nhập khối lượng ước tính'],
    min: [0.1, 'Khối lượng phải lớn hơn 0.1 kg'],
    max: [1000, 'Khối lượng không được vượt quá 1000 kg']
  },
  preferredDate: {
    type: Date,
    required: [true, 'Vui lòng chọn ngày thu gom mong muốn'],
    validate: {
      validator: function(date) {
        return date > new Date();
      },
      message: 'Ngày thu gom phải là ngày trong tương lai'
    }
  },
  preferredTime: {
    type: String,
    required: [true, 'Vui lòng chọn khung giờ thu gom'],
    enum: [
      'morning', // 7:00 - 11:00
      'afternoon', // 13:00 - 17:00
      'evening' // 17:00 - 19:00
    ]
  },
  notes: {
    type: String,
    maxlength: [500, 'Ghi chú không được vượt quá 500 ký tự'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    maxlength: [500, 'Ghi chú admin không được vượt quá 500 ký tự'],
    trim: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  actualCollectionDate: {
    type: Date
  },
  actualWeight: {
    type: Number,
    min: [0, 'Khối lượng thực tế không được âm']
  },
  pointsEarned: {
    type: Number,
    default: 0,
    min: [0, 'Điểm thưởng không được âm']
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
wasteCollectionRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual để format waste types
wasteCollectionRequestSchema.virtual('wasteTypesDisplay').get(function() {
  const typeMap = {
    plastic: 'Nhựa',
    paper: 'Giấy',
    metal: 'Kim loại',
    glass: 'Thủy tinh',
    electronic: 'Điện tử',
    organic: 'Hữu cơ',
    other: 'Khác'
  };
  return this.wasteTypes.map(type => typeMap[type]).join(', ');
});

// Virtual để format preferred time
wasteCollectionRequestSchema.virtual('preferredTimeDisplay').get(function() {
  const timeMap = {
    morning: '7:00 - 11:00',
    afternoon: '13:00 - 17:00',
    evening: '17:00 - 19:00'
  };
  return timeMap[this.preferredTime];
});

// Virtual để format status
wasteCollectionRequestSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  };
  return statusMap[this.status];
});

// Index để tối ưu query
wasteCollectionRequestSchema.index({ user: 1, createdAt: -1 });
wasteCollectionRequestSchema.index({ status: 1, createdAt: -1 });
wasteCollectionRequestSchema.index({ preferredDate: 1 });

module.exports = mongoose.model('WasteCollectionRequest', wasteCollectionRequestSchema);
