// API Service để gọi backend
class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:5001/api';
    this.token = localStorage.getItem('token');
  }

  // Helper method để tạo headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Helper method để xử lý response
  async handleResponse(response) {
    let data;

    try {
      data = await response.json();
    } catch (error) {
      throw new Error('Lỗi khi đọc response từ server');
    }

    if (!response.ok) {
      // Nếu có validation errors, hiển thị chi tiết
      if (data.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map(err => err.msg || err.message).join(', ');
        throw new Error(errorMessages);
      }

      throw new Error(data.message || `Lỗi HTTP ${response.status}`);
    }

    return data;
  }

  // Đăng ký
  async register(userData) {
    try {
      console.log('Registering user with data:', userData);

      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify(userData)
      });

      console.log('Register response status:', response.status);
      const data = await this.handleResponse(response);

      // Lưu token và user info
      if (data.data.token) {
        this.token = data.data.token;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  }

  // Đăng nhập
  async login(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(false),
        body: JSON.stringify(credentials)
      });

      const data = await this.handleResponse(response);

      // Lưu token và user info
      if (data.data.token) {
        this.token = data.data.token;
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Đăng xuất
  logout() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  }

  // Lấy thông tin user hiện tại
  async getMe() {
    try {
      const response = await fetch(`${this.baseURL}/auth/me`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get me error:', error);
      throw error;
    }
  }

  // Cập nhật thông tin cá nhân
  async updateProfile(userData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/me`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      const data = await this.handleResponse(response);

      // Cập nhật user info trong localStorage
      if (data.data.user) {
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  // Đổi mật khẩu
  async changePassword(passwordData) {
    try {
      const response = await fetch(`${this.baseURL}/auth/change-password`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(passwordData)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Admin: Lấy danh sách users
  async getUsers(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.baseURL}/users${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  // Admin: Tạo user mới
  async createUser(userData) {
    try {
      const response = await fetch(`${this.baseURL}/users`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  }

  // Admin: Cập nhật user
  async updateUser(userId, userData) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  // Admin: Xóa user
  async deleteUser(userId) {
    try {
      const response = await fetch(`${this.baseURL}/users/${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  // Admin: Lấy thống kê users
  async getUserStats() {
    try {
      const response = await fetch(`${this.baseURL}/users/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }

  // Kiểm tra user đã đăng nhập chưa
  isAuthenticated() {
    return !!this.token;
  }

  // Lấy thông tin user từ localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Kiểm tra user có phải admin không
  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }

  // ===== WASTE COLLECTION API =====

  // Tạo yêu cầu thu gom mới
  async createWasteCollection(data) {
    try {
      const response = await fetch(`${this.baseURL}/waste-collection`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Create waste collection error:', error);
      throw error;
    }
  }

  // Lấy danh sách yêu cầu thu gom của user
  async getMyWasteCollections(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.baseURL}/waste-collection/my-requests${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get my waste collections error:', error);
      throw error;
    }
  }

  // Lấy chi tiết yêu cầu thu gom
  async getWasteCollectionById(id) {
    try {
      const response = await fetch(`${this.baseURL}/waste-collection/${id}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get waste collection by id error:', error);
      throw error;
    }
  }

  // Cập nhật yêu cầu thu gom
  async updateWasteCollection(id, data) {
    try {
      const response = await fetch(`${this.baseURL}/waste-collection/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Update waste collection error:', error);
      throw error;
    }
  }

  // Hủy yêu cầu thu gom
  async cancelWasteCollection(id) {
    try {
      const response = await fetch(`${this.baseURL}/waste-collection/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Cancel waste collection error:', error);
      throw error;
    }
  }

  // Lấy thống kê yêu cầu thu gom của user
  async getMyWasteStats() {
    try {
      const response = await fetch(`${this.baseURL}/waste-collection/my-stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get my waste stats error:', error);
      throw error;
    }
  }

  // ===== ADMIN WASTE COLLECTION API =====

  // Lấy tất cả yêu cầu thu gom (Admin)
  async getAllWasteCollections(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${this.baseURL}/waste-collection/admin/all${queryString ? '?' + queryString : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get all waste collections error:', error);
      throw error;
    }
  }

  // Cập nhật trạng thái yêu cầu thu gom (Admin)
  async updateWasteCollectionStatus(id, data) {
    try {
      const response = await fetch(`${this.baseURL}/waste-collection/admin/${id}/status`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Update waste collection status error:', error);
      throw error;
    }
  }

  // Hoàn thành thu gom và tính điểm (Admin)
  async completeWasteCollection(id, data) {
    try {
      const response = await fetch(`${this.baseURL}/waste-collection/admin/${id}/complete`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Complete waste collection error:', error);
      throw error;
    }
  }

  // Lấy thống kê admin
  async getAdminWasteStats() {
    try {
      const response = await fetch(`${this.baseURL}/waste-collection/admin/stats`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('Get admin waste stats error:', error);
      throw error;
    }
  }
}

// Export instance
const apiService = new ApiService();
export default apiService;
