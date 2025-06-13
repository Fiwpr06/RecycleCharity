// Hero Carousel JavaScript
class HeroCarousel {
  constructor() {
    this.currentSlide = 0;
    this.totalSlides = 4;
    this.autoPlayInterval = null;
    this.autoPlayDelay = 5000; // 5 seconds

    this.init();
  }

  init() {
    this.slides = document.querySelectorAll('.hero-carousel .slide');
    this.indicators = document.querySelectorAll('.hero-carousel .indicator');
    this.carousel = document.querySelector('.hero-carousel');

    if (!this.slides.length || !this.indicators.length) return;

    // Set up event listeners
    this.setupEventListeners();

    // Show first slide
    this.showSlide(0);

    // Start auto-play
    this.startAutoPlay();
  }

  setupEventListeners() {
    // Indicator clicks
    this.indicators.forEach((indicator) => {
      indicator.addEventListener('click', () => {
        const slideIndex = parseInt(indicator.dataset.slide);
        this.goToSlide(slideIndex);
      });
    });



    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.previousSlide();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
      }
    });
  }

  showSlide(index) {
    // Remove all classes from slides
    this.slides.forEach((slide, i) => {
      slide.classList.remove('active', 'slide-in-right', 'slide-out-left', 'slide-out-right');

      if (i === index) {
        slide.classList.add('active');
      } else if (i < index) {
        slide.classList.add('slide-out-left');
      } else {
        slide.classList.add('slide-out-right');
      }
    });

    // Update indicators
    this.indicators.forEach((indicator, i) => {
      indicator.classList.toggle('active', i === index);
    });

    this.currentSlide = index;
  }

  goToSlide(index) {
    if (index === this.currentSlide) return;

    this.showSlide(index);

    // Restart auto-play after manual interaction
    this.restartAutoPlay();
  }

  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.totalSlides;
    this.goToSlide(nextIndex);
  }

  previousSlide() {
    const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.goToSlide(prevIndex);
  }

  startAutoPlay() {
    if (this.autoPlayInterval) return;

    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, this.autoPlayDelay);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  restartAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  // Public methods for external control
  pause() {
    this.stopAutoPlay();
  }

  resume() {
    this.startAutoPlay();
  }

  destroy() {
    this.stopAutoPlay();
    // Remove event listeners if needed
  }
}

// Initialize carousel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.heroCarousel = new HeroCarousel();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeroCarousel;
}
