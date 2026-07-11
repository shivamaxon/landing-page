const SWIPE_THRESHOLD_PX = 40;
const MAX_ZOOM = 4;
const DOUBLE_TAP_MS = 300;

const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const slides = Array.from(lightbox.querySelectorAll('[data-lightbox-slide]'));
  const stage = lightbox.querySelector('.lightbox__stage');
  let index = 0;

  // Pinch-zoom / pan state for the currently active slide's image.
  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let pinchStartDist = 0;
  let pinchStartScale = 1;
  let panStartX = 0;
  let panStartY = 0;
  let panOriginX = 0;
  let panOriginY = 0;
  let isPanning = false;
  let lastTapTime = 0;

  function isOpen() {
    return lightbox.classList.contains('is-open');
  }

  function activeImg() {
    return slides[index]?.querySelector('img');
  }

  function applyTransform() {
    const img = activeImg();
    if (img) img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  function resetZoom() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    applyTransform();
  }

  function showSlide(newIndex) {
    index = ((newIndex % slides.length) + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    resetZoom();
  }

  function open(startIndex) {
    showSlide(startIndex);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    resetZoom();
  }

  function next() {
    showSlide(index + 1);
  }

  function prev() {
    showSlide(index - 1);
  }

  document.querySelectorAll('[data-lightbox-trigger]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      open(Number(trigger.dataset.lightboxIndex));
    });
  });

  lightbox.querySelectorAll('[data-lightbox-close]').forEach((el) => {
    el.addEventListener('click', close);
  });

  lightbox.querySelector('[data-lightbox-prev]').addEventListener('click', prev);
  lightbox.querySelector('[data-lightbox-next]').addEventListener('click', next);

  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') prev();
    if (event.key === 'ArrowRight') next();
  });

  function touchDistance(touches) {
    const [a, b] = touches;
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  }

  let touchStartX = 0;

  stage.addEventListener(
    'touchstart',
    (event) => {
      if (event.touches.length === 2) {
        pinchStartDist = touchDistance(event.touches);
        pinchStartScale = scale;
        isPanning = false;
      } else if (event.touches.length === 1) {
        touchStartX = event.touches[0].clientX;
        if (scale > 1) {
          isPanning = true;
          panStartX = event.touches[0].clientX;
          panStartY = event.touches[0].clientY;
          panOriginX = translateX;
          panOriginY = translateY;
        }
      }
    },
    { passive: true }
  );

  stage.addEventListener(
    'touchmove',
    (event) => {
      if (event.touches.length === 2) {
        const dist = touchDistance(event.touches);
        scale = Math.min(MAX_ZOOM, Math.max(1, pinchStartScale * (dist / pinchStartDist)));
        applyTransform();
      } else if (event.touches.length === 1 && isPanning) {
        translateX = panOriginX + (event.touches[0].clientX - panStartX);
        translateY = panOriginY + (event.touches[0].clientY - panStartY);
        applyTransform();
      }
    },
    { passive: true }
  );

  stage.addEventListener(
    'touchend',
    (event) => {
      if (isPanning) {
        isPanning = false;
        return;
      }
      if (scale > 1) return; // pinched in — don't also treat this as a swipe

      const now = Date.now();
      if (now - lastTapTime < DOUBLE_TAP_MS) {
        scale = 2;
        applyTransform();
        lastTapTime = 0;
        return;
      }
      lastTapTime = now;

      const deltaX = event.changedTouches[0].clientX - touchStartX;
      if (deltaX > SWIPE_THRESHOLD_PX) prev();
      else if (deltaX < -SWIPE_THRESHOLD_PX) next();
    },
    { passive: true }
  );
}
