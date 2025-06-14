const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Đã kết nối MongoDB');

    // Kiểm tra admin đã tồn tại chưa
    const adminExists = await User.findOne({ 
      email: process.env.ADMIN_EMAIL 
    });

    if (adminExists) {
      console.log('Admin đã tồn tại:', adminExists.email);
      process.exit(0);
    }

    // Tạo admin mới
    const admin = await User.create({
      name: 'Administrator',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
      phone: '0123456789',
      address: 'Hà Nội, Việt Nam'
    });

    console.log('Tạo admin thành công:');
    console.log('Email:', admin.email);
    console.log('Password:', process.env.ADMIN_PASSWORD);
    console.log('Role:', admin.role);

    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi tạo admin:', error);
    process.exit(1);
  }
};

createAdmin();
