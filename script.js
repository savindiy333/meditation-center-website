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

  /* ---- one-time gentle fade-in for the hero singing bowl emblem ---- */
  const emberScene = document.querySelector('.hero-monk-emblem');
  if (emberScene && !reduceMotion) {
    const playEntrance = () => {
      requestAnimationFrame(() => {
        emberScene.classList.add('is-entering');
        setTimeout(() => emberScene.classList.remove('is-entering'), 1200);
      });
    };
    if (document.body.classList.contains('is-loaded')) {
      setTimeout(playEntrance, 250);
    } else {
      window.addEventListener('load', () => setTimeout(playEntrance, 550));
    }
  }

  /* ---- singing bowl: tap to hear a synthesized bowl tone ---- */
  const bowl = document.getElementById('singingBowl');
  if (bowl) {
    const bowlScene = bowl.querySelector('.bowl-scene');
    let audioCtx = null;

    const ringBowl = () => {
      // audio: build a real singing-bowl tone from its natural overtone series,
      // since we can't embed a licensed audio file
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        const now = audioCtx.currentTime;
        const fundamental = 233; // roughly a small brass bowl's fundamental
        const partials = [1, 1.52, 2.76, 3.94, 5.42]; // inharmonic ratios typical of singing bowls
        const master = audioCtx.createGain();
        master.gain.setValueAtTime(0.0001, now);
        master.gain.exponentialRampToValueAtTime(0.32, now + 0.04);
        master.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);
        master.connect(audioCtx.destination);

        partials.forEach((ratio, i) => {
          // two very slightly detuned oscillators per partial for a natural shimmering beat
          [-0.6, 0.6].forEach(detune => {
            const osc = audioCtx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = fundamental * ratio;
            osc.detune.value = detune;
            const partialGain = audioCtx.createGain();
            partialGain.gain.value = 0.5 / (i + 1.3);
            osc.connect(partialGain).connect(master);
            osc.start(now);
            osc.stop(now + 5.6);
          });
        });
      } catch (err) {
        console.error('Singing bowl audio failed:', err);
      }

      // visual: one-off emphasized strike layered on top of the ambient loop
      if (bowlScene && !reduceMotion) {
        bowlScene.classList.remove('is-struck');
        void bowlScene.offsetWidth; // restart animation
        bowlScene.classList.add('is-struck');
        setTimeout(() => bowlScene.classList.remove('is-struck'), 2500);
      }
    };

    bowl.addEventListener('click', ringBowl);
    bowl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        ringBowl();
      }
    });
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
