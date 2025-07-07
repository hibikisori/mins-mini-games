// js/theme.js

// Grab the toggle button and theme option elements
const toggleBtn = document.getElementById('themeToggle');
const themeOptions = document.querySelectorAll('.theme-option');
const themePreviews = document.querySelectorAll('.theme-preview');
const fontSelect = document.getElementById('fontSelect');

// Store current theme mode (day/night)
let currentMode = 'day';

/**
 * Apply a given theme: set data-theme, persist, and update toggle icon
 * @param {string} theme - theme identifier (e.g., 'dark', 'light', 'miami-day')
 * @param {HTMLElement} buttonElement - the button element that triggered the theme change
 */
function applyTheme(theme, buttonElement = null) {
  // Prevent rapid clicking and particle stacking
  if (window.themeChangeInProgress) {
    return;
  }
  window.themeChangeInProgress = true;
  setTimeout(() => {
    window.themeChangeInProgress = false;
  }, 300);
  
  // Preserve current mode when switching themes
  const [themeBase, themeMode] = theme.includes('-') ? theme.split('-') : [theme, 'day'];
  
  // If switching to a new theme, keep current mode
  if (themeBase !== getCurrentThemeBase()) {
    const newTheme = currentMode === 'night' ? `${themeBase}-night` : `${themeBase}-day`;
    theme = newTheme;
  } else {
    // If toggling same theme, update current mode
    currentMode = themeMode;
  }
  
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  // Load font preferences first, then apply font settings
  loadFontPreferences();
  applyFontSettings();
  
  // Update current theme display
  updateCurrentThemeDisplay(theme);
  
  // Update theme preview colors based on new mode
  updateThemePreviewColors();
  
  // Add button shake and color feedback
  if (buttonElement) {
    addButtonFeedback(buttonElement, theme);
  }
  
  // Trigger particle effect from button position
  createParticleEffect(theme, buttonElement);
  
  if (!toggleBtn) return;

  // Determine icon: ☀️ for day variants (light), 🌙 for night variants (dark)
  const [prefix, suffix] = theme.split('-');
  if (suffix === 'night' || theme === 'dark') {
    toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    currentMode = 'night';
  } else {
    toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    currentMode = 'day';
  }
}

/**
 * Get the current theme base (without -day/-night)
 */
function getCurrentThemeBase() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  return current.includes('-') ? current.split('-')[0] : current;
}

/**
 * Toggle between day and night for the current theme group
 */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  let next;

  if (current.includes('-')) {
    // e.g., 'miami-day' -> 'miami-night'
    const [prefix, suffix] = current.split('-');
    const other = suffix === 'day' ? 'night' : 'day';
    next = `${prefix}-${other}`;
    currentMode = other;
  } else {
    // default light <-> dark
    next = current === 'dark' ? 'light' : 'dark';
    currentMode = next === 'dark' ? 'night' : 'day';
  }
  
  // Add spin animation to toggle button
  if (toggleBtn) {
    toggleBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      toggleBtn.style.transform = 'scale(1)';
    }, 150);
  }
  
  applyTheme(next, toggleBtn);
}

/**
 * Add button feedback with theme-appropriate animations and effects
 * @param {HTMLElement} buttonElement - the button that was clicked
 * @param {string} theme - the theme being applied
 */
function addButtonFeedback(buttonElement, theme) {
  if (!buttonElement) return;
  
  // Get theme base for animation selection
  const themeBase = theme.includes('-') ? theme.split('-')[0] : theme;
  
  // Get theme colors
  const themeColors = getThemeColors(theme);
  
  // Add click color feedback
  buttonElement.classList.add('btn-clicked');
  
  // Remove click class after animation
  setTimeout(() => {
    buttonElement.classList.remove('btn-clicked');
  }, 150);
  
  // Remove btn-clicked class from all other buttons to prevent stuck effects
  if (buttonElement.classList.contains('theme-preview')) {
    document.querySelectorAll('.theme-preview').forEach(btn => {
      if (btn !== buttonElement) {
        btn.classList.remove('btn-clicked');
      }
    });
  }
  
  // Choose animation based on theme personality
  const animations = {
    // Soft, gentle themes
    pastel: 'button-shake-soft',
    lavender: 'button-shake-soft',
    mint: 'button-pulse',
    angel: 'button-pulse',
    minimalist: 'button-shake-soft',
    
    // Aggressive, intense themes
    dragon: 'button-shake-aggressive',
    demon: 'button-shake-aggressive',
    volcano: 'button-shake-aggressive',
    steel: 'button-shake-aggressive',
    
    // Magical, mystical themes
    witch: 'button-wobble',
    mystic: 'button-wobble',
    cosmic: 'button-wobble',
    galaxy: 'button-wobble',
    
    // Crystalline, shiny themes
    crystal: 'button-pulse',
    holographic: 'button-glow',
    arctic: 'button-pulse',
    
    // Energetic, vibrant themes
    neon: 'button-glow',
    neonpink: 'button-glow',
    cyberpunk: 'button-glow',
    synthwave: 'button-glow',
    
    // Playful, bouncy themes
    cherry: 'button-bounce',
    sunset: 'button-bounce',
    miami: 'button-bounce',
    rose: 'button-bounce',
    
    // Steady, calm themes
    ocean: 'button-pulse',
    forest: 'button-pulse',
    emerald: 'button-pulse',
    
    // Royal, elegant themes
    royal: 'button-pulse',
    grape: 'button-pulse',
    
    // Warm, cozy themes
    coffee: 'button-shake-soft',
    golden: 'button-bounce',
    
    // Default for others (including default, light, dark)
    default: 'button-shake-soft',
    light: 'button-shake-soft',
    dark: 'button-shake-soft'
  };
  
  const animationClass = animations[themeBase] || animations.default;
  
  // Add animation class
  buttonElement.classList.add(animationClass);
  
  // Add enhanced box shadow
  const originalBoxShadow = buttonElement.style.boxShadow;
  buttonElement.style.boxShadow = `0 0 20px ${themeColors.accent}`;
  
  setTimeout(() => {
    buttonElement.style.boxShadow = originalBoxShadow;
    buttonElement.classList.remove(animationClass);
    buttonElement.classList.remove('btn-clicked');
  }, 600);
}

