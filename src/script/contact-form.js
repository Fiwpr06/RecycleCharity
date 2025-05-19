import Swal from "sweetalert2";

const form = document.getElementById("contactForm");
const feedback = document.getElementById("formFeedback");

if (form) {
  if (feedback) {
    feedback.style.display = "none";
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.classList.add("was-validated");

    // Kiểm tra tính hợp lệ của form
    if (form.checkValidity()) {
      // Thông báo thành công với SweetAlert2
      Swal.fire({
        title: "Gửi tin nhắn thành công!",
        text: "Chúng tôi sẽ phản hồi bạn sớm nhất có thể. Cảm ơn bạn đã liên hệ!",
        icon: "success",
        confirmButtonText: "Đóng",
        confirmButtonColor: "#28a745", // Màu xanh lá
        background: "#f8f9fa", // Nền sáng
        customClass: {
          popup: "animated bounceIn", // Hiệu ứng xuất hiện
          confirmButton: "btn btn-success",
        },
      }).then(() => {
        // Reset form sau khi đóng thông báo
        form.reset();
        form.classList.remove("was-validated");

        // Hiển thị thông báo trong formFeedback
        if (feedback) {
          feedback.style.display = "block";
          feedback.className = "mt-3 text-success";
          feedback.textContent = "Tin nhắn của bạn đã được gửi thành công!";
          // Tự động ẩn feedback sau 5 giây
          setTimeout(() => {
            feedback.style.display = "none";
          }, 5000);
        }
      });
    } else {
      // Thông báo lỗi nếu form không hợp lệ
      Swal.fire({
        title: "Lỗi!",
        text: "Vui lòng điền đầy đủ các trường bắt buộc.",
        icon: "error",
        confirmButtonText: "Thử lại",
        confirmButtonColor: "#dc3545", // Màu đỏ
        background: "#f8f9fa",
        customClass: {
          popup: "animated shake", // Hiệu ứng lỗi
          confirmButton: "btn btn-danger",
        },
      });

      // Hiển thị thông báo lỗi trong formFeedback
      if (feedback) {
        feedback.style.display = "block";
        feedback.className = "mt-3 text-danger";
        feedback.textContent = "Vui lòng điền đầy đủ các trường bắt buộc.";
      }
    }
  });
}
