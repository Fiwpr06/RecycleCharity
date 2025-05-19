// Lấy các phần tử từ DOM
const chatArea = document.getElementById("aiChatArea");
const userInput = document.getElementById("userInput");
const sendTextBtn = document.getElementById("sendTextBtn");
const sendVoiceBtn = document.getElementById("sendVoiceBtn");

// Hàm tạo tin nhắn (AI hoặc người dùng)
const createMessage = (messageText, isUser = false) => {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("mb-3", isUser ? "user-message" : "ai-message");

  const bubbleDiv = document.createElement("div");
  bubbleDiv.classList.add("message-bubble", isUser ? "user" : "ai");

  const messageP = document.createElement("p");
  messageP.classList.add("mb-0");
  messageP.textContent = messageText;

  const timeSpan = document.createElement("span");
  timeSpan.classList.add("message-time", "small", "text-muted");
  const now = new Date();
  timeSpan.textContent = `${now.getHours()}:${now
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;

  bubbleDiv.appendChild(messageP);
  bubbleDiv.appendChild(timeSpan);
  messageDiv.appendChild(bubbleDiv);

  return messageDiv;
};

// Hàm cuộn xuống tin nhắn mới nhất
const scrollToBottom = () => {
  chatArea.scrollTop = chatArea.scrollHeight;
};

// Hàm mô phỏng phản hồi AI
const getAIResponse = (userMessage) => {
  const message = userMessage.toLowerCase();
  if (message.includes("phân loại rác")) {
    return "Rác có thể được phân loại thành: rác tái chế (nhựa, giấy, kim loại), rác hữu cơ (thức ăn thừa), và rác không tái chế (đồ bẩn, không sử dụng được). Bạn nên rửa sạch và phân loại trước khi vứt nhé!";
  } else if (message.includes("tái chế nhựa")) {
    return "Nhựa có thể tái chế bằng cách phân loại (PET, HDPE, v.v.), sau đó được xử lý tại các cơ sở tái chế để làm thành sản phẩm mới như chai nhựa, sợi vải, hoặc đồ gia dụng.";
  } else if (message.includes("lợi ích")) {
    return "Tái chế giúp giảm lượng rác thải, tiết kiệm tài nguyên thiên nhiên, giảm ô nhiễm môi trường, và tiết kiệm năng lượng. Nó cũng góp phần bảo vệ hành tinh cho thế hệ tương lai!";
  } else if (message.includes("rác hữu cơ")) {
    return "Rác hữu cơ (như thức ăn thừa, lá cây) có thể được xử lý bằng cách ủ phân tại nhà hoặc gửi đến các cơ sở xử lý để biến thành phân bón hữu cơ.";
  } else {
    return "Cảm ơn câu hỏi của bạn! Tôi có thể giúp gì thêm về tái chế không? Ví dụ: phân loại rác, tái chế nhựa, hoặc lợi ích của tái chế.";
  }
};

// Hàm gửi tin nhắn
const sendMessage = () => {
  const messageText = userInput.value.trim();
  if (!messageText) return; // Không gửi nếu input rỗng

  // Thêm tin nhắn người dùng
  const userMessage = createMessage(messageText, true);
  chatArea.appendChild(userMessage);
  scrollToBottom();

  // Reset input
  userInput.value = "";

  // Mô phỏng phản hồi AI sau 1 giây
  setTimeout(() => {
    const aiResponse = getAIResponse(messageText);
    const aiMessage = createMessage(aiResponse, false);
    chatArea.appendChild(aiMessage);
    scrollToBottom();
  }, 1000);
};

// Sự kiện nhấn nút gửi
sendTextBtn.addEventListener("click", sendMessage);

// Sự kiện nhấn Enter để gửi
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// Sự kiện nhấn nút giọng nói (mockup)
sendVoiceBtn.addEventListener("click", () => {
  const mockMessage = createMessage(
    "Tính năng gửi bằng giọng nói hiện đang được phát triển. Vui lòng sử dụng nhập văn bản nhé!",
    false
  );
  chatArea.appendChild(mockMessage);
  scrollToBottom();
});

// Xử lý nhấp vào nút gợi ý
document.querySelectorAll(".suggested-question-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const question = button.textContent.trim();
    userInput.value = question; // Đặt câu hỏi vào input
    sendMessage(); // Gửi tin nhắn
  });
});
