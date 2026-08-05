/**
 * AI Visibility Audit Tool — Main JavaScript
 * Production-ready, vanilla ES6+ module
 */

// ============================================
// DOM Element Cache
// ============================================

const DOM = {
  navbar: document.querySelector('.navbar'),
  hamburger: document.querySelector('.hamburger'),
  mobileMenu: document.querySelector('.mobile-menu'),
  mobileMenuBackdrop: document.querySelector('.mobile-menu-backdrop'),
  mobileMenuLinks: document.querySelectorAll('.mobile-menu-link'),
  heroInput: document.querySelector('.hero-input'),
  heroBtn: document.querySelector('.hero-btn'),
  resultsSection: document.querySelector('.results'),
  metricsGrid: document.querySelector('.metrics-grid'),
  resultsScore: document.querySelector('.results-score'),
  resultsScoreText: document.querySelector('.results-score-text'),
  contactForm: document.querySelector('.contact-form'),
  formSuccess: document.querySelector('.form-success'),
  footerYear: document.querySelector('.footer-year'),
  footerModified: document.querySelector('.footer-modified'),
  navLinks: document.querySelectorAll('.navbar-link'),
  sections: document.querySelectorAll('section[id]'),
};

// ============================================
// Constants & Configuration
// ============================================

const CONFIG = {
  navbarOffset: 72,
  successMessageDuration: 5000,
  auditDelay: 1800,
  minUrlLength: 3,
  storageKey: 'aiAuditContacts',
};

const METRIC_CONFIG = {
  'mobile-friendliness': { icon: '📱', title: 'Mobile-Friendliness', min: 65, max: 98 },
  'page-speed': { icon: '⚡', title: 'Page Speed', min: 45, max: 92 },
  'meta-tags': { icon: '🏷️', title: 'Meta Tags & SEO', min: 55, max: 100 },
  'accessibility': { icon: '♿', title: 'Accessibility / WCAG', min: 50, max: 88 },
  'ai-mentions': { icon: '🤖', title: 'AI Search Mentions', min: 30, max: 75 },
  'structured-data': { icon: '📋', title: 'Structured Data / Schema', min: 25, max: 85 },
};

const STATUS_THRESHOLDS = {
  pass: 80,
  warn: 60,
};

const STATUS_LABELS = {
  pass: 'Pass',
  warn: 'Warning',
  fail: 'Fail',
};

// ============================================
// Utility Functions
// ============================================

/**
 * Generate a random integer between min and max (inclusive)
 */
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Clamp a number between min and max
 */
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

/**
 * Debounce function execution
 */
const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
};

/**
 * Smooth scroll to element with navbar offset
 */
const smoothScrollTo = (target) => {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;

  const top = element.getBoundingClientRect().top + window.scrollY - CONFIG.navbarOffset;
  window.scrollTo({ top, behavior: 'smooth' });
};

/**
 * Get status based on score
 */
const getStatus = (score) => {
  if (score >= STATUS_THRESHOLDS.pass) return 'pass';
  if (score >= STATUS_THRESHOLDS.warn) return 'warn';
  return 'fail';
};

/**
 * Get status description
 */
const getStatusDescription = (key, status) => {
  const descriptions = {
    'mobile-friendliness': {
      pass: 'Your site is fully responsive and mobile-optimized.',
      warn: 'Some mobile usability issues detected. Consider improvements.',
      fail: 'Significant mobile usability issues found. Immediate action needed.',
    },
    'page-speed': {
      pass: 'Excellent page load performance across all metrics.',
      warn: 'Page speed could be improved. Consider optimizing images and scripts.',
      fail: 'Slow page speed detected. This hurts your AI search rankings.',
    },
    'meta-tags': {
      pass: 'All critical meta tags are present and well-optimized.',
      warn: 'Some meta tags are missing or need optimization.',
      fail: 'Critical meta tags missing. AI engines may not index your content properly.',
    },
    'accessibility': {
      pass: 'Your site meets WCAG AA accessibility standards.',
      warn: 'Some accessibility issues found. Review alt text and contrast ratios.',
      fail: 'Multiple accessibility violations detected. Fix immediately for compliance.',
    },
    'ai-mentions': {
      pass: 'Strong AI search presence detected across major platforms.',
      warn: 'Limited AI search visibility. Consider content optimization.',
      fail: 'Minimal AI search mentions. Your brand is invisible to AI engines.',
    },
    'structured-data': {
      pass: 'Rich structured data implemented. AI engines can parse your content.',
      warn: 'Basic structured data present but could be expanded.',
      fail: 'No structured data found. AI engines cannot understand your content structure.',
    },
  };
  return descriptions[key]?.[status] || 'Analysis complete.';
};