/**
 * Get theme colors for feedback effects
 * @param {string} theme - the theme identifier
 * @returns {Object} object with accent and secondary colors
 */
function getThemeColors(theme) {
  const themeBase = theme.includes('-') ? theme.split('-')[0] : theme;
  
  const colors = {
    // Base themes
    dark: { accent: '#007bff', secondary: '#6c757d' },
    light: { accent: '#007bff', secondary: '#6c757d' },
    default: { accent: '#007bff', secondary: '#6c757d' },
    
    // Main themes
    miami: { accent: '#ff6b9d', secondary: '#4ecdc4' },
    cyberpunk: { accent: '#ff00ff', secondary: '#00ffff' },
    minimalist: { accent: '#333333', secondary: '#666666' },
    ocean: { accent: '#00d4ff', secondary: '#0077be' },
    forest: { accent: '#4caf50', secondary: '#2e7d32' },
    pastel: { accent: '#ffc0cb', secondary: '#ffb6c1' },
    neon: { accent: '#e91e63', secondary: '#ad1457' },
    
    // Additional themes
    sunset: { accent: '#ff9800', secondary: '#f57c00' },
    lavender: { accent: '#9575cd', secondary: '#7e57c2' },
    cherry: { accent: '#e91e63', secondary: '#c2185b' },
    emerald: { accent: '#4caf50', secondary: '#388e3c' },
    royal: { accent: '#3f51b5', secondary: '#303f9f' },
    coffee: { accent: '#8d6e63', secondary: '#5d4037' },
    arctic: { accent: '#00acc1', secondary: '#0097a7' },
    golden: { accent: '#ffc107', secondary: '#ff8f00' },
    grape: { accent: '#9c27b0', secondary: '#7b1fa2' },
    steel: { accent: '#607d8b', secondary: '#455a64' },
    volcano: { accent: '#ff5722', secondary: '#d84315' },
    mint: { accent: '#4db6ac', secondary: '#26a69a' },
    rose: { accent: '#ff5722', secondary: '#d84315' },
    
    // Special themes
    purple: { accent: '#9c27b0', secondary: '#673ab7' },
    gold: { accent: '#ffc107', secondary: '#ff8f00' },
    cosmic: { accent: '#3f51b5', secondary: '#303f9f' },
    neonpink: { accent: '#ff1744', secondary: '#d50000' },
    matrix: { accent: '#00ff41', secondary: '#008f11' },
    terminal: { accent: '#00ff41', secondary: '#008f11' },
    synthwave: { accent: '#ff00ff', secondary: '#00ffff' },
    vaporwave: { accent: '#ff00ff', secondary: '#00ffff' },
    dragon: { accent: '#ff4444', secondary: '#cc0000' },
    demon: { accent: '#ff0000', secondary: '#8b0000' },
    phoenix: { accent: '#ff6600', secondary: '#cc3300' },
    witch: { accent: '#9932cc', secondary: '#8b008b' },
    mystic: { accent: '#6a5acd', secondary: '#483d8b' },
    angel: { accent: '#fffacd', secondary: '#ffd700' },
    holographic: { accent: '#ff00ff', secondary: '#00ffff' },
    galaxy: { accent: '#4b0082', secondary: '#8a2be2' },
    retro: { accent: '#ff6b35', secondary: '#f7931e' },
    vintage: { accent: '#8b4513', secondary: '#a0522d' },
    monochrome: { accent: '#ffffff', secondary: '#cccccc' },
    sepia: { accent: '#daa520', secondary: '#cd853f' },
    autumn: { accent: '#ff8c00', secondary: '#ff6347' },
    winter: { accent: '#4682b4', secondary: '#5f9ea0' },
    spring: { accent: '#98fb98', secondary: '#90ee90' },
    summer: { accent: '#ffa500', secondary: '#ff7f50' }
  };
  
  return colors[themeBase] || colors.dark;
}

function applyFontSettings() {
  // First, ensure we have the saved font preference
  const savedFont = localStorage.getItem('selectedFont');
  const selectedFont = fontSelect?.value || savedFont || 'theme-default';
  
  if (selectedFont && selectedFont !== 'theme-default') {
    // Override with selected font
    document.documentElement.style.setProperty('--font-family', `'${selectedFont}', sans-serif`);
  } else {
    // Use theme's default font (remove override)
    document.documentElement.style.removeProperty('--font-family');
  }
  
  // Store font preference
  localStorage.setItem('selectedFont', selectedFont);
}

/**
 * Load font preferences from localStorage
 */
function loadFontPreferences() {
  const selectedFont = localStorage.getItem('selectedFont');
  
  if (fontSelect && selectedFont) {
    fontSelect.value = selectedFont;
  }
}

/**
 * Create particle effects based on theme
 * @param {string} theme - the theme identifier
 * @param {HTMLElement} buttonElement - the button element that triggered the effect
 */
