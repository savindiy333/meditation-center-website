// =========================================================
// SARAṆA — shared interactions
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---- preloader ---- */
  const preloader = document.getElementById('preloader');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dismissPreloader = () => {
    if (!preloader) { document.body.classList.add('is-loaded'); return; }
    setTimeout(() => {
      preloader.classList.add('is-hidden');
      document.body.classList.add('is-loaded');
      preloader.addEventListener('transitionend', () => preloader.remove(), { once: true });
    }, reduceMotion ? 0 : 400);
  };
  if (document.readyState === 'complete') {
    dismissPreloader();
  } else {
    window.addEventListener('load', dismissPreloader);
  }

  /* ---- custom cursor (fine-pointer desktop only) ---- */
  const cursorDot = document.getElementById('cursorDot');
  if (cursorDot && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.body.classList.add('has-custom-cursor');
    window.addEventListener('mousemove', (e) => {
      cursorDot.style.left = e.clientX + 'px';
      cursorDot.style.top = e.clientY + 'px';
      cursorDot.classList.add('is-active');
    }, { passive: true });
    document.querySelectorAll('a, button, .btn, .card, .gallery-tile, .quote-card, .retreat-card, input, textarea, select').forEach(el => {
      el.addEventListener('mouseenter', () => cursorDot.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursorDot.classList.remove('is-hover'));
    });
  } else if (cursorDot) {
    cursorDot.remove();
  }

  /* ---- hero ambient particles (home page only) ---- */
  const particleHost = document.getElementById('heroParticles');
  if (particleHost && !reduceMotion) {
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('span');
      p.className = 'hero-particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = 20 + Math.random() * 70 + '%';
      p.style.animationDuration = (5 + Math.random() * 5) + 's';
      p.style.animationDelay = (Math.random() * 6) + 's';
      particleHost.appendChild(p);
    }
  }

  /* ---- sticky header state ---- */
  const header = document.querySelector('.site-header');
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 30);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- mobile nav toggle ---- */
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('is-open');
      document.body.classList.toggle('menu-open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        document.body.classList.remove('menu-open');
      });
    });
  }

  /* ---- mark active nav link ---- */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });

  /* ---- scroll reveal ---- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = (i % 3) * 90 + 'ms';
      io.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---- lotus blooming: scrolling UP opens every lotus, scrolling DOWN closes them ---- */
  const bloomEls = document.querySelectorAll('.scroll-bloom');
  if (bloomEls.length) {
    let lastY = window.scrollY;
    let ticking = false;

    const setBloomState = (state) => {
      bloomEls.forEach(el => {
        el.classList.toggle('is-blooming', state === 'blooming');
        el.classList.toggle('is-closed', state === 'closed');
      });
    };

    // start closed, like a bud waiting to open
    setBloomState('closed');

    // one-time welcome bloom on the hero flower once the page has settled
    const heroFlower = document.querySelector('.hero-flower-badge .flower');
    const playEntranceBloom = () => {
      if (reduceMotion || !heroFlower) return;
      requestAnimationFrame(() => {
        heroFlower.classList.add('is-entering');
        setTimeout(() => heroFlower.classList.remove('is-entering'), 1300);
      });
    };
    if (document.body.classList.contains('is-loaded')) {
      setTimeout(playEntranceBloom, 250);
    } else {
      window.addEventListener('load', () => setTimeout(playEntranceBloom, 550));
    }

    const updateBloom = () => {
      const y = window.scrollY;

      if (y < 24) {
        // back at the very top: rest fully closed
        setBloomState('closed');
      } else if (y < lastY - 2) {
        // scrolling up: bloom open
        setBloomState('blooming');
      } else if (y > lastY + 2) {
        // scrolling down: close back into a bud
        setBloomState('closed');
      }

      lastY = y;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateBloom);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ---- footer year ---- */
  const yearEl = document.querySelector('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- contact form: gentle demo submit ---- */
  const form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Sending…';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = 'Message sent ✓';
        setTimeout(() => {
          btn.textContent = original;
          btn.disabled = false;
          form.reset();
        }, 2200);
      }, 900);
    });
  }

});
