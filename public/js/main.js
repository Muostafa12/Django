/**
 * Wedding Invitation - مصطفى و ملك
 * Enhanced JavaScript with Animations
 */

const CONFIG = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initLoadingScreen();
});

// Loading Screen
function initLoadingScreen() {
  const loadingScreen = document.getElementById('loadingScreen');

  // Hide loading screen after animation completes
  setTimeout(() => {
    loadingScreen.classList.add('hidden');

    // Initialize everything after loading screen hides
    initCountdown();
    initFloatingHearts();
    initRSVPForm();
    initScrollReveal();
    initActiveNavigation();
    initSmoothScroll();
    initActionButtons();

    // Trigger confetti celebration
    setTimeout(() => {
      createConfetti();
    }, 300);
  }, 1800);
}

// Confetti Animation
function createConfetti() {
  const container = document.getElementById('confettiContainer');
  if (!container) return;

  const confettiItems = ['✨', '💫', '⭐', '🌟', '💕', '💖', '🎊', '🎉'];

  // Reduce confetti on mobile for performance
  const isMobile = window.innerWidth <= 768;
  const confettiCount = isMobile ? 20 : 40;

  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      const confetti = document.createElement('span');
      confetti.className = 'confetti' + (Math.random() > 0.5 ? ' sparkle' : '');
      confetti.textContent = confettiItems[Math.floor(Math.random() * confettiItems.length)];
      // Use percentage instead of vw to avoid overflow
      confetti.style.left = (Math.random() * 95 + 2.5) + '%';
      confetti.style.fontSize = (isMobile ? (Math.random() * 12 + 12) : (Math.random() * 20 + 15)) + 'px';
      confetti.style.animationDuration = (Math.random() * 2 + 3) + 's';
      confetti.style.animationDelay = (Math.random() * 0.3) + 's';

      container.appendChild(confetti);

      // Remove after animation
      setTimeout(() => confetti.remove(), 5000);
    }, i * 60);
  }
}

// Countdown Timer - reads date from HTML data attribute
function initCountdown() {
  const section = document.getElementById('countdown');

  // Read date from HTML data attribute
  const dateStr = section.dataset.date;
  const dateText = section.dataset.dateText;
  const timeText = section.dataset.timeText;

  // Update display text
  if (dateText) document.getElementById('dateText').textContent = dateText;
  if (timeText) document.getElementById('timeText').textContent = timeText;

  // Parse the date
  CONFIG.weddingDate = new Date(dateStr);

  // Store previous values for pulse animation
  CONFIG.prevSeconds = null;

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  const now = new Date().getTime();
  const diff = CONFIG.weddingDate.getTime() - now;

  if (diff > 0) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Update values with pulse animation
    updateCountdownValue('days', days);
    updateCountdownValue('hours', hours);
    updateCountdownValue('minutes', minutes);
    updateCountdownValue('seconds', seconds, true);
  } else {
    document.getElementById('days').textContent = '🎉';
    document.getElementById('hours').textContent = '🎊';
    document.getElementById('minutes').textContent = '💒';
    document.getElementById('seconds').textContent = '💍';
    document.querySelectorAll('.countdown-label').forEach(l => l.style.display = 'none');
  }
}

function updateCountdownValue(id, value, alwaysPulse = false) {
  const element = document.getElementById(id);
  const arabicValue = toArabic(value);
  const currentValue = element.textContent;

  if (currentValue !== arabicValue || alwaysPulse) {
    element.textContent = arabicValue;
    // Add pulse animation
    element.classList.remove('pulse');
    void element.offsetWidth; // Trigger reflow
    element.classList.add('pulse');
  }
}

function toArabic(num) {
  const arabic = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return num.toString().padStart(2, '0').split('').map(d => arabic[parseInt(d)] || d).join('');
}

// Floating Hearts
function initFloatingHearts() {
  const container = document.getElementById('heartsContainer');
  const hearts = ['❤', '💕', '💖', '🤍', '💗'];

  function createHeart() {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 8 + 8) + 's';
    heart.style.fontSize = (Math.random() * 12 + 14) + 'px';
    heart.style.opacity = (Math.random() * 0.3 + 0.3).toString();
    container.appendChild(heart);
    setTimeout(() => heart.remove(), 16000);
  }

  // Initial hearts with staggered timing
  for (let i = 0; i < 6; i++) setTimeout(createHeart, i * 500);

  // Continue creating hearts
  setInterval(createHeart, 2500);
}

// Scroll Reveal Animation - Mobile Optimized
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  const isMobile = window.innerWidth <= 768;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Use requestAnimationFrame for smoother animations
          requestAnimationFrame(() => {
            entry.target.classList.add('visible');
          });
          // Unobserve after revealing to improve performance
          observer.unobserve(entry.target);
        }
      });
    }, {
      // Lower threshold on mobile for earlier reveal
      threshold: isMobile ? 0.08 : 0.15,
      rootMargin: isMobile ? '0px 0px -30px 0px' : '0px 0px -50px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('visible'));
  }
}

