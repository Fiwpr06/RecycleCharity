import apiService from './api.js';

// Make apiService available globally for profile-common.js
window.apiService = apiService;

class ProfileManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  async init() {
    // Kiểm tra authentication
    if (!apiService.isAuthenticated()) {
      window.location.href = './index.html';
      return;
    }

    this.setupEventListeners();
    // Load from cache first, then from API if needed
    await this.loadUserData(false);
  }

  setupEventListeners() {
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', this.handleUpdateProfile.bind(this));
    }

    // Reset profile button
    const resetProfileBtn = document.getElementById('resetProfileBtn');
    if (resetProfileBtn) {
      resetProfileBtn.addEventListener('click', this.resetProfileForm.bind(this));
    }

    // Change password form
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
      changePasswordForm.addEventListener('submit', this.handleChangePassword.bind(this));
    }
  }

  async loadUserData(forceRefresh = false) {
    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedUser = this.getCachedUserData();
        if (cachedUser) {
          console.log('Loading user data from cache');
          this.currentUser = cachedUser;
          this.populateProfileForm();
          this.populateAccountSettings();
          this.updateAdminVisibility();
          return;
        }
      }

      console.log('Loading user data from API');
      let response;
      try {
        response = await apiService.getMe();
        this.currentUser = response.data.user;
      } catch (error) {
        console.warn('API not available, using demo user data:', error);
        // Demo user data for testing - only when API is not available
        this.currentUser = {
          _id: 'demo-user-id',
          name: 'Demo User',
          username: 'demo', // Username != admin, no debug
          email: 'demo@example.com',
          role: 'user', // Regular user
          points: 1250,
          phone: '0901234567',
          address: 'Demo Address',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          isActive: true
        };
      }

      // Cache the user data
      this.cacheUserData(this.currentUser);

      this.populateProfileForm();
      this.populateAccountSettings();
      this.updateAdminVisibility();
    } catch (error) {
      console.error('Error loading user data:', error);
      this.showError('profileFormFeedback', 'Không thể tải thông tin người dùng');
    }
  }

  updateAdminVisibility() {
    const isAdmin = this.currentUser && this.currentUser.role === 'admin';
    const isAdminUsername = this.currentUser && this.currentUser.username === 'admin';

    // Admin elements (role-based)
    const adminElements = document.querySelectorAll('.admin-only');
    // Debug elements (username-based)
    const debugElements = document.querySelectorAll('.admin-debug');

    console.log('Current user:', this.currentUser);
    console.log('Is admin (role):', isAdmin);
    console.log('Is admin (username):', isAdminUsername);
    console.log('Admin elements found:', adminElements.length);
    console.log('Debug elements found:', debugElements.length);

    // Show/hide admin elements based on role
    adminElements.forEach(element => {
      if (isAdmin) {
        element.style.display = '';
        console.log('Showing admin element:', element);
      } else {
        element.style.display = 'none';
        console.log('Hiding admin element:', element);
      }
    });

    // Show/hide debug elements based on username
    debugElements.forEach(element => {
      if (isAdminUsername) {
        element.style.display = '';
        console.log('Showing debug element:', element);
      } else {
        element.style.display = 'none';
        console.log('Hiding debug element:', element);
      }
    });

    console.log('Admin visibility updated:', isAdmin ? 'Admin user' : 'Regular user');
    console.log('Debug visibility updated:', isAdminUsername ? 'Admin username' : 'Regular username');
  }

  getCachedUserData() {
    try {
      const cached = localStorage.getItem('cachedUserProfile');
      if (cached) {
        const data = JSON.parse(cached);
        // Check if cache is still valid (24 hours)
        const cacheTime = new Date(data.timestamp);
        const now = new Date();
        const hoursDiff = (now - cacheTime) / (1000 * 60 * 60);

        if (hoursDiff < 24) {
          return data.user;
        } else {
          // Cache expired, remove it
          localStorage.removeItem('cachedUserProfile');
        }
      }
    } catch (error) {
      console.error('Error reading cached user data:', error);
      localStorage.removeItem('cachedUserProfile');
    }
    return null;
  }

  cacheUserData(userData) {
    try {
      const cacheData = {
        user: userData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('cachedUserProfile', JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching user data:', error);
    }
  }

  clearUserCache() {
    localStorage.removeItem('cachedUserProfile');
  }

  populateProfileForm() {
    if (!this.currentUser) return;

    document.getElementById('profileName').value = this.currentUser.name || '';
    document.getElementById('profileEmail').value = this.currentUser.email || '';
    document.getElementById('profilePhone').value = this.currentUser.phone || '';
    document.getElementById('profileAddress').value = this.currentUser.address || '';
    document.getElementById('profileRole').value =
      this.currentUser.role === 'admin' ? 'Quản trị viên' : 'Thành viên';

    // Hiển thị menu admin nếu user là admin
    this.toggleAdminMenu();
  }

  toggleAdminMenu() {
    const adminElements = document.querySelectorAll('.admin-only');
    const isAdmin = this.currentUser && this.currentUser.role === 'admin';

    adminElements.forEach(element => {
      element.style.display = isAdmin ? 'block' : 'none';
    });

    // Load admin stats nếu là admin
    if (isAdmin) {
      this.loadAdminStats();
    }
  }

  async loadAdminStats() {
    try {
      // Load pending waste collection requests count
      const wasteResponse = await fetch('/api/waste-collection/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (wasteResponse.ok) {
        const wasteData = await wasteResponse.json();
        const pendingCount = wasteData.data.stats.pendingRequests || 0;
        const pendingBadge = document.getElementById('pendingRequestsCount');
        if (pendingBadge) {
          pendingBadge.textContent = pendingCount;
          pendingBadge.style.display = pendingCount > 0 ? 'inline' : 'none';
        }
      }

      // Load unread messages count
      const messagesResponse = await fetch('/api/contact/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        const unreadCount = messagesData.data.stats.newMessages || 0;
        const unreadBadge = document.getElementById('unreadMessagesCount');
        if (unreadBadge) {
          unreadBadge.textContent = unreadCount;
          unreadBadge.style.display = unreadCount > 0 ? 'inline' : 'none';
        }
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
    }
  }

  populateAccountSettings() {
    if (!this.currentUser) return;

    document.getElementById('accountId').textContent = this.currentUser._id;
    document.getElementById('accountCreated').textContent =
      new Date(this.currentUser.createdAt).toLocaleDateString('vi-VN');
    document.getElementById('accountLastLogin').textContent =
      this.currentUser.lastLogin ?
      new Date(this.currentUser.lastLogin).toLocaleDateString('vi-VN') : 'Chưa có';

    const statusElement = document.getElementById('accountStatus');
    if (this.currentUser.isActive) {
      statusElement.textContent = 'Hoạt động';
      statusElement.className = 'badge bg-success';
    } else {
      statusElement.textContent = 'Không hoạt động';
      statusElement.className = 'badge bg-danger';
    }
  }

  async handleUpdateProfile(e) {
    e.preventDefault();

    const name = document.getElementById('profileName').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();
    const address = document.getElementById('profileAddress').value.trim();
    const feedback = document.getElementById('profileFormFeedback');

    // Build update object - only include fields that have values
    const updateData = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      this.showError(feedback, 'Vui lòng nhập ít nhất một thông tin để cập nhật');
      return;
    }

    try {
      this.showLoading(feedback, 'Đang cập nhật thông tin...');

      const response = await apiService.updateProfile(updateData);

      // Update current user data
      this.currentUser = response.data.user;

      // Clear cache and refresh data
      this.clearUserCache();
      this.cacheUserData(this.currentUser);

      // Repopulate form with updated data
      this.populateProfileForm();
      this.populateAccountSettings();

      this.showSuccess(feedback, response.message || 'Cập nhật thông tin thành công!');

    } catch (error) {
      this.showError(feedback, error.message);
    }
  }

  resetProfileForm() {
    this.populateProfileForm();
    document.getElementById('profileFormFeedback').innerHTML = '';
  }

  // Method to force refresh data from API
  async refreshUserData() {
    console.log('Refreshing user data from API...');
    this.clearUserCache(); // Clear cache first
    await this.loadUserData(true);
    console.log('User data refreshed:', this.currentUser);
  }

  async handleChangePassword(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const feedback = document.getElementById('changePasswordFormFeedback');

    // Validate password confirmation
    if (newPassword !== confirmNewPassword) {
      this.showError(feedback, 'Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    // Validate password strength
    if (!this.validatePassword(newPassword)) {
      this.showError(feedback, 'Mật khẩu mới phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số');
      return;
    }

    try {
      this.showLoading(feedback, 'Đang đổi mật khẩu...');

      const response = await apiService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword: confirmNewPassword
      });

      this.showSuccess(feedback, response.message);

      // Reset form
      document.getElementById('changePasswordForm').reset();

    } catch (error) {
      this.showError(feedback, error.message);
    }
  }

  validatePassword(password) {
    // At least 6 characters, contains uppercase, lowercase, and number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return regex.test(password);
  }



  // Helper methods
  showLoading(element, message) {
    element.innerHTML = `
      <div class="alert alert-info d-flex align-items-center" role="alert">
        <div class="spinner-border spinner-border-sm me-2" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        ${message}
      </div>
    `;
  }

  showSuccess(element, message) {
    element.innerHTML = `
      <div class="alert alert-success" role="alert">
        <i class="bi bi-check-circle me-2"></i>${message}
      </div>
    `;
  }

  showError(element, message) {
    element.innerHTML = `
      <div class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle me-2"></i>${message}
      </div>
    `;
  }
}

// Sidebar toggle function
function toggleSidebar() {
  const sidebar = document.getElementById('profileSidebar');
  const content = document.getElementById('profileContent');

  if (sidebar && content) {
    sidebar.classList.toggle('collapsed');
    content.classList.toggle('expanded');
  }
}

// Note: showUserFeature is now defined in profile-common.js

// Show admin feature
function showAdminFeature(feature) {
  console.log('Admin feature requested:', feature);

  // Update active state
  document.querySelectorAll('.list-group-item').forEach(item => {
    item.classList.remove('active');
  });
  event.target.closest('.list-group-item').classList.add('active');

  // Show feature content
  const content = document.getElementById('profileContent');
  if (content) {
    switch (feature) {
      case 'waste-requests':
        showAdminWasteRequests();
        break;
      case 'messages':
        showAdminMessages();
        break;
      case 'users':
        showAdminUsers();
        break;
      case 'stats':
        showAdminStats();
        break;
      default:
        showAdminPlaceholder(feature);
    }
  }
}

// Show admin waste collection requests management
async function showAdminWasteRequests() {
  const content = document.getElementById('profileContent');
  if (!content) return;

  try {
    // Show loading
    content.innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="mt-2">Đang tải danh sách yêu cầu thu gom...</p>
      </div>
    `;

    // Get all waste collection requests
    let wasteCollections = [];
    try {
      const response = await apiService.getAllWasteCollections();
      wasteCollections = response.data.wasteCollections || [];
    } catch (error) {
      console.warn('API not available, using mock data for demo:', error);
      // Mock data for demo purposes
      wasteCollections = [
        {
          _id: 'mock1',
          requestId: 'WC001',
          status: 'pending',
          contactInfo: {
            name: 'Nguyễn Văn A',
            phone: '0901234567',
            address: '123 Đường ABC, Quận 1, TP.HCM'
          },
          wasteTypes: {
            metal: { estimated: 2.5, actual: 0 },
            plastic: { estimated: 1.8, actual: 0 },
            paper: { estimated: 3.2, actual: 0 }
          },
          scheduledDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          notes: 'Rác để ở cổng chính',
          totalPoints: 0
        },
        {
          _id: 'mock2',
          requestId: 'WC002',
          status: 'confirmed',
          contactInfo: {
            name: 'Trần Thị B',
            phone: '0907654321',
            address: '456 Đường XYZ, Quận 3, TP.HCM'
          },
          wasteTypes: {
            plastic: { estimated: 2.0, actual: 0 },
            glass: { estimated: 1.5, actual: 0 }
          },
          scheduledDate: new Date().toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          notes: 'Liên hệ trước khi đến',
          totalPoints: 0
        },
        {
          _id: 'mock3',
          requestId: 'WC003',
          status: 'collected',
          contactInfo: {
            name: 'Lê Văn C',
            phone: '0903456789',
            address: '789 Đường DEF, Quận 7, TP.HCM'
          },
          wasteTypes: {
            metal: { estimated: 1.0, actual: 1.2 },
            paper: { estimated: 2.5, actual: 2.3 }
          },
          scheduledDate: new Date(Date.now() - 172800000).toISOString(),
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          notes: '',
          totalPoints: 0
        },
        {
          _id: 'mock4',
          requestId: 'WC004',
          status: 'completed',
          contactInfo: {
            name: 'Phạm Thị D',
            phone: '0905678901',
            address: '321 Đường GHI, Quận 5, TP.HCM'
          },
          wasteTypes: {
            plastic: { estimated: 3.0, actual: 2.8 },
            glass: { estimated: 2.0, actual: 2.2 },
            paper: { estimated: 1.5, actual: 1.3 }
          },
          scheduledDate: new Date(Date.now() - 345600000).toISOString(),
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          notes: 'Cảm ơn dịch vụ tuyệt vời',
          totalPoints: 41.1,
          adminNotes: 'Thu gom thành công, chất lượng rác tốt'
        }
      ];
    }

    // Render admin waste collection management
    renderAdminWasteCollections(wasteCollections);

  } catch (error) {
    console.error('Error loading admin waste collections:', error);
    content.innerHTML = `
      <div class="alert alert-danger">
        <i class="bi bi-exclamation-triangle me-2"></i>
        Có lỗi xảy ra khi tải danh sách yêu cầu thu gom: ${error.message}
      </div>
    `;
  }
}

// Render admin waste collection management interface
function renderAdminWasteCollections(wasteCollections) {
  const content = document.getElementById('profileContent');
  if (!content) return;

  const statusLabels = {
    pending: { text: 'Chờ xử lý', class: 'warning', icon: 'clock' },
    confirmed: { text: 'Đã xác nhận', class: 'info', icon: 'check-circle' },
    collected: { text: 'Đã thu gom', class: 'primary', icon: 'truck' },
    completed: { text: 'Hoàn thành', class: 'success', icon: 'check-all' },
    cancelled: { text: 'Đã hủy', class: 'secondary', icon: 'x-circle' }
  };

  const wasteTypeLabels = {
    metal: { name: 'Kim loại', icon: 'bi-gear', color: 'warning' },
    plastic: { name: 'Nhựa', icon: 'bi-cup', color: 'info' },
    paper: { name: 'Giấy', icon: 'bi-file-text', color: 'success' },
    glass: { name: 'Thủy tinh', icon: 'bi-cup-straw', color: 'primary' }
  };

  let html = `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4><i class="bi bi-recycle me-2"></i>Quản lý yêu cầu thu gom rác</h4>
      <div class="d-flex gap-2">
        <select class="form-select form-select-sm" id="statusFilter" onchange="filterWasteRequests()">
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="collected">Đã thu gom</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>
    </div>
  `;

  if (wasteCollections.length === 0) {
    html += `
      <div class="text-center py-5">
        <i class="bi bi-inbox text-muted" style="font-size: 4rem;"></i>
        <h5 class="mt-3 text-muted">Chưa có yêu cầu thu gom nào</h5>
        <p class="text-muted">Các yêu cầu thu gom từ người dùng sẽ hiển thị ở đây.</p>
      </div>
    `;
  } else {
    html += '<div class="row" id="wasteRequestsList">';

    wasteCollections.forEach(request => {
      const status = statusLabels[request.status] || { text: request.status, class: 'secondary', icon: 'question' };
      const createdDate = new Date(request.createdAt).toLocaleDateString('vi-VN');
      const scheduledDate = request.scheduledDate ? new Date(request.scheduledDate).toLocaleDateString('vi-VN') : 'Chưa xác định';

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
              <small class="text-muted">#${request.requestId || request._id.slice(-6)}</small>
              <span class="badge bg-${status.class}">
                <i class="bi bi-${status.icon} me-1"></i>${status.text}
              </span>
            </div>
            <div class="card-body">
              <h6 class="card-title mb-2">
                <i class="bi bi-person me-1"></i>${request.contactInfo.name}
              </h6>
              <p class="card-text small mb-2">
                <i class="bi bi-geo-alt me-1"></i>${request.contactInfo.address}
              </p>
              <p class="card-text small mb-2">
                <i class="bi bi-telephone me-1"></i>${request.contactInfo.phone}
              </p>

              <div class="mb-3">
                <strong class="small">Loại rác:</strong>
                <div class="mt-1">
                  ${wasteTypesHtml}
                </div>
              </div>

              <div class="row text-center mb-3">
                <div class="col-6">
                  <small class="text-muted">Ngày tạo</small><br>
                  <small><strong>${createdDate}</strong></small>
                </div>
                <div class="col-6">
                  <small class="text-muted">Ngày hẹn</small><br>
                  <small><strong>${scheduledDate}</strong></small>
                </div>
              </div>

              ${request.totalPoints > 0 ? `
                <div class="alert alert-success py-2 mb-2">
                  <i class="fas fa-coins me-1"></i>
                  <strong>${request.totalPoints} xu</strong>
                </div>
              ` : ''}
            </div>
            <div class="card-footer bg-transparent border-0">
              <div class="d-grid gap-2">
                <button class="btn btn-outline-primary btn-sm" onclick="viewAdminWasteDetails('${request._id}')">
                  <i class="bi bi-eye me-1"></i>Xem chi tiết
                </button>
                ${request.status === 'pending' ? `
                  <div class="btn-group" role="group">
                    <button class="btn btn-success btn-sm" onclick="updateWasteStatus('${request._id}', 'confirmed')">
                      <i class="bi bi-check me-1"></i>Xác nhận
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="updateWasteStatus('${request._id}', 'cancelled')">
                      <i class="bi bi-x me-1"></i>Từ chối
                    </button>
                  </div>
                ` : ''}
                ${request.status === 'confirmed' ? `
                  <button class="btn btn-primary btn-sm" onclick="updateWasteStatus('${request._id}', 'collected')">
                    <i class="bi bi-truck me-1"></i>Đã thu gom
                  </button>
                ` : ''}
                ${request.status === 'collected' ? `
                  <button class="btn btn-success btn-sm" onclick="completeWasteCollection('${request._id}')">
                    <i class="bi bi-check-all me-1"></i>Hoàn thành
                  </button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    });

    html += '</div>';
  }

  content.innerHTML = html;
}