// ============================================
// Audit Engine
// ============================================

/**
 * Run a single audit check
 */
const runAuditCheck = (key) => {
  const config = METRIC_CONFIG[key];
  const score = randomInt(config.min, config.max);
  const status = getStatus(score);

  return {
    key,
    icon: config.icon,
    title: config.title,
    score,
    status,
    description: getStatusDescription(key, status),
  };
};

/**
 * Run the full audit simulation
 */
const runAudit = async (url) => {
  // Show loading state
  DOM.heroBtn.classList.add('btn-loading');
  DOM.heroBtn.disabled = true;
  DOM.heroBtn.setAttribute('aria-busy', 'true');

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, CONFIG.auditDelay));

  // Run all checks
  const checks = Object.keys(METRIC_CONFIG).map((key) => runAuditCheck(key));

  // Calculate overall score
  const overallScore = Math.round(checks.reduce((sum, check) => sum + check.score, 0) / checks.length);

  // Render results
  renderResults(overallScore, checks, url);

  // Hide loading state
  DOM.heroBtn.classList.remove('btn-loading');
  DOM.heroBtn.disabled = false;
  DOM.heroBtn.setAttribute('aria-busy', 'false');

  // Show results section and scroll
  DOM.resultsSection.classList.add('visible');
  smoothScrollTo(DOM.resultsSection);
};

/**
 * Render audit results to the DOM
 */
const renderResults = (overallScore, checks, url) => {
  // Update overall score
  DOM.resultsScore.textContent = `${overallScore}%`;

  const status = getStatus(overallScore);
  const statusMessages = {
    pass: 'Excellent! Your website is well-optimized for AI search engines.',
    warn: 'Good start, but there are areas that need improvement.',
    fail: 'Critical issues found. Your website needs immediate optimization.',
  };
  DOM.resultsScoreText.textContent = statusMessages[status];

  // Build metric cards
  const metricsHTML = checks
    .map(
      (check) => `
        <article class="metric-card" data-metric="${check.key}">
          <div class="metric-header">
            <div class="metric-icon-title">
              <span class="metric-icon" aria-hidden="true">${check.icon}</span>
              <h3 class="metric-title">${check.title}</h3>
            </div>
            <span class="metric-score ${check.status}">${check.score}%</span>
          </div>
          <span class="metric-status ${check.status}">
            <span class="status-dot" aria-hidden="true">${check.status === 'pass' ? '✓' : check.status === 'warn' ? '!' : '✕'}</span>
            ${STATUS_LABELS[check.status]}
          </span>
          <p class="metric-description">${check.description}</p>
        </article>
      `
    )
    .join('');

  DOM.metricsGrid.innerHTML = metricsHTML;
};

/**
 * Validate and trigger audit
 */
const handleAudit = () => {
  const url = DOM.heroInput.value.trim();

  if (!url || url.length < CONFIG.minUrlLength || !url.includes('.')) {
    DOM.heroInput.classList.add('error');
    DOM.heroInput.setAttribute('aria-invalid', 'true');
    DOM.heroInput.focus();
    return;
  }

  DOM.heroInput.classList.remove('error');
  DOM.heroInput.setAttribute('aria-invalid', 'false');

  runAudit(url);
};

// ============================================
// Mobile Menu
// ============================================

/**
 * Open mobile menu
 */
const openMobileMenu = () => {
  DOM.hamburger.setAttribute('aria-expanded', 'true');
  DOM.mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
  DOM.mobileMenuLinks[0]?.focus();
};

/**
 * Close mobile menu
 */
const closeMobileMenu = () => {
  DOM.hamburger.setAttribute('aria-expanded', 'false');
  DOM.mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
  DOM.hamburger.focus();
};

/**
 * Toggle mobile menu
 */
const toggleMobileMenu = () => {
  const isOpen = DOM.hamburger.getAttribute('aria-expanded') === 'true';
  if (isOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
};

// ============================================
// Form Validation & Handling
// ============================================

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  return email.includes('@') && email.includes('.') && email.indexOf('@') < email.lastIndexOf('.');
};

/**
 * Validate URL format
 */
const isValidUrl = (url) => {
  return url.includes('.') && url.length >= 3;
};

/**
 * Show field error
 */
const showFieldError = (field, message) => {
  field.classList.add('error');
  field.setAttribute('aria-invalid', 'true');

  const errorEl = field.parentElement.querySelector('.error-message');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.add('visible');
  }
};

/**
 * Clear field error
 */
const clearFieldError = (field) => {
  field.classList.remove('error');
  field.setAttribute('aria-invalid', 'false');

  const errorEl = field.parentElement.querySelector('.error-message');
  if (errorEl) {
    errorEl.classList.remove('visible');
  }
};

