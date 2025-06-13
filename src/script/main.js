import AOS from "aos";
import "aos/dist/aos.css";
import "./video-modal.js";

document.addEventListener("DOMContentLoaded", () => {
  // Khởi tạo AOS
  AOS.init({
    duration: 500,
    offset: 100,
  });

  // Login/Register Modal with improved scrollbar handling
  const authModal = document.getElementById("authModal");
  if (authModal) {
    // Store original body styles
    let originalBodyOverflow = "";
    let originalBodyPaddingRight = "";

    // Handle modal show event
    authModal.addEventListener("show.bs.modal", (event) => {
      // Store original body styles before modal opens
      originalBodyOverflow = document.body.style.overflow;
      originalBodyPaddingRight = document.body.style.paddingRight;

      // Get scrollbar width
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Apply styles to prevent layout shift
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px";

      // Fix navbar container to prevent shift - minimal changes
      const navbar = document.querySelector(".navbar");
      if (navbar) {
        navbar.style.paddingRight = "0px";
      }

      // Handle tab switching
      const button = event.relatedTarget; // Nút kích hoạt modal
      const tab = button.getAttribute("data-tab"); // Lấy data-tab (login/register)
      console.log("Tab to show:", tab); // Debug giá trị tab

      if (tab) {
        const tabElement = document.querySelector(`#tab-${tab}`);
        const tabPane = document.querySelector(`#pills-${tab}`);

        if (tabElement && tabPane) {
          // Xóa lớp active khỏi tab và tab-pane hiện tại
          const activeTab = document.querySelector(
            "#authTabs .nav-link.active"
          );
          const activePane = document.querySelector(
            ".tab-content .tab-pane.show.active"
          );
          if (activeTab) activeTab.classList.remove("active");
          if (activePane) activePane.classList.remove("show", "active");

          // Kích hoạt tab mới
          tabElement.classList.add("active");
          tabPane.classList.add("show", "active");

          // Sử dụng Bootstrap Tab API để đảm bảo trạng thái
          const tabTrigger = new bootstrap.Tab(tabElement);
          tabTrigger.show();
        } else {
          console.error("Tab element or pane not found for tab:", tab);
        }
      } else {
        console.error("No data-tab attribute found on button:", button);
      }
    });

    // Handle modal hide event
    authModal.addEventListener("hidden.bs.modal", () => {
      // Restore original body styles
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.paddingRight = originalBodyPaddingRight;

      // Restore navbar styles
      const navbar = document.querySelector(".navbar");
      if (navbar) {
        navbar.style.paddingRight = "";
      }
    });

    // Prevent modal from closing when clicking inside modal content
    authModal.addEventListener("click", (event) => {
      if (event.target === authModal) {
        // Only close if clicking on backdrop, not modal content
        return;
      }
    });
  }

  // Counter Animation
  const counters = document.querySelectorAll(".count-number");
  const speed = 500;

  counters.forEach((counter) => {
    let hasCounted = false; // Biến flag để kiểm soát việc đếm chỉ chạy một lần

    const updateCount = () => {
      const target = +counter.getAttribute("data-count");
      const count = +counter.innerText.replace(/[^0-9.-]+/g, "");
      const increment = target / (speed / 20);

      if (count < target) {
        counter.innerText = Math.ceil(count + increment).toString();
        setTimeout(updateCount, 70);
      } else {
        if (
          counter.nextElementSibling &&
          counter.nextElementSibling.textContent.includes("VNĐ tiền quỹ")
        ) {
          counter.innerText = target + "M+";
        } else if (target >= 1000) {
          counter.innerText = target / 1000 + "K+";
        } else {
          counter.innerText = target;
        }
        hasCounted = true; // Đánh dấu đã hoàn thành đếm
      }
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasCounted) {
            updateCount(); // Bắt đầu đếm khi phần tử xuất hiện trong viewport
            obs.unobserve(entry.target); // Ngừng quan sát sau khi đếm xong
          }
        });
      },
      {
        threshold: 0.5, // Kích hoạt khi 50% phần tử nằm trong viewport
      }
    );

    observer.observe(counter);
  });

  // Navbar Active Link
  function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll(
      ".navbar-nav .nav-link[data-page]"
    );

    console.log("Current path:", currentPath); // Debug log

    // Remove active class from all links first
    navLinks.forEach((link) => {
      link.classList.remove("active");
      link.removeAttribute("aria-current");
    });

    // Determine current page from path
    let currentPage = "index"; // default
    if (currentPath === "/" || currentPath === "/index.html") {
      currentPage = "index";
    } else {
      // Extract page name from path (e.g., "/collection.html" -> "collection")
      const pathParts = currentPath.split("/");
      const fileName = pathParts[pathParts.length - 1];
      if (fileName && fileName.includes(".")) {
        currentPage = fileName.split(".")[0];
      }
    }

    console.log("Current page:", currentPage); // Debug log

    // Find and activate the current page link
    navLinks.forEach((link) => {
      const linkPage = link.getAttribute("data-page");
      console.log("Link page:", linkPage); // Debug log

      if (linkPage === currentPage) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
        console.log(`Active link set for page: ${linkPage}`); // Debug log
      }
    });
  }

  setActiveNavLink();

  // Update active link when clicking on nav links
  document
    .querySelectorAll(".navbar-nav .nav-link[data-page]")
    .forEach((link) => {
      link.addEventListener("click", function () {
        // Remove active from all navbar links
        document
          .querySelectorAll(".navbar-nav .nav-link[data-page]")
          .forEach((l) => {
            l.classList.remove("active");
            l.removeAttribute("aria-current");
          });

        // Add active to clicked link
        this.classList.add("active");
        this.setAttribute("aria-current", "page");
      });
    });

  // Modern Navbar Scroll Effect
  let lastScrollTop = 0;
  const navbar = document.querySelector(".navbar");

  if (navbar) {
    window.addEventListener(
      "scroll",
      () => {
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;

        // Add/remove scrolled class for styling
        if (scrollTop > 50) {
          navbar.classList.add("navbar-scrolled");
        } else {
          navbar.classList.remove("navbar-scrolled");
        }

        // Hide/show navbar on scroll direction
        if (scrollTop > lastScrollTop && scrollTop > 100) {
          // Scrolling down - hide navbar
          navbar.classList.add("navbar-hidden");
        } else {
          // Scrolling up - show navbar
          navbar.classList.remove("navbar-hidden");
        }

        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
      },
      { passive: true }
    );
  }
});
