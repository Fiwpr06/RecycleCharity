document.addEventListener("DOMContentLoaded", () => {
  const heroSection = document.querySelector(".hero-section");
  const heroVideo = document.querySelector(".hero-video");
  const soundControl = document.getElementById("soundControl");
  const skipControl = document.getElementById("skipControl");
  const container = document.querySelector(".hero-section .container");

  if (heroSection && heroVideo && soundControl && skipControl && container) {
    let isMuted = true; // YouTube video bắt đầu với mute=1

    // Click hero section to play video
    heroSection.addEventListener("click", (event) => {
      // Prevent clicking on controls from triggering video
      if (event.target.closest('#soundControl') || event.target.closest('#skipControl')) {
        return;
      }

      console.log("Hero section clicked");
      container.classList.add("hidden");
      heroSection.classList.add("video-active");
      heroVideo.classList.add("active");
      soundControl.classList.add("active");
      skipControl.classList.add("active");

      // Enable autoplay by updating iframe src
      const currentSrc = heroVideo.src;
      if (currentSrc.includes('autoplay=0')) {
        heroVideo.src = currentSrc.replace('autoplay=0', 'autoplay=1');
      }
    });

    // Skip video function
    const skipVideo = () => {
      console.log("Skipping video");
      heroVideo.classList.remove("active");
      soundControl.classList.remove("active");
      skipControl.classList.remove("active");

      // Reset autoplay to 0 to prevent auto-restart
      const currentSrc = heroVideo.src;
      if (currentSrc.includes('autoplay=1')) {
        heroVideo.src = currentSrc.replace('autoplay=1', 'autoplay=0');
      }

      const feedback = document.createElement("div");
      feedback.textContent = "Đang quay lại...";
      feedback.style.position = "fixed";
      feedback.style.top = "50%";
      feedback.style.left = "50%";
      feedback.style.color = "#fff";
      feedback.style.transform = "translate(-50%, -50%)";
      feedback.style.zIndex = "30";
      feedback.style.fontSize = "1.2rem";
      feedback.style.fontWeight = "bold";
      document.body.appendChild(feedback);

      setTimeout(() => {
        console.log("Resetting UI");
        heroSection.classList.remove("video-active");
        container.classList.remove("hidden");
        isMuted = true;
        soundControl.innerHTML = '<i class="bi bi-volume-mute-fill"></i>';
        feedback.remove();
      }, 2000);
    };

    // Skip control click
    skipControl.addEventListener("click", (event) => {
      event.stopPropagation();
      skipVideo();
    });

    // Sound control click - Toggle mute/unmute by changing iframe src
    soundControl.addEventListener("click", (event) => {
      event.stopPropagation();
      console.log("Sound control clicked");
      isMuted = !isMuted;

      const currentSrc = heroVideo.src;
      if (isMuted) {
        // Mute video
        heroVideo.src = currentSrc.replace('&mute=0', '&mute=1');
        soundControl.innerHTML = '<i class="bi bi-volume-mute-fill"></i>';
      } else {
        // Unmute video
        heroVideo.src = currentSrc.replace('&mute=1', '&mute=0');
        soundControl.innerHTML = '<i class="bi bi-volume-up-fill"></i>';
      }
    });
  } else {
    console.log("Video elements not found on this page - this is normal for pages without video.");
  }
});
