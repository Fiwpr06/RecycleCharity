// YouTube Video Handler - v7.0 - Updated for YouTube iframe
console.log(
  "YouTube video handler script v7.0 loaded at:",
  new Date().toISOString()
);
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, checking if video elements exist...");

  // Chỉ chạy video handler nếu có elements video (tức là ở trang chủ)
  const storyImage = document.getElementById("storyImage");
  const storyVideo = document.getElementById("storyVideo");
  const playOverlay = document.getElementById("playOverlay");
  const sloganImageContainer = document.querySelector(".slogan-image");

  if (storyImage && storyVideo && playOverlay && sloganImageContainer) {
    console.log("Video elements found, initializing YouTube video handler...");
    // Đợi một chút để đảm bảo tất cả elements đã load
    setTimeout(initYouTubeVideoHandler, 100);
  } else {
    console.log(
      "Video elements not found, skipping video handler (not homepage)"
    );
  }
});

function initYouTubeVideoHandler() {
  const storyImage = document.getElementById("storyImage");
  const storyVideo = document.getElementById("storyVideo");
  const playOverlay = document.getElementById("playOverlay");
  const sloganImageContainer = document.querySelector(".slogan-image");

  console.log("YouTube video elements found:", {
    storyImage: !!storyImage,
    storyVideo: !!storyVideo,
    playOverlay: !!playOverlay,
    sloganImageContainer: !!sloganImageContainer,
  });

  // Tất cả elements đã được kiểm tra trước khi gọi function này

  let isVideoMode = false;

  // Function để hiện lại ảnh - FORCE RESET cho YouTube
  function forceShowImage() {
    console.log("FORCE: Switching back to image");
    isVideoMode = false;

    // Stop YouTube video by resetting src to stop autoplay
    const currentSrc = storyVideo.src;
    if (currentSrc.includes("autoplay=1")) {
      storyVideo.src = currentSrc.replace("autoplay=1", "autoplay=0");
    }

    // Force hide video
    storyVideo.style.display = "none";
    storyVideo.style.visibility = "hidden";

    // Force show image
    storyImage.style.display = "block";
    storyImage.style.visibility = "visible";
    playOverlay.style.display = "flex";
    playOverlay.style.visibility = "visible";
    playOverlay.style.opacity = "1";
    playOverlay.style.pointerEvents = "auto";
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

  // Function để chuyển sang YouTube video
  function showVideo() {
    console.log("FORCE: Switching to YouTube video");
    isVideoMode = true;

    // Hide image and overlay completely
    storyImage.style.display = "none";
    playOverlay.style.display = "none";
    playOverlay.style.opacity = "0";
    playOverlay.style.visibility = "hidden";
    playOverlay.style.pointerEvents = "none";

    // Show YouTube video and enable autoplay
    storyVideo.style.display = "block";
    const currentSrc = storyVideo.src;
    if (currentSrc.includes("autoplay=0")) {
      storyVideo.src = currentSrc.replace("autoplay=0", "autoplay=1");
    }
  }

  // Click handler để chuyển sang video
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

  // Click on video iframe để quay lại image
  storyVideo.addEventListener("click", function (e) {
    e.stopPropagation();
    console.log("YouTube iframe clicked, switching back to image");
    forceShowImage();
  });

  // Keyboard support để quay lại image
  document.addEventListener("keydown", function (e) {
    if (isVideoMode && e.code === "Escape") {
      e.preventDefault();
      console.log("Escape pressed, switching back to image");
      forceShowImage();
    }
  });

  // Initialize in image mode
  forceShowImage();

  console.log("Video handler initialized successfully");
}
