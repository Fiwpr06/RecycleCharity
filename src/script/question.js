document.addEventListener("DOMContentLoaded", function () {
  // Dữ liệu cho 3 loại quiz
  const quizzesData = {
    phanloairac: {
      title: "Quiz: Phân loại rác thải",
      questions: [
        {
          question: "Rác thải nào sau đây KHÔNG thể tái chế?",
          options: ["Chai nhựa PET", "Giấy báo cũ", "Túi nilon dơ", "Lon nhôm"],
          correctAnswer: 2,
          explanation:
            "Túi nilon dơ thường không thể tái chế vì bị nhiễm bẩn và khó xử lý.",
        },
        {
          question: "Rác thải hữu cơ bao gồm những loại nào?",
          options: ["Chai nhựa", "Lá cây", "Pin cũ", "Kính vỡ"],
          correctAnswer: 1,
          explanation:
            "Rác thải hữu cơ bao gồm các loại dễ phân hủy như lá cây, thức ăn thừa.",
        },
        {
          question: "Loại rác nào nên bỏ vào thùng tái chế?",
          options: [
            "Thức ăn thừa",
            "Chai nhựa PET",
            "Khăn giấy bẩn",
            "Đồ gốm vỡ",
          ],
          correctAnswer: 1,
          explanation: "Chai nhựa PET có thể tái chế nếu được phân loại đúng.",
        },
        {
          question: "Rác thải nguy hại bao gồm những loại nào?",
          options: ["Pin cũ", "Giấy báo", "Vỏ chai nước", "Hộp sữa"],
          correctAnswer: 0,
          explanation: "Pin cũ chứa hóa chất độc hại nên được xử lý riêng.",
        },
        {
          question: "Kính vỡ nên được xử lý như thế nào?",
          options: ["Tái chế", "Chôn lấp", "Đốt", "Compost"],
          correctAnswer: 1,
          explanation:
            "Kính vỡ không dễ tái chế và thường được chôn lấp an toàn.",
        },
        {
          question: "Hành động nào giúp phân loại rác hiệu quả?",
          options: ["Vứt lẫn lộn", "Rửa sạch bao bì", "Đốt rác", "Chôn rác"],
          correctAnswer: 1,
          explanation: "Rửa sạch bao bì giúp phân loại rác dễ dàng hơn.",
        },
        {
          question: "Rác thải điện tử nên được xử lý ở đâu?",
          options: [
            "Thùng rác thường",
            "Trung tâm tái chế",
            "Sông",
            "Đất trống",
          ],
          correctAnswer: 1,
          explanation:
            "Rác thải điện tử cần được xử lý tại trung tâm tái chế chuyên dụng.",
        },
        {
          question: "Loại rác nào phù hợp để ủ compost?",
          options: ["Vỏ táo", "Chai nhựa", "Pin", "Kính"],
          correctAnswer: 0,
          explanation: "Vỏ táo là rác hữu cơ, phù hợp để ủ compost.",
        },
        {
          question: "Nhựa dẻo nên được bỏ vào thùng nào?",
          options: [
            "Thùng tái chế",
            "Thùng rác thường",
            "Thùng hữu cơ",
            "Thùng nguy hại",
          ],
          correctAnswer: 1,
          explanation:
            "Nhựa dẻo thường không tái chế được và nên bỏ vào thùng rác thường.",
        },
        {
          question: "Tại sao cần phân loại rác trước khi tái chế?",
          options: [
            "Giảm ô nhiễm",
            "Tăng chi phí",
            "Làm chậm tái chế",
            "Không cần thiết",
          ],
          correctAnswer: 0,
          explanation:
            "Phân loại rác giúp giảm ô nhiễm và tăng hiệu quả tái chế.",
        },
      ],
    },
    loiichtaiche: {
      title: "Quiz: Lợi ích của tái chế",
      questions: [
        {
          question: "Tái chế giấy giúp tiết kiệm bao nhiêu cây xanh mỗi tấn?",
          options: ["5 cây", "10 cây", "17 cây", "25 cây"],
          correctAnswer: 2,
          explanation:
            "Mỗi tấn giấy tái chế giúp tiết kiệm khoảng 17 cây xanh.",
        },
        {
          question: "Tái chế giúp giảm loại khí nào gây biến đổi khí hậu?",
          options: ["Oxy", "Carbon Dioxide", "Nitơ", "Hydro"],
          correctAnswer: 1,
          explanation:
            "Tái chế giảm lượng khí CO2 phát thải bằng cách giảm sản xuất mới.",
        },
        {
          question: "Tái chế kim loại tiết kiệm bao nhiêu năng lượng?",
          options: ["20%", "50%", "75%", "95%"],
          correctAnswer: 2,
          explanation:
            "Tái chế kim loại tiết kiệm khoảng 75% năng lượng so với khai thác mới.",
        },
        {
          question: "Tái chế nhựa tiết kiệm bao nhiêu gallon nước mỗi tấn?",
          options: [
            "500 gallon",
            "1.000 gallon",
            "3.000 gallon",
            "5.000 gallon",
          ],
          correctAnswer: 2,
          explanation:
            "Quá trình tái chế nhựa tiết kiệm khoảng 3.000 gallon nước.",
        },
        {
          question: "Ngành tái chế tạo ra bao nhiêu việc làm trên toàn cầu?",
          options: ["Hàng trăm", "Hàng nghìn", "Hàng triệu", "Hàng tỷ"],
          correctAnswer: 2,
          explanation:
            "Ngành tái chế tạo ra hàng triệu việc làm trên toàn cầu.",
        },
        {
          question: "Tái chế giúp giảm lượng rác thải ở đâu?",
          options: ["Bãi rác", "Sông", "Biển", "Tất cả các nơi trên"],
          correctAnswer: 3,
          explanation: "Tái chế giảm lượng rác thải ở bãi rác, sông, và biển.",
        },
        {
          question: "Tái chế giấy tiết kiệm bao nhiêu nước mỗi tấn?",
          options: [
            "1.000 gallon",
            "3.000 gallon",
            "7.000 gallon",
            "10.000 gallon",
          ],
          correctAnswer: 2,
          explanation:
            "Mỗi tấn giấy tái chế tiết kiệm khoảng 7.000 gallon nước.",
        },
        {
          question: "Lợi ích kinh tế của tái chế là gì?",
          options: [
            "Tăng chi phí",
            "Giảm việc làm",
            "Tiết kiệm nguyên liệu",
            "Ô nhiễm tăng",
          ],
          correctAnswer: 2,
          explanation:
            "Tái chế giúp tiết kiệm nguyên liệu thô và giảm chi phí xử lý rác.",
        },
      ],
    },
    taichenhua: {
      title: "Quiz: Tái chế nhựa",
      questions: [
        {
          question: "Loại nhựa nào thường được dùng cho chai nước?",
          options: ["PVC (3)", "PET (1)", "PP (5)", "PS (6)"],
          correctAnswer: 1,
          explanation:
            "Nhựa PET (1) được sử dụng phổ biến cho chai nước vì tính an toàn.",
        },
        {
          question: "Loai nhựa nào khó tái chế nhất?",
          options: ["PET (1)", "HDPE (2)", "PVC (3)", "PP (5)"],
          correctAnswer: 2,
          explanation: "Nhựa PVC (3) khó tái chế do chứa hóa chất độc hại.",
        },
        {
          question: "Nhựa HDPE (2) thường được dùng để làm gì?",
          options: ["Chai nước", "Chai sữa", "Hộp đựng thức ăn", "Túi nylon"],
          correctAnswer: 1,
          explanation:
            "Nhựa HDPE (2) thường được dùng để làm chai sữa vì độ bền cao.",
        },
        {
          question: "Ký hiệu nào trên bao bì nhựa cho biết có thể tái chế?",
          options: [
            "Tam giác với số",
            "Hình vuông",
            "Hình tròn",
            "Không có ký hiệu",
          ],
          correctAnswer: 0,
          explanation:
            "Tam giác với số (Resin Identification Code) cho biết loại nhựa và khả năng tái chế.",
        },
        {
          question: "Nhựa PP (5) thường được dùng để làm gì?",
          options: ["Chai nước", "Hộp đựng thức ăn", "Ống nước", "Xốp"],
          correctAnswer: 1,
          explanation:
            "Nhựa PP (5) thường được dùng làm hộp đựng thức ăn vì chịu nhiệt tốt.",
        },
        {
          question: "Tại sao nhựa dơ khó tái chế?",
          options: ["Không có công nghệ", "Nhiễm bẩn", "Màu sắc", "Kích thước"],
          correctAnswer: 1,
          explanation:
            "Nhựa dơ khó tái chế vì nhiễm bẩn, làm giảm chất lượng nguyên liệu.",
        },
        {
          question: "Nhựa tái chế có thể được dùng để làm gì?",
          options: ["Đồ chơi", "Quần áo", "Đường xá", "Tất cả các thứ trên"],
          correctAnswer: 3,
          explanation:
            "Nhựa tái chế có thể được dùng để làm đồ chơi, quần áo, và cả đường xá.",
        },
        {
          question: "Tái chế nhựa giúp giảm bao nhiêu CO2 mỗi tấn?",
          options: ["0,5 tấn", "1 tấn", "2 tấn", "3 tấn"],
          correctAnswer: 2,
          explanation:
            "Mỗi tấn nhựa tái chế giúp giảm khoảng 2 tấn CO2 phát thải.",
        },
        {
          question: "Loại nhựa nào thường được dùng làm túi nylon?",
          options: ["LDPE (4)", "PET (1)", "PP (5)", "PS (6)"],
          correctAnswer: 0,
          explanation:
            "Nhựa LDPE (4) thường được dùng để làm túi nylon vì tính mềm dẻo.",
        },
        {
          question: "Nhựa tái chế có thể làm chai nước mới không?",
          options: [
            "Không",
            "Có, nếu là PET",
            "Chỉ làm túi",
            "Chỉ làm đồ chơi",
          ],
          correctAnswer: 1,
          explanation:
            "Nhựa PET tái chế có thể được dùng làm chai nước mới nếu đạt tiêu chuẩn an toàn.",
        },
        {
          question: "Tỷ lệ nhựa được tái chế trên toàn cầu là bao nhiêu?",
          options: ["5%", "9%", "20%", "50%"],
          correctAnswer: 1,
          explanation:
            "Chỉ khoảng 9% nhựa trên toàn cầu được tái chế, còn lại bị thải ra môi trường.",
        },
        {
          question: "Hành động nào giúp tái chế nhựa hiệu quả hơn?",
          options: ["Vứt lẫn lộn", "Phân loại nhựa", "Đốt nhựa", "Chôn nhựa"],
          correctAnswer: 1,
          explanation: "Phân loại nhựa theo ký hiệu giúp tái chế hiệu quả hơn.",
        },
      ],
    },
  };

  let currentQuiz = null;
  let currentQuestionIndex = 0;
  let userScore = 0;
  let userAnswers = [];

  const quizTitle = document.getElementById("quiz-title");
  const questionText = document.getElementById("question-text");
  const answerOptions = document.getElementById("answer-options");
  const currentQuestionNumber = document.getElementById(
    "current-question-number"
  );
  const totalQuestions = document.getElementById("total-questions");
  const nextQuestionBtn = document.getElementById("next-question-btn");
  const quizContentArea = document.getElementById("quiz-content-area");
  const quizResultArea = document.getElementById("quiz-result-area");
  const finalScore = document.getElementById("final-score");
  const resultMessage = document.getElementById("result-message");
  const answerExplanations = document.getElementById("answer-explanations");

  // Khởi tạo quiz khi nhấn nút "Bắt đầu Quiz"
  document.querySelectorAll(".quiz-start-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const quizId = this.getAttribute("data-quiz-id");
      currentQuiz = quizzesData[quizId];
      currentQuestionIndex = 0;
      userScore = 0;
      userAnswers = [];
      quizTitle.textContent = currentQuiz.title;
      totalQuestions.textContent = currentQuiz.questions.length;
      quizContentArea.style.display = "block";
      quizResultArea.style.display = "none";
      renderQuestion();
    });
  });

  // Render câu hỏi
  function renderQuestion() {
    const question = currentQuiz.questions[currentQuestionIndex];
    questionText.textContent = `Câu hỏi ${currentQuestionIndex + 1}: ${
      question.question
    }`;
    currentQuestionNumber.textContent = currentQuestionIndex + 1;

    answerOptions.innerHTML = question.options
      .map(
        (option, index) => `
        <button type="button" class="list-group-item list-group-item-action" data-index="${index}">
          ${String.fromCharCode(65 + index)}. ${option}
        </button>
      `
      )
      .join("");

    answerOptions.querySelectorAll(".list-group-item").forEach((button) => {
      button.classList.remove("active");
      button.addEventListener("click", function () {
        answerOptions
          .querySelectorAll(".list-group-item")
          .forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");
      });
    });

    nextQuestionBtn.disabled = false;
    nextQuestionBtn.innerHTML =
      currentQuestionIndex === currentQuiz.questions.length - 1
        ? "Hoàn thành <i class='bi bi-check-circle-fill'></i>"
        : "Câu tiếp theo <i class='bi bi-arrow-right-short'></i>";
  }

  // Xử lý nút "Câu tiếp theo" hoặc "Hoàn thành"
  nextQuestionBtn.addEventListener("click", function () {
    const selectedOption = answerOptions.querySelector(
      ".list-group-item.active"
    );
    if (!selectedOption) {
      alert("Vui lòng chọn một đáp án!");
      return;
    }

    const userAnswer = parseInt(selectedOption.getAttribute("data-index"));
    userAnswers[currentQuestionIndex] = userAnswer;

    if (
      userAnswer === currentQuiz.questions[currentQuestionIndex].correctAnswer
    ) {
      userScore += 10;
    }

    currentQuestionIndex++;

    if (currentQuestionIndex < currentQuiz.questions.length) {
      renderQuestion();
    } else {
      showResults();
    }
  });

  // Hiển thị kết quả
  function showResults() {
    quizContentArea.style.display = "none";
    quizResultArea.style.display = "block";

    const totalScore = currentQuiz.questions.length * 10;
    finalScore.textContent = `${userScore}/${totalScore}`;
    resultMessage.textContent =
      userScore / totalScore >= 0.8
        ? "Xuất sắc! Bạn rất hiểu biết về tái chế!"
        : userScore / totalScore >= 0.5
        ? "Tốt lắm! Bạn có kiến thức nền tảng vững chắc!"
        : "Hãy cố gắng hơn ở lần sau nhé!";

    answerExplanations.innerHTML = currentQuiz.questions
      .map(
        (question, index) => `
        <div class="mb-3">
          <p class="fw-bold">Câu ${index + 1}: ${question.question}</p>
          <p>Đáp án của bạn: <strong>${String.fromCharCode(
            65 + userAnswers[index]
          )}</strong> -
            Đáp án đúng: <strong>${String.fromCharCode(
              65 + question.correctAnswer
            )}</strong></p>
          <p class="text-muted">${question.explanation}</p>
        </div>
      `
      )
      .join("");

    const userScoreElement = document.getElementById("userScore");
    if (userScoreElement) {
      userScoreElement.textContent = `${userScore}/${totalScore}`;
      localStorage.setItem("userScore", `${userScore}/${totalScore}`);
    }
  }
});
