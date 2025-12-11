// assets/js/script.js
// Consolidated, syntactically clean script for:
// - preloader (waits for video end, fallback 6s)
// - header visibility during preloader
// - mobile nav
// - contact form placeholder
// - stats counters
// - reveal-on-scroll
// - hover tilt
// - seamless page carousels and clients carousel
// - touch/mouse nudge (does not pause animation)

(function () {
  'use strict';

  /* ---------- utilities ---------- */

  function imagesLoaded(container) {
    if (!container) return Promise.resolve();
    const imgs = container.querySelectorAll('img');
    if (!imgs.length) return Promise.resolve();
    const promises = Array.from(imgs).map(img => {
      if (img.complete && img.naturalWidth !== 0) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    });
    return Promise.all(promises);
  }

  function debounce(fn, ms) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, arguments), ms || 100);
    };
  }

  function once(fn) {
    let done = false;
    return function () {
      if (done) return;
      done = true;
      return fn.apply(this, arguments);
    };
  }

  /* ---------- preloader & header ---------- */

  function setupPreloader() {
    const preloader = document.getElementById('preloader');
    const video = document.getElementById('preloader-video');
    const header = document.querySelector('.site-header');

    // initially hide header while preloader present
    if (header) header.classList.add('preloading');

    // lock scroll until preloader is hidden
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    const hideNow = once(function hideNow() {
      if (!preloader) {
        if (header) {
          header.classList.remove('preloading');
          header.classList.add('preloader-done');
        }
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        return;
      }
      if (preloader.classList.contains('hide')) {
        // already hidden
        if (header) {
          header.classList.remove('preloading');
          header.classList.add('preloader-done');
        }
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        return;
      }
      preloader.classList.add('fade-out');
      // match CSS transition (600ms)
      setTimeout(() => {
        preloader.classList.add('hide');
        // do not remove preloader element from DOM — keep it for sibling selector logic
        if (header) {
          header.classList.remove('preloading');
          header.classList.add('preloader-done');
        }
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }, 620);
    });

    // If there's a preloader video, prefer the ended event. Ensure video can autoplay by muting.
    if (video) {
      try {
        video.muted = true;
        video.playsInline = true;
      } catch (e) {}
      // attempt to play; ignore rejection
      try { video.play().catch(()=>{}); } catch(e) {}

      // if ended, hide
      video.addEventListener('ended', hideNow, { once: true });
    }

    // Fallbacks:
    // 1) If some other code adds .hide class, watch for it and hide
    if (preloader) {
      const mo = new MutationObserver((mutations) => {
        mutations.forEach(m => {
          if (m.type === 'attributes' && preloader.classList.contains('hide')) {
            hideNow();
          }
        });
      });
      mo.observe(preloader, { attributes: true, attributeFilter: ['class'] });

      // 2) Hard fallback after 6000ms in case video fails or autoplay blocked
      setTimeout(hideNow, 2200);

      // 3) Also hide after window.load + short delay if video not present
      if (!video) {
        window.addEventListener('load', function () {
          setTimeout(hideNow, 300);
        });
      }
    } else {
      // no preloader element — reveal header now
      if (header) {
        header.classList.remove('preloading');
        header.classList.add('preloader-done');
      }
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  }

  /* ---------- mobile nav ---------- */

  function setupMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinkItems = document.querySelectorAll('.nav-link');

    if (!navToggle) return;
    navToggle.addEventListener('click', () => {
      document.body.classList.toggle('nav-open');
    });

    navLinkItems.forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 720) {
          document.body.classList.remove('nav-open');
        }
      });
    });
  }

  /* ---------- contact forms ---------- */

  function setupForms() {
    const forms = document.querySelectorAll('.contact-form');
    forms.forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        window.alert('Thank you! We will contact you shortly.');
        try { form.reset(); } catch (err) {}
      });
    });
  }

  /* ---------- stats counter ---------- */

  function setupStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (!statNumbers.length) return;
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const raw = el.dataset.target || el.getAttribute('data-target') || el.textContent;
        const target = parseInt(String(raw).replace(/\D/g,''), 10) || 0;
        if (!target) { o.unobserve(el); return; }
        if (el.dataset.animated) { o.unobserve(el); return; }
        el.dataset.animated = '1';
        const delay = parseInt(el.dataset.delay || '0', 10) || 0;
        setTimeout(() => {
          const duration = 1800;
          const start = performance.now();
          function step(now) {
            const p = Math.min((now - start)/duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            const current = Math.floor(target * eased);
            el.textContent = current + (String(raw).trim().endsWith('+') ? '+' : '');
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        }, delay);
        o.unobserve(el);
      });
    }, { threshold: 0.35 });
    statNumbers.forEach(n => obs.observe(n));
  }

  /* ---------- reveal on scroll ---------- */

  function setupScrollReveal() {
    const items = document.querySelectorAll('.reveal-on-scroll');
    if (!items.length) return;
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseFloat(el.dataset.revealDelay || '0') || 0;
        setTimeout(() => el.classList.add('is-visible'), delay);
        o.unobserve(el);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -60px 0px' });
    items.forEach((el, i) => {
      if (!el.dataset.revealDelay) el.dataset.revealDelay = i * 80;
      obs.observe(el);
    });
  }

  /* ---------- hover tilt ---------- */

  function setupHoverTilt() {
    const cards = document.querySelectorAll('.hover-tilt');
    if (!cards.length) return;
    const maxTilt = 10;
    const maxTranslate = 4;
    cards.forEach(card => {
      card.style.transformStyle = 'preserve-3d';
      card.style.transition = 'transform 150ms ease-out, box-shadow 150ms ease-out';
      function move(e) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const bounds = card.getBoundingClientRect();
        const x = clientX - bounds.left;
        const y = clientY - bounds.top;
        const centerX = bounds.width/2;
        const centerY = bounds.height/2;
        const percentX = (x - centerX)/centerX;
        const percentY = (y - centerY)/centerY;
        const rotateX = percentY * -maxTilt;
        const rotateY = percentX * maxTilt;
        const translateY = -Math.abs(percentY) * maxTranslate;
        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${translateY}px)`;
        card.style.boxShadow = '0 20px 50px rgba(0,0,0,0.55)';
      }
      function reset() {
        card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
        card.style.boxShadow = '';
      }
      card.addEventListener('mousemove', move);
      card.addEventListener('mouseenter', move);
      card.addEventListener('mouseleave', reset);
      card.addEventListener('touchmove', ev => move(ev), { passive: true });
      card.addEventListener('touchend', reset);
    });
  }

  /* ---------- page carousels (generic .carousel) ---------- */

  function initPageCarousels() {
    const carousels = document.querySelectorAll('.carousel');
    if (!carousels.length) return;
    carousels.forEach((carousel, idx) => {
      const track = carousel.querySelector('.carousel-track');
      if (!track) return;

      // collect base children
      const baseChildren = Array.from(track.children);
      if (!baseChildren.length) return;

      // create wrapper (will receive animation)
      const wrapper = document.createElement('div');
      wrapper.className = 'carousel-track-wrapper';

      // create slide wrappers
      const slides = baseChildren.map(n => {
        const s = document.createElement('div');
        s.className = 'carousel-slide';
        s.appendChild(n.cloneNode(true));
        return s;
      });

      // populate wrapper with clones until width >= 2x viewport
      function populate() {
        wrapper.innerHTML = '';
        slides.forEach(s => wrapper.appendChild(s.cloneNode(true)));
        let tries = 0;
        while (wrapper.scrollWidth < carousel.clientWidth * 2 && tries < 8) {
          slides.forEach(s => wrapper.appendChild(s.cloneNode(true)));
          tries++;
        }
        // append another full sequence so we have A + B
        const seq = wrapper.innerHTML;
        wrapper.insertAdjacentHTML('beforeend', seq);
      }

      // clear original track and append wrapper
      track.innerHTML = '';
      track.appendChild(wrapper);

      imagesLoaded(wrapper).then(() => {
        populate();
        const total = wrapper.scrollWidth;
        const oneLoop = total / 2;
        const pxPerSec = 140;
        const duration = Math.max(6, Math.round(oneLoop / pxPerSec));

        // create unique keyframes
        const name = `gv_carousel_${idx}_${Math.floor(Math.random()*1e6)}`;
        const style = document.createElement('style');
        style.textContent = `@keyframes ${name} { 0% { transform: translateX(var(--drag,0px)); } 100% { transform: translateX(calc(var(--drag,0px) - ${oneLoop}px)); } }`;
        document.head.appendChild(style);

        wrapper.style.setProperty('--drag', '0px');
        wrapper.style.animation = `${name} ${duration}s linear infinite`;
        wrapper.style.willChange = 'transform';
        wrapper.style.webkitTransform = 'translateZ(0)';

        attachNudgeDrag(wrapper);

        // responsive rebuild
        window.addEventListener('resize', debounce(() => {
          populate();
          // re-measure and reapply animation
          setTimeout(() => {
            const newTotal = wrapper.scrollWidth;
            const newOne = newTotal / 2;
            const newDuration = Math.max(6, Math.round(newOne / pxPerSec));
            style.textContent = `@keyframes ${name} { 0% { transform: translateX(var(--drag,0px)); } 100% { transform: translateX(calc(var(--drag,0px) - ${newOne}px)); } }`;
            wrapper.style.animation = `${name} ${newDuration}s linear infinite`;
          }, 100);
        }, 160));
      }).catch(() => {
        // fallback: duplicate once
        try { wrapper.insertAdjacentHTML('beforeend', wrapper.innerHTML); } catch (e) {}
      });
    });
  }

  /* ---------- clients carousel (logos) ---------- */

  function initClientsCarousels() {
    const wraps = document.querySelectorAll('.clients-carousel');
    if (!wraps.length) return;

    wraps.forEach((wrap) => {
      const track = wrap.querySelector('.clients-track');
      if (!track) return;

      const originals = Array.from(track.children);
      if (!originals.length) return;

      function populate() {
        track.innerHTML = '';
        originals.forEach(n => track.appendChild(n.cloneNode(true)));
        let tries = 0;
        while (track.scrollWidth < wrap.clientWidth * 2 && tries < 8) {
          originals.forEach(n => track.appendChild(n.cloneNode(true)));
          tries++;
        }
      }

      populate();

      imagesLoaded(track).then(() => {
        const total = track.scrollWidth;
        const oneLoop = total / 2;
        const pxPerSec = 120;
        const duration = Math.max(6, Math.round(oneLoop / pxPerSec));

        if (!document.getElementById('gv_clients_keyframes')) {
          const s = document.createElement('style');
          s.id = 'gv_clients_keyframes';
          s.textContent = `@keyframes gv_clients_scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`;
          document.head.appendChild(s);
        }
        track.style.animation = `gv_clients_scroll ${duration}s linear infinite`;
        track.style.willChange = 'transform';
        attachClientsNudge(track, wrap);

        window.addEventListener('resize', debounce(() => {
          populate();
          setTimeout(() => {
            const newTotal = track.scrollWidth;
            const newOne = newTotal / 2;
            const newDur = Math.max(6, Math.round(newOne / pxPerSec));
            track.style.animation = `gv_clients_scroll ${newDur}s linear infinite`;
          }, 120);
        }, 160));
      }).catch(() => {
        try { track.insertAdjacentHTML('beforeend', track.innerHTML); } catch (e) {}
      });
    });
  }

  /* ---------- nudge drag helpers ---------- */

  function attachNudgeDrag(wrapper) {
    if (!wrapper) return;
    let down = false;
    let startX = 0;
    let last = 0;

    function setDrag(px) {
      wrapper.style.setProperty('--drag', px + 'px');
    }

    function onDown(e) {
      down = true;
      startX = (e.touches ? e.touches[0].clientX : e.clientX);
      last = parseFloat(getComputedStyle(wrapper).getPropertyValue('--drag')) || 0;
    }
    function onMove(e) {
      if (!down) return;
      const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
      const delta = clientX - startX;
      setDrag(last + delta);
    }
    function onUp() {
      if (!down) return;
      down = false;
      // ease back
      const start = parseFloat(getComputedStyle(wrapper).getPropertyValue('--drag')) || 0;
      const dur = 360;
      const t0 = performance.now();
      function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = start * (1 - eased);
        setDrag(val);
        if (p < 1) requestAnimationFrame(tick);
        else setDrag(0);
      }
      requestAnimationFrame(tick);
    }

    wrapper.addEventListener('touchstart', onDown, { passive: true });
    wrapper.addEventListener('touchmove', onMove, { passive: true });
    wrapper.addEventListener('touchend', onUp, { passive: true });
    wrapper.addEventListener('mousedown', (e) => { e.preventDefault(); onDown(e); });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    wrapper.addEventListener('mouseleave', onUp);
  }

  function attachClientsNudge(track, wrap) {
    if (!track || !wrap) return;
    let down = false;
    let startX = 0;

    function onDown(e) {
      down = true;
      startX = (e.touches ? e.touches[0].clientX : e.clientX);
    }
    function onMove(e) {
      if (!down) return;
      const clientX = (e.touches ? e.touches[0].clientX : e.clientX);
      const delta = clientX - startX;
      track.style.transform = `translateX(${delta}px)`;
    }
    function onUp() {
      if (!down) return;
      down = false;
      track.style.transform = '';
    }

    wrap.addEventListener('touchstart', onDown, { passive: true });
    wrap.addEventListener('touchmove', onMove, { passive: true });
    wrap.addEventListener('touchend', onUp, { passive: true });
    wrap.addEventListener('mousedown', (e) => { e.preventDefault(); onDown(e); });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    wrap.addEventListener('mouseleave', onUp);
  }

  /* ---------- boot ---------- */

  function boot() {
    setupPreloader();
    setupMobileNav();
    setupForms();
    setupStats();
    setupScrollReveal();
    setupHoverTilt();
    // initialize carousels after small delay
    setTimeout(() => {
      initPageCarousels();
      initClientsCarousels();
    }, 120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // safety: if preloader element missing at load, ensure header visible
  window.addEventListener('load', function () {
    const pre = document.getElementById('preloader');
    if (!pre) {
      const header = document.querySelector('.site-header');
      if (header) { header.classList.remove('preloading'); header.classList.add('preloader-done'); }
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  });

})();
