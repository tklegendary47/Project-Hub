
/**
 * Matimaku Mansions - Main JavaScript
 * Production-ready, accessible, vanilla JS only
 */

(function() {
  'use strict';

  /* ========================================================================
     1. Mobile Menu Toggle
     ======================================================================== */
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileOverlay = document.querySelector('.mobile-menu__overlay');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');

  function openMobileMenu() {
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('mobile-menu--open');
    mobileOverlay.classList.add('mobile-menu__overlay--visible');
    document.body.style.overflow = 'hidden';
    
    // Focus trap: focus first link
    if (mobileLinks.length > 0) {
      mobileLinks[0].focus();
    }
  }

  function closeMobileMenu() {
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('mobile-menu--open');
    mobileOverlay.classList.remove('mobile-menu__overlay--visible');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  function isMobileMenuOpen() {
    return hamburger && hamburger.getAttribute('aria-expanded') === 'true';
  }

  function isEscapeKey(event) {
    return event.key === 'Escape' || event.key === 'Esc' || event.keyCode === 27;
  }

  if (hamburger) {
    hamburger.addEventListener('click', function() {
      const isOpen = isMobileMenuOpen();
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (isEscapeKey(e) && isMobileMenuOpen()) {
        closeMobileMenu();
      }
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', closeMobileMenu);
  }

  // Close on mobile link click
  mobileLinks.forEach(function(link) {
    link.addEventListener('click', closeMobileMenu);
  });

  // Focus trap within mobile menu
  if (mobileMenu) {
    mobileMenu.addEventListener('keydown', function(e) {
      if (e.key !== 'Tab') return;
      
      const focusableElements = mobileMenu.querySelectorAll('a, button');
      if (focusableElements.length === 0) return;
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    });
  }

  /* ========================================================================
     2. Smooth Scroll
     ======================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ========================================================================
     3. Scroll Reveal (IntersectionObserver)
     ======================================================================== */
  const revealElements = document.querySelectorAll('.reveal');
  
  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(function() {
            entry.target.classList.add('active');
          }, delay);
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(function(el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show all elements immediately
    revealElements.forEach(function(el) {
      el.classList.add('active');
    });
  }

  /* ========================================================================
     4. Header Scroll Effect
     ======================================================================== */
  const header = document.querySelector('.header');
  let lastScrollY = 0;

  function updateHeader() {
    const scrollY = window.scrollY;
    
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScrollY = scrollY;
  }

  // Throttled scroll handler
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        updateHeader();
        ticking = false;
      });
      ticking = true;
    }
  });

  /* ========================================================================
     5. Counter Animation
     ======================================================================== */
  const counters = document.querySelectorAll('.counter');

  function animateCounter(element) {
    const target = parseInt(element.dataset.target, 10);
    const suffix = element.dataset.suffix || '';
    const duration = 2000; // 2 seconds
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: easeOutQuart
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(eased * target);
      
      element.textContent = current.toLocaleString() + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target.toLocaleString() + suffix;
      }
    }

    requestAnimationFrame(update);
  }

  if (counters.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(function(counter) {
      counterObserver.observe(counter);
    });
  }

  /* ========================================================================
     6. Form Validation
     ======================================================================== */
  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    const formGroups = contactForm.querySelectorAll('.form__group');
    
    function validateField(input) {
      const group = input.closest('.form__group');
      const value = input.value.trim();
      let isValid = true;
      let errorMessage = '';

      if (input.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required.';
      } else if (input.type === 'email' && value) {
        const emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailPattern.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address.';
        }
      }

      const errorEl = group.querySelector('.form__error');
      
      if (!isValid) {
        group.classList.add('form__group--error');
        if (errorEl) {
          errorEl.textContent = errorMessage;
        }
      } else {
        group.classList.remove('form__group--error');
        if (errorEl) {
          errorEl.textContent = '';
        }
      }

      return isValid;
    }

    // Real-time validation on blur and input
    formGroups.forEach(function(group) {
      const input = group.querySelector('.form__input, .form__textarea');
      if (input) {
        const validateInput = function() {
          validateField(input);
        };

        input.addEventListener('blur', validateInput);

        input.addEventListener('input', function() {
          if (group.classList.contains('form__group--error')) {
            validateInput();
          }
        });
      }
    });

    // Submit handler
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      let isFormValid = true;
      const inputs = contactForm.querySelectorAll('.form__input, .form__textarea');
      
      inputs.forEach(function(input) {
        if (!validateField(input)) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        // Show success state (mock - no backend)
        const formContent = contactForm.querySelector('.form__content');
        const formSuccess = contactForm.querySelector('.form__success');
        
        if (formContent && formSuccess) {
          formContent.style.display = 'none';
          formSuccess.classList.add('form__success--visible');
        }
        
        // Reset form after 3 seconds
        setTimeout(function() {
          contactForm.reset();
          if (formContent && formSuccess) {
            formContent.style.display = 'block';
            formSuccess.classList.remove('form__success--visible');
          }
        }, 3000);
      } else {
        // Focus first invalid field
        const firstInvalid = contactForm.querySelector('.form__group--error input, .form__group--error textarea');
        if (firstInvalid) {
          firstInvalid.focus();
        }
      }
    });
  }

  /* ========================================================================
     7. Active Navigation Link on Scroll
     ======================================================================== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header__nav-link');

  function setActiveNav() {
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(function(section) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(function(link) {
          link.classList.remove('header__nav-link--active');
          if (link.getAttribute('href') === '#' + sectionId) {
            link.classList.add('header__nav-link--active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        setActiveNav();
        ticking = false;
      });
      ticking = true;
    }
  });

  /* ========================================================================
     8. Console Safety
     ======================================================================== */
  // Suppress any unexpected console errors in production
  window.onerror = function(message, source, lineno, colno, error) {
    // Log to console for debugging but prevent UI disruption
    console.warn('Caught error:', message);
    return true;
  };

})();
