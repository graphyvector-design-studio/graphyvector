document.addEventListener("DOMContentLoaded", function () {
  // ==========================
  // 1. Mobile nav toggle
  // ==========================
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
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
            const duration = 900;
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
  //    Usage: add class "reveal-on-scroll"
  //    Optional: data-reveal-delay="120"
  // ==========================
  setupScrollReveal();

  // ==========================
  // 5. 3D hover / tilt effect
  //    Usage: add class "hover-tilt"
  // ==========================
  setupHoverTilt();
});

/**
 * Scroll reveal: elements fade & slide up when they enter viewport.
 * CSS you can add in your stylesheet (at the end):
 *
 * .reveal-on-scroll {
 *   opacity: 0;
 *   transform: translateY(24px);
 *   transition: opacity 450ms ease-out, transform 450ms ease-out;
 * }
 *
 * .reveal-on-scroll.is-visible {
 *   opacity: 1;
 *   transform: translateY(0);
 * }
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

          // Stagger via timeout
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

  // If no custom data-reveal-delay, auto stagger in DOM order
  revealEls.forEach((el, index) => {
    if (!el.dataset.revealDelay) {
      el.dataset.revealDelay = index * 80; // 80ms stagger
    }
    observer.observe(el);
  });
}

/**
 * 3D hover tilt effect similar to n8n homepage cards.
 * Add class "hover-tilt" to any element (cards, service blocks, etc).
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
