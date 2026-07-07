/**
 * assets/js/components.js
 * Graphy Vector Studio — Web Components
 * Usage in every page:
 *   <gv-header page="home"></gv-header>   ← change "home" per page
 *   <gv-footer></gv-footer>
 *
 * Valid page values:
 *   home | works | contact | insights | about
 */

/* ════════════════════════════════════════
   GV-HEADER
════════════════════════════════════════ */
class GVHeader extends HTMLElement {

  connectedCallback() {
    const page = this.getAttribute('page') || '';
    this.innerHTML = this._template(page);
    this._initMobileNav();
    this._initPreloader();
  }

  _isActive(page, check) {
    return page === check ? ' active' : '';
  }

  _template(page) {
    return `
<!-- Preloader -->
<div id="preloader">
  <video id="preloader-video" autoplay muted playsinline>
    <source src="./assets/vid/preloader.webm" type="video/webm">
  </video>
</div>

<header class="site-header">
  <div class="container nav-container">
    <a href="index.html" class="logo">
      <span class="logo-mark">
        <img src="./assets/img/GraphyVectorLogo.svg" alt="Graphy Vector Studio">
      </span>
    </a>
    <button class="nav-toggle" aria-label="Toggle navigation">
      <span></span><span></span><span></span>
    </button>
    <nav class="nav-links">
      <a href="index.html"    class="nav-link${this._isActive(page, 'home')}">Home</a>
      <a href="works.html"    class="nav-link${this._isActive(page, 'works')}">Works</a>
      <a href="contact.html"  class="nav-link${this._isActive(page, 'contact')}">Contact</a>
      <a href="insights.html" class="nav-link${this._isActive(page, 'insights')}">Insights</a>
      <a href="about.html"    class="nav-link${this._isActive(page, 'about')}">About Us</a>
    </nav>
  </div>
</header>`;
  }

  _initMobileNav() {
    const toggle = this.querySelector('.nav-toggle');
    const links  = this.querySelectorAll('.nav-link');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('nav-open');
    });
    links.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 720) document.body.classList.remove('nav-open');
      });
    });
  }

  _initPreloader() {
    const preloader = this.querySelector('#preloader');
    const video     = this.querySelector('#preloader-video');
    const header    = this.querySelector('.site-header');

    if (header) header.classList.add('preloading');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    let done = false;
    const hide = () => {
      if (done) return;
      done = true;
      if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(() => {
          preloader.classList.add('hide');
          if (header) {
            header.classList.remove('preloading');
            header.classList.add('preloader-done');
          }
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
        }, 620);
      } else {
        if (header) {
          header.classList.remove('preloading');
          header.classList.add('preloader-done');
        }
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
    };

    if (video) {
      video.muted = true;
      video.playsInline = true;
      try { video.play().catch(() => {}); } catch(e) {}
      video.addEventListener('ended', hide, { once: true });
    }

    // Hard fallback 2.2s
    setTimeout(hide, 2200);

    if (!video) {
      window.addEventListener('load', () => setTimeout(hide, 300));
    }
  }
}

customElements.define('gv-header', GVHeader);


/* ════════════════════════════════════════
   GV-FOOTER
════════════════════════════════════════ */
class GVFooter extends HTMLElement {

  connectedCallback() {
    this.innerHTML = this._template();
  }

  _template() {
    const year = new Date().getFullYear();
    return `
<footer class="site-footer">
  <div class="container footer-grid">

    <div class="footer-brand">
      <div class="logo footer-logo">
        <span class="logo-mark">
          <img src="./assets/img/GraphyVectorLogo.svg" alt="Graphy Vector Studio">
        </span>
        <span class="logo-text">
          <span class="logo-name">Graphy Vector Studio</span>
          <span class="logo-tagline">Let The Design Speak for You</span>
        </span>
      </div>
      <p class="trusted">Trusted by clients on</p>
      <p class="trusted-icons">
        <a href="https://www.fiverr.com/users/nilesh_artistic/" target="_blank" rel="noopener">
          <img src="./assets/icons/fiverr.svg" style="width:45px;margin-right:20px;margin-top:8px;" alt="Fiverr">
        </a>
        <a href="https://upwork.com/freelancers/nilesh01" target="_blank" rel="noopener">
          <img src="./assets/icons/upwork.svg" style="width:65px;margin-right:20px;" alt="Upwork">
        </a>
      </p>
      <p class="copyright">© ${year} Graphy Vector. All rights reserved</p>
    </div>

    <div class="footer-column">
      <h4>Information</h4>
      <ul>
        <a href="tel:+917029933095">
          <li style="display:inline-flex;height:20px;">
            <img src="./assets/icons/call.svg" style="margin-right:7px;" alt="Phone">
            +91 70299 33095
          </li>
        </a><br>
        <a href="mailto:graphyvector@gmail.com">
          <li style="display:inline-flex;height:20px;">
            <img src="./assets/icons/email.svg" style="margin-right:7px;" alt="Email">
            graphyvector@gmail.com
          </li>
        </a>
      </ul>
      <h4>Follow Us On</h4>
      <p class="social-icons">
        <a href="https://www.behance.net/graphyvector" target="_blank" rel="noopener">
          <img src="./assets/icons/behance.svg" style="margin-right:10px;" alt="Behance">
        </a>
        <a href="https://www.instagram.com/graphy.vector/" target="_blank" rel="noopener">
          <img src="./assets/icons/instagram.svg" style="margin-right:10px;" alt="Instagram">
        </a>
        <a href="https://www.linkedin.com/in/graphy-vector/" target="_blank" rel="noopener">
          <img src="./assets/icons/linkedin.svg" style="margin-right:10px;" alt="LinkedIn">
        </a>
      </p>
    </div>

    <div class="footer-column">
      <h4>Links</h4>
      <ul class="footer-links">
        <li><a href="index.html">Home</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="works.html">Works &amp; Case Studies</a></li>
        <li><a href="contact.html">Start Consultation</a></li>
        <li><a href="#">Privacy Policy</a></li>
        <li><a href="#">Terms of Service</a></li>
      </ul>
    </div>

  </div>
</footer>`;
  }
}

customElements.define('gv-footer', GVFooter);
