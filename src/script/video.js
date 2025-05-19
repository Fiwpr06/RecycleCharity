document.addEventListener("DOMContentLoaded", () => {
  const heroSection = document.querySelector(".hero-section");
  const heroVideo = document.querySelector(".hero-video");
  const soundControl = document.getElementById("soundControl");
  const skipControl = document.getElementById("skipControl");
  const container = document.querySelector(".hero-section .container");

  if (heroSection && heroVideo && soundControl && skipControl && container) {
    let isMuted = false; // Ban đầu âm thanh bật

    // Click hero section to play video
    heroSection.addEventListener("click", (event) => {
      console.log("Hero section clicked");
      container.classList.add("hidden");
      heroSection.classList.add("video-active");
      heroVideo.classList.add("active");
      heroVideo.muted = false;
      heroVideo.play().catch((error) => {
        console.error("Error playing video:", error);
        heroVideo.muted = true;
        isMuted = true;
        soundControl.innerHTML = '<i class="bi bi-volume-mute-fill"></i>';
        heroVideo.play();
      });
    });

    // Khi video kết thúc
    heroVideo.addEventListener("ended", () => {
      console.log("Video ended");
      heroVideo.pause();
      heroVideo.currentTime = 0;
      heroVideo.classList.remove("active");
      const feedback = document.createElement("div");
      feedback.textContent = "Đang quay lại...";
      feedback.style.position = "fixed";
      feedback.style.top = "50%";
      feedback.style.left = "50%";
      feedback.style.color = "#fff";
      feedback.style.transform = "translate(-50%, -50%)";
      feedback.style.zIndex = "30";
      document.body.appendChild(feedback);
      setTimeout(() => {
        console.log("Resetting UI");
        heroSection.classList.remove("video-active");
        container.classList.remove("hidden");
        isMuted = false;
        heroVideo.muted = false;
        soundControl.innerHTML = '<i class="bi bi-volume-up-fill"></i>';
        feedback.remove();
      }, 2000); // Delay 2 giây (per your latest code)
    });

    // Điều khiển âm thanh
    soundControl.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent heroSection click
      console.log("Sound control clicked");
      isMuted = !isMuted;
      heroVideo.muted = isMuted;
      soundControl.innerHTML = isMuted
        ? '<i class="bi bi-volume-mute-fill"></i>'
        : '<i class="bi bi-volume-up-fill"></i>';
    });
  } else {
    console.error("Required elements not found!");
  }
});
