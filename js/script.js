document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Mask-line heading wraps (run before reveal wiring) ---------- */
  document.querySelectorAll('h1, .section-head h2, .about-copy h2, .booking-info h2').forEach(el => {
    const inner = document.createElement('span');
    inner.className = 'mask-line-inner';
    inner.innerHTML = el.innerHTML;
    el.innerHTML = '';
    el.classList.add('mask-line');
    el.appendChild(inner);
  });

  /* ---------- Preloader (curtain reveal + percent count) ---------- */
  const preloader = document.getElementById('preloader');
  const preloaderPercent = document.getElementById('preloaderPercent');
  let preloaderDone = false;

  function finishPreloader() {
    if (preloaderDone) return;
    preloaderDone = true;
    preloader && preloader.classList.add('hidden');
    document.body.classList.add('loaded');
    document.querySelectorAll('.hero-copy, .hero-visual').forEach(el => el.classList.add('in-view'));
  }

  let pct = 0;
  const pctTimer = setInterval(() => {
    pct = Math.min(100, pct + Math.floor(Math.random() * 14) + 6);
    if (preloaderPercent) preloaderPercent.textContent = pct + '%';
    if (pct >= 100) {
      clearInterval(pctTimer);
      setTimeout(finishPreloader, 250);
    }
  }, 110);

  // hard safety fallback in case the counter or fonts/images stall
  setTimeout(finishPreloader, 3500);

  /* ---------- Magnetic buttons (hero + header CTAs) ---------- */
  if (window.matchMedia('(min-width: 993px)').matches) {
    document.querySelectorAll('.hero-cta .btn, .header-actions .btn-primary').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.3}px)`;
      });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Sticky header + scroll progress ---------- */
  const header = document.getElementById('siteHeader');
  const scrollProgress = document.getElementById('scrollProgress');
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');

    backToTop.classList.toggle('visible', window.scrollY > 500);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
    scrollProgress.style.width = progress + '%';
  };

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById('navToggle');
  const mainNav = document.getElementById('mainNav');
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mainNav.classList.toggle('open');
  });
  mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      mainNav.classList.remove('open');
    });
  });

  /* ---------- Active link on scroll ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const setActiveLink = () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 140;
      if (window.scrollY >= top) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  };

  window.addEventListener('scroll', () => { onScroll(); setActiveLink(); });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-reveal-delay') || 0;
        setTimeout(() => entry.target.classList.add('in-view'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px 160px 0px' });
  revealEls.forEach(el => {
    if (el.closest('.hero')) return; // hero timing is driven by the preloader instead
    revealObserver.observe(el);
  });

  /* ---------- Counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-count'));
    const decimals = parseInt(el.getAttribute('data-decimal') || '0', 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = (decimals ? value.toFixed(decimals) : Math.round(value)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  /* ---------- Gallery filter ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      galleryItems.forEach(item => {
        const match = filter === 'all' || item.getAttribute('data-cat') === filter;
        item.classList.toggle('hide', !match);
      });
    });
  });

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxTile = document.getElementById('lightboxTile');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const tile = item.querySelector('.gallery-tile');
      const caption = item.querySelector('figcaption');
      lightboxTile.className = 'lightbox-tile ' + [...tile.classList].find(c => c.startsWith('tint-'));
      lightboxCaption.textContent = caption ? caption.textContent : '';
      lightbox.classList.add('open');
    });
  });
  const closeLightbox = () => lightbox.classList.remove('open');
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  /* ---------- Testimonial slider ---------- */
  const track = document.getElementById('testimonialTrack');
  const dotsWrap = document.getElementById('testimonialDots');
  const slides = track.children.length;
  let current = 0;
  let autoplayId;

  for (let i = 0; i < slides; i++) {
    const dot = document.createElement('span');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  }
  const dots = dotsWrap.children;

  function goTo(index) {
    current = (index + slides) % slides;
    track.style.transform = `translateX(-${current * 100}%)`;
    [...dots].forEach((d, i) => d.classList.toggle('active', i === current));
  }
  function startAutoplay() {
    autoplayId = setInterval(() => goTo(current + 1), 5500);
  }
  function stopAutoplay() { clearInterval(autoplayId); }

  document.getElementById('testimonialNext').addEventListener('click', () => { goTo(current + 1); stopAutoplay(); startAutoplay(); });
  document.getElementById('testimonialPrev').addEventListener('click', () => { goTo(current - 1); stopAutoplay(); startAutoplay(); });
  track.parentElement.addEventListener('mouseenter', stopAutoplay);
  track.parentElement.addEventListener('mouseleave', startAutoplay);
  startAutoplay();

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.accordion-item').forEach(item => {
    const head = item.querySelector('.accordion-head');
    head.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      item.parentElement.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  /* ---------- Booking form (front-end only) ---------- */
  const bookingForm = document.getElementById('bookingForm');
  const formNote = document.getElementById('formNote');
  bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formNote.textContent = '✓ Thank you! Your request has been received - we will confirm shortly.';
    bookingForm.reset();
    setTimeout(() => { formNote.textContent = ''; }, 6000);
  });

  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('input');
    input.value = 'Subscribed! ✓';
    setTimeout(() => { input.value = ''; }, 2500);
  });

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById('backToTop');
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  onScroll();
  setActiveLink();
});
