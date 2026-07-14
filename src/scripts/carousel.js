const AUTOPLAY_INTERVAL_MS = 3200;
const RESUME_AFTER_MS = 4000;

// Shared peek-carousel behavior used by both the Lifestyle and Sindhudurg
// infrastructure sections (extracted here in the design-review pass so both
// consume identical logic instead of duplicated inline scripts — they now
// share timing, peek amount, and interaction-pause behavior by construction,
// not by convention). Native touch swipe rides on the track's own CSS
// scroll-snap; this script just syncs dots/autoplay to whatever the browser
// scrolled to.
function initCarousel(root) {
  const track = root.querySelector('[data-carousel-track]');
  const slides = Array.from(root.querySelectorAll('[data-carousel-slide]'));
  const dots = Array.from(root.querySelectorAll('[data-carousel-dot]'));
  const prevBtn = root.querySelector('[data-carousel-prev]');
  const nextBtn = root.querySelector('[data-carousel-next]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!track || slides.length === 0) return;

  let activeIndex = 0;
  let autoplayTimer = null;
  let resumeTimer = null;

  function setActiveDot(i) {
    dots.forEach((d, di) => d.classList.toggle('is-active', di === i));
  }

  function goTo(i, behavior) {
    const target = ((i % slides.length) + slides.length) % slides.length;
    activeIndex = target;
    track.scrollTo({
      left: slides[target].offsetLeft - track.offsetLeft,
      behavior: reducedMotion ? 'auto' : behavior || 'smooth',
    });
    setActiveDot(target);
  }

  function next() {
    goTo(activeIndex + 1);
  }

  function prev() {
    goTo(activeIndex - 1);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      window.clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    if (reducedMotion || slides.length <= 1) return;
    stopAutoplay();
    autoplayTimer = window.setInterval(next, AUTOPLAY_INTERVAL_MS);
  }

  function pauseAndScheduleResume() {
    stopAutoplay();
    if (resumeTimer) window.clearTimeout(resumeTimer);
    if (reducedMotion) return;
    resumeTimer = window.setTimeout(startAutoplay, RESUME_AFTER_MS);
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prev();
      pauseAndScheduleResume();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      next();
      pauseAndScheduleResume();
    });
  }
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goTo(Number(dot.dataset.carouselDot));
      pauseAndScheduleResume();
    });
  });

  track.addEventListener('pointerdown', pauseAndScheduleResume, { passive: true });
  track.addEventListener('touchstart', pauseAndScheduleResume, { passive: true });
  track.addEventListener('mouseenter', stopAutoplay, { passive: true });
  track.addEventListener('mouseleave', () => {
    if (!reducedMotion) startAutoplay();
  }, { passive: true });

  let scrollSettleTimer = null;
  track.addEventListener(
    'scroll',
    () => {
      if (scrollSettleTimer) window.clearTimeout(scrollSettleTimer);
      scrollSettleTimer = window.setTimeout(() => {
        const trackLeft = track.offsetLeft;
        let closest = 0;
        let closestDist = Infinity;
        slides.forEach((slide, i) => {
          const dist = Math.abs(slide.offsetLeft - trackLeft - track.scrollLeft);
          if (dist < closestDist) {
            closestDist = dist;
            closest = i;
          }
        });
        activeIndex = closest;
        setActiveDot(closest);
      }, 120);
    },
    { passive: true }
  );

  setActiveDot(0);
  startAutoplay();
}

document.querySelectorAll('[data-carousel]').forEach(initCarousel);