function createParticleEffect(theme, buttonElement = null) {
  // Check if particles are disabled
  if (document.body.classList.contains('particles-disabled')) {
    return;
  }
  
  // Only create particles when there's a button element (user interaction)
  // This prevents particles from appearing during page navigation/load
  if (!buttonElement) {
    return;
  }
  
  // Don't create particles for navigation buttons or page links
  if (buttonElement && (
    buttonElement.classList.contains('no-particles') ||
    buttonElement.closest('.navbar') ||
    buttonElement.closest('.nav-item') ||
    buttonElement.classList.contains('nav-link') ||
    buttonElement.id === 'themeToggle' ||
    buttonElement.classList.contains('navbar-brand') ||
    buttonElement.classList.contains('navbar-toggler') ||
    buttonElement.tagName === 'A' ||
    buttonElement.href ||
    buttonElement.closest('a')
  )) {
    return;
  }
  
  const container = getOrCreateParticleContainer();
  const themeBase = theme.includes('-') ? theme.split('-')[0] : theme;
  
  // Clear ALL existing particles to prevent stacking and overlap
  container.innerHTML = '';
  
  // Also clear any pending timeouts to prevent delayed particles from previous themes
  if (window.particleTimeouts) {
    window.particleTimeouts.forEach(timeout => clearTimeout(timeout));
  }
  window.particleTimeouts = [];
  
  // Get button position for particle origin (page coordinates)
  let originX = window.innerWidth / 2 + window.scrollX; // default to center
  let originY = window.innerHeight / 2 + window.scrollY;
  
  if (buttonElement) {
    const rect = buttonElement.getBoundingClientRect();
    // Convert viewport coordinates to page coordinates
    originX = rect.left + window.scrollX + rect.width / 2;
    originY = rect.top + window.scrollY + rect.height / 2;
  }
  
  // Themes that should have particles
  const particleThemes = {
    matrix: () => createCodeRain(originX, originY),
    terminal: () => createCodeRain(originX, originY),
    dragon: () => createFireEffect('🔥', originX, originY),
    demon: () => createFireEffect('🔥', originX, originY),
    phoenix: () => createFireEffect('🔥', originX, originY),
    volcano: () => createFireEffect('🌋', originX, originY),
    forest: () => createNatureEffect(['🍃', '🌿'], originX, originY),
    ocean: () => createNatureEffect(['💧', '🌊'], originX, originY),
    mint: () => createNatureEffect(['🍃', '💚'], originX, originY),
    emerald: () => createNatureEffect(['💎', '💚'], originX, originY),
    cherry: () => createNatureEffect(['🌸', '🌺'], originX, originY),
    rose: () => createNatureEffect(['🌹', '💖'], originX, originY),
    lavender: () => createNatureEffect(['💜', '🌸'], originX, originY),
    cosmic: () => createSpaceEffect(originX, originY),
    galaxy: () => createSpaceEffect(originX, originY),
    witch: () => createMagicEffect(originX, originY),
    mystic: () => createMagicEffect(originX, originY),
    angel: () => createAngelEffect(originX, originY),
    holographic: () => createHolographicEffect(originX, originY),
    neon: () => createNeonEffect(originX, originY),
    neonpink: () => createNeonEffect(originX, originY),
    cyberpunk: () => createCyberpunkEffect(originX, originY),
    synthwave: () => createSynthwaveEffect(originX, originY),
    vaporwave: () => createVaporwaveEffect(originX, originY),
    crystal: () => createCrystalEffect(originX, originY),
    autumn: () => createNatureEffect(['🍂', '🍁'], originX, originY),
    sunset: () => createFireEffect('🌅', originX, originY)
  };
  
  const effect = particleThemes[themeBase];
  if (effect) {
    effect();
  }
  // Note: No default particles for minimal/plain themes like default, minimalist, etc.
}

