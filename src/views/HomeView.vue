<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import PocketBase from 'pocketbase'

const isLoaded = ref(false)
const lightboxImage = ref(null)
const features = ref([])
const loadingFeatures = ref(true)
const galleryImages = ref([])
const loadingGallery = ref(true)
const aboutInfo = ref({
  address: 'جاده قدیم قم کاشان، هشت متری اول',
  phone: '۰۹۱۲۱۵۳۴۲۲۷',
})
const loadingAboutInfo = ref(true)

// PocketBase setup
const pb = new PocketBase('https://ajor-ahlr7djtx.liara.run')

// Fetch features from PocketBase
const fetchFeatures = async () => {
  try {
    loadingFeatures.value = true
    const records = await pb.collection('about').getFullList({
      sort: 'created',
    })
    features.value = records.map((record) => ({
      icon: record.icon || '🏗',
      title: record.title || '',
      description: record.dis || '',
    }))
  } catch (error) {
    console.error('Error fetching features:', error)
    // Fallback to default features if API fails
    features.value = [
      {
        icon: '🏗',
        title: 'کیفیت بالا',
        description: 'استفاده از بهترین مواد اولیه و فناوری‌های مدرن در تولید',
      },
      {
        icon: '🚚',
        title: 'ارسال سریع',
        description: 'تحویل فوری و ارسال به تمام نقاط کشور با کیفیت بسته‌بندی عالی',
      },
      {
        icon: '🧱',
        title: 'تنوع محصولات',
        description: 'تولید انواع آجر با ابعاد و کیفیت‌های مختلف متناسب با نیاز شما',
      },
    ]
  } finally {
    loadingFeatures.value = false
  }
}

// Fetch gallery images from PocketBase
const fetchGalleryImages = async () => {
  try {
    loadingGallery.value = true
    const records = await pb.collection('post').getFullList({
      sort: '-created',
    })

    galleryImages.value = records.map((record) => ({
      src: pb.files.getUrl(record, record.field),
      alt: record.name || 'آجر ساختمانی',
      title: record.name || 'آجر ساختمانی',
      description: record.dis || 'آجر با کیفیت بالا',
      loaded: false,
    }))
  } catch (error) {
    console.error('Error fetching gallery images:', error)
    // Fallback to default images if API fails
  } finally {
    loadingGallery.value = false
  }
}

// Fetch about info from PocketBase
const fetchAboutInfo = async () => {
  try {
    loadingAboutInfo.value = true
    const record = await pb.collection('connected').getFirstListItem('address!=""', {
      sort: '-created',
    })

    if (record) {
      aboutInfo.value = {
        address: record.address || 'جاده قدیم قم کاشان، هشت متری اول',
        phone: record.phone || '۰۹۱۲۱۵۳۴۲۲۷',
      }
    }
  } catch (error) {
    console.error('Error fetching about info:', error)
    // Keep default values if API fails
  } finally {
    loadingAboutInfo.value = false
  }
}

// Intersection Observer for scroll animations
const setupScrollAnimations = () => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px',
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated')
        // Add staggered animation for grid items
        if (entry.target.classList.contains('stagger')) {
          const items = entry.target.querySelectorAll('.stagger-item')
          items.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('animated')
            }, index * 100)
          })
        }
      }
    })
  }, observerOptions)

  // Observe all elements with animate-on-scroll class
  const animatedElements = document.querySelectorAll('.animate-on-scroll')
  animatedElements.forEach((el) => observer.observe(el))
}

// Parallax effect for hero background
const setupParallax = () => {
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset
    const parallaxElements = document.querySelectorAll('.parallax-element')

    parallaxElements.forEach((element) => {
      const speed = element.dataset.speed || 0.5
      const yPos = -(scrolled * speed)
      element.style.transform = `translateY(${yPos}px)`
    })
  })
}

const contactUs = () => {
  // Direct call functionality
  window.location.href = 'tel:+989121534227'
}

const scrollToGallery = () => {
  const gallerySection = document.querySelector('.gallery-section')
  if (gallerySection) {
    gallerySection.scrollIntoView({ behavior: 'smooth' })
  }
}

