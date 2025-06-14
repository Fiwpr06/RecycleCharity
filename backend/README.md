# RecycleCharity Backend API

Backend API cho website RecycleCharity được xây dựng với Node.js, Express và MongoDB.

## Tính năng

- ✅ Đăng ký/Đăng nhập người dùng
- ✅ Xác thực JWT
- ✅ Phân quyền Admin/User
- ✅ Quản lý tài khoản người dùng
- ✅ Bảo mật với Helmet, CORS, Rate Limiting
- ✅ Validation dữ liệu
- ✅ Error handling
- ✅ Logging

## Cài đặt

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình môi trường

Sao chép file `.env.example` thành `.env` và cập nhật các giá trị:

```bash
cp .env.example .env
```

### 3. Khởi động MongoDB

Đảm bảo MongoDB đang chạy trên máy của bạn hoặc sử dụng MongoDB Atlas.

### 4. Tạo tài khoản Admin

```bash
npm run create-admin
```

### 5. Khởi động server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server sẽ chạy trên `http://localhost:5000`

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Đăng ký tài khoản mới | Public |
| POST | `/login` | Đăng nhập | Public |
| GET | `/me` | Lấy thông tin user hiện tại | Private |
| PUT | `/me` | Cập nhật thông tin cá nhân | Private |
| PUT | `/change-password` | Đổi mật khẩu | Private |

### User Management Routes (`/api/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Lấy danh sách users | Admin |
| POST | `/` | Tạo user mới | Admin |
| GET | `/stats` | Thống kê users | Admin |
| GET | `/:id` | Lấy thông tin user theo ID | Admin/Owner |
| PUT | `/:id` | Cập nhật thông tin user | Admin |
| DELETE | `/:id` | Xóa user | Admin |

### Health Check

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/health` | Kiểm tra trạng thái server | Public |

## Request/Response Examples

### Đăng ký

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "Password123",
  "phone": "0123456789",
  "address": "Hà Nội"
}
```

### Đăng nhập

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

### Response format

```json
{
  "success": true,
  "message": "Thành công",
  "data": {
    "user": {
      "_id": "...",
      "name": "Nguyễn Văn A",
      "email": "user@example.com",
      "role": "user"
    },
    "token": "jwt_token_here"
  }
}
```

## Cấu trúc thư mục

```
backend/
├── config/
│   └── database.js          # Cấu hình database
├── controllers/
│   ├── authController.js    # Controller xác thực
│   └── userController.js    # Controller quản lý user
├── middleware/
│   ├── auth.js             # Middleware xác thực
│   ├── validation.js       # Validation rules
│   └── errorHandler.js     # Xử lý lỗi
├── models/
│   └── User.js             # Model User
├── routes/
│   ├── authRoutes.js       # Routes xác thực
│   └── userRoutes.js       # Routes quản lý user
├── scripts/
│   └── createAdmin.js      # Script tạo admin
├── utils/
│   ├── generateToken.js    # Utility tạo JWT
│   └── responseHelper.js   # Helper response
├── .env                    # Biến môi trường
├── .env.example           # Template biến môi trường
├── package.json
├── server.js              # File chính
└── README.md
```

## Bảo mật

- JWT authentication
- Password hashing với bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- Error handling

## Scripts

```bash
# Khởi động development server
npm run dev

# Khởi động production server
npm start

# Tạo tài khoản admin
npm run create-admin
```

## Biến môi trường

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Port server | 5000 |
| NODE_ENV | Environment | development |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/recyclecharity |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRE | JWT expiration time | 7d |
| ADMIN_EMAIL | Admin email | admin@recyclecharity.com |
| ADMIN_PASSWORD | Admin password | admin123456 |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:1234 |