function getOrCreateParticleContainer() {
  let container = document.querySelector('.particle-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'particle-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Create a particle with proper positioning and animation
 * @param {string} content - The content/emoji for the particle
 * @param {number} originX - X position relative to page
 * @param {number} originY - Y position relative to page
 * @param {string} animation - Animation class name
 * @param {number} delay - Delay before creating particle (ms)
 * @param {Object} options - Additional options
 */
function createParticle(content, originX, originY, animation = 'particle-float', delay = 0, options = {}) {
  const container = getOrCreateParticleContainer();
  
  const timeout = setTimeout(() => {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.textContent = content;
    
    // Use page coordinates instead of viewport coordinates
    particle.style.left = `${originX}px`;
    particle.style.top = `${originY}px`;
    particle.style.fontSize = `${options.size || 16}px`;
    particle.style.color = options.color || '#fff';
    particle.style.textShadow = options.glow || '0 0 10px currentColor';
    particle.style.zIndex = '9999';
    
    // Set CSS custom properties for animations
    if (options.dx !== undefined) particle.style.setProperty('--dx', options.dx + 'px');
    if (options.dy !== undefined) particle.style.setProperty('--dy', options.dy + 'px');
    if (options.distance !== undefined) particle.style.setProperty('--distance', options.distance + 'px');
    if (options.startY !== undefined) particle.style.setProperty('--start-y', options.startY + 'px');
    if (options.endY !== undefined) particle.style.setProperty('--end-y', options.endY + 'px');
    if (options.fallDistance !== undefined) particle.style.setProperty('--fall-distance', options.fallDistance + 'px');
    
    // Apply animation
    particle.style.animation = `${animation} ${options.duration || 1.5}s ease-out forwards`;
    
    container.appendChild(particle);
    
    // Clean up particle after animation
    setTimeout(() => {
      if (particle && particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, (options.duration || 1.5) * 1000 + 100);
  }, delay);
  
  // Store timeout for cleanup
  if (window.particleTimeouts) {
    window.particleTimeouts.push(timeout);
  }
}

function createCodeRain(originX, originY) {
  const codeChars = ['0', '1', '{', '}', '<', '>', '/', '*', '+', '-', '=', ';', 'A', 'B', 'C', 'D', 'E', 'F'];
  
  // Create particles from button with larger spread
  for (let i = 0; i < 10; i++) {
    const char = codeChars[Math.floor(Math.random() * codeChars.length)];
    const angle = (Math.PI * 2 * i) / 10;
    const distance = 60 + Math.random() * 50; // Increased distance for more spread
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    
    createParticle(char, originX, originY, 'firework-burst', i * 60, {
      color: '#00ff41',
      glow: '0 0 15px #00ff41',
      duration: 1.8,
      size: 14,
      dx: dx,
      dy: dy
    });
  }
  
  // Create particles from top of screen
  for (let i = 0; i < 8; i++) {
    const char = codeChars[Math.floor(Math.random() * codeChars.length)];
    const startX = Math.random() * window.innerWidth + window.scrollX;
    const dx = (Math.random() - 0.5) * 100;
    
    createParticle(char, startX, window.scrollY, 'particle-from-top', i * 150, {
      color: '#00ff41',
      glow: '0 0 15px #00ff41',
      duration: 2.5,
      size: 14,
      dx: dx,
      fallDistance: 300 + Math.random() * 200
    });
  }
}

function createFireEffect(emoji, originX, originY) {
  const fireEmojis = [emoji, '🔥', '💥', '✨'];
  
  // Create firework burst pattern with larger spread
  for (let i = 0; i < 8; i++) {
    const selectedEmoji = fireEmojis[Math.floor(Math.random() * fireEmojis.length)];
    const angle = (Math.PI * 2 * i) / 8;
    const distance = 70 + Math.random() * 50; // Increased distance
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    
    createParticle(selectedEmoji, originX, originY, 'firework-burst', i * 50, {
      color: '#ff4444',
      glow: '0 0 20px #ff4444',
      duration: 1.5,
      size: 18,
      dx: dx,
      dy: dy
    });
  }
  
  // Add some particles from top for extra effect
  for (let i = 0; i < 4; i++) {
    const selectedEmoji = fireEmojis[Math.floor(Math.random() * fireEmojis.length)];
    const startX = Math.random() * window.innerWidth + window.scrollX;
    const dx = (Math.random() - 0.5) * 80;
    
    createParticle(selectedEmoji, startX, window.scrollY, 'particle-from-top', i * 200, {
      color: '#ff4444',
      glow: '0 0 20px #ff4444',
      duration: 2.2,
      size: 16,
      dx: dx,
      fallDistance: 250 + Math.random() * 150
    });
  }
}

function createNatureEffect(emojis, originX, originY) {
  // Gentle floating pattern with larger spread
  for (let i = 0; i < 6; i++) {
    const selectedEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const angle = (Math.PI * 2 * i) / 6;
    const distance = 60 + Math.random() * 40; // Increased distance
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    
    createParticle(selectedEmoji, originX, originY, 'firework-burst', i * 120, {
      color: '#4caf50',
      glow: '0 0 15px #4caf50',
      duration: 1.8,
      size: 16,
      dx: dx,
      dy: dy
    });
  }
  
  // Add some particles from top for nature effect
  for (let i = 0; i < 3; i++) {
    const selectedEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const startX = Math.random() * window.innerWidth + window.scrollX;
    const dx = (Math.random() - 0.5) * 50;
    
    createParticle(selectedEmoji, startX, window.scrollY, 'particle-from-top', i * 250, {
      color: '#4caf50',
      glow: '0 0 15px #4caf50',
      duration: 2.5,
      size: 14,
      dx: dx,
      fallDistance: 280 + Math.random() * 170
    });
  }
}

function createSpaceEffect(originX, originY) {
  const spaceEmojis = ['⭐', '✨', '🌟', '💫', '🌌'];
  
  // Radiating star burst from button with larger spread
  for (let i = 0; i < 8; i++) {
    const selectedEmoji = spaceEmojis[Math.floor(Math.random() * spaceEmojis.length)];
    const angle = (Math.PI * 2 * i) / 8;
    const distance = 80 + Math.random() * 50; // Increased distance
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    
    createParticle(selectedEmoji, originX, originY, 'firework-burst', i * 80, {
      color: '#9932cc',
      glow: '0 0 20px #9932cc',
      duration: 1.5,
      size: 18,
      dx: dx,
      dy: dy
    });
  }
  
  // Add some particles from top for cosmic effect
  for (let i = 0; i < 5; i++) {
    const selectedEmoji = spaceEmojis[Math.floor(Math.random() * spaceEmojis.length)];
    const startX = Math.random() * window.innerWidth + window.scrollX;
    const dx = (Math.random() - 0.5) * 60;
    
    createParticle(selectedEmoji, startX, window.scrollY, 'particle-from-top', i * 180, {
      color: '#9932cc',
      glow: '0 0 20px #9932cc',
      duration: 2.8,
      size: 16,
      dx: dx,
      fallDistance: 350 + Math.random() * 200
    });
  }
}

function createMagicEffect(originX, originY) {
  const magicEmojis = ['✨', '🔮', '💜', '🌙', '⚡'];
  
  // Magical spiral pattern
  for (let i = 0; i < 10; i++) {
    const selectedEmoji = magicEmojis[Math.floor(Math.random() * magicEmojis.length)];
    const distance = 40 + i * 8;
    
    createParticle(selectedEmoji, originX, originY, 'magic-spiral', i * 80, {
      color: '#9370db',
      glow: '0 0 18px #9370db',
      duration: 1.6,
      spread: 0,
      size: 16,
      distance: distance
    });
  }
}

function createAngelEffect(originX, originY) {
  const angelEmojis = ['👼', '✨', '🤍', '💛', '🌟'];
  
  // Gentle upward floating from button
  for (let i = 0; i < 8; i++) {
    const selectedEmoji = angelEmojis[Math.floor(Math.random() * angelEmojis.length)];
    const angle = (Math.PI * 2 * i) / 8;
    const distance = 45 + Math.random() * 25;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 20; // Slight upward bias
    
    createParticle(selectedEmoji, originX, originY, 'firework-burst', i * 100, {
      color: '#ffd700',
      glow: '0 0 20px #ffd700',
      duration: 2,
      size: 18,
      dx: dx,
      dy: dy
    });
  }
  
  // Add some particles from top for heavenly effect
  for (let i = 0; i < 4; i++) {
    const selectedEmoji = angelEmojis[Math.floor(Math.random() * angelEmojis.length)];
    const startX = Math.random() * window.innerWidth;
    const dx = (Math.random() - 0.5) * 40;
    
    createParticle(selectedEmoji, startX, 0, 'particle-from-top', i * 300, {
      color: '#ffd700',
      glow: '0 0 20px #ffd700',
      duration: 3,
      size: 16,
      dx: dx,
      fallDistance: 400 + Math.random() * 200
    });
  }
}

function createHolographicEffect(originX, originY) {
  const holoEmojis = ['💎', '🌈', '✨', '💠', '🔆'];
  
  // Prismatic burst from button with larger spread
  for (let i = 0; i < 10; i++) {
    const selectedEmoji = holoEmojis[Math.floor(Math.random() * holoEmojis.length)];
    const angle = (Math.PI * 2 * i) / 10;
    const distance = 70 + Math.random() * 60; // Increased distance
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    
    createParticle(selectedEmoji, originX, originY, 'firework-burst', i * 60, {
      color: '#00ffff',
      glow: '0 0 25px #00ffff',
      duration: 1.4,
      size: 19,
      dx: dx,
      dy: dy
    });
  }
  
  // Add some particles from top for holographic effect
  for (let i = 0; i < 6; i++) {
    const selectedEmoji = holoEmojis[Math.floor(Math.random() * holoEmojis.length)];
    const startX = Math.random() * window.innerWidth + window.scrollX;
    const dx = (Math.random() - 0.5) * 70;
    
    createParticle(selectedEmoji, startX, window.scrollY, 'particle-from-top', i * 160, {
      color: '#00ffff',
      glow: '0 0 25px #00ffff',
      duration: 2.4,
      size: 17,
      dx: dx,
      fallDistance: 320 + Math.random() * 180
    });
  }
}

function createNeonEffect(originX, originY) {
  const neonEmojis = ['💖', '💜', '💙', '⚡', '✨'];
  
  // Electric burst pattern from button with larger spread
  for (let i = 0; i < 8; i++) {
    const selectedEmoji = neonEmojis[Math.floor(Math.random() * neonEmojis.length)];
    const angle = (Math.PI * 2 * i) / 8;
    const distance = 65 + Math.random() * 45; // Increased distance
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    
    createParticle(selectedEmoji, originX, originY, 'firework-burst', i * 70, {
      color: '#ff1493',
      glow: '0 0 22px #ff1493',
      duration: 1.3,
      size: 17,
      dx: dx,
      dy: dy
    });
  }
  
  // Add some particles from top for neon effect
  for (let i = 0; i < 5; i++) {
    const selectedEmoji = neonEmojis[Math.floor(Math.random() * neonEmojis.length)];
    const startX = Math.random() * window.innerWidth + window.scrollX;
    const dx = (Math.random() - 0.5) * 80;
    
    createParticle(selectedEmoji, startX, window.scrollY, 'particle-from-top', i * 190, {
      color: '#ff1493',
      glow: '0 0 22px #ff1493',
      duration: 2.1,
      size: 15,
      dx: dx,
      fallDistance: 290 + Math.random() * 160
    });
  }
}

function createCyberpunkEffect(originX, originY) {
  const cyberEmojis = ['🤖', '💻', '⚡', '🔮', '💜'];
  
  // Digital scatter burst with larger spread
  for (let i = 0; i < 10; i++) {
    const selectedEmoji = cyberEmojis[Math.floor(Math.random() * cyberEmojis.length)];
    const angle = (Math.PI * 2 * i) / 10;
    const distance = 60 + Math.random() * 50; // Increased distance
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    
    createParticle(selectedEmoji, originX, originY, 'firework-burst', i * 80, {
      color: '#ff00ff',
      glow: '0 0 20px #ff00ff',
      duration: 1.4,
      size: 16,
      dx: dx,
      dy: dy
    });
  }
  
  // Add some particles from top for cyberpunk effect
  for (let i = 0; i < 6; i++) {
    const selectedEmoji = cyberEmojis[Math.floor(Math.random() * cyberEmojis.length)];
    const startX = Math.random() * window.innerWidth + window.scrollX;
    const dx = (Math.random() - 0.5) * 90;
    
    createParticle(selectedEmoji, startX, window.scrollY, 'particle-from-top', i * 170, {
      color: '#ff00ff',
      glow: '0 0 20px #ff00ff',
      duration: 2.3,
      size: 14,
      dx: dx,
      fallDistance: 300 + Math.random() * 180
    });
  }
}

function createSynthwaveEffect(originX, originY) {
  const synthEmojis = ['🌆', '🚗', '💜', '💖', '✨'];
  
  // Retro wave burst with larger spread
  for (let i = 0; i < 8; i++) {
    const selectedEmoji = synthEmojis[Math.floor(Math.random() * synthEmojis.length)];
    const angle = (Math.PI * 2 * i) / 8;
    const distance = 65 + Math.random() * 45; // Increased distance
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    
    createParticle(selectedEmoji, originX, originY, 'firework-burst', i * 90, {
      color: '#ff0080',
      glow: '0 0 18px #ff0080',
      duration: 1.5,
      size: 17,
      dx: dx,
      dy: dy
    });
  }
  
  // Add some particles from top for synthwave effect
  for (let i = 0; i < 5; i++) {
    const selectedEmoji = synthEmojis[Math.floor(Math.random() * synthEmojis.length)];
    const startX = Math.random() * window.innerWidth + window.scrollX;
    const dx = (Math.random() - 0.5) * 75;
    
    createParticle(selectedEmoji, startX, window.scrollY, 'particle-from-top', i * 200, {
      color: '#ff0080',
      glow: '0 0 18px #ff0080',
      duration: 2.4,
      size: 15,
      dx: dx,
      fallDistance: 280 + Math.random() * 160
    });
  }
}

function createVaporwaveEffect(originX, originY) {
  const vaporEmojis = ['🌴', '💜', '💖', '🌅', '✨'];
  
  // Aesthetic floating with larger spread
  for (let i = 0; i < 8; i++) {
    const selectedEmoji = vaporEmojis[Math.floor(Math.random() * vaporEmojis.length)];
    const angle = (Math.PI * 2 * i) / 8;
    const distance = 55 + Math.random() * 40; // Increased distance
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    
    createParticle(selectedEmoji, originX, originY, 'firework-burst', i * 100, {
      color: '#ff00ff',
      glow: '0 0 16px #ff00ff',
      duration: 1.8,
      size: 16,
      dx: dx,
      dy: dy
    });
  }
  
  // Add some particles from top for vaporwave effect
  for (let i = 0; i < 4; i++) {
    const selectedEmoji = vaporEmojis[Math.floor(Math.random() * vaporEmojis.length)];
    const startX = Math.random() * window.innerWidth + window.scrollX;
    const dx = (Math.random() - 0.5) * 60;
    
    createParticle(selectedEmoji, startX, window.scrollY, 'particle-from-top', i * 250, {
      color: '#ff00ff',
      glow: '0 0 16px #ff00ff',
      duration: 2.6,
      size: 14,
      dx: dx,
      fallDistance: 320 + Math.random() * 200
    });
  }
}

function createCrystalEffect(originX, originY) {
  const crystalEmojis = ['💎', '✨', '💠', '🔷', '🔸'];
  
  // Crystal burst pattern with larger spread
  for (let i = 0; i < 12; i++) {
    const selectedEmoji = crystalEmojis[Math.floor(Math.random() * crystalEmojis.length)];
    const angle = (Math.PI * 2 * i) / 12;
    const distance = 65 + Math.random() * 50; // Increased distance
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    
    createParticle(selectedEmoji, originX, originY, 'firework-burst', i * 60, {
      color: '#00ced1',
      glow: '0 0 20px #00ced1',
      duration: 1.6,
      size: 15,
      dx: dx,
      dy: dy
    });
  }
  
  // Add some particles from top for crystal effect
  for (let i = 0; i < 6; i++) {
    const selectedEmoji = crystalEmojis[Math.floor(Math.random() * crystalEmojis.length)];
    const startX = Math.random() * window.innerWidth + window.scrollX;
    const dx = (Math.random() - 0.5) * 70;
    
    createParticle(selectedEmoji, startX, window.scrollY, 'particle-from-top', i * 180, {
      color: '#00ced1',
      glow: '0 0 20px #00ced1',
      duration: 2.5,
      size: 13,
      dx: dx,
      fallDistance: 300 + Math.random() * 180
    });
  }
}

// Initialize theme on load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  const [themeBase, themeMode] = savedTheme.includes('-') ? savedTheme.split('-') : [savedTheme, 'day'];
  currentMode = themeMode;

  loadFontPreferences();
  applyTheme(savedTheme);

  // Attach toggle handler
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleTheme);
  }

  // Attach font customization handler
  if (fontSelect) {
    fontSelect.addEventListener('change', applyFontSettings);
  }

  // Attach handlers for explicit theme options
  themeOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      applyTheme(theme, btn);
    });
  });

  // Attach handlers for theme previews
  themePreviews.forEach(btn => {
    btn.addEventListener('click', () => {
      // Prevent rapid clicking
      if (btn.dataset.clicking === 'true') {
        return;
      }
      btn.dataset.clicking = 'true';
      
      setTimeout(() => {
        btn.dataset.clicking = 'false';
      }, 500);
      
      const theme = btn.dataset.theme;
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      
      // Get theme base names
      const newThemeBase = theme.includes('-') ? theme.split('-')[0] : theme;
      const currentThemeBase = currentTheme.includes('-') ? currentTheme.split('-')[0] : currentTheme;
      
      let finalTheme = theme;
      
      // If clicking the same theme, toggle day/night
      if (newThemeBase === currentThemeBase) {
        const currentMode = currentTheme.includes('night') ? 'night' : 'day';
        const newMode = currentMode === 'day' ? 'night' : 'day';
        finalTheme = `${newThemeBase}-${newMode}`;
      }
      
      // Update selected state
      themePreviews.forEach(p => p.classList.remove('selected'));
      btn.classList.add('selected');
      
      // Clear any existing btn-clicked classes from all buttons
      themePreviews.forEach(p => p.classList.remove('btn-clicked'));
      
      // Apply theme and button feedback immediately
      applyTheme(finalTheme, btn);
      
      // Add additional highlight effect for visual feedback
      btn.classList.add('theme-highlight');
      setTimeout(() => {
        btn.classList.remove('theme-highlight');
      }, 2000);
    });
  });
  
  // Initialize particle toggle
  initializeParticleToggle();
  
  // Set initial selected theme preview
  updateSelectedThemePreview();
  
  // Update current theme display
  updateCurrentThemeDisplay(savedTheme);
  
  // Update theme preview colors
  updateThemePreviewColors();
  
  // Initialize scroll behavior for current theme display
  handleScrollBehavior();
  
  // Initialize click handler for current theme display
  initializeCurrentThemeClick();
});

