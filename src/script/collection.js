import Swal from "sweetalert2";
import apiService from "./api.js";

// Initialize waste collection form
document.addEventListener('DOMContentLoaded', function() {
  initializeWasteCollectionForm();
});

function initializeWasteCollectionForm() {
  const form = document.getElementById("collectionForm");
  const authRequiredMessage = document.getElementById("authRequiredMessage");

  if (!form || !authRequiredMessage) return;

  // Check authentication status
  checkAuthenticationStatus();

  // Setup form event listeners
  setupFormEventListeners();

  // Setup points calculation
  setupPointsCalculation();
}

function checkAuthenticationStatus() {
  const form = document.getElementById("collectionForm");
  const authRequiredMessage = document.getElementById("authRequiredMessage");

  if (apiService.isAuthenticated()) {
    // User is logged in - show form, hide auth message
    form.style.display = 'block';
    authRequiredMessage.style.display = 'none';

    // Pre-fill user information
    prefillUserInfo();
  } else {
    // User not logged in - show auth message, hide form
    form.style.display = 'none';
    authRequiredMessage.style.display = 'block';
  }
}

function prefillUserInfo() {
  const user = apiService.getCurrentUser();
  if (user) {
    const fullNameInput = document.getElementById('fullName');
    const phoneInput = document.getElementById('phoneNumber');

    if (fullNameInput && user.name) {
      fullNameInput.value = user.name;
    }

    if (phoneInput && user.phone) {
      phoneInput.value = user.phone;
    }
  }
}

function setupFormEventListeners() {
  const form = document.getElementById("collectionForm");
  if (!form) return;

  form.addEventListener("submit", handleFormSubmit);
}

function setupPointsCalculation() {
  const weightInputs = ['metalWeight', 'plasticWeight', 'paperWeight', 'glassWeight'];
  const rates = { metal: 20, plastic: 10, paper: 5, glass: 3 };

  weightInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', calculateEstimatedPoints);
    }
  });
}

function calculateEstimatedPoints() {
  const rates = { metal: 20, plastic: 10, paper: 5, glass: 3 };
  const weights = {
    metal: parseFloat(document.getElementById('metalWeight')?.value || 0),
    plastic: parseFloat(document.getElementById('plasticWeight')?.value || 0),
    paper: parseFloat(document.getElementById('paperWeight')?.value || 0),
    glass: parseFloat(document.getElementById('glassWeight')?.value || 0)
  };

  let totalPoints = 0;
  Object.keys(weights).forEach(type => {
    totalPoints += weights[type] * rates[type];
  });

  const pointsDisplay = document.getElementById('estimatedPoints');
  if (pointsDisplay) {
    pointsDisplay.textContent = Math.round(totalPoints);
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  form.classList.add("was-validated");

  // Validate form
  if (!form.checkValidity()) {
    showErrorMessage("Vui lòng điền đầy đủ thông tin bắt buộc.");
    return;
  }

  // Check if at least one waste type has weight
  const hasWasteTypes = checkWasteTypes();
  if (!hasWasteTypes) {
    showErrorMessage("Vui lòng nhập khối lượng cho ít nhất một loại rác.");
    return;
  }

  // Collect form data
  const formData = collectFormData();

  try {
    // Show loading
    showLoadingMessage();

    // Submit to API
    const response = await apiService.createWasteCollection(formData);

    // Show success message
    showSuccessMessage(response.data.wasteCollection);

    // Reset form
    resetForm();

  } catch (error) {
    console.error('Submit waste collection error:', error);
    showErrorMessage(error.message || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
  }
}

function checkWasteTypes() {
  const weights = {
    metal: parseFloat(document.getElementById('metalWeight')?.value || 0),
    plastic: parseFloat(document.getElementById('plasticWeight')?.value || 0),
    paper: parseFloat(document.getElementById('paperWeight')?.value || 0),
    glass: parseFloat(document.getElementById('glassWeight')?.value || 0)
  };

  return Object.values(weights).some(weight => weight > 0);
}

function collectFormData() {
  const weights = {
    metal: { estimated: parseFloat(document.getElementById('metalWeight')?.value || 0) },
    plastic: { estimated: parseFloat(document.getElementById('plasticWeight')?.value || 0) },
    paper: { estimated: parseFloat(document.getElementById('paperWeight')?.value || 0) },
    glass: { estimated: parseFloat(document.getElementById('glassWeight')?.value || 0) }
  };

  return {
    contactInfo: {
      name: document.getElementById('fullName')?.value || '',
      phone: document.getElementById('phoneNumber')?.value || '',
      address: document.getElementById('address')?.value || ''
    },
    wasteTypes: weights,
    scheduledDate: document.getElementById('scheduledDate')?.value || null,
    notes: document.getElementById('notes')?.value || ''
  };
}

function showLoadingMessage() {
  Swal.fire({
    title: 'Đang gửi yêu cầu...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
}

function showSuccessMessage(wasteCollection) {
  Swal.fire({
    title: "Đăng ký thành công!",
    html: `
      <div class="text-center">
        <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
        <h5 class="mt-3">Yêu cầu thu gom đã được gửi!</h5>
        <p class="mb-3">Mã yêu cầu: <strong>${wasteCollection.requestId}</strong></p>
        <p class="text-muted">Chúng tôi sẽ liên hệ với bạn trong vòng 24 giờ để xác nhận lịch thu gom.</p>
      </div>
    `,
    icon: "success",
    confirmButtonText: "Xem trong hồ sơ",
    showCancelButton: true,
    cancelButtonText: "Đóng",
    confirmButtonColor: "#28a745",
    cancelButtonColor: "#6c757d"
  }).then((result) => {
    if (result.isConfirmed) {
      window.location.href = './profile.html';
    }
  });
}

function showErrorMessage(message) {
  Swal.fire({
    title: "Lỗi!",
    text: message,
    icon: "error",
    confirmButtonText: "Thử lại",
    confirmButtonColor: "#dc3545"
  });
}

function resetForm() {
  const form = document.getElementById("collectionForm");
  if (form) {
    form.reset();
    form.classList.remove("was-validated");
    calculateEstimatedPoints(); // Reset points display
  }
}

// Listen for authentication changes
window.addEventListener('authStateChanged', function() {
  checkAuthenticationStatus();
});
