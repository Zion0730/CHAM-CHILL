const ageGate = document.getElementById('ageGate');
const ageYes = document.getElementById('ageYes');
const ageNo = document.getElementById('ageNo');
const giftForm = document.getElementById('giftForm');
const formNote = document.getElementById('formNote');
const lineButtons = document.querySelectorAll('.js-line-cta');

function trackEvent(eventName, params = {}) {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
  console.info(`[GA4 event] ${eventName}`, params);
}

if (localStorage.getItem('helloMayAgeOK') === 'true') {
  ageGate.classList.add('hidden');
}

ageYes?.addEventListener('click', () => {
  localStorage.setItem('helloMayAgeOK', 'true');
  ageGate.classList.add('hidden');
});

ageNo?.addEventListener('click', () => {
  alert('未滿 18 歲不得瀏覽酒類商品資訊。請離開本網站。');
  window.location.href = 'https://www.google.com';
});

lineButtons.forEach((button) => {
  button.addEventListener('click', () => {
    trackEvent('click_to_line_inquiry', {
      event_category: 'CTA',
      event_label: button.textContent.trim()
    });
  });
});

giftForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(giftForm);
  const purpose = data.get('purpose');
  const budget = data.get('budget');

  trackEvent('submit_form', {
    event_category: 'Lead',
    purpose,
    budget
  });

  formNote.textContent = '已收到你的禮盒需求。正式網站可串接 Google Form、EmailJS 或後端 API 接收資料。';
  giftForm.reset();
});

const storySection = document.querySelector('[data-track-story]');
let storyTracked = false;

if ('IntersectionObserver' in window && storySection) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !storyTracked) {
        storyTracked = true;
        trackEvent('scroll_story', {
          event_category: 'Engagement',
          section: 'brand_story'
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.45 });
  observer.observe(storySection);
}

// Product carousel: auto-rotate every few seconds, with manual control and lightbox zoom.
const carousel = document.querySelector('[data-carousel]');
const slides = carousel ? Array.from(carousel.querySelectorAll('.carousel-slide')) : [];
const prevButton = carousel?.querySelector('.carousel-prev');
const nextButton = carousel?.querySelector('.carousel-next');
const dotsWrap = document.querySelector('[data-carousel-dots]');
let currentSlide = 0;
let carouselTimer;

function renderDots() {
  if (!dotsWrap || !slides.length) return;
  dotsWrap.innerHTML = '';
  slides.forEach((slide, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `切換到第 ${index + 1} 款茶梅酒`);
    dot.addEventListener('click', () => {
      showSlide(index);
      restartCarousel();
    });
    dotsWrap.appendChild(dot);
  });
}

function showSlide(index) {
  if (!slides.length) return;
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle('is-active', slideIndex === currentSlide);
  });
  dotsWrap?.querySelectorAll('button').forEach((dot, dotIndex) => {
    dot.classList.toggle('is-active', dotIndex === currentSlide);
    dot.setAttribute('aria-current', dotIndex === currentSlide ? 'true' : 'false');
  });
}

function nextSlide() { showSlide(currentSlide + 1); }
function prevSlide() { showSlide(currentSlide - 1); }
function startCarousel() { carouselTimer = window.setInterval(nextSlide, 7000); }
function restartCarousel() {
  window.clearInterval(carouselTimer);
  startCarousel();
}

if (slides.length) {
  renderDots();
  showSlide(0);
  startCarousel();
  nextButton?.addEventListener('click', () => { nextSlide(); restartCarousel(); });
  prevButton?.addEventListener('click', () => { prevSlide(); restartCarousel(); });
  carousel?.addEventListener('mouseenter', () => window.clearInterval(carouselTimer));
  carousel?.addEventListener('mouseleave', startCarousel);
}

const lightbox = document.getElementById('productLightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const lightboxClose = lightbox?.querySelector('.lightbox-close');

function openLightbox(src, title, alt) {
  if (!lightbox || !lightboxImage || !lightboxCaption) return;
  lightboxImage.src = src;
  lightboxImage.alt = alt || title || 'Hello May 喝樂梅商品圖片放大預覽';
  lightboxCaption.textContent = title || '';
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImage.src = '';
  document.body.style.overflow = '';
}

document.querySelectorAll('[data-lightbox]').forEach((button) => {
  button.addEventListener('click', () => {
    const image = button.querySelector('img');
    openLightbox(button.dataset.lightbox, button.dataset.title, image?.alt);
  });
});

lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeLightbox();
});