/**
 * Initialize particle toggle functionality
 */
function initializeParticleToggle() {
  const particleToggle = document.getElementById('particleToggle');
  if (particleToggle) {
    // Load saved preference
    const particlesEnabled = localStorage.getItem('particlesEnabled') !== 'false';
    
    // Apply initial state
    if (particlesEnabled) {
      particleToggle.classList.add('active');
    } else {
      particleToggle.classList.remove('active');
      document.body.classList.add('particles-disabled');
    }
    
    // Add event listener for click
    particleToggle.addEventListener('click', (e) => {
      const isActive = particleToggle.classList.contains('active');
      const enabled = !isActive;
      
      // Toggle visual state
      if (enabled) {
        particleToggle.classList.add('active');
        document.body.classList.remove('particles-disabled');
      } else {
        particleToggle.classList.remove('active');
        document.body.classList.add('particles-disabled');
        // Clear existing particles
        const container = document.querySelector('.particle-container');
        if (container) {
          container.innerHTML = '';
        }
      }
      
      // Save preference
      localStorage.setItem('particlesEnabled', enabled);
    });
  }
}

/**
 * Update the current theme display indicator
 */
function updateCurrentThemeDisplay(theme) {
  const display = document.getElementById('currentThemeDisplay');
  if (display) {
    const themeBase = theme.includes('-') ? theme.split('-')[0] : theme;
    const themeMode = theme.includes('-') ? theme.split('-')[1] : 'day';
    
    // Capitalize theme name
    const themeName = themeBase.charAt(0).toUpperCase() + themeBase.slice(1);
    const modeText = themeMode === 'night' ? ' (Night)' : ' (Day)';
    
    display.textContent = `Currently using: ${themeName} Theme${modeText}`;
  }
}