const goToAdmin = () => {
  window.location.href = '/admin'
}

const openLightbox = (image) => {
  lightboxImage.value = image
}

const closeLightbox = () => {
  lightboxImage.value = null
}

const navigateImage = (direction) => {
  if (!lightboxImage.value) return

  const currentIndex = galleryImages.value.findIndex((img) => img.src === lightboxImage.value.src)
  const newIndex =
    (currentIndex + direction + galleryImages.value.length) % galleryImages.value.length
  lightboxImage.value = galleryImages.value[newIndex]
}

// Touch gesture support for mobile
let touchStartX = 0
let touchEndX = 0

const handleTouchStart = (event) => {
  touchStartX = event.changedTouches[0].screenX
}

const handleTouchEnd = (event) => {
  touchEndX = event.changedTouches[0].screenX
  handleSwipe()
}

const handleSwipe = () => {
  const swipeThreshold = 50
  const diff = touchStartX - touchEndX

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe left - next image
      navigateImage(1)
    } else {
      // Swipe right - previous image
      navigateImage(-1)
    }
  }
}

const handleKeydown = (event) => {
  if (lightboxImage.value) {
    if (event.key === 'Escape') {
      closeLightbox()
    } else if (event.key === 'ArrowRight') {
      navigateImage(1)
    } else if (event.key === 'ArrowLeft') {
      navigateImage(-1)
    }
  }
}

