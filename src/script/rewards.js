// Import AOS for animations
import AOS from "aos";

// Rewards page functionality
document.addEventListener("DOMContentLoaded", function () {
  // Initialize rewards page
  initializeRewardsPage();
});

function initializeRewardsPage() {
  // Initialize category filters
  initializeCategoryFilters();

  // Initialize exchange buttons
  initializeExchangeButtons();

  // Initialize user points display
  updateUserPoints();

  // Add custom styles
  addCustomStyles();
}

// Category filtering functionality
function initializeCategoryFilters() {
  const categoryButtons = document.querySelectorAll(".btn-category");
  const rewardItems = document.querySelectorAll(".reward-item");

  categoryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const category = this.getAttribute("data-category");

      // Update active button
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // Filter reward items
      filterRewardItems(category, rewardItems);
    });
  });
}

function filterRewardItems(category, items) {
  items.forEach((item) => {
    const itemCategory = getItemCategory(item);

    if (category === "all" || itemCategory === category) {
      item.parentElement.style.display = "block";
      item.parentElement.classList.add("fade-in");
    } else {
      item.parentElement.style.display = "none";
      item.parentElement.classList.remove("fade-in");
    }
  });

  // Refresh AOS after filtering to re-trigger animations
  if (typeof AOS !== 'undefined') {
    setTimeout(() => {
      AOS.refresh();
    }, 100);
  }
}

function getItemCategory(item) {
  const categorySpan = item.querySelector(".reward-category");
  if (!categorySpan) return "";

  const categoryText = categorySpan.textContent.trim();

  // Map Vietnamese categories to English keys
  const categoryMap = {
    "Đồ thủ công": "handmade",
    "Đồ chơi": "toys",
    "Phụ kiện": "accessories",
  };

  return categoryMap[categoryText] || "";
}

// Exchange button functionality
function initializeExchangeButtons() {
  const exchangeButtons = document.querySelectorAll(".btn-exchange");

  exchangeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const rewardItem = this.closest(".reward-item");
      handleExchange(rewardItem);
    });
  });
}

function handleExchange(rewardItem) {
  const itemName = rewardItem.querySelector(".reward-title").textContent;
  const itemCost = parseInt(
    rewardItem.querySelector(".reward-cost").textContent.replace(/\D/g, "")
  );
  const currentPoints = getCurrentUserPoints();

  if (currentPoints >= itemCost) {
    // Show success message
    showExchangeSuccess(itemName, itemCost);

    // Update user points
    updateUserPoints(currentPoints - itemCost);

    // Update stock
    updateItemStock(rewardItem);
  } else {
    // Show insufficient points message
    showInsufficientPoints(itemName, itemCost, currentPoints);
  }
}

function showExchangeSuccess(itemName, cost) {
  // Create success notification
  const notification = document.createElement("div");
  notification.className =
    "alert alert-success alert-dismissible fade show position-fixed";
  notification.style.cssText =
    "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
  notification.innerHTML = `
    <i class="fas fa-check-circle me-2"></i>
    <strong>Đổi quà thành công!</strong><br>
    Bạn đã đổi <strong>${itemName}</strong> với <strong>${cost} xu</strong>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

function showInsufficientPoints(itemName, cost, currentPoints) {
  // Create error notification
  const notification = document.createElement("div");
  notification.className =
    "alert alert-warning alert-dismissible fade show position-fixed";
  notification.style.cssText =
    "top: 20px; right: 20px; z-index: 9999; min-width: 300px;";
  notification.innerHTML = `
    <i class="fas fa-exclamation-triangle me-2"></i>
    <strong>Không đủ xu!</strong><br>
    Bạn cần <strong>${cost} xu</strong> để đổi <strong>${itemName}</strong><br>
    Hiện tại bạn có <strong>${currentPoints} xu</strong>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
}

function updateItemStock(rewardItem) {
  const stockElement = rewardItem.querySelector(".reward-stock");
  const currentStock = parseInt(stockElement.textContent.replace(/\D/g, ""));
  const newStock = currentStock - 1;

  if (newStock > 0) {
    stockElement.textContent = `Còn ${newStock} món`;

    // Add low stock warning if needed
    if (newStock <= 5) {
      stockElement.classList.add("low-stock");
    }
  } else {
    stockElement.textContent = "Hết hàng";
    stockElement.classList.add("out-of-stock");

    // Disable exchange button
    const exchangeButton = rewardItem.querySelector(".btn-exchange");
    exchangeButton.disabled = true;
    exchangeButton.innerHTML = '<i class="fas fa-times"></i> Hết hàng';
    exchangeButton.classList.add("btn-secondary");
    exchangeButton.classList.remove("btn-primary");
  }
}

// User points management
function getCurrentUserPoints() {
  const pointsElement = document.getElementById("userPoints");
  return parseInt(pointsElement.textContent.replace(/\D/g, ""));
}

function updateUserPoints(newPoints = null) {
  const pointsElement = document.getElementById("userPoints");

  if (newPoints !== null) {
    // Update with new value
    pointsElement.textContent = newPoints.toLocaleString("vi-VN");

    // Save to localStorage
    localStorage.setItem("userPoints", newPoints);
  } else {
    // Load from localStorage or use default
    const savedPoints = localStorage.getItem("userPoints");
    const points = savedPoints ? parseInt(savedPoints) : 1250;
    pointsElement.textContent = points.toLocaleString("vi-VN");
  }
}

// Add CSS animations and styles
function addCustomStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .fade-in {
      animation: fadeIn 0.5s ease-in-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .reward-stock.low-stock {
      color: #ff6b35 !important;
      font-weight: bold;
    }

    .reward-stock.out-of-stock {
      color: #dc3545 !important;
      font-weight: bold;
    }

    .btn-category.active {
      background-color: #1E40AF !important;
      color: white !important;
      border-color: #1E40AF !important;
    }

    .btn-category {
      margin: 0 5px 10px 0;
      transition: all 0.3s ease;
    }

    .btn-category:hover {
      background-color: #1E40AF;
      color: white;
      border-color: #1E40AF;
    }

    .btn-exchange {
      transition: all 0.3s ease;
    }

    .btn-exchange:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
  `;
  document.head.appendChild(style);
}