// Admin waste collection management functions
async function updateWasteStatus(id, status) {
  try {
    const statusNames = {
      confirmed: 'xác nhận',
      cancelled: 'từ chối',
      collected: 'đã thu gom'
    };

    if (!confirm(`Bạn có chắc chắn muốn ${statusNames[status]} yêu cầu này?`)) {
      return;
    }

    try {
      const response = await apiService.updateWasteCollectionStatus(id, { status });
      // Show success message
      alert(`Đã ${statusNames[status]} yêu cầu thành công!`);
    } catch (error) {
      console.warn('API not available, simulating status update for demo:', error);
      // Simulate success for demo
      alert(`[DEMO] Đã ${statusNames[status]} yêu cầu thành công!`);
    }

    // Reload the list
    showAdminWasteRequests();

  } catch (error) {
    console.error('Error updating waste status:', error);
    alert('Có lỗi xảy ra khi cập nhật trạng thái: ' + error.message);
  }
}

async function completeWasteCollection(id) {
  try {
    // Show modal to input actual weights
    showCompleteWasteModal(id);

  } catch (error) {
    console.error('Error completing waste collection:', error);
    alert('Có lỗi xảy ra: ' + error.message);
  }
}

async function viewAdminWasteDetails(id) {
  try {
    let request;
    try {
      const response = await apiService.getWasteCollectionById(id);
      request = response.data.wasteCollection;
    } catch (error) {
      console.warn('API not available, using mock data for demo:', error);
      // Find mock data by id
      const mockData = [
        {
          _id: 'mock1',
          requestId: 'WC001',
          status: 'pending',
          contactInfo: {
            name: 'Nguyễn Văn A',
            phone: '0901234567',
            address: '123 Đường ABC, Quận 1, TP.HCM'
          },
          wasteTypes: {
            metal: { estimated: 2.5, actual: 0 },
            plastic: { estimated: 1.8, actual: 0 },
            paper: { estimated: 3.2, actual: 0 }
          },
          scheduledDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          notes: 'Rác để ở cổng chính',
          totalPoints: 0
        },
        {
          _id: 'mock2',
          requestId: 'WC002',
          status: 'confirmed',
          contactInfo: {
            name: 'Trần Thị B',
            phone: '0907654321',
            address: '456 Đường XYZ, Quận 3, TP.HCM'
          },
          wasteTypes: {
            plastic: { estimated: 2.0, actual: 0 },
            glass: { estimated: 1.5, actual: 0 }
          },
          scheduledDate: new Date().toISOString(),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          notes: 'Liên hệ trước khi đến',
          totalPoints: 0
        },
        {
          _id: 'mock3',
          requestId: 'WC003',
          status: 'collected',
          contactInfo: {
            name: 'Lê Văn C',
            phone: '0903456789',
            address: '789 Đường DEF, Quận 7, TP.HCM'
          },
          wasteTypes: {
            metal: { estimated: 1.0, actual: 1.2 },
            paper: { estimated: 2.5, actual: 2.3 }
          },
          scheduledDate: new Date(Date.now() - 172800000).toISOString(),
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          notes: '',
          totalPoints: 0
        },
        {
          _id: 'mock4',
          requestId: 'WC004',
          status: 'completed',
          contactInfo: {
            name: 'Phạm Thị D',
            phone: '0905678901',
            address: '321 Đường GHI, Quận 5, TP.HCM'
          },
          wasteTypes: {
            plastic: { estimated: 3.0, actual: 2.8 },
            glass: { estimated: 2.0, actual: 2.2 },
            paper: { estimated: 1.5, actual: 1.3 }
          },
          scheduledDate: new Date(Date.now() - 345600000).toISOString(),
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          notes: 'Cảm ơn dịch vụ tuyệt vời',
          totalPoints: 41.1,
          adminNotes: 'Thu gom thành công, chất lượng rác tốt'
        }
      ];
      request = mockData.find(item => item._id === id) || mockData[0];
    }

    // Show admin details modal
    showAdminWasteDetailsModal(request);

  } catch (error) {
    console.error('Error loading waste collection details:', error);
    alert('Có lỗi xảy ra khi tải chi tiết yêu cầu.');
  }
}