onMounted(async () => {
  await nextTick()

  setTimeout(() => {
    isLoaded.value = true
  }, 100)

  setTimeout(() => {
    setupScrollAnimations()
    setupParallax()
  }, 500)

  fetchFeatures() // Call fetchFeatures after setup
  fetchGalleryImages() // Call fetchGalleryImages after setup
  fetchAboutInfo() // Call fetchAboutInfo after setup
  // Add keyboard navigation for lightbox
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  // Clean up event listener
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="brick-factory-landing">
    <!-- Hero Section -->
    <section class="hero-section" :class="{ loaded: isLoaded }">
      <div class="hero-background">
        <!-- Background Images -->
        <div class="hero-image-container">
          <img src="/download (3).png" alt="Brick Factory" class="hero-bg-image main-bg" />
          <!-- <img src="/download (4).png" alt="Brick Factory" class="hero-bg-image secondary-bg" />
          <img src="/download (8).png" alt="Brick Factory" class="hero-bg-image accent-bg" />
          <img src="/download (9).png" alt="Brick Factory" class="hero-bg-image overlay-bg" /> -->
        </div>

        <!-- Animated Overlay -->
        <div class="hero-overlay">
          <div class="geometric-pattern"></div>
          <div class="gradient-overlay"></div>
        </div>

        <!-- Floating Elements -->
        <div class="floating-elements">
          <div class="floating-brick brick-1"></div>
          <div class="floating-brick brick-2"></div>
          <div class="floating-brick brick-3"></div>
          <div class="floating-circle circle-1"></div>
          <div class="floating-circle circle-2"></div>
        </div>
      </div>

      <div class="hero-content">
        <div class="hero-badge">
          <span>🏗️ تولیدکننده برتر آجر</span>
        </div>

        <h1 class="hero-title">
          <span class="title-line">کارخانه آجر</span>
          <span class="title-line highlight">حسین مفیدی</span>
        </h1>

        <p class="hero-subtitle">تولیدکننده آجر با کیفیت در جاده قدیم قم کاشان</p>

        <!-- <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">۱۵+</span>
            <span class="stat-label">سال تجربه</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">۱۰۰۰+</span>
            <span class="stat-label">مشتری راضی</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">۵۰+</span>
            <span class="stat-label">نوع محصول</span>
          </div>
        </div> -->

        <div class="hero-actions">
          <button class="cta-button primary" @click="contactUs">
            <span class="button-icon">📞</span>
            تماس بگیرید
          </button>
          <button class="cta-button secondary" @click="scrollToGallery">
            <span class="button-icon">🖼️</span>
            مشاهده محصولات
          </button>
        </div>
      </div>

      <div class="scroll-indicator">
        <div class="scroll-text">اسکرول کنید</div>
        <div class="scroll-arrow"></div>
      </div>
    </section>

    <!-- About Section -->
    <section class="about-section">
      <div class="container">
        <div class="about-card animate-on-scroll">
          <h2 class="animate-on-scroll slide-right">درباره ما</h2>
          <div class="about-content">
            <div v-if="loadingAboutInfo" class="loading-about">
              <div class="loading-spinner"></div>
              <p>در حال بارگذاری اطلاعات...</p>
            </div>
            <div v-else class="location-info animate-on-scroll stagger">
              <div class="info-item stagger-item animate-on-scroll">
                <span class="icon">📍</span>
                <p>{{ aboutInfo.address }}</p>
              </div>
              <div class="info-item stagger-item animate-on-scroll">
                <span class="icon">📞</span>
                <p>{{ aboutInfo.phone }}</p>
              </div>
            </div>
            <p class="description animate-on-scroll slide-left">
              ما در کارخانه آجر حسین مفیدی با سال‌ها تجربه در تولید آجر باکیفیت، متعهد به ارائه
              بهترین محصولات ساختمانی هستیم.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Gallery Section -->
    <section class="gallery-section">
      <div class="container">
        <h2 class="section-title animate-on-scroll">گالری محصولات</h2>
        <div class="gallery-grid animate-on-scroll stagger">
          <!-- Loading state -->
          <div v-if="loadingGallery" class="gallery-loading">
            <div class="loading-spinner"></div>
            <p>در حال بارگذاری گالری...</p>
          </div>

          <!-- Gallery items -->
          <div
            v-else
            class="gallery-item stagger-item animate-on-scroll"
            v-for="(image, index) in galleryImages"
            :key="index"
            @click="openLightbox(image)"
          >
            <div class="gallery-image">
              <img
                :src="image.src"
                :alt="image.alt"
                class="product-image"
                :class="{ loaded: image.loaded }"
                @load="image.loaded = true"
                loading="lazy"
              />
              <div class="image-loader" v-if="!image.loaded">
                <div class="loader-spinner"></div>
                <div class="loading-text">در حال بارگذاری...</div>
              </div>
              <div class="gallery-overlay">
                <span class="product-title">{{ image.title }}</span>
                <p class="product-description">{{ image.description }}</p>
                <div class="view-fullsize">
                  <span class="view-icon">🔍</span>
                  <span>مشاهده کامل</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lightbox Modal -->
        <div class="lightbox-modal" v-if="lightboxImage" @click="closeLightbox">
          <div
            class="lightbox-content"
            @click.stop
            @touchstart="handleTouchStart"
            @touchend="handleTouchEnd"
          >
            <button class="lightbox-close" @click="closeLightbox">×</button>

            <!-- Navigation Arrows -->
            <button
              class="lightbox-nav lightbox-prev"
              @click="navigateImage(-1)"
              v-if="galleryImages.length > 1"
            >
              ›
            </button>
            <button
              class="lightbox-nav lightbox-next"
              @click="navigateImage(1)"
              v-if="galleryImages.length > 1"
            >
              ‹
            </button>

            <img :src="lightboxImage.src" :alt="lightboxImage.alt" class="lightbox-image" />
            <div class="lightbox-info">
              <h3>{{ lightboxImage.title }}</h3>
              <p>{{ lightboxImage.description }}</p>
              <div class="lightbox-counter">
                {{ galleryImages.findIndex((img) => img.src === lightboxImage.src) + 1 }} از
                {{ galleryImages.length }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Us Section -->
    <section class="why-us-section">
      <div class="container">
        <h2 class="section-title animate-on-scroll">چرا ما را انتخاب کنید؟</h2>
        <div class="features-grid animate-on-scroll stagger">
          <!-- Loading state -->
          <div v-if="loadingFeatures" class="features-loading">
            <div class="loading-spinner"></div>
            <p>در حال بارگذاری ویژگی‌ها...</p>
          </div>

          <!-- Features cards -->
          <div
            v-else
            class="feature-card stagger-item animate-on-scroll"
            v-for="(feature, index) in features"
            :key="index"
          >
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer-section">
      <div class="container">
        <div class="footer-content">
          <div class="footer-info">
            <h3>کارخانه آجر حسین مفیدی</h3>
            <p>{{ aboutInfo.address }}</p>
            <p>📞 {{ aboutInfo.phone }}</p>
          </div>
          <div class="footer-copyright">
            <p>&copy; ۱۴۰۳ کارخانه آجر حسین مفیدی. تمامی حقوق محفوظ است.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.brick-factory-landing {
  position: relative;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Hero Section */
.hero-section {
  height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  opacity: 0;
  transform: translateY(50px);
  transition: all 1s ease-out;
  background: #0a0a0a;
}

.hero-section.loaded {
  opacity: 1;
  transform: translateY(0);
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -2;
}

.hero-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
}

.hero-bg-image {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.15;
  filter: blur(2px) brightness(0.7);
  transition: all 0.5s ease;
}

.main-bg {
  top: 0;
  left: 0;
  transform: scale(1.2);
  animation: slowZoom 20s ease-in-out infinite;
}

.secondary-bg {
  top: 20%;
  left: 30%;
  transform: scale(0.9);
  animation: slowZoom 25s ease-in-out infinite reverse;
}

.accent-bg {
  top: 60%;
  left: 70%;
  transform: scale(0.8);
  animation: slowZoom 30s ease-in-out infinite;
}

.overlay-bg {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1;
}

@keyframes slowZoom {
  0%,
  100% {
    transform: scale(1.1);
  }
  50% {
    transform: scale(1.3);
  }
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}

.geometric-pattern {
  position: absolute;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 20% 80%, rgba(210, 105, 30, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(210, 105, 30, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(210, 105, 30, 0.05) 0%, transparent 50%);
  opacity: 0.3;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(10, 10, 10, 0.9) 0%,
    rgba(44, 24, 16, 0.7) 50%,
    rgba(139, 69, 19, 0.5) 100%
  );
  z-index: 1;
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
}

.floating-brick {
  position: absolute;
  width: 60px;
  height: 30px;
  background: linear-gradient(135deg, rgba(210, 105, 30, 0.4), rgba(255, 127, 80, 0.4));
  border-radius: 8px;
  opacity: 0.6;
  animation: float 8s ease-in-out infinite;
  box-shadow: 0 4px 15px rgba(210, 105, 30, 0.3);
}

.brick-1 {
  top: 15%;
  left: 15%;
  animation-delay: 0s;
  transform: rotate(15deg);
}

.brick-2 {
  top: 75%;
  left: 85%;
  animation-delay: -2s;
  transform: rotate(-20deg);
}

.brick-3 {
  top: 45%;
  left: 25%;
  animation-delay: -4s;
  transform: rotate(10deg);
}

.floating-circle {
  position: absolute;
  width: 40px;
  height: 40px;
  background: radial-gradient(circle, rgba(210, 105, 30, 0.3), rgba(210, 105, 30, 0.1));
  border-radius: 50%;
  opacity: 0.5;
  animation: float 10s ease-in-out infinite;
  box-shadow: 0 2px 10px rgba(210, 105, 30, 0.2);
}

.circle-1 {
  top: 25%;
  left: 65%;
  animation-delay: 0s;
}

.circle-2 {
  top: 85%;
  left: 25%;
  animation-delay: -3s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0) rotate(0deg);
  }
  25% {
    transform: translateY(-15px) translateX(8px) rotate(5deg);
  }
  50% {
    transform: translateY(-25px) translateX(0) rotate(0deg);
  }
  75% {
    transform: translateY(-15px) translateX(-8px) rotate(-5deg);
  }
}

.hero-content {
  text-align: center;
  z-index: 4;
  animation: fadeInUp 1.5s ease-out 0.5s both;
  position: relative;
  max-width: 800px;
  padding: 0 20px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-badge {
  background: linear-gradient(135deg, #d2691e, #ff7f50);
  color: white;
  padding: 12px 24px;
  border-radius: 30px;
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 25px;
  display: inline-block;
  box-shadow: 0 8px 25px rgba(210, 105, 30, 0.4);
  animation: badgePulse 2s ease-in-out infinite;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

@keyframes badgePulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.hero-title {
  font-size: 4.5rem;
  font-weight: 900;
  margin-bottom: 25px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  line-height: 1.1;
}

.title-line {
  font-size: 1em;
  color: #ffffff;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.8);
  transition: all 0.3s ease;
}

.title-line.highlight {
  background: linear-gradient(135deg, #d2691e, #ff7f50, #ff6347);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 1.2em;
  animation: titleGlow 3s ease-in-out infinite alternate;
  text-shadow: none;
}

@keyframes titleGlow {
  from {
    filter: brightness(1) drop-shadow(0 0 10px rgba(210, 105, 30, 0.5));
  }
  to {
    filter: brightness(1.3) drop-shadow(0 0 20px rgba(210, 105, 30, 0.8));
  }
}

.hero-subtitle {
  font-size: 1.6rem;
  margin-bottom: 40px;
  color: #f5f5f5;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(210, 105, 30, 0.2);
  transition: all 0.3s ease;
  min-width: 120px;
}

.stat-item:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(210, 105, 30, 0.4);
}

.stat-number {
  font-size: 2.8rem;
  font-weight: 900;
  color: #d2691e;
  display: block;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.stat-label {
  font-size: 0.95rem;
  color: #f5f5f5;
  opacity: 0.9;
  font-weight: 500;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 25px;
  margin-top: 40px;
  flex-wrap: wrap;
}

.cta-button {
  background: linear-gradient(135deg, #d2691e, #ff7f50);
  color: white;
  border: none;
  padding: 18px 40px;
  font-size: 1.1rem;
  font-family: 'Shabnam', sans-serif;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(210, 105, 30, 0.3);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
  min-width: 180px;
  justify-content: center;
}

.cta-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.cta-button:hover::before {
  left: 100%;
}

.cta-button:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(210, 105, 30, 0.5);
}

.cta-button.primary {
  background: linear-gradient(135deg, #d2691e, #ff7f50);
}

.cta-button.secondary {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  box-shadow: 0 8px 25px rgba(46, 204, 113, 0.3);
}

.cta-button.secondary:hover {
  box-shadow: 0 15px 35px rgba(46, 204, 113, 0.5);
}

.cta-button.admin {
  background: linear-gradient(135deg, #667eea, #764ba2);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.cta-button.admin:hover {
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.5);
}

.button-icon {
  font-size: 1.3em;
}

.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  animation: bounce 2s infinite;
  z-index: 5;
  text-align: center;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-15px);
  }
  60% {
    transform: translateX(-50%) translateY(-8px);
  }
}

.scroll-text {
  font-size: 0.9rem;
  color: #f5f5f5;
  margin-bottom: 10px;
  opacity: 0.8;
  font-weight: 500;
}

.scroll-arrow {
  width: 24px;
  height: 24px;
  border-right: 3px solid #d2691e;
  border-bottom: 3px solid #d2691e;
  transform: rotate(45deg);
  margin: 0 auto;
  animation: arrowPulse 2s ease-in-out infinite;
}

@keyframes arrowPulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* About Section */
.about-section {
  padding: 100px 0;
  background: linear-gradient(135deg, #1a0f08 0%, #2c1810 100%);
}

.about-card {
  background: rgba(139, 69, 19, 0.1);
  border-radius: 20px;
  padding: 50px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(210, 105, 30, 0.2);
  transition: all 0.3s ease;
}

.about-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(210, 105, 30, 0.2);
}

.about-card h2 {
  font-size: 2.5rem;
  color: #d2691e;
  margin-bottom: 30px;
  text-align: center;
}

.location-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(210, 105, 30, 0.1);
  padding: 20px;
  border-radius: 15px;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: rgba(210, 105, 30, 0.2);
  transform: scale(1.02);
}

.icon {
  font-size: 1.5rem;
}

.description {
  font-size: 1.1rem;
  line-height: 1.8;
  text-align: center;
  color: #f5f5f5;
}

/* About Loading State */
.loading-about {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-about .loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(210, 105, 30, 0.3);
  border-top: 4px solid #d2691e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.loading-about p {
  color: #d2691e;
  font-size: 1.1rem;
  font-weight: 500;
  opacity: 0.8;
}

/* Gallery Section */
.gallery-section {
  padding: 100px 0;
  background: #2c1810;
}

/* Gallery Loading State */
.gallery-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  grid-column: 1 / -1;
}

.gallery-loading .loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(210, 105, 30, 0.3);
  border-top: 4px solid #d2691e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.gallery-loading p {
  color: #d2691e;
  font-size: 1.1rem;
  font-weight: 500;
  opacity: 0.8;
}

