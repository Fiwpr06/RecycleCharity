document.addEventListener("DOMContentLoaded", function () {
  // Dữ liệu hạng mục chi tiêu
  const transparencyData = [
    {
      icon: "bi-tree-fill",
      iconClass: "text-success",
      category: "Trồng cây xanh",
      amount: 20000000,
      description:
        "Mua cây giống, phân bón và chi phí tổ chức các buổi trồng cây tại cộng đồng.",
    },
    {
      icon: "bi-people-fill",
      iconClass: "text-info",
      category: "Hỗ trợ cộng đồng",
      amount: 15000000,
      description:
        "Tặng quà, nhu yếu phẩm cho các hộ gia đình khó khăn tham gia tích cực vào việc tái chế.",
    },
    {
      icon: "bi-book-half",
      iconClass: "text-warning",
      category: "Hoạt động giáo dục",
      amount: 10000000,
      description:
        "Tổ chức workshop, in ấn tài liệu, phát triển nội dung giáo dục về tái chế.",
    },
    {
      icon: "bi-gear-fill",
      iconClass: "text-secondary",
      category: "Chi phí vận hành dự án",
      amount: 5000000,
      description:
        "Chi phí vận chuyển rác, thuê kho bãi (nếu có), và các chi phí hành chính nhỏ.",
    },
  ];

  const transparencyTableBody = document.getElementById(
    "transparencyTableBody"
  );
  const transparencyTableFooter = document.getElementById(
    "transparencyTableFooter"
  );

  // Hàm định dạng tiền tệ
  function formatCurrency(amount) {
    return amount.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  }

  // Render tbody
  if (transparencyTableBody) {
    transparencyTableBody.innerHTML = "";
    transparencyData.forEach((item, index) => {
      const tr = document.createElement("tr");
      tr.setAttribute("data-aos", "fade-up");
      tr.setAttribute("data-aos-delay", `${300 + index * 100}`); // Delay tăng dần

      const tdCategory = document.createElement("td");
      tdCategory.innerHTML = `<i class="bi ${item.icon} me-2 ${item.iconClass}"></i>${item.category}`;
      tr.appendChild(tdCategory);

      const tdAmount = document.createElement("td");
      tdAmount.classList.add("text-end", "fw-semibold");
      tdAmount.textContent = formatCurrency(item.amount).replace("₫", "");
      tr.appendChild(tdAmount);

      const tdDescription = document.createElement("td");
      tdDescription.textContent = item.description;
      tr.appendChild(tdDescription);

      transparencyTableBody.appendChild(tr);
    });
  }

  // Tính tổng chi và render tfoot
  if (transparencyTableFooter) {
    const totalAmount = transparencyData.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    transparencyTableFooter.innerHTML = `
      <tr>
        <th scope="row" class="fw-bold text-center">Tổng chi</th>
        <td class="text-end fw-bold">${formatCurrency(totalAmount).replace(
          "₫",
          ""
        )}</td>
        <td></td>
      </tr>
    `;
  }
});
