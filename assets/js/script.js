// assets/js/script.js
// Reworked: removed wheel-driven smooth scroll (that caused glitches).
// Keeps mobile nav, preloader, stats, reveal, hover-tilt and carousel.

document.addEventListener("DOMContentLoaded", function () {
  // ==========================
  // 1. Mobile nav toggle + Apple-like animation
  // ==========================
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navLinkItems = document.querySelectorAll(".nav-link");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      document.body.classList.toggle("nav-open");
    });

    // Close menu when clicking a link on mobile
    navLinkItems.forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 720) {
          document.body.classList.remove("nav-open");
        }
      });
    });
  }

  // ==========================
  // 2. Contact form handler
  // ==========================
  const forms = document.querySelectorAll(".contact-form");
  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Thank you! We will contact you shortly.");
      form.reset();
    });
  });

  // ==========================
  // 3. Stats counter on scroll
  // ==========================
  const statNumbers = document.querySelectorAll(".stat-number");
  if (statNumbers.length) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.dataset.target, 10);
            if (!target) {
              obs.unobserve(el);
              return;
            }

            // delay start if you want: read data-delay or default 0
            const delayMs = parseInt(el.dataset.delay || "0", 10);

            setTimeout(() => {
              let current = 0;
              const duration = 1800; // ms (shorter, smoother)
              const startTime = performance.now();

              function tick(now) {
                const progress = Math.min((now - startTime) / duration, 1);
                // ease-out progress for nicer feel
                const eased = 1 - Math.pow(1 - progress, 3);
                current = Math.floor(target * eased);
                el.textContent =
                  current + (el.textContent.toString().includes("+") ? "+" : "");
                if (progress < 1) requestAnimationFrame(tick);
              }

              requestAnimationFrame(tick);
            }, delayMs);

            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.4 }
    );

    statNumbers.forEach((num) => observer.observe(num));
  }

  // ==========================
  // 4. Scroll reveal animation
  // ==========================
  setupScrollReveal();

  // ==========================
  // 5. 3D hover / tilt effect
  // ==========================
  setupHoverTilt();

  // Initialize carousels (if any) after a short delay so images can start loading
  setTimeout(() => {
    initSeamlessCarousel();
  }, 140); // small delay keeps measurements stable
});

/**
 * Scroll reveal: fade + slide + blur to crisp.
 */
function setupScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal-on-scroll");
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseFloat(el.dataset.revealDelay || "0");

          setTimeout(() => {
            el.classList.add("is-visible");
          }, delay);

          obs.unobserve(el);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -60px 0px",
    }
  );

  revealEls.forEach((el, index) => {
    if (!el.dataset.revealDelay) {
      el.dataset.revealDelay = index * 80;
    }
    observer.observe(el);
  });
}

/**
 * 3D hover tilt (n8n-like).
 */
