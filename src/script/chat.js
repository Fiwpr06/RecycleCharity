// Lấy các phần tử từ DOM
const chatArea = document.getElementById("aiChatArea");
const userInput = document.getElementById("userInput");
const sendTextBtn = document.getElementById("sendTextBtn");
const sendVoiceBtn = document.getElementById("sendVoiceBtn");

// API Configuration
const API_BASE_URL = 'http://localhost:5001/api';
let isLoading = false;

// Hàm format text với markdown-like syntax nâng cao
const formatMessage = (text) => {
  // Thay thế các ký tự markdown cơ bản
  let formattedText = text
    // Headers (##)
    .replace(/^##\s+(.+)$/gm, '<h4 class="message-header">$1</h4>')
    // Bold text với highlight
    .replace(/\*\*(.*?)\*\*/g, '<span class="highlight-text">$1</span>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks hoặc technical terms
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // Important notes với !
    .replace(/^!\s+(.+)$/gm, '<div class="important-note"><i class="bi bi-exclamation-triangle"></i> $1</div>')
    // Tips với >
    .replace(/^>\s+(.+)$/gm, '<div class="tip-box"><i class="bi bi-lightbulb"></i> $1</div>')
    // Line breaks - double line breaks become paragraph breaks
    .replace(/\n\n/g, '</p><p>')
    // Single line breaks
    .replace(/\n/g, '<br>')
    // Bullet points với * hoặc -
    .replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>')
    // Numbered lists
    .replace(/^\d+\.\s+(.+)$/gm, '<li class="numbered-item">$1</li>');

  // Wrap consecutive <li> elements in <ul>
  formattedText = formattedText.replace(/(<li(?:\s+class="[^"]*")?>.*?<\/li>)(?:\s*<li(?:\s+class="[^"]*")?>.*?<\/li>)*/gs, (match) => {
    if (match.includes('numbered-item')) {
      return '<ol class="formatted-list numbered-list">' + match.replace(/class="numbered-item"/g, '') + '</ol>';
    }
    return '<ul class="formatted-list">' + match + '</ul>';
  });

  // Wrap in paragraph tags if not already wrapped
  if (!formattedText.startsWith('<p>') && !formattedText.startsWith('<ul>') && !formattedText.startsWith('<ol>') && !formattedText.startsWith('<h4>')) {
    formattedText = '<p>' + formattedText + '</p>';
  }

  // Clean up empty paragraphs
  formattedText = formattedText.replace(/<p><\/p>/g, '');

  return formattedText;
};

// Hàm tạo tin nhắn (AI hoặc người dùng)
const createMessage = (messageText, isUser = false) => {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("mb-3", isUser ? "user-message" : "ai-message");

  // Thêm avatar cho AI
  if (!isUser) {
    const avatarDiv = document.createElement("div");
    avatarDiv.classList.add("ai-avatar");
    avatarDiv.innerHTML = `
      <div class="ai-icon">
        <i class="bi bi-robot"></i>
      </div>
      <div class="ai-status-indicator"></div>
    `;
    messageDiv.appendChild(avatarDiv);
  }

  const bubbleDiv = document.createElement("div");
  bubbleDiv.classList.add("message-bubble", isUser ? "user" : "ai");

  const messageP = document.createElement("div");
  messageP.classList.add("mb-0", "message-content");

  if (isUser) {
    // User messages - plain text
    messageP.textContent = messageText;
  } else {
    // AI messages - formatted HTML với animation
    messageP.innerHTML = formatMessage(messageText);
    // Thêm animation cho AI message
    setTimeout(() => {
      messageP.classList.add("message-appear");
    }, 100);
  }

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

// Hàm tạo tin nhắn loading
const createLoadingMessage = () => {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("mb-3", "ai-message", "loading-message");

  const bubbleDiv = document.createElement("div");
  bubbleDiv.classList.add("message-bubble", "ai");

  const loadingDiv = document.createElement("div");
  loadingDiv.classList.add("mb-0");
  loadingDiv.innerHTML = `
    <div class="typing-indicator">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>
  `;

  bubbleDiv.appendChild(loadingDiv);
  messageDiv.appendChild(bubbleDiv);

  return messageDiv;
};

// Hàm gọi API để chat với AI
const callAIAPI = async (message) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: message })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Có lỗi xảy ra khi gọi API');
    }

    return data.data.message;
  } catch (error) {
    console.error('API Error:', error);

    // Handle different types of errors
    if (error.message.includes('Failed to fetch')) {
      return 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.';
    }

    return error.message || 'Có lỗi xảy ra khi xử lý câu hỏi. Vui lòng thử lại sau.';
  }
};

// Hàm cập nhật trạng thái loading cho button
const setLoadingState = (loading) => {
  isLoading = loading;
  sendTextBtn.disabled = loading;
  userInput.disabled = loading;

  if (loading) {
    sendTextBtn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
  } else {
    sendTextBtn.innerHTML = '<i class="bi bi-send-fill"></i>';
  }
};

// Hàm gửi tin nhắn
const sendMessage = async () => {
  const messageText = userInput.value.trim();
  if (!messageText || isLoading) return; // Không gửi nếu input rỗng hoặc đang loading

  // Set loading state
  setLoadingState(true);

  // Thêm tin nhắn người dùng
  const userMessage = createMessage(messageText, true);
  chatArea.appendChild(userMessage);
  scrollToBottom();

  // Reset input
  userInput.value = "";

  // Thêm loading message
  const loadingMessage = createLoadingMessage();
  chatArea.appendChild(loadingMessage);
  scrollToBottom();

  try {
    // Gọi API để lấy phản hồi từ AI
    const aiResponse = await callAIAPI(messageText);

    // Xóa loading message
    chatArea.removeChild(loadingMessage);

    // Thêm phản hồi AI
    const aiMessage = createMessage(aiResponse, false);
    chatArea.appendChild(aiMessage);
    scrollToBottom();

  } catch (error) {
    console.error('Send Message Error:', error);

    // Xóa loading message
    if (chatArea.contains(loadingMessage)) {
      chatArea.removeChild(loadingMessage);
    }

    // Thêm error message
    const errorMessage = createMessage(
      'Xin lỗi, có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.',
      false
    );
    chatArea.appendChild(errorMessage);
    scrollToBottom();
  } finally {
    // Reset loading state
    setLoadingState(false);
  }
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