function filterWasteRequests() {
  const statusFilter = document.getElementById('statusFilter').value;
  // Reload with filter
  showAdminWasteRequests();
}

// Show placeholder for other admin features
function showAdminPlaceholder(feature) {
  const content = document.getElementById('profileContent');
  const featureNames = {
    'messages': 'Tin nhắn từ người dùng',
    'users': 'Quản lý người dùng',
    'stats': 'Thống kê hệ thống'
  };

  content.innerHTML = `
    <div class="container-fluid">
      <div class="alert alert-warning">
        <h4><i class="bi bi-shield-check me-2"></i>Chức năng Admin: ${featureNames[feature]}</h4>
        <p>Chức năng quản trị này đang được phát triển. Chỉ dành cho Admin!</p>
        <hr>
        <p class="mb-0">
          <strong>Dự kiến:</strong>
          ${feature === 'messages' ? 'Inbox tin nhắn với reply function và status management' : ''}
          ${feature === 'users' ? 'User management table với role assignment và ban/unban' : ''}
          ${feature === 'stats' ? 'Dashboard với charts và metrics tổng quan hệ thống' : ''}
        </p>
      </div>
    </div>
  `;
}

function showAdminMessages() {
  showAdminPlaceholder('messages');
}

function showAdminUsers() {
  showAdminPlaceholder('users');
}

