import apiService from './api.js';

class AdminManager {
  constructor() {
    this.currentPage = 1;
    this.usersPerPage = 10;
    this.totalUsers = 0;
    this.users = [];
    this.stats = null;
    this.init();
  }

  async init() {
    // Kiểm tra quyền admin
    if (!apiService.isAuthenticated() || !apiService.isAdmin()) {
      alert('Bạn không có quyền truy cập trang này!');
      window.location.href = './index.html';
      return;
    }

    this.setupEventListeners();
    this.setupTabs();
    await this.loadDashboardData();
  }

  setupEventListeners() {
    // Tab navigation
    const tabLinks = document.querySelectorAll('[data-tab]');
    tabLinks.forEach(link => {
      link.addEventListener('click', this.handleTabClick.bind(this));
    });

    // Search and filter
    document.getElementById('searchBtn').addEventListener('click', this.handleSearch.bind(this));
    document.getElementById('searchUsers').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSearch();
    });

    // Create user form
    document.getElementById('createUserForm').addEventListener('submit', this.handleCreateUser.bind(this));
  }

  setupTabs() {
    // Hide all tab contents initially
    const tabContents = document.querySelectorAll('.tab-content-item');
    tabContents.forEach(content => {
      content.style.display = 'none';
    });

    // Show first tab
    const firstTab = document.querySelector('.tab-content-item.active');
    if (firstTab) {
      firstTab.style.display = 'block';
    }
  }

  async loadDashboardData() {
    try {
      // Load stats
      const statsResponse = await apiService.getUserStats();
      this.stats = statsResponse.data;
      this.updateStatsCards();

      // Load users for users tab
      await this.loadUsers();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  updateStatsCards() {
    if (!this.stats) return;

    document.getElementById('totalUsers').textContent = this.stats.totalUsers;
    document.getElementById('activeUsers').textContent = this.stats.activeUsers;
    document.getElementById('adminUsers').textContent = this.stats.adminUsers;
    document.getElementById('regularUsers').textContent = this.stats.regularUsers;
  }

  async loadUsers(page = 1, search = '', role = '', isActive = '') {
    try {
      const params = {
        page,
        limit: this.usersPerPage,
        search,
        role,
        isActive
      };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '') delete params[key];
      });

      const response = await apiService.getUsers(params);
      this.users = response.data.users;
      this.currentPage = response.data.pagination.currentPage;
      this.totalUsers = response.data.pagination.totalUsers;

      this.renderUsersTable();
      this.renderPagination(response.data.pagination);

    } catch (error) {
      console.error('Error loading users:', error);
      this.showError('usersTableBody', 'Không thể tải danh sách users');
    }
  }

  renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');

    if (this.users.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted">Không có dữ liệu</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.users.map(user => `
      <tr>
        <td>
          <div class="d-flex align-items-center">
            <i class="bi bi-person-circle me-2 fs-4"></i>
            <div>
              <div class="fw-semibold">${user.name}</div>
              ${user.phone ? `<small class="text-muted">${user.phone}</small>` : ''}
            </div>
          </div>
        </td>
        <td>${user.email}</td>
        <td>
          <span class="badge ${user.role === 'admin' ? 'bg-warning' : 'bg-info'}">
            ${user.role === 'admin' ? 'Admin' : 'User'}
          </span>
        </td>
        <td>
          <span class="badge ${user.isActive ? 'bg-success' : 'bg-danger'}">
            ${user.isActive ? 'Hoạt động' : 'Không hoạt động'}
          </span>
        </td>
        <td>${new Date(user.createdAt).toLocaleDateString('vi-VN')}</td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-primary" onclick="adminManager.editUser('${user._id}')" title="Chỉnh sửa">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger" onclick="adminManager.deleteUser('${user._id}', '${user.name}')" title="Xóa">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  renderPagination(pagination) {
    const paginationEl = document.getElementById('usersPagination');

    if (pagination.totalPages <= 1) {
      paginationEl.innerHTML = '';
      return;
    }

    let paginationHTML = '';

    // Previous button
    if (pagination.hasPrev) {
      paginationHTML += `
        <li class="page-item">
          <a class="page-link" href="#" onclick="adminManager.loadUsers(${pagination.currentPage - 1})">Trước</a>
        </li>
      `;
    }

    // Page numbers
    const startPage = Math.max(1, pagination.currentPage - 2);
    const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <li class="page-item ${i === pagination.currentPage ? 'active' : ''}">
          <a class="page-link" href="#" onclick="adminManager.loadUsers(${i})">${i}</a>
        </li>
      `;
    }

    // Next button
    if (pagination.hasNext) {
      paginationHTML += `
        <li class="page-item">
          <a class="page-link" href="#" onclick="adminManager.loadUsers(${pagination.currentPage + 1})">Sau</a>
        </li>
      `;
    }

    paginationEl.innerHTML = paginationHTML;
  }

  handleTabClick(e) {
    e.preventDefault();

    const targetTab = e.target.getAttribute('data-tab');

    // Remove active class from all tab links
    const tabLinks = document.querySelectorAll('[data-tab]');
    tabLinks.forEach(link => {
      link.classList.remove('active');
    });

    // Add active class to clicked tab
    e.target.classList.add('active');

    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content-item');
    tabContents.forEach(content => {
      content.style.display = 'none';
      content.classList.remove('active');
    });

    // Show target tab content
    const targetContent = document.getElementById(targetTab);
    if (targetContent) {
      targetContent.style.display = 'block';
      targetContent.classList.add('active');
    }

    // Load data for specific tabs
    if (targetTab === 'stats') {
      this.renderChart();
    }
  }

  handleSearch() {
    const search = document.getElementById('searchUsers').value;
    const role = document.getElementById('filterRole').value;
    const isActive = document.getElementById('filterStatus').value;

    this.loadUsers(1, search, role, isActive);
  }

  async handleCreateUser(e) {
    e.preventDefault();

    const name = document.getElementById('createUserName').value;
    const email = document.getElementById('createUserEmail').value;
    const password = document.getElementById('createUserPassword').value;
    const phone = document.getElementById('createUserPhone').value;
    const role = document.getElementById('createUserRole').value;
    const feedback = document.getElementById('createUserFormFeedback');

    try {
      this.showLoading(feedback, 'Đang tạo user...');

      await apiService.createUser({
        name,
        email,
        password,
        phone,
        role
      });

      this.showSuccess(feedback, 'Tạo user thành công!');

      // Reset form and close modal
      document.getElementById('createUserForm').reset();
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('createUserModal'));
        modal.hide();
        this.loadUsers(); // Reload users list
        this.loadDashboardData(); // Reload stats
      }, 1000);

    } catch (error) {
      this.showError(feedback, error.message);
    }
  }

  async deleteUser(userId, userName) {
    if (!confirm(`Bạn có chắc chắn muốn xóa user "${userName}"?`)) {
      return;
    }

    try {
      await apiService.deleteUser(userId);
      alert('Xóa user thành công!');
      this.loadUsers(); // Reload users list
      this.loadDashboardData(); // Reload stats
    } catch (error) {
      alert('Lỗi khi xóa user: ' + error.message);
    }
  }

  editUser(userId) {
    // TODO: Implement edit user functionality
    alert('Tính năng chỉnh sửa user sẽ được phát triển trong phiên bản tiếp theo');
  }

  renderChart() {
    if (!this.stats || !this.stats.monthlyRegistrations) return;

    const ctx = document.getElementById('monthlyChart').getContext('2d');

    // Prepare data
    const labels = this.stats.monthlyRegistrations.map(item =>
      `${item._id.month}/${item._id.year}`
    );
    const data = this.stats.monthlyRegistrations.map(item => item.count);

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Số lượng đăng ký',
          data: data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
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

// Initialize and make it globally accessible
let adminManager;
document.addEventListener('DOMContentLoaded', () => {
  adminManager = new AdminManager();
  window.adminManager = adminManager; // Make it globally accessible for onclick handlers
});