function setupHoverTilt() {
  const cards = document.querySelectorAll(".hover-tilt");
  if (!cards.length) return;

  const maxTilt = 10; // degrees
  const maxTranslate = 4; // px

  cards.forEach((card) => {
    card.style.transformStyle = "preserve-3d";
    card.style.transition =
      "transform 150ms ease-out, box-shadow 150ms ease-out";

    function handleMove(e) {
      // support touch (single touch) by using touches[0] if present
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const bounds = card.getBoundingClientRect();
      const x = clientX - bounds.left;
      const y = clientY - bounds.top;
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;

      const percentX = (x - centerX) / centerX; // -1 to 1
      const percentY = (y - centerY) / centerY; // -1 to 1

      const rotateX = percentY * -maxTilt;
      const rotateY = percentX * maxTilt;
      const translateY = -Math.abs(percentY) * maxTranslate;

      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(${translateY}px)`;
      card.style.boxShadow = "0 20px 50px rgba(0,0,0,0.55)";
    }

    function reset() {
      card.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
      card.style.boxShadow = "";
    }

    // mouse
    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseleave", reset);
    card.addEventListener("mouseenter", (e) => handleMove(e));

    // touch support (lightweight)
    card.addEventListener(
      "touchmove",
      (ev) => {
        handleMove(ev);
      },
      { passive: true }
    );
    card.addEventListener("touchend", reset);
  });
}

/* ===========================
   PRELOADER HANDLING
   - hide safely when video ends or fallback
   =========================== */
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  const video = document.getElementById("preloader-video");

  if (!preloader) return;

  function hidePreloader() {
    // defensive: if already hidden, skip
    if (preloader.classList.contains("hide")) return;

    preloader.classList.add("fade-out");
    setTimeout(() => {
      preloader.classList.add("hide");
      // allow scroll after preloader removed
      document.body.style.overflow = "";
    }, 600); // match CSS transition time
  }

  // If video exists, wait for ended event (but still have fallback)
  if (video) {
    // play attempt may fail on some browsers; ignore errors
    try {
      // ensure muted & playsinline are set in HTML so autoplay works
      video.play().catch(() => {});
    } catch (e) {}

    video.addEventListener("ended", hidePreloader);
  }

  // Fallback in case video doesn't finish
  setTimeout(hidePreloader, 2200);
});

// ===== Infinite seamless carousel (no-pause + dragable nudge) =====
function initSeamlessCarousel() {
  const carousels = document.querySelectorAll(".carousel");
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    const originalTrack = carousel.querySelector(".carousel-track");
    if (!originalTrack) return;

    // collect source nodes
    const sourceNodes = Array.from(originalTrack.children);
    if (!sourceNodes.length) return;

    // create slides array
    const slides = sourceNodes.map((node) => {
      const wrapper = document.createElement("div");
      wrapper.className = "carousel-slide";
      wrapper.appendChild(node.cloneNode(true));
      return wrapper;
    });

    originalTrack.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.className = "carousel-track-wrapper";

    function populateTracks() {
      wrapper.innerHTML = "";
      slides.forEach((s) => wrapper.appendChild(s.cloneNode(true)));
      let tries = 0;
      while (wrapper.scrollWidth < carousel.clientWidth * 2 && tries < 8) {
        slides.forEach((s) => wrapper.appendChild(s.cloneNode(true)));
        tries++;
      }
      originalTrack.appendChild(wrapper);
    }

    function ensureDouble() {
      if (wrapper.scrollWidth < carousel.clientWidth * 2) {
        const more = wrapper.cloneNode(true);
        originalTrack.appendChild(more);
      }
    }

    populateTracks();
    ensureDouble();

    // compute animation duration & apply animation (inline)
    function setupAnimation() {
      if (!wrapper || wrapper.children.length === 0) return;
      const totalPx = wrapper.scrollWidth;
      const oneLoopDistance = totalPx / 2;
      const speed = 140; // px/sec — adjust to taste
      const durationSec = Math.max(8, Math.round(oneLoopDistance / speed));
      // set initial drag var
      wrapper.style.setProperty("--drag", "0px");
      // apply animation
      wrapper.style.animation = `carousel-scroll ${durationSec}s linear infinite`;
      carousel._carouselWrapper = wrapper;
    }



    // enhance carousel fades while pointer is active (dragging/hover) so fade is more visible
(function carouselFadeEnhancer() {
  const carWraps = document.querySelectorAll('.carousel-wrap');
  if (!carWraps.length) return;

  carWraps.forEach(wrap => {
    let active = false;
    function setActive(v) {
      active = !!v;
      if (active) wrap.classList.add('carousel-fade-active');
      else wrap.classList.remove('carousel-fade-active');
    }

    // pointer & mouse events
    wrap.addEventListener('mouseenter', () => setActive(true));
    wrap.addEventListener('mouseleave', () => setActive(false));
    wrap.addEventListener('touchstart', () => setActive(true), { passive: true });
    wrap.addEventListener('touchend', () => setActive(false), { passive: true });

    // pointer-drag nuance (if your carousel sets --drag var, support it too)
    wrap.addEventListener('pointerdown', () => setActive(true), { passive: true });
    window.addEventListener('pointerup', () => setActive(false), { passive: true });
  });
})();


    setupAnimation();

    // re-run on load & resize
    window.addEventListener("load", () => {
      setTimeout(() => {
        populateTracks();
        ensureDouble();
        setupAnimation();
      }, 80);
    });

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        populateTracks();
        ensureDouble();
        setupAnimation();
      }, 160);
    });

    // POINTER / TOUCH DRAG: apply a temporary drag offset while keeping animation running.
    // This allows user to nudge/swipe without pausing the loop.
    (function attachDrag() {
      let isPointerDown = false;
      let startX = 0;
      let lastDrag = 0; // current drag offset in px
      let currentVar = 0; // numeric px value for --drag

      const minMoveToStart = 6; // ignore tiny taps

      // helper to set CSS var
      function setDrag(px) {
        currentVar = px;
        // set var as px string
        wrapper.style.setProperty("--drag", px + "px");
      }

      // pointer start (mouse or touch)
      function onPointerDown(e) {
        isPointerDown = true;
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        lastDrag = currentVar || 0;
        // allow passive moves
      }

      function onPointerMove(e) {
        if (!isPointerDown) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const delta = clientX - startX;
        // only react to meaningful moves
        if (Math.abs(delta) < minMoveToStart) return;
        // compute new drag value (we invert to match translate direction)
        const newDrag = lastDrag + delta;
        setDrag(newDrag);
        // don't call preventDefault so page still scrolls vertically if user scrolls
      }

      function onPointerUp() {
        if (!isPointerDown) return;
        isPointerDown = false;
        // Animate the drag var back to 0 smoothly so the running animation is not abruptly changed.
        // We use a little easing loop to restore var to nearest loop-normalized value.
        const start = currentVar;
        const duration = 360; // ms to ease back
        const t0 = performance.now();

        function easeOutQuad(t) {
          return 1 - (1 - t) * (1 - t);
        }

        function tick(now) {
          const p = Math.min((now - t0) / duration, 1);
          const eased = easeOutQuad(p);
          const val = start * (1 - eased);
          setDrag(val);
          if (p < 1) requestAnimationFrame(tick);
          else {
            // finally snap to 0
            setDrag(0);
          }
        }
        requestAnimationFrame(tick);
      }

      // attach listeners (support touch and mouse)
      wrapper.addEventListener("touchstart", onPointerDown, { passive: true });
      wrapper.addEventListener("touchmove", onPointerMove, { passive: true });
      wrapper.addEventListener("touchend", onPointerUp, { passive: true });

      wrapper.addEventListener("mousedown", (e) => {
        // prevent text selection while dragging
        e.preventDefault();
        onPointerDown(e);
      });
      window.addEventListener("mousemove", onPointerMove);
      window.addEventListener("mouseup", onPointerUp);
      // also cancel on leave
      wrapper.addEventListener("mouseleave", onPointerUp);
    })();

    // pause/resume on hover removed per request — animation always runs

    // respect reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (wrapper) wrapper.style.animation = "none";
    }
  });
}

// if you call initSeamlessCarousel earlier, ensure to call it again or have the DOMContentLoaded call invoke it
// e.g. window.addEventListener('load', initSeamlessCarousel);




/* Clients logo seamless carousel (auto-loop + draggable nudge, doesn't pause) */
(function initClientsCarousel(){
  const wraps = document.querySelectorAll('.clients-carousel');
  if(!wraps.length) return;

  wraps.forEach((wrap) => {
    const track = wrap.querySelector('.clients-track');
    if(!track) return;

    // collect original slides
    const orig = Array.from(track.children);
    if(!orig.length) return;

    // create a wrapper for animation (if not already)
    // We'll clone slides until track width >= 2x visible width
    function populate() {
      // clear and re-append base set then clones
      track.innerHTML = '';
      orig.forEach(node => track.appendChild(node.cloneNode(true)));
      let tries=0;
      // keep adding clones until wide enough
      while(track.scrollWidth < wrap.clientWidth * 2 && tries < 8) {
        orig.forEach(node => track.appendChild(node.cloneNode(true)));
        tries++;
      }
    }

    populate();

    // apply animation via inline style: move -50% across whole track content
    function applyAnimation() {
      const totalWidth = track.scrollWidth;
      const oneLoopPx = totalWidth / 2; // we translate -50%
      const pxPerSec = 120; // tweak speed
      const duration = Math.max(8, Math.round(oneLoopPx / pxPerSec));
      // set keyframes dynamically if not present
      if(!document.getElementById('clients-carousel-frames')) {
        const s = document.createElement('style');
        s.id = 'clients-carousel-frames';
        s.textContent = `
@keyframes clients-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}`;
        document.head.appendChild(s);
      }
      track.style.animation = `clients-scroll ${duration}s linear infinite`;
      track.style.willChange = 'transform';
      track.style.display = 'flex';
    }

    applyAnimation();

    // responsive recalcs
    let rt;
    window.addEventListener('resize', ()=> {
      clearTimeout(rt);
      rt = setTimeout(()=>{ populate(); applyAnimation(); }, 140);
    });

    // allow pointer drag nudging without stopping the loop
    (function attachDrag(){
      let down=false, startX=0, last=0;
      function setVar(px){ track.style.transform = `translateX(${px}px)`; } // temporary override
      function onDown(e){
        down=true;
        startX = (e.touches ? e.touches[0].clientX : e.clientX);
        last = 0;
      }
      function onMove(e){
        if(!down) return;
        const x = (e.touches ? e.touches[0].clientX : e.clientX);
        const delta = x - startX;
        // apply temp transform on top of animation (keeps animation running)
        track.style.transform = `translateX(${delta}px)`;
      }
      function onUp(){
        if(!down) return;
        down=false;
        // animate back to none (let CSS animation resume)
        track.style.transform = '';
      }
      wrap.addEventListener('touchstart', onDown, {passive:true});
      wrap.addEventListener('touchmove', onMove, {passive:true});
      wrap.addEventListener('touchend', onUp, {passive:true});
      wrap.addEventListener('mousedown', (e)=>{ e.preventDefault(); onDown(e); });
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      wrap.addEventListener('mouseleave', onUp);
    })();

  });
})();




// optional: hook for roadmap step reveal
document.querySelectorAll('.roadmap-step.reveal-on-scroll').forEach(step => {
  step.addEventListener('transitionend', () => {
    if (step.classList.contains('is-visible')) {
      // placeholder for custom animation trigger
      // e.g. animate connecting SVG line, or start Lottie
      // console.log('roadmap step visible:', step.dataset.step);
    }
  });
});


/* END OF FILE */