.section-title {
  font-size: 3rem;
  text-align: center;
  color: #d2691e;
  margin-bottom: 60px;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 3px;
  background: linear-gradient(135deg, #d2691e, #ff7f50);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
}

.gallery-item {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  height: 300px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  background: #1a0f08;
}

.gallery-item:hover {
  transform: scale(1.05) translateY(-10px);
  box-shadow: 0 20px 50px rgba(210, 105, 30, 0.4);
}

.gallery-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, transparent 0%, rgba(210, 105, 30, 0.1) 100%);
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 1;
  pointer-events: none;
}

.gallery-item:hover::before {
  opacity: 1;
}

.gallery-image {
  position: relative;
  width: 100%;
  height: 100%;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.5s ease;
  filter: brightness(0.9);
  opacity: 0;
  transform: scale(1.05);
}

.product-image.loaded {
  opacity: 1;
  transform: scale(1);
}

.image-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #2c1810, #1a0f08);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.loader-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(210, 105, 30, 0.3);
  border-top: 3px solid #d2691e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

.loading-text {
  color: #d2691e;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: center;
  opacity: 0.8;
}

/* Skeleton loader for images */
.image-loader::before {
  content: '';
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  height: 20px;
  background: linear-gradient(90deg, transparent, rgba(210, 105, 30, 0.2), transparent);
  animation: shimmer 1.5s infinite;
}

