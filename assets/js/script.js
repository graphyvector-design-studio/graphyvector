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
            if (!target) return;

            let current = 0;
            const duration = 4000;
            const startTime = performance.now();

            function tick(now) {
              const progress = Math.min((now - startTime) / duration, 1);
              current = Math.floor(target * progress);
              el.textContent =
                current + (el.textContent.toString().includes("+") ? "+" : "");
              if (progress < 1) requestAnimationFrame(tick);
            }

            requestAnimationFrame(tick);
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
      const bounds = card.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      const centerX = bounds.width / 2;
      const centerY = bounds.height / 2;

      const percentX = (x - centerX) / centerX; // -1 to 1
      const percentY = (y - centerY) / centerY; // -1 to 1

      const rotateX = percentY * -maxTilt;
      const rotateY = percentX * maxTilt;
      const translateY = -Math.abs(percentY) * maxTranslate;

      card.style.transform = `
        perspective(900px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        translateY(${translateY}px)
      `;
      card.style.boxShadow = "0 20px 50px rgba(0,0,0,0.55)";
    }

    function reset() {
      card.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)";
      card.style.boxShadow = "";
    }

    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseleave", reset);
    card.addEventListener("mouseenter", (e) => handleMove(e));
  });
}


// PRELOADER HANDLING
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");

  // Fade out after video finishes OR after 2 seconds (fallback)
  const video = document.getElementById("preloader-video");

  function hidePreloader() {
    preloader.classList.add("fade-out");

    setTimeout(() => {
      preloader.classList.add("hide");
    }, 600); // matches fade-out transition
  }

  // If video ends naturally
  video.addEventListener("ended", hidePreloader);

  // Safety fallback: hide after 2.2 sec
  setTimeout(hidePreloader, 2200);
});


// --------------------------------------
// Smooth Scrolling (Ease In / Ease Out)
// --------------------------------------
let scrollPosition = window.scrollY;
let targetScroll = scrollPosition;
const ease = 0.05; // smaller = slower, smoother

function smoothScroll() {
  scrollPosition += (targetScroll - scrollPosition) * ease;
  window.scrollTo(0, scrollPosition);
  requestAnimationFrame(smoothScroll);
}

window.addEventListener("wheel", (e) => {
  targetScroll += e.deltaY;
  targetScroll = Math.max(0, targetScroll);
});

// initialize
smoothScroll();


// ===== Infinite seamless carousel (robust no-gap loop) =====
(function initSeamlessCarousel() {
  const carousels = document.querySelectorAll(".carousel");
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    // find the initial track (contains slides directly)
    const originalTrack = carousel.querySelector(".carousel-track");
    if (!originalTrack) return;

    // build slides array from original markup, wrap slides into slide elements
    const slides = Array.from(originalTrack.children).map((node) => {
      const wrapper = document.createElement("div");
      wrapper.className = "carousel-slide";
      wrapper.appendChild(node.cloneNode(true));
      return wrapper;
    });

    // clear existing content and create wrapper that will be animated
    originalTrack.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.className = "carousel-track-wrapper";

    // append at least 2 copies of slides to guarantee seamless loop
    function populateTracks() {
      wrapper.innerHTML = "";
      // append original set
      slides.forEach((s) => wrapper.appendChild(s.cloneNode(true)));
      // keep appending extra copies until wrapper width >= 2 * carousel width
      // (we need content length >= 2x visible so translateX -50% equals one copy)
      let tries = 0;
      while (wrapper.scrollWidth < carousel.clientWidth * 2 && tries < 6) {
        slides.forEach((s) => wrapper.appendChild(s.cloneNode(true)));
        tries++;
      }
      // put the wrapper inside the track (so CSS selectors remain consistent)
      originalTrack.appendChild(wrapper);
    }

    // create a second wrapper clone to double up content and ensure perfect looping (optional)
    function ensureDouble() {
      // if wrapper width is still less than 2x, duplicate appended nodes
      if (wrapper.scrollWidth < carousel.clientWidth * 2) {
        const more = wrapper.cloneNode(true);
        originalTrack.appendChild(more);
      }
    }

    populateTracks();
    ensureDouble();

    // compute animation duration from distance and speed
    function setupAnimation() {
      // total scrollable distance = wrapper.scrollWidth (we will move by half)
      const totalPx = wrapper.scrollWidth;
      const oneLoopDistance = totalPx / 2; // we will translate by -50%
      const speed = 120; // px/sec, change if you want faster/slower
      const durationSec = Math.max(8, Math.round(oneLoopDistance / speed));

      // apply CSS animation via inline style for reliable timing
      wrapper.style.animation = `carousel-scroll ${durationSec}s linear infinite`;
      // create keyframes dynamically in case not present
      const styleId = "carousel-seamless-keyframes";
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement("style");
        styleEl.id = styleId;
        styleEl.textContent = `
@keyframes carousel-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}`;
        document.head.appendChild(styleEl);
      }

      // expose wrapper for pause/resume
      carousel._carouselWrapper = wrapper;
    }

    // run setup on load and resize
    window.addEventListener("load", () => {
      // Small timeout to let images load and cause correct measurements
      setTimeout(() => {
        populateTracks();
        ensureDouble();
        setupAnimation();
      }, 80);
    });

    // Recalculate on resize (debounced)
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        populateTracks();
        ensureDouble();
        setupAnimation();
      }, 150);
    });

    // pause on hover/focus
    carousel.addEventListener("mouseenter", () => {
      if (carousel._carouselWrapper)
        carousel._carouselWrapper.style.animationPlayState = "paused";
    });
    carousel.addEventListener("mouseleave", () => {
      if (carousel._carouselWrapper)
        carousel._carouselWrapper.style.animationPlayState = "running";
    });
    carousel.addEventListener("focusin", () => {
      if (carousel._carouselWrapper)
        carousel._carouselWrapper.style.animationPlayState = "paused";
    });
    carousel.addEventListener("focusout", () => {
      if (carousel._carouselWrapper)
        carousel._carouselWrapper.style.animationPlayState = "running";
    });

    // respect reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (wrapper) wrapper.style.animation = "none";
    }
  });
})();
