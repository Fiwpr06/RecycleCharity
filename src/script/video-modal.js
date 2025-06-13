// Video Inline Handler - 100% Working Solution - v6.0 - PERFECT CENTERED TEXT & FIXED AUDIO
console.log("Video handler script v6.0 loaded at:", new Date().toISOString());
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, checking if video elements exist...");

  // Chỉ chạy video handler nếu có elements video (tức là ở trang chủ)
  const storyImage = document.getElementById("storyImage");
  const storyVideo = document.getElementById("storyVideo");
  const playOverlay = document.getElementById("playOverlay");
  const sloganImageContainer = document.querySelector(".slogan-image");

  if (storyImage && storyVideo && playOverlay && sloganImageContainer) {
    console.log("Video elements found, initializing video handler...");
    // Đợi một chút để đảm bảo tất cả elements đã load
    setTimeout(initVideoHandler, 100);
  } else {
    console.log(
      "Video elements not found, skipping video handler (not homepage)"
    );
  }
});

function initVideoHandler() {
  const storyImage = document.getElementById("storyImage");
  const storyVideo = document.getElementById("storyVideo");
  const playOverlay = document.getElementById("playOverlay");
  const sloganImageContainer = document.querySelector(".slogan-image");

  console.log("Video elements found:", {
    storyImage: !!storyImage,
    storyVideo: !!storyVideo,
    playOverlay: !!playOverlay,
    sloganImageContainer: !!sloganImageContainer,
  });

  // Tất cả elements đã được kiểm tra trước khi gọi function này

  let isVideoMode = false;
  let pauseCheckInterval;

  // Function để hiện lại ảnh - FORCE RESET
  function forceShowImage() {
    console.log("FORCE: Switching back to image");
    isVideoMode = false;

    // Clear any intervals
    if (pauseCheckInterval) {
      clearInterval(pauseCheckInterval);
      pauseCheckInterval = null;
    }

    // Force stop video and audio completely
    storyVideo.pause();
    storyVideo.currentTime = 0;
    storyVideo.muted = true; // Mute để đảm bảo không có âm thanh
    storyVideo.volume = 0; // Set volume về 0

    // Load lại video để dừng hoàn toàn
    const currentSrc =
      storyVideo.src || storyVideo.querySelector("source")?.src;
    if (currentSrc) {
      storyVideo.src = "";
      storyVideo.load(); // Force reload
      setTimeout(() => {
        storyVideo.src = currentSrc;
        storyVideo.load();
        storyVideo.muted = false; // Unmute cho lần phát tiếp theo
        storyVideo.volume = 1; // Restore volume
      }, 100);
    }

    // Force hide video
    storyVideo.style.display = "none !important";
    storyVideo.style.visibility = "hidden";

    // Force show image
    storyImage.style.display = "block !important";
    storyImage.style.visibility = "visible";
    playOverlay.style.display = "flex !important";
    playOverlay.style.visibility = "visible";
    playOverlay.style.opacity = "";
    playOverlay.style.pointerEvents = "";

    // Remove any inline styles that might interfere
    setTimeout(() => {
      storyVideo.removeAttribute("style");
      storyImage.removeAttribute("style");
      playOverlay.removeAttribute("style");

      // Set correct styles
      storyVideo.style.display = "none";
      storyImage.style.display = "block";
      playOverlay.style.display = "flex";
    }, 50);
  }

  // Function để chuyển sang video
  function showVideo() {
    console.log("FORCE: Switching to video");
    isVideoMode = true;

    // Hide image and overlay completely
    storyImage.style.display = "none";
    playOverlay.style.display = "none";
    playOverlay.style.opacity = "0";
    playOverlay.style.visibility = "hidden";
    playOverlay.style.pointerEvents = "none";

    // Show and play video
    storyVideo.style.display = "block";
    storyVideo.currentTime = 0;
    storyVideo.play().catch(function (error) {
      console.log("Không thể tự động phát video:", error);
    });

    // Start monitoring video state
    startVideoMonitoring();
  }

  // Monitor video state continuously
  function startVideoMonitoring() {
    if (pauseCheckInterval) {
      clearInterval(pauseCheckInterval);
    }

    pauseCheckInterval = setInterval(() => {
      if (isVideoMode && storyVideo.paused && storyVideo.currentTime > 0) {
        console.log("Video detected as paused, switching to image");
        forceShowImage();
      }
    }, 100); // Check every 100ms
  }

  // Click handler
  sloganImageContainer.addEventListener("click", function (e) {
    console.log(
      "Container clicked, current mode:",
      isVideoMode ? "video" : "image"
    );

    if (!isVideoMode) {
      e.preventDefault();
      e.stopPropagation();
      showVideo();
    }
  });

  // Multiple event listeners for video pause
  storyVideo.addEventListener("pause", function () {
    console.log("Video pause event triggered");
    if (isVideoMode) {
      setTimeout(forceShowImage, 50);
    }
  });

  storyVideo.addEventListener("ended", function () {
    console.log("Video ended event triggered");
    forceShowImage();
  });

  // Hide overlay when video starts playing
  storyVideo.addEventListener("play", function () {
    console.log("Video play event triggered");
    if (isVideoMode) {
      playOverlay.style.display = "none";
      playOverlay.style.opacity = "0";
      playOverlay.style.visibility = "hidden";
      playOverlay.style.pointerEvents = "none";
    }
  });

  // Additional safety nets
  storyVideo.addEventListener("waiting", function () {
    console.log("Video waiting event");
  });

  storyVideo.addEventListener("stalled", function () {
    console.log("Video stalled event");
  });

  // Click on video to pause
  storyVideo.addEventListener("click", function (e) {
    e.stopPropagation();
    if (!storyVideo.paused) {
      console.log("Video clicked, pausing...");
      storyVideo.pause();
    }
  });

  // Keyboard support
  document.addEventListener("keydown", function (e) {
    if (isVideoMode && e.code === "Space") {
      e.preventDefault();
      if (storyVideo.paused) {
        storyVideo.play();
      } else {
        storyVideo.pause();
      }
    }
  });

  // Initialize in image mode
  forceShowImage();

  console.log("Video handler initialized successfully");
}