.image-loader::after {
  content: '';
  position: absolute;
  bottom: 20px;
  left: 20px;
  right: 20px;
  height: 15px;
  background: linear-gradient(90deg, transparent, rgba(210, 105, 30, 0.2), transparent);
  animation: shimmer 1.5s infinite 0.5s;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.gallery-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(44, 24, 16, 0.9) 0%, rgba(139, 69, 19, 0.8) 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #ffffff;
  opacity: 0;
  transition: all 0.4s ease;
  padding: 20px;
  text-align: center;
  transform: translateY(20px);
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
  transform: translateY(0);
}

.gallery-item:hover .product-image {
  transform: scale(1.15);
  filter: brightness(1.1);
}

.product-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 10px;
  color: #d2691e;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.product-description {
  font-size: 1rem;
  line-height: 1.5;
  color: #f5f5f5;
  opacity: 0.9;
  max-width: 200px;
}

.view-fullsize {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;
  padding: 8px 16px;
  background: rgba(210, 105, 30, 0.2);
  border-radius: 20px;
  border: 1px solid rgba(210, 105, 30, 0.4);
  font-size: 0.9rem;
  color: #d2691e;
  transition: all 0.3s ease;
}

.view-icon {
  font-size: 1.1rem;
}

/* Lightbox Modal */
.lightbox-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.lightbox-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  background: #1a0f08;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.lightbox-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(210, 105, 30, 0.8);
  color: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
}