/**
 * Update the selected theme preview indicator
 */
function updateSelectedThemePreview() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const themeBase = currentTheme.includes('-') ? currentTheme.split('-')[0] : currentTheme;
  
  themePreviews.forEach(preview => {
    const previewTheme = preview.dataset.theme;
    const previewBase = previewTheme.includes('-') ? previewTheme.split('-')[0] : previewTheme;
    
    if (previewBase === themeBase) {
      preview.classList.add('selected');
    } else {
      preview.classList.remove('selected');
    }
  });
}

/**
 * Handle scroll behavior for current theme display
 */
function handleScrollBehavior() {
  const currentThemeDisplay = document.getElementById('currentThemeDisplay');
  const themeHeader = document.querySelector('.theme-header');
  
  if (!currentThemeDisplay || !themeHeader) return;
  
  let isScrolled = false;
  
  function updatePosition() {
    const headerRect = themeHeader.getBoundingClientRect();
    const shouldMove = headerRect.bottom < -10; // Add small buffer for smoother transition
    
    if (shouldMove && !isScrolled) {
      currentThemeDisplay.classList.add('scrolled');
      isScrolled = true;
    } else if (!shouldMove && isScrolled) {
      currentThemeDisplay.classList.remove('scrolled');
      isScrolled = false;
    }
  }
  
  // Throttle scroll events for performance
  let ticking = false;
  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updatePosition);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', () => {
    requestTick();
    ticking = false;
  });
  
  // Initial check
  updatePosition();
}

