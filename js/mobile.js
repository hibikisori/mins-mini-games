// Mobile Navigation Auto-Hide
let lastScrollY = window.scrollY;
let navbar = document.getElementById('mainNavbar');

function handleScroll() {
  const currentScrollY = window.scrollY;
  
  if (window.innerWidth <= 768) { // Only on mobile
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down & past 100px
      navbar.classList.add('navbar-hidden');
    } else {
      // Scrolling up or at top
      navbar.classList.remove('navbar-hidden');
    }
  } else {
    // Desktop - always show navbar
    navbar.classList.remove('navbar-hidden');
  }
  
  lastScrollY = currentScrollY;
}

// Throttle scroll events
let ticking = false;
function requestTick() {
  if (!ticking) {
    requestAnimationFrame(handleScroll);
    ticking = true;
  }
}

window.addEventListener('scroll', () => {
  requestTick();
  ticking = false;
});

// Handle window resize
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    navbar.classList.remove('navbar-hidden');
  }
});

// Touch improvements for mobile
if ('ontouchstart' in window) {
  // Add touch feedback for buttons
  document.addEventListener('touchstart', (e) => {
    if (e.target.matches('.btn, .tower-option, .theme-preview')) {
      e.target.style.transform = 'scale(0.95)';
    }
  });
  
  document.addEventListener('touchend', (e) => {
    if (e.target.matches('.btn, .tower-option, .theme-preview')) {
      setTimeout(() => {
        e.target.style.transform = '';
      }, 150);
    }
  });
}
