/**
 * Profile Common Functions
 * Shared functionality across all profile pages with MongoDB integration
 */

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api'; // Adjust to your backend URL
const API_ENDPOINTS = {
  profile: '/user/profile',
  updateProfile: '/user/profile',
  auth: '/auth/me'
};

// Default profile data
const defaultProfileData = {
  _id: null,
  fullName: '',
  username: '',
  email: '',
  phone: '',
  address: '',
  role: 'Thành viên',
  gender: '',
  points: 0,
  accountId: '',
  accountCreated: null,
  lastLogin: null,
  loginCount: 0,
  lastActivity: null
};

// Profile data management with MongoDB integration
class ProfileManager {
  constructor() {
    this.data = { ...defaultProfileData };
    this.isLoading = false;
    this.init();
  }

  // Initialize profile manager
  async init() {
    try {
      await this.loadFromMongoDB();
      // Load data into forms after successful fetch
      this.loadIntoAllForms();
    } catch (error) {
      console.error('Failed to load from MongoDB, falling back to localStorage:', error);
      this.loadFromStorage();
      this.loadIntoAllForms();
    }
  }

  // Load data from MongoDB via API
  async loadFromMongoDB() {
    this.isLoading = true;

    try {
      // Show connection status
      if (window.connectionManager) {
        window.connectionManager.setSyncing(true);
      }

      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.profile}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 404) {
          throw new Error('Không tìm thấy thông tin người dùng.');
        } else {
          throw new Error(`Lỗi server: ${response.status}`);
        }
      }

      const userData = await response.json();
      this.data = { ...defaultProfileData, ...userData };

      // Cache in localStorage as backup
      this.saveToStorage();
      this.updateAllHeaders();

    } catch (error) {
      console.error('Error loading profile from MongoDB:', error);
      throw error;
    } finally {
      this.isLoading = false;

      // Hide connection status
      if (window.connectionManager) {
        window.connectionManager.setSyncing(false);
      }
    }
  }

  // Save data to MongoDB via API
  async saveToMongoDB() {
    this.isLoading = true;

    try {
      // Show connection status
      if (window.connectionManager) {
        window.connectionManager.setSyncing(true);
      }

      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.updateProfile}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.data)
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          throw new Error('Bạn không có quyền cập nhật thông tin này.');
        } else if (response.status === 422) {
          const errorData = await response.json();
          throw new Error(`Dữ liệu không hợp lệ: ${errorData.message || 'Vui lòng kiểm tra lại thông tin.'}`);
        } else {
          throw new Error(`Lỗi server: ${response.status}`);
        }
      }

      const updatedData = await response.json();
      this.data = { ...this.data, ...updatedData };

      // Update localStorage cache
      this.saveToStorage();
      this.updateAllHeaders();

      return updatedData;
    } catch (error) {
      console.error('Error saving profile to MongoDB:', error);
      throw error;
    } finally {
      this.isLoading = false;

      // Hide connection status
      if (window.connectionManager) {
        window.connectionManager.setSyncing(false);
      }
    }
  }

  // Get authentication token
  getAuthToken() {
    // Try multiple sources for auth token
    return localStorage.getItem('authToken') ||
           localStorage.getItem('token') ||
           sessionStorage.getItem('authToken') ||
           sessionStorage.getItem('token');
  }

  // Load data from localStorage (fallback)
  loadFromStorage() {
    const stored = localStorage.getItem('profileData');
    if (stored) {
      try {
        const parsedData = JSON.parse(stored);
        this.data = { ...defaultProfileData, ...parsedData };
        this.updateAllHeaders();
      } catch (error) {
        console.error('Error parsing stored profile data:', error);
        this.data = { ...defaultProfileData };
      }
    }
  }

  // Get authenticated user info (placeholder - integrate with your auth system)
  getAuthenticatedUser() {
    // This should integrate with your actual authentication system
    // For demo purposes, you can uncomment and modify this:

    // Check if user is logged in via your auth system
    const authData = localStorage.getItem('authUser');
    if (authData) {
      try {
        const user = JSON.parse(authData);
        return {
          fullName: user.name || user.fullName || '',
          username: user.username || '',
          email: user.email || '',
          phone: user.phone || '',
          address: user.address || '',
          points: user.points || 0,
          role: user.role || 'Thành viên',
          gender: user.gender || ''
        };
      } catch (error) {
        console.error('Error parsing auth user data:', error);
      }
    }

    return null;
  }

  // Demo function to set sample user data
  async setDemoUser() {
    const demoUser = {
      fullName: 'Trần Thị Mai',
      username: 'tranthimai',
      email: 'tranthimai@example.com',
      phone: '0987654321',
      address: 'Quận 1, TP.HCM',
      role: 'Thành viên',
      gender: 'female',
      points: 2500
    };

    return await this.updateData(demoUser);
  }

  // Save data to localStorage (cache)
  saveToStorage() {
    try {
      localStorage.setItem('profileData', JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving profile data to localStorage:', error);
    }
  }

  // Get profile data
  getData() {
    return { ...this.data };
  }

  // Update profile data (saves to MongoDB)
  async updateData(newData) {
    const oldData = { ...this.data };
    this.data = { ...this.data, ...newData };

    try {
      await this.saveToMongoDB();
      return { success: true, data: this.data };
    } catch (error) {
      // Rollback on error
      this.data = oldData;
      this.updateAllHeaders();
      return { success: false, error: error.message };
    }
  }

  // Refresh data from MongoDB
  async refreshData() {
    try {
      await this.loadFromMongoDB();
      this.loadIntoAllForms();
      return { success: true, data: this.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      // Show connection status
      if (window.connectionManager) {
        window.connectionManager.setSyncing(true);
      }

      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
      }

      const response = await fetch(`${API_BASE_URL}/user/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Mật khẩu hiện tại không đúng.');
        } else if (response.status === 422) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Mật khẩu mới không hợp lệ.');
        } else {
          throw new Error(`Lỗi server: ${response.status}`);
        }
      }

      const result = await response.json();
      return { success: true, message: result.message || 'Đổi mật khẩu thành công!' };

    } catch (error) {
      console.error('Error changing password:', error);
      return { success: false, error: error.message };
    } finally {
      // Hide connection status
      if (window.connectionManager) {
        window.connectionManager.setSyncing(false);
      }
    }
  }

  // Update header information across all pages
  updateAllHeaders() {
    const headerUserName = document.getElementById('headerUserName');
    const headerUserPoints = document.getElementById('headerUserPoints');

    if (headerUserName) {
      // Priority: fullName > username > email prefix > default
      let displayName = 'Người dùng';

      if (this.data.fullName && this.data.fullName.trim()) {
        displayName = this.data.fullName.trim();
      } else if (this.data.username && this.data.username.trim()) {
        displayName = this.data.username.trim();
      } else if (this.data.email && this.data.email.trim()) {
        // Extract name from email (before @)
        const emailPrefix = this.data.email.split('@')[0];
        displayName = emailPrefix || 'Người dùng';
      }

      headerUserName.textContent = displayName;
    }

    if (headerUserPoints) {
      headerUserPoints.textContent = this.data.points.toLocaleString();
    }

    // Update user points display in rewards page
    const userPointsDisplay = document.getElementById('userPoints');
    if (userPointsDisplay) {
      userPointsDisplay.textContent = this.data.points.toLocaleString();
    }
  }

  // Load profile data into form (for profile.html)
  loadIntoForm() {
    const elements = {
      'profileFullName': this.data.fullName,
      'profileName': this.data.username,
      'profileEmail': this.data.email,
      'profilePhone': this.data.phone,
      'profileAddress': this.data.address,
      'profileRole': this.data.role,
      'profileGender': this.data.gender
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value || '';
      }
    });
  }

  // Load data into all forms across different pages
  loadIntoAllForms() {
    // Load into profile form
    this.loadIntoForm();

    // Load into settings page
    this.loadAccountInfo();

    // Update all headers
    this.updateAllHeaders();
  }

  // Update from form (for profile.html) - async version
  async updateFromForm() {
    const formData = {
      fullName: document.getElementById('profileFullName')?.value || '',
      username: document.getElementById('profileName')?.value || '',
      phone: document.getElementById('profilePhone')?.value || '',
      address: document.getElementById('profileAddress')?.value || '',
      gender: document.getElementById('profileGender')?.value || ''
    };

    return await this.updateData(formData);
  }

  // Load account info into settings page
  loadAccountInfo() {
    const elements = {
      'accountId': this.data.accountId,
      'accountCreated': this.formatDate(this.data.accountCreated),
      'accountLastLogin': this.data.lastLogin,
      'loginCount': this.data.loginCount,
      'lastActivity': this.data.lastActivity
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value || '-';
      }
    });
  }

  // Format date for display
  formatDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return dateString;
    }
  }

  // Spend points (for rewards) - local only, needs database sync
  spendPoints(amount) {
    if (this.data.points >= amount) {
      this.data.points -= amount;
      this.saveToStorage();
      this.updateAllHeaders();
      return true;
    }
    return false;
  }

  // Add points - local only, needs database sync
  addPoints(amount) {
    this.data.points += amount;
    this.saveToStorage();
    this.updateAllHeaders();
  }

  // Spend points with database sync
  async spendPointsWithSync(amount, description = '') {
    if (this.data.points < amount) {
      return { success: false, error: 'Không đủ xu' };
    }

    const oldPoints = this.data.points;
    this.data.points -= amount;

    try {
      const result = await this.updateData({ points: this.data.points });
      if (result.success) {
        return { success: true, newPoints: this.data.points };
      } else {
        // Rollback on failure
        this.data.points = oldPoints;
        this.updateAllHeaders();
        return { success: false, error: result.error };
      }
    } catch (error) {
      // Rollback on error
      this.data.points = oldPoints;
      this.updateAllHeaders();
      return { success: false, error: error.message };
    }
  }
}

// Connection status manager
class ConnectionManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.statusElement = null;
    this.init();
  }

  init() {
    this.createStatusIndicator();
    this.bindEvents();
    this.updateStatus();
  }

  createStatusIndicator() {
    this.statusElement = document.createElement('div');
    this.statusElement.className = 'connection-status';
    this.statusElement.id = 'connectionStatus';
    document.body.appendChild(this.statusElement);
  }

  bindEvents() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateStatus();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateStatus();
    });
  }

  updateStatus(syncing = false) {
    if (!this.statusElement) return;

    if (syncing) {
      this.statusElement.className = 'connection-status syncing';
      this.statusElement.innerHTML = '<i class="bi bi-arrow-repeat me-1"></i>Đang đồng bộ...';
    } else if (this.isOnline) {
      this.statusElement.className = 'connection-status online';
      this.statusElement.innerHTML = '<i class="bi bi-wifi me-1"></i>Đã kết nối';
    } else {
      this.statusElement.className = 'connection-status offline';
      this.statusElement.innerHTML = '<i class="bi bi-wifi-off me-1"></i>Mất kết nối';
    }

    // Auto hide after 3 seconds if online
    if (this.isOnline && !syncing) {
      setTimeout(() => {
        if (this.statusElement) {
          this.statusElement.style.opacity = '0';
          setTimeout(() => {
            if (this.statusElement) {
              this.statusElement.style.display = 'none';
            }
          }, 300);
        }
      }, 3000);
    } else {
      this.statusElement.style.display = 'block';
      this.statusElement.style.opacity = '1';
    }
  }

  setSyncing(syncing) {
    this.updateStatus(syncing);
  }
}

// Loading overlay manager
class LoadingManager {
  constructor() {
    this.overlay = null;
  }

  show(message = 'Đang tải...') {
    if (this.overlay) return;

    this.overlay = document.createElement('div');
    this.overlay.className = 'loading-overlay';
    this.overlay.innerHTML = `
      <div class="loading-content">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p>${message}</p>
      </div>
    `;
    document.body.appendChild(this.overlay);
  }

  hide() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}

// Global instances
window.profileManager = new ProfileManager();
window.connectionManager = new ConnectionManager();
window.loadingManager = new LoadingManager();

// Sidebar functions
function toggleSidebar() {
  const sidebar = document.getElementById('profileSidebar');
  const content = document.getElementById('profileContent');

  sidebar.classList.toggle('collapsed');
  content.classList.toggle('expanded');
}

// Mobile sidebar toggle
function toggleMobileSidebar() {
  const sidebar = document.getElementById('profileSidebar');
  sidebar.classList.toggle('show');
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(event) {
  const sidebar = document.getElementById('profileSidebar');
  const toggle = document.querySelector('.navbar-toggle');

  if (window.innerWidth <= 768 &&
      !sidebar.contains(event.target) &&
      !toggle.contains(event.target)) {
    sidebar.classList.remove('show');
  }
});

// Profile logout function
function handleProfileLogout() {
  if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    // Import apiService if not already available
    if (typeof apiService !== 'undefined') {
      apiService.logout();
    } else {
      // Fallback logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = './index.html';
    }
  }
}

// Handle window resize
window.addEventListener('resize', function() {
  const sidebar = document.getElementById('profileSidebar');
  const content = document.getElementById('profileContent');

  if (window.innerWidth <= 768) {
    sidebar.classList.remove('collapsed');
    content.classList.remove('expanded');
  }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Update header information
  window.profileManager.updateAllHeaders();

  // Page-specific initialization
  const currentPage = window.location.pathname.split('/').pop();

  switch (currentPage) {
    case 'profile.html':
      initProfilePage();
      break;
    case 'profile-rewards.html':
      initRewardsPage();
      break;
    case 'profile-settings.html':
      initSettingsPage();
      break;
    case 'profile-password.html':
      initPasswordPage();
      break;
  }
});

// Page-specific initialization functions
function initProfilePage() {
  window.profileManager.loadIntoForm();

  // Form submission with loading state
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const submitBtn = profileForm.querySelector('button[type="submit"]');
      const feedback = document.getElementById('profileFormFeedback');

      // Show loading state
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="spinner-border spinner-border-sm me-2"></i>Đang cập nhật...';
      submitBtn.disabled = true;

      try {
        const result = await window.profileManager.updateFromForm();

        if (result.success) {
          feedback.innerHTML = '<div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>Thông tin đã được cập nhật thành công!</div>';
        } else {
          feedback.innerHTML = `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>Lỗi: ${result.error}</div>`;
        }
      } catch (error) {
        feedback.innerHTML = `<div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>Lỗi: ${error.message}</div>`;
      } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        // Clear message after 5 seconds
        setTimeout(() => {
          feedback.innerHTML = '';
        }, 5000);
      }
    });
  }

  // Reset form
  const resetBtn = document.getElementById('resetProfileBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', async function() {
      const result = await window.profileManager.refreshData();
      if (result.success) {
        window.profileManager.loadIntoForm();

        const feedback = document.getElementById('profileFormFeedback');
        if (feedback) {
          feedback.innerHTML = '<div class="alert alert-info"><i class="bi bi-arrow-clockwise me-2"></i>Đã khôi phục thông tin từ server.</div>';
          setTimeout(() => {
            feedback.innerHTML = '';
          }, 3000);
        }
      }
    });
  }

  // Demo user button
  const demoBtn = document.getElementById('demoUserBtn');
  if (demoBtn) {
    demoBtn.addEventListener('click', async function() {
      const originalText = demoBtn.innerHTML;
      demoBtn.innerHTML = '<i class="spinner-border spinner-border-sm me-2"></i>Loading...';
      demoBtn.disabled = true;

      try {
        const result = await window.profileManager.setDemoUser();
        window.profileManager.loadIntoForm();

        const feedback = document.getElementById('profileFormFeedback');
        if (feedback) {
          if (result.success) {
            feedback.innerHTML = '<div class="alert alert-info"><i class="bi bi-info-circle me-2"></i>Đã tải thông tin demo user và lưu vào database.</div>';
          } else {
            feedback.innerHTML = `<div class="alert alert-warning"><i class="bi bi-exclamation-triangle me-2"></i>Demo user loaded locally: ${result.error}</div>`;
          }

          setTimeout(() => {
            feedback.innerHTML = '';
          }, 3000);
        }
      } finally {
        demoBtn.innerHTML = originalText;
        demoBtn.disabled = false;
      }
    });
  }
}

function initRewardsPage() {
  // Handle reward exchange buttons
  const rewardButtons = document.querySelectorAll('.reward-card .btn-primary');

  rewardButtons.forEach(button => {
    button.addEventListener('click', async function(e) {
      e.preventDefault();

      // Get reward info from the card
      const card = this.closest('.reward-card');
      const rewardName = card.querySelector('.card-title').textContent;
      const costText = card.querySelector('.badge .fas.fa-coins').parentElement.textContent;
      const cost = parseInt(costText.match(/\d+/)[0]);

      // Confirm exchange
      if (!confirm(`Bạn có chắc muốn đổi "${rewardName}" với ${cost} xu?`)) {
        return;
      }

      // Check if user has enough points
      if (window.profileManager.data.points < cost) {
        alert(`Bạn không đủ xu để đổi món quà này. Cần ${cost} xu, bạn có ${window.profileManager.data.points} xu.`);
        return;
      }

      // Show loading state
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="spinner-border spinner-border-sm me-1"></i>Đang xử lý...';
      this.disabled = true;

      try {
        // Spend points with database sync
        const result = await window.profileManager.spendPointsWithSync(cost, `Đổi quà: ${rewardName}`);

        if (result.success) {
          alert(`Đổi quà thành công! Bạn đã sử dụng ${cost} xu. Số xu còn lại: ${result.newPoints} xu.`);

          // Update stock display (demo)
          const stockElement = card.querySelector('small');
          if (stockElement && stockElement.textContent.includes('Còn')) {
            const currentStock = parseInt(stockElement.textContent.match(/\d+/)[0]);
            if (currentStock > 0) {
              stockElement.textContent = `Còn ${currentStock - 1} món`;
              if (currentStock - 1 <= 5) {
                stockElement.className = 'text-warning';
              }
              if (currentStock - 1 === 0) {
                stockElement.textContent = 'Hết hàng';
                stockElement.className = 'text-danger';
                this.disabled = true;
                this.innerHTML = 'Hết hàng';
                return;
              }
            }
          }
        } else {
          alert('Lỗi đổi quà: ' + result.error);
        }
      } catch (error) {
        alert('Lỗi: ' + error.message);
      } finally {
        // Restore button state
        if (!this.disabled) {
          this.innerHTML = originalText;
          this.disabled = false;
        }
      }
    });
  });
}

function initSettingsPage() {
  window.profileManager.loadAccountInfo();
}

function initPasswordPage() {
  // Password change form
  const passwordForm = document.getElementById('changePasswordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmNewPassword').value;
      const feedback = document.getElementById('changePasswordFormFeedback');
      const submitBtn = passwordForm.querySelector('button[type="submit"]');

      // Clear previous feedback
      feedback.innerHTML = '';

      // Validation
      if (!currentPassword || !newPassword || !confirmPassword) {
        feedback.innerHTML = '<div class="alert alert-warning"><i class="bi bi-exclamation-triangle me-2"></i>Vui lòng điền đầy đủ thông tin.</div>';
        return;
      }

      if (newPassword !== confirmPassword) {
        feedback.innerHTML = '<div class="alert alert-warning"><i class="bi bi-exclamation-triangle me-2"></i>Mật khẩu mới và xác nhận mật khẩu không khớp.</div>';
        return;
      }

      if (newPassword.length < 6) {
        feedback.innerHTML = '<div class="alert alert-warning"><i class="bi bi-exclamation-triangle me-2"></i>Mật khẩu mới phải có ít nhất 6 ký tự.</div>';
        return;
      }

      // Show loading state
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="spinner-border spinner-border-sm me-2"></i>Đang xử lý...';
      submitBtn.disabled = true;

      try {
        const result = await window.profileManager.changePassword(currentPassword, newPassword);

        if (result.success) {
          feedback.innerHTML = '<div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>' + result.message + '</div>';
          // Clear form
          passwordForm.reset();
        } else {
          feedback.innerHTML = '<div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>' + result.error + '</div>';
        }
      } catch (error) {
        feedback.innerHTML = '<div class="alert alert-danger"><i class="bi bi-exclamation-triangle me-2"></i>Lỗi: ' + error.message + '</div>';
      } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        // Clear message after 5 seconds
        setTimeout(() => {
          feedback.innerHTML = '';
        }, 5000);
      }
    });
  }
}

// Show user feature content
function showUserFeature(feature) {
  const contentArea = document.getElementById('profileContent');
  if (!contentArea) return;

  switch (feature) {
    case 'waste-collection':
      showWasteCollectionRequests();
      break;
    case 'quiz-history':
      showQuizHistory();
      break;
    case 'chat-history':
      showChatHistory();
      break;
    case 'messages':
      showUserMessages();
      break;
    default:
      contentArea.innerHTML = `
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>
          Chức năng ${feature} đang được phát triển...
        </div>
      `;
  }
}

// Show waste collection requests
async function showWasteCollectionRequests() {
  const contentArea = document.getElementById('profileContent');
  if (!contentArea) return;

  try {
    // Check if apiService is available
    if (typeof window.apiService === 'undefined') {
      throw new Error('API Service chưa được tải. Vui lòng tải lại trang.');
    }

    const apiService = window.apiService;

    // Show loading
    contentArea.innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="mt-2">Đang tải danh sách yêu cầu thu gom...</p>
      </div>
    `;

    // Get waste collection requests
    const response = await apiService.getMyWasteCollections();
    const wasteCollections = response.data.wasteCollections || [];

    // Render waste collection list
    renderWasteCollectionList(wasteCollections);

  } catch (error) {
    console.error('Error loading waste collections:', error);
    contentArea.innerHTML = `
      <div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Có lỗi xảy ra khi tải danh sách yêu cầu thu gom: ${error.message}
      </div>
    `;
  }
}

function renderWasteCollectionList(wasteCollections) {
  const contentArea = document.getElementById('profileContent');
  if (!contentArea) return;

  if (wasteCollections.length === 0) {
    contentArea.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-recycle text-muted" style="font-size: 4rem;"></i>
        <h5 class="mt-3 text-muted">Chưa có yêu cầu thu gom nào</h5>
        <p class="text-muted">Hãy đăng ký thu gom rác tái chế để bảo vệ môi trường!</p>
        <a href="./collection.html" class="btn btn-primary">
          <i class="bi bi-plus-circle me-2"></i>Đăng ký thu gom
        </a>
      </div>
    `;
    return;
  }

  const statusLabels = {
    pending: { text: 'Chờ xử lý', class: 'warning' },
    confirmed: { text: 'Đã xác nhận', class: 'info' },
    collected: { text: 'Đã thu gom', class: 'primary' },
    completed: { text: 'Hoàn thành', class: 'success' },
    cancelled: { text: 'Đã hủy', class: 'secondary' }
  };

  const wasteTypeLabels = {
    metal: { name: 'Kim loại', icon: 'fas fa-cog', color: 'warning' },
    plastic: { name: 'Nhựa', icon: 'fas fa-bottle-water', color: 'info' },
    paper: { name: 'Giấy', icon: 'fas fa-newspaper', color: 'success' },
    glass: { name: 'Thủy tinh', icon: 'fas fa-wine-bottle', color: 'primary' }
  };

  let html = `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4><i class="bi bi-recycle me-2"></i>Lịch sử yêu cầu thu gom</h4>
      <a href="./collection.html" class="btn btn-primary">
        <i class="bi bi-plus-circle me-2"></i>Đăng ký mới
      </a>
    </div>

    <div class="alert alert-info mb-4">
      <i class="bi bi-info-circle me-2"></i>
      <strong>Quy trình xử lý:</strong> Yêu cầu của bạn sẽ được admin xem xét và xử lý.
      Bạn có thể theo dõi trạng thái tại đây.
    </div>

    <div class="row">
  `;

  wasteCollections.forEach(request => {
    const status = statusLabels[request.status] || { text: request.status, class: 'secondary' };
    const createdDate = new Date(request.createdAt).toLocaleDateString('vi-VN');

    // Get waste types with weight > 0
    const wasteTypesHtml = Object.keys(request.wasteTypes)
      .filter(type => request.wasteTypes[type].estimated > 0)
      .map(type => {
        const wasteType = wasteTypeLabels[type];
        const estimated = request.wasteTypes[type].estimated;
        const actual = request.wasteTypes[type].actual;
        return `
          <div class="d-flex align-items-center mb-1">
            <i class="${wasteType.icon} text-${wasteType.color} me-2"></i>
            <span>${wasteType.name}: ${estimated}kg${actual > 0 ? ` → ${actual}kg` : ''}</span>
          </div>
        `;
      }).join('');

    html += `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card h-100 border-0 shadow-sm">
          <div class="card-header bg-light border-0 d-flex justify-content-between align-items-center">
            <small class="text-muted">${request.requestId}</small>
            <span class="badge bg-${status.class}">${status.text}</span>
          </div>
          <div class="card-body">
            <h6 class="card-title">${request.contactInfo.name}</h6>
            <p class="card-text text-muted small mb-2">
              <i class="bi bi-geo-alt me-1"></i>${request.contactInfo.address}
            </p>
            <p class="card-text text-muted small mb-3">
              <i class="bi bi-calendar me-1"></i>Đăng ký: ${createdDate}
            </p>

            <div class="mb-3">
              <small class="text-muted fw-bold">Loại rác:</small>
              ${wasteTypesHtml}
            </div>

            ${request.totalPoints > 0 ? `
              <div class="alert alert-success py-2 mb-2">
                <i class="fas fa-coins me-1"></i>
                <strong>${request.totalPoints} xu</strong>
              </div>
            ` : ''}
          </div>
          <div class="card-footer bg-transparent border-0">
            <div class="d-grid">
              <button class="btn btn-outline-primary btn-sm"
                onclick="viewWasteCollectionDetails('${request._id}')">
                <i class="bi bi-eye me-1"></i>Xem chi tiết
              </button>
              ${request.status === 'pending' ? `
                <small class="text-muted mt-2 text-center">
                  <i class="bi bi-clock me-1"></i>Đang chờ admin xử lý
                </small>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  contentArea.innerHTML = html;
}

// View waste collection details
async function viewWasteCollectionDetails(id) {
  try {
    // Check if apiService is available
    if (typeof window.apiService === 'undefined') {
      alert('API Service chưa được tải. Vui lòng tải lại trang.');
      return;
    }

    const apiService = window.apiService;
    const response = await apiService.getWasteCollectionById(id);
    const request = response.data.wasteCollection;

    // Show details in modal
    showWasteCollectionModal(request);

  } catch (error) {
    console.error('Error loading waste collection details:', error);
    alert('Có lỗi xảy ra khi tải chi tiết yêu cầu.');
  }
}

function showWasteCollectionModal(request) {
  const statusLabels = {
    pending: { text: 'Chờ xử lý', class: 'warning', desc: 'Yêu cầu đang được admin xem xét' },
    confirmed: { text: 'Đã xác nhận', class: 'info', desc: 'Admin đã xác nhận và sẽ sắp xếp thu gom' },
    collected: { text: 'Đã thu gom', class: 'primary', desc: 'Đã thu gom thành công, đang xử lý điểm xu' },
    completed: { text: 'Hoàn thành', class: 'success', desc: 'Thu gom hoàn tất và điểm xu đã được cộng' },
    cancelled: { text: 'Đã hủy', class: 'secondary', desc: 'Yêu cầu đã bị hủy bởi admin' }
  };

  const status = statusLabels[request.status] || { text: request.status, class: 'secondary' };
  const createdDate = new Date(request.createdAt).toLocaleDateString('vi-VN');

  const modalHtml = `
    <div class="modal fade" id="wasteCollectionModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-recycle me-2"></i>Chi tiết yêu cầu thu gom
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Mã yêu cầu:</strong> ${request.requestId}
              </div>
              <div class="col-md-6">
                <span class="badge bg-${status.class}">${status.text}</span>
              </div>
            </div>

            <div class="alert alert-${status.class} alert-dismissible">
              <i class="bi bi-info-circle me-2"></i>
              <strong>Trạng thái:</strong> ${status.desc}
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Người liên hệ:</strong> ${request.contactInfo.name}
              </div>
              <div class="col-md-6">
                <strong>Điện thoại:</strong> ${request.contactInfo.phone}
              </div>
            </div>

            <div class="mb-3">
              <strong>Địa chỉ thu gom:</strong><br>
              ${request.contactInfo.address}
            </div>

            <div class="mb-3">
              <strong>Ngày đăng ký:</strong> ${createdDate}
            </div>

            ${request.totalPoints > 0 ? `
              <div class="alert alert-success">
                <i class="fas fa-coins me-2"></i>
                <strong>Điểm xu nhận được: ${request.totalPoints} xu</strong>
              </div>
            ` : ''}

            ${request.notes ? `
              <div class="mb-3">
                <strong>Ghi chú của bạn:</strong><br>
                <div class="bg-light p-2 rounded">${request.notes}</div>
              </div>
            ` : ''}

            ${request.adminNotes ? `
              <div class="mb-3">
                <strong>Ghi chú từ admin:</strong><br>
                <div class="bg-warning bg-opacity-10 p-2 rounded">${request.adminNotes}</div>
              </div>
            ` : ''}

            ${request.totalPoints > 0 ? `
              <div class="alert alert-success">
                <i class="fas fa-coins me-2"></i>
                <strong>Điểm xu đã nhận: ${request.totalPoints} xu</strong>
              </div>
            ` : ''}

            ${request.status === 'pending' ? `
              <div class="alert alert-info">
                <i class="bi bi-clock me-2"></i>
                Yêu cầu của bạn đang được admin xem xét. Vui lòng chờ thông báo.
              </div>
            ` : ''}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existingModal = document.getElementById('wasteCollectionModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('wasteCollectionModal'));
  modal.show();
}

// Export for use in other scripts
window.toggleSidebar = toggleSidebar;
window.toggleMobileSidebar = toggleMobileSidebar;
window.showUserFeature = showUserFeature;
window.viewWasteCollectionDetails = viewWasteCollectionDetails;