function showAdminStats() {
  showAdminPlaceholder('stats');
}

// Debug function to enable admin mode for testing
function enableAdminMode() {
  console.log('Enabling admin mode for testing...');

  // Force show all admin elements
  const adminElements = document.querySelectorAll('.admin-only');
  adminElements.forEach(element => {
    element.style.display = '';
  });

  // Update current user to admin
  if (window.profileManager) {
    window.profileManager.currentUser = {
      ...window.profileManager.currentUser,
      role: 'admin'
    };
  }

  alert('Admin mode enabled! Now you can see admin features.');
  console.log('Admin elements shown:', adminElements.length);
}

// Show admin waste details modal
function showAdminWasteDetailsModal(request) {
  const statusLabels = {
    pending: { text: 'Chờ xử lý', class: 'warning' },
    confirmed: { text: 'Đã xác nhận', class: 'info' },
    collected: { text: 'Đã thu gom', class: 'primary' },
    completed: { text: 'Hoàn thành', class: 'success' },
    cancelled: { text: 'Đã hủy', class: 'secondary' }
  };

  const wasteTypeLabels = {
    metal: { name: 'Kim loại', icon: 'bi-gear', color: 'warning', price: 20 },
    plastic: { name: 'Nhựa', icon: 'bi-cup', color: 'info', price: 10 },
    paper: { name: 'Giấy', icon: 'bi-file-text', color: 'success', price: 5 },
    glass: { name: 'Thủy tinh', icon: 'bi-cup-straw', color: 'primary', price: 3 }
  };

  const status = statusLabels[request.status] || { text: request.status, class: 'secondary' };
  const createdDate = new Date(request.createdAt).toLocaleDateString('vi-VN');
  const scheduledDate = request.scheduledDate ? new Date(request.scheduledDate).toLocaleDateString('vi-VN') : 'Chưa xác định';

  // Get waste types with weight > 0
  const wasteTypesHtml = Object.keys(request.wasteTypes)
    .filter(type => request.wasteTypes[type].estimated > 0)
    .map(type => {
      const wasteType = wasteTypeLabels[type];
      const estimated = request.wasteTypes[type].estimated;
      const actual = request.wasteTypes[type].actual || 0;
      const estimatedPoints = estimated * wasteType.price;
      const actualPoints = actual * wasteType.price;

      return `
        <tr>
          <td>
            <i class="${wasteType.icon} text-${wasteType.color} me-2"></i>
            ${wasteType.name}
          </td>
          <td>${estimated} kg</td>
          <td>${actual > 0 ? actual + ' kg' : '-'}</td>
          <td>${estimatedPoints} xu</td>
          <td>${actualPoints > 0 ? actualPoints + ' xu' : '-'}</td>
        </tr>
      `;
    }).join('');

  const modalHtml = `
    <div class="modal fade" id="adminWasteDetailsModal" tabindex="-1">
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
                <strong>Mã yêu cầu:</strong> #${request.requestId || request._id.slice(-6)}
              </div>
              <div class="col-md-6">
                <span class="badge bg-${status.class} fs-6">${status.text}</span>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Người liên hệ:</strong><br>
                ${request.contactInfo.name}<br>
                <i class="bi bi-telephone me-1"></i>${request.contactInfo.phone}
              </div>
              <div class="col-md-6">
                <strong>Địa chỉ thu gom:</strong><br>
                ${request.contactInfo.address}
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <strong>Ngày tạo:</strong> ${createdDate}
              </div>
              <div class="col-md-6">
                <strong>Ngày hẹn:</strong> ${scheduledDate}
              </div>
            </div>

            <div class="mb-3">
              <strong>Chi tiết rác tái chế:</strong>
              <table class="table table-sm mt-2">
                <thead>
                  <tr>
                    <th>Loại rác</th>
                    <th>KL ước tính</th>
                    <th>KL thực tế</th>
                    <th>Xu ước tính</th>
                    <th>Xu thực tế</th>
                  </tr>
                </thead>
                <tbody>
                  ${wasteTypesHtml}
                </tbody>
              </table>
            </div>

            ${request.notes ? `
              <div class="mb-3">
                <strong>Ghi chú từ người dùng:</strong><br>
                <div class="bg-light p-2 rounded">${request.notes}</div>
              </div>
            ` : ''}

            ${request.adminNotes ? `
              <div class="mb-3">
                <strong>Ghi chú admin:</strong><br>
                <div class="bg-warning bg-opacity-10 p-2 rounded">${request.adminNotes}</div>
              </div>
            ` : ''}

            ${request.totalPoints > 0 ? `
              <div class="alert alert-success">
                <i class="fas fa-coins me-2"></i>
                <strong>Tổng điểm đã trao: ${request.totalPoints} xu</strong>
              </div>
            ` : ''}
          </div>
          <div class="modal-footer">
            ${request.status === 'pending' ? `
              <button type="button" class="btn btn-success" onclick="updateWasteStatus('${request._id}', 'confirmed')" data-bs-dismiss="modal">
                <i class="bi bi-check me-1"></i>Xác nhận
              </button>
              <button type="button" class="btn btn-danger" onclick="updateWasteStatus('${request._id}', 'cancelled')" data-bs-dismiss="modal">
                <i class="bi bi-x me-1"></i>Từ chối
              </button>
            ` : ''}
            ${request.status === 'confirmed' ? `
              <button type="button" class="btn btn-primary" onclick="updateWasteStatus('${request._id}', 'collected')" data-bs-dismiss="modal">
                <i class="bi bi-truck me-1"></i>Đã thu gom
              </button>
            ` : ''}
            ${request.status === 'collected' ? `
              <button type="button" class="btn btn-success" onclick="completeWasteCollection('${request._id}')" data-bs-dismiss="modal">
                <i class="bi bi-check-all me-1"></i>Hoàn thành
              </button>
            ` : ''}
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  const existingModal = document.getElementById('adminWasteDetailsModal');
  if (existingModal) {
    existingModal.remove();
  }

  // Add modal to body
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('adminWasteDetailsModal'));
  modal.show();
}

// Show complete waste collection modal
async function showCompleteWasteModal(id) {
  try {
    const response = await apiService.getWasteCollectionById(id);
    const request = response.data.wasteCollection;

    const wasteTypeLabels = {
      metal: { name: 'Kim loại', icon: 'bi-gear', color: 'warning', price: 20 },
      plastic: { name: 'Nhựa', icon: 'bi-cup', color: 'info', price: 10 },
      paper: { name: 'Giấy', icon: 'bi-file-text', color: 'success', price: 5 },
      glass: { name: 'Thủy tinh', icon: 'bi-cup-straw', color: 'primary', price: 3 }
    };

    // Generate form fields for actual weights
    const wasteTypesFormHtml = Object.keys(request.wasteTypes)
      .filter(type => request.wasteTypes[type].estimated > 0)
      .map(type => {
        const wasteType = wasteTypeLabels[type];
        const estimated = request.wasteTypes[type].estimated;

        return `
          <div class="row mb-3">
            <div class="col-md-6">
              <label class="form-label">
                <i class="${wasteType.icon} text-${wasteType.color} me-2"></i>
                ${wasteType.name}
              </label>
              <small class="text-muted d-block">Ước tính: ${estimated} kg</small>
            </div>
            <div class="col-md-6">
              <div class="input-group">
                <input type="number" class="form-control" id="actual_${type}"
                       min="0" step="0.1" placeholder="0.0" value="${estimated}">
                <span class="input-group-text">kg</span>
              </div>
              <small class="text-muted">Điểm: <span id="points_${type}">${estimated * wasteType.price}</span> xu</small>
            </div>
          </div>
        `;
      }).join('');

    const modalHtml = `
      <div class="modal fade" id="completeWasteModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                <i class="bi bi-check-all me-2"></i>Hoàn thành thu gom
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="completeWasteForm">
              <div class="modal-body">
                <div class="alert alert-info">
                  <i class="bi bi-info-circle me-2"></i>
                  Nhập khối lượng thực tế đã thu gom để tính điểm xu chính xác.
                </div>

                <div class="mb-3">
                  <strong>Yêu cầu:</strong> #${request.requestId || request._id.slice(-6)}<br>
                  <strong>Người liên hệ:</strong> ${request.contactInfo.name}
                </div>

                ${wasteTypesFormHtml}

                <div class="mb-3">
                  <label for="adminNotes" class="form-label">Ghi chú admin (tùy chọn)</label>
                  <textarea class="form-control" id="adminNotes" rows="3"
                            placeholder="Ghi chú về quá trình thu gom..."></textarea>
                </div>

                <div class="alert alert-success">
                  <strong>Tổng điểm xu: <span id="totalPoints">0</span> xu</strong>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-success">
                  <i class="bi bi-check-all me-1"></i>Hoàn thành thu gom
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('completeWasteModal');
    if (existingModal) {
      existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Setup form event listeners
    const form = document.getElementById('completeWasteForm');

    // Calculate points when weights change
    Object.keys(request.wasteTypes).forEach(type => {
      const input = document.getElementById(`actual_${type}`);
      if (input) {
        input.addEventListener('input', () => {
          const weight = parseFloat(input.value) || 0;
          const price = wasteTypeLabels[type].price;
          const points = weight * price;
          document.getElementById(`points_${type}`).textContent = points;
          updateTotalPoints();
        });
      }
    });

    function updateTotalPoints() {
      let total = 0;
      Object.keys(request.wasteTypes).forEach(type => {
        const input = document.getElementById(`actual_${type}`);
        if (input) {
          const weight = parseFloat(input.value) || 0;
          const price = wasteTypeLabels[type].price;
          total += weight * price;
        }
      });
      document.getElementById('totalPoints').textContent = total;
    }

    // Initial calculation
    updateTotalPoints();

    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const wasteTypes = {};
      Object.keys(request.wasteTypes).forEach(type => {
        const input = document.getElementById(`actual_${type}`);
        if (input) {
          wasteTypes[type] = {
            actual: parseFloat(input.value) || 0
          };
        }
      });

      const adminNotes = document.getElementById('adminNotes').value;

      try {
        try {
          await apiService.completeWasteCollection(id, {
            wasteTypes,
            adminNotes
          });
          alert('Đã hoàn thành thu gom và tính điểm thành công!');
        } catch (error) {
          console.warn('API not available, simulating completion for demo:', error);
          alert('[DEMO] Đã hoàn thành thu gom và tính điểm thành công!');
        }

        // Close modal and reload list
        const modal = bootstrap.Modal.getInstance(document.getElementById('completeWasteModal'));
        modal.hide();
        showAdminWasteRequests();

      } catch (error) {
        console.error('Error completing waste collection:', error);
        alert('Có lỗi xảy ra khi hoàn thành thu gom: ' + error.message);
      }
    });

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('completeWasteModal'));
    modal.show();

  } catch (error) {
    console.error('Error loading waste collection for completion:', error);
    alert('Có lỗi xảy ra khi tải thông tin yêu cầu.');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.profileManager = new ProfileManager();

  // Make functions available globally
  window.toggleSidebar = toggleSidebar;
  window.showAdminFeature = showAdminFeature;
  window.updateWasteStatus = updateWasteStatus;
  window.completeWasteCollection = completeWasteCollection;
  window.viewAdminWasteDetails = viewAdminWasteDetails;
  window.filterWasteRequests = filterWasteRequests;
  window.showCompleteWasteModal = showCompleteWasteModal;
  window.enableAdminMode = enableAdminMode;

  // Export profile manager functions
  window.refreshUserData = () => {
    if (window.profileManager) {
      window.profileManager.refreshUserData();
    }
  };

  window.resetProfileForm = () => {
    if (window.profileManager) {
      window.profileManager.resetProfileForm();
    }
  };

  // Debug function to clear all cache and reload
  window.clearAllCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    console.log('All cache cleared');
    location.reload();
  };
  // Note: showUserFeature is exported from profile-common.js
});