.lightbox-close:hover {
  background: #d2691e;
  transform: scale(1.1);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(210, 105, 30, 0.8);
  color: white;
  border: none;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  font-size: 2.5rem;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  opacity: 0.8;
}

.lightbox-nav:hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

.lightbox-prev {
  left: 20px;
}

.lightbox-next {
  right: 20px;
}

.lightbox-image {
  width: 100%;
  height: auto;
  max-height: 70vh;
  object-fit: contain;
}

.lightbox-info {
  padding: 25px;
  text-align: center;
}

.lightbox-info h3 {
  color: #d2691e;
  font-size: 1.8rem;
  margin-bottom: 15px;
}

.lightbox-info p {
  color: #f5f5f5;
  font-size: 1.1rem;
  line-height: 1.6;
  opacity: 0.9;
}

.lightbox-counter {
  font-size: 1.1rem;
  color: #f5f5f5;
  margin-top: 15px;
  opacity: 0.8;
}

/* Why Us Section */
.why-us-section {
  padding: 100px 0;
  background: linear-gradient(135deg, #1a0f08 0%, #2c1810 100%);
}

/* Features Loading State */
.features-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.features-loading .loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(210, 105, 30, 0.3);
  border-top: 4px solid #d2691e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.features-loading p {
  color: #d2691e;
  font-size: 1.1rem;
  font-weight: 500;
  opacity: 0.8;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
}

