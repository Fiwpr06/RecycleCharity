const mongoose = require('mongoose');

const wasteCollectionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vui lòng chỉ định người dùng']
  },
  requestId: {
    type: String,
    unique: true
  },
  contactInfo: {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên liên hệ'],
      trim: true,
      maxlength: [100, 'Tên liên hệ không được vượt quá 100 ký tự']
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
      maxlength: [500, 'Địa chỉ không được vượt quá 500 ký tự']
    }
  },
  wasteTypes: {
    metal: {
      estimated: { type: Number, default: 0, min: 0 }, // kg ước tính
      actual: { type: Number, default: 0, min: 0 },    // kg thực tế
      points: { type: Number, default: 0, min: 0 }     // điểm xu nhận được
    },
    plastic: {
      estimated: { type: Number, default: 0, min: 0 },
      actual: { type: Number, default: 0, min: 0 },
      points: { type: Number, default: 0, min: 0 }
    },
    paper: {
      estimated: { type: Number, default: 0, min: 0 },
      actual: { type: Number, default: 0, min: 0 },
      points: { type: Number, default: 0, min: 0 }
    },
    glass: {
      estimated: { type: Number, default: 0, min: 0 },
      actual: { type: Number, default: 0, min: 0 },
      points: { type: Number, default: 0, min: 0 }
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'collected', 'completed', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'collected', 'completed', 'cancelled']
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  scheduledDate: {
    type: Date
  },
  collectedDate: {
    type: Date
  },
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    maxlength: [1000, 'Ghi chú không được vượt quá 1000 ký tự']
  },
  adminNotes: {
    type: String,
    maxlength: [1000, 'Ghi chú admin không được vượt quá 1000 ký tự']
  },
  images: [{
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Tạo requestId tự động
wasteCollectionSchema.pre('save', function(next) {
  if (!this.requestId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.requestId = `WC${timestamp}${random}`.toUpperCase();
  }
  next();
});

// Tính tổng điểm xu
wasteCollectionSchema.methods.calculateTotalPoints = function() {
  const rates = {
    metal: 20,   // 20 xu/kg
    plastic: 10, // 10 xu/kg
    paper: 5,    // 5 xu/kg
    glass: 3     // 3 xu/kg
  };

  let total = 0;
  Object.keys(this.wasteTypes).forEach(type => {
    const actual = this.wasteTypes[type].actual || 0;
    const points = actual * rates[type];
    this.wasteTypes[type].points = points;
    total += points;
  });

  this.totalPoints = total;
  return total;
};

// Cập nhật trạng thái
wasteCollectionSchema.methods.updateStatus = function(newStatus, updatedBy, note = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    updatedBy,
    updatedAt: new Date(),
    note
  });

  // Cập nhật ngày tương ứng
  if (newStatus === 'collected') {
    this.collectedDate = new Date();
  }
};

// Index cho tìm kiếm
wasteCollectionSchema.index({ user: 1, createdAt: -1 });
wasteCollectionSchema.index({ status: 1, createdAt: -1 });
wasteCollectionSchema.index({ requestId: 1 });

module.exports = mongoose.model('WasteCollection', wasteCollectionSchema);
