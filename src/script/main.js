import AOS from "aos";
import "aos/dist/aos.css";

document.addEventListener("DOMContentLoaded", () => {
  // Khởi tạo AOS
  AOS.init({
    duration: 2000,
    offset: 100,
  });

  // Login/Register Modal
  const authModal = document.getElementById("authModal");
  if (authModal) {
    authModal.addEventListener("show.bs.modal", (event) => {
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
    const currentPath =
      window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".nav-link");

    navLinks.forEach((link) => {
      const linkPath = link.getAttribute("href").replace("./", "");
      if (linkPath === currentPath) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    });
  }

  setActiveNavLink();
});
