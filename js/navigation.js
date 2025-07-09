// Navigation utility for handling back button functionality
class NavigationManager {
  constructor() {
    this.init();
  }

  init() {
    this.createBackButton();
    this.setupBackButtonBehavior();
  }

  createBackButton() {
    // Don't create back button on home page
    if (this.isHomePage()) {
      return;
    }

    // Find the navbar to insert the back button
    const navbar = document.querySelector('.navbar .container');
    const navControls = navbar.querySelector('.d-flex.align-items-center');
    if (!navbar || !navControls) return;

    // Create back button element
    const backButton = document.createElement('button');
    backButton.id = 'backButton';
    backButton.className = 'back-button';
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i><span class="back-text">Back</span>';
    backButton.setAttribute('aria-label', 'Go back to previous page');
    backButton.setAttribute('title', 'Go back (Alt + ←, Esc, or Backspace)');

    // Insert as the first child of the nav controls (before the nav links)
    navControls.insertBefore(backButton, navControls.firstChild);
  }

  setupBackButtonBehavior() {
    const backButton = document.getElementById('backButton');
    if (!backButton) return;

    // Click handler
    backButton.addEventListener('click', () => {
      this.goBack();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Alt + Left Arrow or Escape key
      if ((e.altKey && e.key === 'ArrowLeft') || e.key === 'Escape') {
        e.preventDefault();
        this.goBack();
      }
      // Backspace key (only if not in an input field)
      else if (e.key === 'Backspace' && !this.isInputFocused()) {
        e.preventDefault();
        this.goBack();
      }
    });

    // Update button text based on referrer
    this.updateBackButtonText();
    
    // Add entrance animation
    setTimeout(() => {
      backButton.classList.add('loaded');
    }, 100);
  }

  isInputFocused() {
    const activeElement = document.activeElement;
    return activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.tagName === 'SELECT' ||
      activeElement.contentEditable === 'true'
    );
  }

  goBack() {
    // Check if there's history to go back to
    if (window.history.length > 1 && document.referrer) {
      // Check if referrer is from the same domain
      const referrerDomain = new URL(document.referrer).hostname;
      const currentDomain = window.location.hostname;
      
      if (referrerDomain === currentDomain) {
        window.history.back();
        return;
      }
    }

    // Fallback navigation based on current page
    this.fallbackNavigation();
  }

  fallbackNavigation() {
    const currentPath = window.location.pathname;
    
    // Game pages - go to home
    if (currentPath.includes('/games/')) {
      window.location.href = '../../index.html';
    }
    // Other pages - go to home
    else {
      window.location.href = 'index.html';
    }
  }

  updateBackButtonText() {
    const backButton = document.getElementById('backButton');
    if (!backButton) return;

    let backText = 'Back';
    
    // Try to determine where to go back to
    if (document.referrer) {
      const referrerPath = new URL(document.referrer).pathname;
      const referrerFile = referrerPath.split('/').pop();
      
      if (referrerFile === 'index.html' || referrerPath.endsWith('/')) {
        backText = 'Back to Home';
      } else if (referrerFile === 'about.html') {
        backText = 'Back to About';
      } else if (referrerFile === 'themes.html') {
        backText = 'Back to Themes';
      } else if (referrerPath.includes('/games/')) {
        // Extract game name from path
        const gameName = this.getGameNameFromPath(referrerPath);
        if (gameName) {
          backText = `Back to ${gameName}`;
        }
      }
    } else {
      // No referrer, set default based on current page
      const currentPath = window.location.pathname;
      if (currentPath.includes('/games/')) {
        backText = 'Back to Home';
      }
    }

    backButton.innerHTML = `<i class="fas fa-arrow-left"></i><span class="back-text">${backText}</span>`;
  }

  getGameNameFromPath(path) {
    if (path.includes('memory-link')) return 'MemoryLink';
    if (path.includes('reaction-time')) return 'QuickFlex';
    if (path.includes('defend-line')) return 'PathGuard';
    return null;
  }

  isHomePage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    // Check if we're on the root index.html or just the root directory
    return (
      path === '/' || 
      path.endsWith('/index.html') || 
      filename === 'index.html' || 
      (filename === '' && path.split('/').length <= 2)
    ) && !path.includes('/games/');
  }
}

// Initialize navigation manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new NavigationManager();
});
