import apiService from './api.js';

// Make apiService available globally for other scripts
window.apiService = apiService;

// Authentication Manager
class AuthManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateUI();
  }

  setupEventListeners() {
    // Form đăng nhập
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', this.handleLogin.bind(this));
    }

    // Form đăng ký
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', this.handleRegister.bind(this));
    }

    // Modal auth tabs
    const authModal = document.getElementById('authModal');
    if (authModal) {
      authModal.addEventListener('show.bs.modal', this.handleModalShow.bind(this));
    }

    // Logout button (sẽ được thêm động)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('logout-btn')) {
        this.handleLogout();
      }
    });
  }

  // Xử lý đăng nhập
  async handleLogin(e) {
    e.preventDefault();

    const loginField = document.getElementById('loginField').value.trim();
    const password = document.getElementById('loginPassword').value;
    const feedback = document.getElementById('loginFormFeedback');

    // Frontend validation
    if (!loginField) {
      this.showError(feedback, 'Vui lòng nhập email hoặc tên đăng nhập');
      return;
    }

    if (loginField.length < 3) {
      this.showError(feedback, 'Email hoặc tên đăng nhập phải có ít nhất 3 ký tự');
      return;
    }

    if (!password) {
      this.showError(feedback, 'Vui lòng nhập mật khẩu');
      return;
    }

    try {
      this.showLoading(feedback, 'Đang đăng nhập...');

      const response = await apiService.login({ login: loginField, password });

      this.showSuccess(feedback, response.message);

      // Đóng modal và cập nhật UI
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
        modal.hide();
        this.updateUI();
        this.resetForms();
      }, 1000);

    } catch (error) {
      this.showError(feedback, error.message);
    }
  }

  // Xử lý đăng ký
  async handleRegister(e) {
    e.preventDefault();

    const name = document.getElementById('registerFullName').value.trim();
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const feedback = document.getElementById('registerFormFeedback');

    // Frontend validation
    if (!name) {
      this.showError(feedback, 'Vui lòng nhập tên hiển thị');
      return;
    }

    if (name.length < 2 || name.length > 50) {
      this.showError(feedback, 'Tên hiển thị phải từ 2-50 ký tự');
      return;
    }

    if (!username) {
      this.showError(feedback, 'Vui lòng nhập tên đăng nhập');
      return;
    }

    if (username.length < 3 || username.length > 30) {
      this.showError(feedback, 'Tên đăng nhập phải từ 3-30 ký tự');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      this.showError(feedback, 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới');
      return;
    }

    if (!email) {
      this.showError(feedback, 'Vui lòng nhập email');
      return;
    }

    if (!this.isValidEmail(email)) {
      this.showError(feedback, 'Email không hợp lệ');
      return;
    }

    if (!password) {
      this.showError(feedback, 'Vui lòng nhập mật khẩu');
      return;
    }

    if (password.length < 6) {
      this.showError(feedback, 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    // Validate password confirmation if field exists
    const confirmPasswordField = document.getElementById('registerConfirmPassword');
    if (confirmPasswordField && password !== confirmPassword) {
      this.showError(feedback, 'Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      this.showLoading(feedback, 'Đang đăng ký...');

      const response = await apiService.register({
        name,
        username,
        email,
        password
      });

      this.showSuccess(feedback, response.message);

      // Đóng modal và cập nhật UI
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
        modal.hide();
        this.updateUI();
        this.resetForms();
      }, 1000);

    } catch (error) {
      this.showError(feedback, error.message);
    }
  }

  // Xử lý đăng xuất
  handleLogout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      apiService.logout();
    }
  }

  // Xử lý hiển thị modal
  handleModalShow(e) {
    const button = e.relatedTarget;
    const tab = button?.getAttribute('data-tab');

    if (tab === 'register') {
      document.getElementById('tab-register').click();
    } else {
      document.getElementById('tab-login').click();
    }
  }

  // Cập nhật UI dựa trên trạng thái đăng nhập
  updateUI() {
    const isAuthenticated = apiService.isAuthenticated();
    const user = apiService.getCurrentUser();

    // Tìm container chứa buttons auth
    const authContainer = document.querySelector('.d-flex.align-items-center.flex-nowrap.ms-auto');

    if (!authContainer) return;

    if (isAuthenticated && user) {
      // Hiển thị thông tin user và menu dropdown
      authContainer.innerHTML = `
        <div class="dropdown">
          <button class="btn btn-outline-primary dropdown-toggle d-flex align-items-center"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false">
            <i class="bi bi-person-circle me-2"></i>
            <span class="d-none d-md-inline">${user.name}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
            <li>
              <h6 class="dropdown-header">
                <i class="bi bi-person-badge me-2"></i>
                ${user.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
              </h6>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
              <a class="dropdown-item" href="./profile.html">
                <i class="bi bi-person me-2"></i>Thông tin cá nhân
              </a>
            </li>
            ${user.role === 'admin' ? `
            <li>
              <a class="dropdown-item" href="./admin.html">
                <i class="bi bi-gear me-2"></i>Quản lý hệ thống
              </a>
            </li>
            ` : ''}
            <li><hr class="dropdown-divider"></li>
            <li>
              <button class="dropdown-item logout-btn text-danger">
                <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
              </button>
            </li>
          </ul>
        </div>
      `;
    } else {
      // Hiển thị buttons đăng nhập/đăng ký
      authContainer.innerHTML = `
        <button
          type="button"
          class="btn btn-outline-success me-2 fw-semibold"
          data-bs-toggle="modal"
          data-bs-target="#authModal"
          data-tab="login"
        >
          Đăng nhập
        </button>
        <button
          type="button"
          class="btn btn-success me-2 fw-semibold"
          data-bs-toggle="modal"
          data-bs-target="#authModal"
          data-tab="register"
        >
          Đăng ký
        </button>
      `;
    }
  }

  // Reset forms
  resetForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();

    // Clear feedback messages
    const feedbacks = document.querySelectorAll('[id$="FormFeedback"]');
    feedbacks.forEach(feedback => feedback.innerHTML = '');
  }

  // Validation helper methods
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper methods để hiển thị messages
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AuthManager();
});

export default AuthManager;
