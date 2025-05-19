document.addEventListener("DOMContentLoaded", function () {
  const articlesData = {
    1: {
      title: "Tại sao tái chế quan trọng?",
      content: `
        <p>Tái chế là một quá trình quan trọng giúp giảm lượng rác thải ra môi trường bằng cách tái sử dụng nguyên liệu.</p>
        <p>Nó không chỉ tiết kiệm tài nguyên thiên nhiên như gỗ, nước và khoáng sản mà còn giảm lượng khí thải carbon, góp phần làm chậm biến đổi khí hậu.</p>
        <p>Theo thống kê, mỗi tấn giấy được tái chế có thể tiết kiệm khoảng 17 cây xanh và 7.000 gallon nước.</p>
        <p><strong>Hãy cùng hành động để bảo vệ hành tinh của chúng ta!</strong></p>
      `,
    },
    2: {
      title: "Các loại nhựa có thể tái chế",
      content: `
        <p>Nhựa được phân loại dựa trên ký hiệu tái chế (Resin Identification Code - RIC).</p>
        <p>Một số loại phổ biến bao gồm: PET (1) dùng cho chai nước, HDPE (2) dùng cho chai sữa, và PP (5) dùng cho hộp đựng thực phẩm.</p>
        <p>Tuy nhiên, không phải tất cả nhựa đều dễ tái chế; nhựa PVC (3) và PS (6) thường khó xử lý hơn.</p>
        <p><em>Hãy kiểm tra ký hiệu trước khi vứt rác để hỗ trợ quá trình tái chế hiệu quả!</em></p>
      `,
    },
    3: {
      title: "Lợi ích kinh tế từ tái chế",
      content: `
        <p>Tái chế không chỉ thân thiện với môi trường mà còn mang lại lợi ích kinh tế đáng kể.</p>
        <p>Ngành công nghiệp tái chế tạo ra hàng triệu việc làm trên toàn cầu, từ thu gom, phân loại đến sản xuất sản phẩm mới.</p>
        <p>Ví dụ, tại Việt Nam, tái chế nhựa đã giúp tiết kiệm hàng nghìn tỷ đồng mỗi năm nhờ giảm chi phí xử lý rác và khai thác nguyên liệu thô.</p>
        <p><strong>Đây là cơ hội để phát triển kinh tế bền vững!</strong></p>
      `,
    },
  };

  // Xử lý sự kiện khi nhấn nút "Đọc thêm"
  document.querySelectorAll(".read-more-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const articleId = this.getAttribute("data-article-id");
      const article = articlesData[articleId];

      if (article) {
        document.getElementById("articleModalTitle").textContent =
          article.title;
        document.getElementById("articleModalContent").innerHTML =
          article.content; // Sử dụng innerHTML để render HTML
      } else {
        console.error("Article not found for ID:", articleId);
      }
    });
  });
});