.feature-card {
  background: rgba(139, 69, 19, 0.1);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(210, 105, 30, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(210, 105, 30, 0.1), transparent);
  transform: rotate(45deg);
  transition: all 0.6s ease;
  opacity: 0;
}

.feature-card:hover::before {
  opacity: 1;
  top: -100%;
  left: -100%;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(210, 105, 30, 0.3);
}

.feature-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.feature-card h3 {
  font-size: 1.8rem;
  color: #d2691e;
  margin-bottom: 15px;
}

.feature-card p {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #f5f5f5;
}

/* Footer */
.footer-section {
  background: #1a0f08;
  padding: 50px 0 30px;
  border-top: 1px solid rgba(210, 105, 30, 0.3);
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 40px;
  align-items: center;
}

.footer-info h3 {
  color: #d2691e;
  font-size: 1.5rem;
  margin-bottom: 15px;
}

.footer-info p {
  margin-bottom: 8px;
  color: #f5f5f5;
}

.footer-copyright {
  text-align: center;
  color: rgba(245, 245, 245, 0.7);
  font-size: 0.9rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 3rem;
  }

  .hero-subtitle {
    font-size: 1.3rem;
    margin-bottom: 30px;
  }

  .hero-stats {
    gap: 20px;
    margin-bottom: 30px;
  }

  .stat-item {
    min-width: 100px;
    padding: 15px;
  }

  .stat-number {
    font-size: 2.2rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  .cta-button {
    min-width: 200px;
    padding: 16px 30px;
  }

  .about-card {
    padding: 30px;
  }

  .location-info {
    grid-template-columns: 1fr;
  }

  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .section-title {
    font-size: 2rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .gallery-item {
    height: 250px;
  }

  .product-title {
    font-size: 1.5rem;
  }

  .product-description {
    font-size: 0.9rem;
  }

  .floating-elements {
    display: none; /* Hide floating elements on mobile for better performance */
  }

  .hero-badge {
    font-size: 0.9rem;
    padding: 10px 20px;
  }

  .lightbox-content {
    max-width: 95%;
    margin: 20px;
  }

  .lightbox-info {
    padding: 20px;
  }

  .lightbox-info h3 {
    font-size: 1.5rem;
  }

  .lightbox-info p {
    font-size: 1rem;
  }

  .lightbox-nav {
    width: 50px;
    height: 50px;
    font-size: 2rem;
  }

  .lightbox-prev {
    left: 10px;
  }

  .lightbox-next {
    right: 10px;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .hero-stats {
    flex-direction: column;
    gap: 15px;
  }

  .stat-item {
    min-width: auto;
    width: 100%;
    max-width: 200px;
  }

  .cta-button {
    min-width: 180px;
    font-size: 1rem;
    padding: 14px 25px;
  }

  .hero-badge {
    font-size: 0.8rem;
    padding: 8px 16px;
  }
}
</style>