// Active Navigation Highlighting
function initActiveNavigation() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.simple-nav a');

  function highlightNav() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    let activeHref = null;

    // Special case for hero section at top
    if (scrollY < windowHeight / 2) {
      activeHref = '#home';
    } else {
      // Find the current section
      sections.forEach(section => {
        const sectionTop = section.offsetTop - windowHeight / 3;
        const sectionBottom = sectionTop + section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionBottom) {
          // Only set activeHref if there's a matching nav link
          const matchingLink = document.querySelector(`.simple-nav a[href="#${sectionId}"]`);
          if (matchingLink) {
            activeHref = `#${sectionId}`;
          }
        }
      });
    }

    // Always clear all active states first, then set the correct one
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (activeHref && link.getAttribute('href') === activeHref) {
        link.classList.add('active');
      }
    });
  }

  // Throttled scroll handler
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        highlightNav();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial highlight
  highlightNav();
}

// Smooth Scroll with mobile optimization
function initSmoothScroll() {
  const isMobile = window.innerWidth <= 768;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const target = document.querySelector(targetId);

      if (target) {
        // Get target position accounting for mobile nav
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = targetPosition - (isMobile ? 20 : 40);

        // Use smooth scroll with fallback
        if ('scrollBehavior' in document.documentElement.style) {
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        } else {
          // Fallback for older browsers
          window.scrollTo(0, offsetPosition);
        }

        // Update URL hash without jumping
        history.pushState(null, null, targetId);
      }
    });
  });
}

// RSVP Form
function initRSVPForm() {
  const form = document.getElementById('rsvpForm');
  const guestsGroup = document.getElementById('guestsCountGroup');
  const messageDiv = document.getElementById('rsvpMessage');

  // Show guests count only when attending
  document.querySelectorAll('input[name="attending"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'yes') {
        guestsGroup.classList.add('show');
      } else {
        guestsGroup.classList.remove('show');
      }
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.btn-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const data = {
      name: formData.get('name'),
      attending: formData.get('attending'),
      numberOfGuests: parseInt(formData.get('numberOfGuests')) || 1,
      message: formData.get('message')
    };

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        showMessage(messageDiv, result.message, 'success');
        form.reset();
        guestsGroup.classList.remove('show');
        celebrate();
      } else {
        showMessage(messageDiv, result.message, 'error');
      }
    } catch (error) {
      showMessage(messageDiv, 'حدث خطأ، يرجى المحاولة مرة أخرى', 'error');
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  });
}

function showMessage(el, msg, type) {
  el.textContent = msg;
  el.className = 'form-message ' + type;
  setTimeout(() => el.className = 'form-message', 6000);
}

function celebrate() {
  const container = document.getElementById('heartsContainer');
  const items = ['🎉', '🎊', '💝', '✨', '💕', '🥳', '💖'];

  for (let i = 0; i < 25; i++) {
    setTimeout(() => {
      const el = document.createElement('span');
      el.className = 'floating-heart';
      el.textContent = items[Math.floor(Math.random() * items.length)];
      el.style.left = Math.random() * 100 + 'vw';
      el.style.animationDuration = (Math.random() * 4 + 3) + 's';
      el.style.fontSize = (Math.random() * 18 + 20) + 'px';
      container.appendChild(el);
      setTimeout(() => el.remove(), 8000);
    }, i * 60);
  }
}

// Action Buttons (Add to Calendar & WhatsApp Share)
function initActionButtons() {
  const calendarBtn = document.getElementById('addToCalendar');
  const whatsappBtn = document.getElementById('shareWhatsApp');
  const section = document.getElementById('countdown');

  if (!section) return;

  const dateStr = section.dataset.date;
  const weddingDate = new Date(dateStr);

  // Add to Calendar
  if (calendarBtn) {
    calendarBtn.addEventListener('click', () => {
      const title = 'حفل زفاف مصطفى و ملك';
      const location = 'دار مناسبات النخيل، القاهرة الجديدة';
      const description = 'ندعوكم لحضور حفل زفافنا. نتطلع لرؤيتكم!';

      // Create end date (4 hours after start)
      const endDate = new Date(weddingDate.getTime() + 4 * 60 * 60 * 1000);

      // Format dates for Google Calendar
      const formatDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '').slice(0, 15) + 'Z';
      };

      const startFormatted = formatDate(weddingDate);
      const endFormatted = formatDate(endDate);

      // Google Calendar URL
      const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}&sf=true&output=xml`;

      window.open(googleCalendarUrl, '_blank');
    });
  }

  // WhatsApp Share
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      const dateText = section.dataset.dateText || 'الجمعة، ١ مايو ٢٠٢٦';
      const timeText = section.dataset.timeText || 'الساعة السابعة مساءً';

      const message = `💒 دعوة لحفل زفاف

بسم الله الرحمن الرحيم

يسعدنا دعوتكم لحضور حفل زفاف

✨ مصطفى محمود و ملك محمد ✨

📅 ${dateText}
🕖 ${timeText}
📍 دار مناسبات النخيل - القاهرة الجديدة

نتشرف بحضوركم 💕`;

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    });
  }
}