/**
 * Update theme preview colors based on current mode (day/night)
 */
function updateThemePreviewColors() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'default-day';
  const currentMode = currentTheme.includes('night') ? 'night' : 'day';
  
  // Define theme colors for both day and night modes
  const themeColors = {
    'default': {
      day: { bg: '#f8f9fa', text: '#212529', accent: '#0070f3' },
      night: { bg: '#121212', text: '#e1e1e1', accent: '#66aaff' }
    },
    'minimalist': {
      day: { bg: '#ffffff', text: '#222222', accent: '#222222' },
      night: { bg: '#1f1f1f', text: '#cccccc', accent: '#555555' }
    },
    'noir': {
      day: { bg: '#f5f5f5', text: '#2f2f2f', accent: '#696969' },
      night: { bg: '#0f0f0f', text: '#d3d3d3', accent: '#a9a9a9' }
    },
    'slate': {
      day: { bg: '#f5f5f5', text: '#212121', accent: '#546e7a' },
      night: { bg: '#121212', text: '#e0e0e0', accent: '#78909c' }
    },
    'ocean': {
      day: { bg: '#caf0f8', text: '#023e8a', accent: '#0096c7' },
      night: { bg: '#03045e', text: '#caf0f8', accent: '#00b4d8' }
    },
    'forest': {
      day: { bg: '#e9f5f2', text: '#264653', accent: '#2a9d8f' },
      night: { bg: '#14232c', text: '#a8dadc', accent: '#2a9d8f' }
    },
    'sunset': {
      day: { bg: '#fff4e6', text: '#d2001c', accent: '#ff6b35' },
      night: { bg: '#2d1b1b', text: '#ffb380', accent: '#ff8c42' }
    },
    'arctic': {
      day: { bg: '#e0f2f1', text: '#004d40', accent: '#00acc1' },
      night: { bg: '#0d1f1c', text: '#b2dfdb', accent: '#4dd0e1' }
    },
    'autumn': {
      day: { bg: '#fdf5e6', text: '#8b4513', accent: '#ff8c00' },
      night: { bg: '#2d1810', text: '#deb887', accent: '#ff8c00' }
    },
    'volcano': {
      day: { bg: '#fbe9e7', text: '#bf360c', accent: '#ff5722' },
      night: { bg: '#1c0f0a', text: '#ffab91', accent: '#ff7043' }
    },
    'miami': {
      day: { bg: '#ffe066', text: '#333333', accent: '#ff6ec7' },
      night: { bg: '#2d1e4d', text: '#f8f0ff', accent: '#ff6ec7' }
    },
    'cherry': {
      day: { bg: '#ffebee', text: '#b71c1c', accent: '#ff1744' },
      night: { bg: '#1a0f12', text: '#ffb3ba', accent: '#dc143c' }
    },
    'mint': {
      day: { bg: '#e8f5e8', text: '#1b5e20', accent: '#00e676' },
      night: { bg: '#0a1f0a', text: '#b9f6ca', accent: '#69f0ae' }
    },
    'rose': {
      day: { bg: '#fce4ec', text: '#880e4f', accent: '#e91e63' },
      night: { bg: '#1f0a14', text: '#f8bbd9', accent: '#f06292' }
    },
    'lavender': {
      day: { bg: '#f8f4ff', text: '#4a3c85', accent: '#9c88ff' },
      night: { bg: '#1a1626', text: '#e6d9ff', accent: '#b19cd9' }
    },
    'cosmic': {
      day: { bg: '#191970', text: '#e6e6fa', accent: '#9932cc' },
      night: { bg: '#0b0b2f', text: '#f0f8ff', accent: '#da70d6' }
    },
    'emerald': {
      day: { bg: '#e8f5e8', text: '#1b5e20', accent: '#00c853' },
      night: { bg: '#0d1b0d', text: '#a5d6a7', accent: '#4caf50' }
    },
    'royal': {
      day: { bg: '#e8eaf6', text: '#1a237e', accent: '#3f51b5' },
      night: { bg: '#0f0f23', text: '#b8c5ff', accent: '#7986cb' }
    },
    'golden': {
      day: { bg: '#fff8e1', text: '#e65100', accent: '#ff9800' },
      night: { bg: '#1f1611', text: '#ffcc80', accent: '#ffb74d' }
    },
    'grape': {
      day: { bg: '#f3e5f5', text: '#4a148c', accent: '#9c27b0' },
      night: { bg: '#1a0d1a', text: '#e1bee7', accent: '#ba68c8' }
    },
    'steel': {
      day: { bg: '#eceff1', text: '#263238', accent: '#607d8b' },
      night: { bg: '#0f1419', text: '#cfd8dc', accent: '#90a4ae' }
    },
    'coffee': {
      day: { bg: '#efebe9', text: '#3e2723', accent: '#8d6e63' },
      night: { bg: '#1c1611', text: '#d7ccc8', accent: '#a1887f' }
    },
    'neon': {
      day: { bg: '#ffffff', text: '#1a1a1a', accent: '#f72585' },
      night: { bg: '#0d0d0d', text: '#f72585', accent: '#b5179e' }
    },
    'neonpink': {
      day: { bg: '#fff0f5', text: '#8b008b', accent: '#ff1493' },
      night: { bg: '#2d0a1a', text: '#ffb6c1', accent: '#ff1493' }
    },
    'cyberpunk': {
      day: { bg: '#1a0720', text: '#f0e6f6', accent: '#ff0090' },
      night: { bg: '#0a0a0a', text: '#e0fffc', accent: '#00ffea' }
    },
    'synthwave': {
      day: { bg: '#1a0033', text: '#ff66cc', accent: '#ff0080' },
      night: { bg: '#0d001a', text: '#ff99dd', accent: '#ff0080' }
    },
    'vaporwave': {
      day: { bg: '#ff1493', text: '#800080', accent: '#ff00ff' },
      night: { bg: '#4b0082', text: '#da70d6', accent: '#ff00ff' }
    },
    'matrix': {
      day: { bg: '#000000', text: '#00ff41', accent: '#00ff41' },
      night: { bg: '#000000', text: '#00ff41', accent: '#39ff14' }
    },
    'terminal': {
      day: { bg: '#1a1a1a', text: '#33ff33', accent: '#33ff33' },
      night: { bg: '#0f0f0f', text: '#33ff33', accent: '#66ff66' }
    },
    'retro': {
      day: { bg: '#fff8dc', text: '#8b4513', accent: '#ff6b35' },
      night: { bg: '#2d1810', text: '#deb887', accent: '#ff8c42' }
    },
    'shadow': {
      day: { bg: '#e0e0e0', text: '#333333', accent: '#616161' },
      night: { bg: '#121212', text: '#e0e0e0', accent: '#757575' }
    },
    'witch': {
      day: { bg: '#e1bee7', text: '#4a148c', accent: '#9c27b0' },
      night: { bg: '#1a0d1a', text: '#e1bee7', accent: '#ba68c8' }
    },
    'demon': {
      day: { bg: '#ffcdd2', text: '#b71c1c', accent: '#f44336' },
      night: { bg: '#1c0a0a', text: '#ffcdd2', accent: '#ff5252' }
    },
    'dragon': {
      day: { bg: '#8b4513', text: '#ffb347', accent: '#dc143c' },
      night: { bg: '#2f1b14', text: '#ffb347', accent: '#dc143c' }
    },
    'phoenix': {
      day: { bg: '#ffd700', text: '#b22222', accent: '#ff4500' },
      night: { bg: '#ffefd5', text: '#b22222', accent: '#ff4500' }
    },
    'galaxy': {
      day: { bg: '#4b0082', text: '#e6e6fa', accent: '#8a2be2' },
      night: { bg: '#191970', text: '#e6e6fa', accent: '#8a2be2' }
    },
    'mystic': {
      day: { bg: '#dda0dd', text: '#483d8b', accent: '#9370db' },
      night: { bg: '#e6e6fa', text: '#483d8b', accent: '#9370db' }
    },
    'angel': {
      day: { bg: '#fff8dc', text: '#daa520', accent: '#ffd700' },
      night: { bg: '#fffacd', text: '#daa520', accent: '#ffd700' }
    },
    'crystal': {
      day: { bg: '#e0ffff', text: '#008b8b', accent: '#00ced1' },
      night: { bg: '#f0ffff', text: '#008b8b', accent: '#00ced1' }
    },
    'pastel': {
      day: { bg: '#fff1e6', text: '#6b705c', accent: '#ffd6a5' },
      night: { bg: '#2e1a1a', text: '#ffe8d6', accent: '#ff9e9d' }
    },
    'holographic': {
      day: { bg: '#ffffff', text: '#333333', accent: '#ff00ff' },
      night: { bg: '#1a1a1a', text: '#ffffff', accent: '#00ffff' }
    }
  };

  // Update each theme preview button
  themePreviews.forEach(preview => {
    const themeAttr = preview.getAttribute('data-theme');
    if (themeAttr) {
      const themeBase = themeAttr.includes('-') ? themeAttr.split('-')[0] : themeAttr;
      const colors = themeColors[themeBase];
      
      if (colors) {
        const modeColors = colors[currentMode];
        const dayColors = colors['day']; // Always use day mode colors for text
        
        preview.style.backgroundColor = modeColors.bg;
        preview.style.color = dayColors.text; // Always use day mode text color
        preview.style.borderColor = modeColors.accent + '20'; // Add slight opacity
      } else {
        // Fallback for themes not yet defined - use neutral colors that work in both modes
        console.warn(`Theme "${themeBase}" not found in updateThemePreviewColors. Using fallback colors.`);
        const fallbackBg = currentMode === 'night' 
          ? { bg: '#2a2a2a', accent: '#666666' }
          : { bg: '#f5f5f5', accent: '#999999' };
        
        preview.style.backgroundColor = fallbackBg.bg;
        preview.style.color = '#333333'; // Always use dark text for consistency
        preview.style.borderColor = fallbackBg.accent + '20';
      }
    }
  });
}

/**
 * Handle click on current theme display to scroll to and highlight the active theme
 */
function handleCurrentThemeClick() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'default-day';
  const themeBase = currentTheme.includes('-') ? currentTheme.split('-')[0] : currentTheme;
  
  // Find the theme preview button for the current theme
  const currentThemePreview = document.querySelector(`.theme-preview[data-theme="${themeBase}-day"]`);
  
  if (currentThemePreview) {
    // Scroll to the theme preview with smooth animation
    currentThemePreview.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
    
    // Add a temporary highlight effect
    currentThemePreview.classList.add('theme-highlight');
    
    // Trigger the theme's specific animation
    setTimeout(() => {
      addButtonFeedback(currentThemePreview, currentTheme);
    }, 800); // Wait for scroll to complete
    
    // Remove highlight after animation
    setTimeout(() => {
      currentThemePreview.classList.remove('theme-highlight');
    }, 2000);
  }
}

/**
 * Initialize click handler for current theme display
 */
function initializeCurrentThemeClick() {
  const currentThemeDisplay = document.getElementById('currentThemeDisplay');
  if (currentThemeDisplay) {
    currentThemeDisplay.addEventListener('click', handleCurrentThemeClick);
  }
}