/**
 * Handle contact form submission
 */
const handleContactSubmit = (event) => {
  event.preventDefault();

  const nameField = DOM.contactForm.querySelector('[name="name"]');
  const emailField = DOM.contactForm.querySelector('[name="email"]');
  const urlField = DOM.contactForm.querySelector('[name="website"]');
  const messageField = DOM.contactForm.querySelector('[name="message"]');

  let isValid = true;

  // Validate name
  if (!nameField.value.trim()) {
    showFieldError(nameField, 'Full name is required.');
    isValid = false;
  } else {
    clearFieldError(nameField);
  }

  // Validate email
  if (!emailField.value.trim()) {
    showFieldError(emailField, 'Email address is required.');
    isValid = false;
  } else if (!isValidEmail(emailField.value.trim())) {
    showFieldError(emailField, 'Please enter a valid email address.');
    isValid = false;
  } else {
    clearFieldError(emailField);
  }

  // Validate URL
  if (!urlField.value.trim()) {
    showFieldError(urlField, 'Website URL is required.');
    isValid = false;
  } else if (!isValidUrl(urlField.value.trim())) {
    showFieldError(urlField, 'Please enter a valid website URL.');
    isValid = false;
  } else {
    clearFieldError(urlField);
  }

  if (!isValid) return;

  // Save to localStorage
  const contactData = {
    name: nameField.value.trim(),
    email: emailField.value.trim(),
    website: urlField.value.trim(),
    message: messageField.value.trim(),
    timestamp: new Date().toISOString(),
  };

  try {
    const existing = JSON.parse(localStorage.getItem(CONFIG.storageKey)) || [];
    existing.push(contactData);
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(existing));
  } catch (e) {
    console.warn('Could not save to localStorage:', e);
  }

  // Show success message
  DOM.formSuccess.classList.add('visible');
  DOM.formSuccess.setAttribute('role', 'status');

  // Reset form
  DOM.contactForm.reset();

  // Auto-hide success message
  setTimeout(() => {
    DOM.formSuccess.classList.remove('visible');
  }, CONFIG.successMessageDuration);
};

// ============================================
// Navbar Scroll Effect
// ============================================

const handleNavbarScroll = () => {
  if (window.scrollY > 10) {
    DOM.navbar.classList.add('scrolled');
  } else {
    DOM.navbar.classList.remove('scrolled');
  }
};

// ============================================
// Active Section Highlighting
// ============================================

const highlightActiveSection = () => {
  const scrollPos = window.scrollY + CONFIG.navbarOffset + 100;

  DOM.sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id = section.getAttribute('id');

    if (scrollPos >= top && scrollPos < bottom) {
      DOM.navLinks.forEach((link) => {
        link.removeAttribute('aria-current');
        if (link.getAttribute('href') === `#${id}`) {
          link.setAttribute('aria-current', 'page');
        }
      });
    }
  });
};

// ============================================
// Footer Dynamic Content
// ============================================

const updateFooter = () => {
  if (DOM.footerYear) {
    DOM.footerYear.textContent = new Date().getFullYear();
  }
  if (DOM.footerModified) {
    DOM.footerModified.textContent = document.lastModified;
  }
};

// ============================================
// Event Listeners
// ============================================

const initEventListeners = () => {
  // Hero audit button
  DOM.heroBtn?.addEventListener('click', handleAudit);

  // Hero input enter key
  DOM.heroInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAudit();
    }
  });

  // Clear error on input
  DOM.heroInput?.addEventListener('input', () => {
    DOM.heroInput.classList.remove('error');
  });

  // Hamburger toggle
  DOM.hamburger?.addEventListener('click', toggleMobileMenu);

  // Mobile menu backdrop click
  DOM.mobileMenuBackdrop?.addEventListener('click', closeMobileMenu);

  // Mobile menu link clicks
  DOM.mobileMenuLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('href');
      closeMobileMenu();
      setTimeout(() => smoothScrollTo(target), 350);
    });
  });

  // Escape key to close mobile menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && DOM.mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // Contact form
  DOM.contactForm?.addEventListener('submit', handleContactSubmit);

  // Clear form errors on input
  DOM.contactForm?.querySelectorAll('.form-input, .form-textarea').forEach((field) => {
    field.addEventListener('input', () => clearFieldError(field));
  });

  // Navbar scroll effect (debounced)
  window.addEventListener('scroll', debounce(handleNavbarScroll, 50));

  // Active section highlighting (debounced)
  window.addEventListener('scroll', debounce(highlightActiveSection, 100));

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      smoothScrollTo(href);
    });
  });
};

// ============================================
// Initialization
// ============================================

const init = () => {
  updateFooter();
  initEventListeners();
  handleNavbarScroll();
};

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
