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
  const categoryButtons = document.querySelectorAll(".btn-group .btn[data-category]");
  const rewardCards = document.querySelectorAll(".reward-card");

  categoryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const category = this.getAttribute("data-category");

      // Update active button
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      // Filter reward items
      filterRewardCards(category, rewardCards);
    });
  });
}

function filterRewardCards(category, cards) {
  cards.forEach((card) => {
    const itemCategory = getCardCategory(card);

    if (category === "all" || itemCategory === category) {
      card.parentElement.style.display = "block";
      card.parentElement.classList.add("fade-in");
    } else {
      card.parentElement.style.display = "none";
      card.parentElement.classList.remove("fade-in");
    }
  });

  // Refresh AOS after filtering to re-trigger animations
  if (typeof AOS !== 'undefined') {
    setTimeout(() => {
      AOS.refresh();
    }, 100);
  }
}

function getCardCategory(card) {
  // Get category from card title to determine the actual category
  const titleElement = card.querySelector(".card-title");
  if (!titleElement) return "";

  const titleText = titleElement.textContent.trim();

  // Map product names to category keys based on their type
  if (titleText.includes("Gấu bông") || titleText.includes("Tranh vẽ") || titleText.includes("Búp bê") || titleText.includes("Hộp bút")) {
    return "handmade";
  } else if (titleText.includes("Xe đồ chơi") || titleText.includes("búp bê")) {
    return "toys";
  } else if (titleText.includes("Móc khóa") || titleText.includes("Túi vải") || titleText.includes("Bookmark")) {
    return "accessories";
  }

  return "";
}

// Exchange button functionality
function initializeExchangeButtons() {
  const exchangeButtons = document.querySelectorAll(".btn-primary");

  exchangeButtons.forEach((button) => {
    if (button.textContent.includes("Đổi")) {
      button.addEventListener("click", function () {
        const rewardCard = this.closest(".reward-card");
        handleExchange(rewardCard);
      });
    }
  });
}

function handleExchange(rewardCard) {
  const itemName = rewardCard.querySelector(".card-title").textContent;
  const itemCost = parseInt(
    rewardCard.querySelector(".badge.bg-warning").textContent.replace(/\D/g, "")
  );
  const currentPoints = getCurrentUserPoints();

  if (currentPoints >= itemCost) {
    // Show success message
    showExchangeSuccess(itemName, itemCost);

    // Update user points
    updateUserPoints(currentPoints - itemCost);

    // Update stock
    updateCardStock(rewardCard);
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

function updateCardStock(rewardCard) {
  const stockElement = rewardCard.querySelector("small");
  const currentStock = parseInt(stockElement.textContent.replace(/\D/g, ""));
  const newStock = currentStock - 1;

  if (newStock > 0) {
    stockElement.textContent = `Còn ${newStock} món`;
    stockElement.className = "text-success";

    // Add low stock warning if needed
    if (newStock <= 5) {
      stockElement.className = "text-warning";
    }
  } else {
    stockElement.textContent = "Hết hàng";
    stockElement.className = "text-danger";

    // Disable exchange button
    const exchangeButton = rewardCard.querySelector(".btn-primary");
    exchangeButton.disabled = true;
    exchangeButton.innerHTML = '<i class="fas fa-times me-1"></i>Hết hàng';
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

    .btn-outline-primary.active {
      background-color: #0d6efd !important;
      color: white !important;
      border-color: #0d6efd !important;
    }

    .btn-group .btn {
      margin: 0 5px 10px 0;
      transition: all 0.3s ease;
    }

    .btn-group .btn:hover {
      transform: translateY(-2px);
    }

    .reward-card {
      transition: all 0.3s ease;
      border: 1px solid #dee2e6;
    }

    .reward-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.1);
      border-color: #0d6efd;
    }

    .reward-card .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
  `;
  document.head.appendChild(style);
}
