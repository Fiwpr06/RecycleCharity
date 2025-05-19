import Swal from "sweetalert2";

// Form Validation
const form = document.getElementById("collectionForm");
if (form) {
  const wasteTypeFeedback = document.getElementById("wasteTypeFeedback");
  const checkboxes = form.querySelectorAll('input[type="checkbox"]');

  // Ẩn feedback mặc định khi tải trang
  if (wasteTypeFeedback) {
    wasteTypeFeedback.style.display = "none";
  }

  // Hàm kiểm tra trạng thái checkbox
  const checkCheckboxValidation = () => {
    if (!checkboxes.length) return false; // Kiểm tra nếu không có checkbox
    const isChecked = Array.from(checkboxes).some(
      (checkbox) => checkbox.checked
    );
    if (wasteTypeFeedback) {
      wasteTypeFeedback.style.display = isChecked ? "none" : "block";
    }
    return isChecked;
  };

  // Lắng nghe sự kiện thay đổi trên từng checkbox
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      checkCheckboxValidation();
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.classList.add("was-validated");

    const isChecked = checkCheckboxValidation();

    if (form.checkValidity() && isChecked) {
      // Thông báo thành công với SweetAlert2
      Swal.fire({
        title: "Đăng ký thành công!",
        text: "Chúng tôi sẽ liên hệ bạn sớm để sắp xếp thu gom rác tái chế.",
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
        if (wasteTypeFeedback) {
          wasteTypeFeedback.style.display = "none"; // Ẩn feedback sau khi reset
        }
      });
    } else {
      // Thông báo lỗi nếu form không hợp lệ
      Swal.fire({
        title: "Lỗi!",
        text: "Vui lòng điền đầy đủ thông tin và chọn ít nhất một loại rác tái chế.",
        icon: "error",
        confirmButtonText: "Thử lại",
        confirmButtonColor: "#dc3545", // Màu đỏ
        background: "#f8f9fa",
        customClass: {
          popup: "animated shake", // Hiệu ứng lỗi
          confirmButton: "btn btn-danger",
        },
      });
    }
  });
}
