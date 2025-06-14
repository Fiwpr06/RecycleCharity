const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vui lòng nhập tên hiển thị'],
    trim: true,
    maxlength: [50, 'Tên hiển thị không được vượt quá 50 ký tự']
  },
  username: {
    type: String,
    required: [true, 'Vui lòng nhập tên tài khoản'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Tên tài khoản phải có ít nhất 3 ký tự'],
    maxlength: [30, 'Tên tài khoản không được vượt quá 30 ký tự'],
    match: [/^[a-zA-Z0-9_]+$/, 'Tên tài khoản chỉ được chứa chữ cái, số và dấu gạch dưới']
  },
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Vui lòng nhập email hợp lệ'
    ]
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    match: [/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ']
  },
  address: {
    type: String,
    maxlength: [200, 'Địa chỉ không được vượt quá 200 ký tự']
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  },
  lastLogin: {
    type: Date,
    default: null
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

// Middleware để hash password trước khi save
userSchema.pre('save', async function(next) {
  // Chỉ hash password nếu nó được modify
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hash password với cost 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware để update updatedAt trước khi save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method để so sánh password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method để lấy thông tin user không bao gồm password
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Static method để tìm user active
userSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

module.exports = mongoose.model('User', userSchema);
