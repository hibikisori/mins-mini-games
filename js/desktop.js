// Desktop OS Functionality with Sound Effects
class DesktopOS {
  constructor() {
    this.windows = new Map();
    this.windowZIndex = 100;
    this.activeWindow = null;
    this.isStartMenuOpen = false;
    this.sounds = {
      startup: this.createBeep(800, 200),
      click: this.createBeep(1000, 50),
      windowOpen: this.createBeep(600, 100),
      windowClose: this.createBeep(400, 150),
      error: this.createBeep(200, 300)
    };
    
    this.init();
  }
  
  // Create retro computer beep sounds
  createBeep(frequency, duration) {
    return () => {
      if (!window.AudioContext && !window.webkitAudioContext) return;
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    };
  }
  
  playSound(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName]();
    }
  }
  
  init() {
    this.setupEventListeners();
    this.updateClock();
    this.showLoadingScreen();
    
    // Update clock every second
    setInterval(() => this.updateClock(), 1000);
    
    // Play startup sound after loading
    setTimeout(() => {
      this.playSound('startup');
    }, 3200);
  }
  
  setupEventListeners() {
    // Desktop icon double clicks
    document.querySelectorAll('.desktop-icon').forEach(icon => {
      icon.addEventListener('dblclick', (e) => {
        e.preventDefault();
        this.playSound('click');
        const app = icon.dataset.app;
        if (app) {
          this.openApp(app);
        }
      });
      
      icon.addEventListener('click', (e) => {
        e.preventDefault();
        this.playSound('click');
        this.selectIcon(icon);
      });
    });
    
    // Start menu items
    document.querySelectorAll('.start-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.playSound('click');
        const app = item.dataset.app;
        const action = item.dataset.action;
        
        if (app) {
          this.openApp(app);
        } else if (action === 'shutdown') {
          this.shutdown();
        }
        
        this.hideStartMenu();
      });
    });
    
    // Start button
    document.querySelector('.start-button').addEventListener('click', (e) => {
      e.preventDefault();
      this.playSound('click');
      this.toggleStartMenu();
    });
    
    // Click outside to close start menu
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.start-menu') && !e.target.closest('.start-button')) {
        this.hideStartMenu();
      }
    });
    
    // Desktop click to deselect icons
    document.querySelector('.desktop').addEventListener('click', (e) => {
      if (e.target.classList.contains('desktop')) {
        this.deselectAllIcons();
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Exit fullscreen if any window is in fullscreen mode
        const fullscreenWindow = document.querySelector('.window-fullscreen');
        if (fullscreenWindow) {
          const windowId = fullscreenWindow.dataset.windowId;
          this.fullscreenWindow(windowId);
        }
        
        // Close start menu if open
        if (this.isStartMenuOpen) {
          this.hideStartMenu();
        }
      }
    });
  }
  
  showLoadingScreen() {
    const loadingHTML = `
      <div class="loading-screen" id="loading-screen">
        <div class="loading-title">Min OS</div>
        <div class="loading-subtitle">Starting up...</div>
        <div class="loading-bar">
          <div class="loading-progress"></div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', loadingHTML);
    
    setTimeout(() => {
      document.getElementById('loading-screen').classList.add('hidden');
    }, 3000);
  }
  
  selectIcon(icon) {
    this.deselectAllIcons();
    icon.classList.add('selected');
  }
  
  deselectAllIcons() {
    document.querySelectorAll('.desktop-icon').forEach(icon => {
      icon.classList.remove('selected');
    });
  }
  
  toggleStartMenu() {
    const startMenu = document.getElementById('start-menu');
    const startButton = document.querySelector('.start-button');
    
    if (this.isStartMenuOpen) {
      this.hideStartMenu();
    } else {
      this.showStartMenu();
    }
  }
  
  showStartMenu() {
    const startMenu = document.getElementById('start-menu');
    const startButton = document.querySelector('.start-button');
    
    startMenu.classList.add('show');
    startButton.classList.add('active');
    this.isStartMenuOpen = true;
  }
  
  hideStartMenu() {
    const startMenu = document.getElementById('start-menu');
    const startButton = document.querySelector('.start-button');
    
    startMenu.classList.remove('show');
    startButton.classList.remove('active');
    this.isStartMenuOpen = false;
  }
  
  openApp(appName) {
    if (this.windows.has(appName)) {
      // Bring existing window to front
      this.focusWindow(appName);
      return;
    }
    
    let windowConfig;
    
    switch (appName) {
      case 'games':
        windowConfig = {
          title: 'Games Folder',
          icon: 'games-icon',
          content: this.createGamesContent(),
          width: 600,
          height: 500
        };
        break;
        
      case 'browser':
        windowConfig = {
          title: 'Web Browser - Min\'s Portfolio',
          icon: 'browser-icon',
          content: this.createBrowserContent(),
          width: 800,
          height: 600
        };
        break;
        
      case 'about':
        windowConfig = {
          title: 'About.pdf - Document Viewer',
          icon: 'document-icon',
          content: this.createAboutContent(),
          width: 500,
          height: 600
        };
        break;
        
      case 'art':
        windowConfig = {
          title: 'Art Gallery',
          icon: 'folder-icon art-folder',
          content: this.createArtContent(),
          width: 700,
          height: 500
        };
        break;
        
      case 'music':
        windowConfig = {
          title: 'Music Studio',
          icon: 'folder-icon music-folder',
          content: this.createMusicContent(),
          width: 600,
          height: 450
        };
        break;        default:
        return;
    }
    
    this.createWindow(appName, windowConfig);
    this.playSound('windowOpen');
  }
  
  createWindow(id, config) {
    const windowElement = document.createElement('div');
    windowElement.className = 'window active';
    windowElement.dataset.windowId = id;
    
    // Calculate position (cascade new windows)
    const windowCount = this.windows.size;
    const left = 50 + (windowCount * 30);
    const top = 50 + (windowCount * 30);
    
    windowElement.style.left = left + 'px';
    windowElement.style.top = top + 'px';
    windowElement.style.width = config.width + 'px';
    windowElement.style.height = config.height + 'px';
    windowElement.style.zIndex = ++this.windowZIndex;
    
    windowElement.innerHTML = `
      <div class="window-header">
        <div class="window-title">
          <div class="window-title-icon ${config.icon}"></div>
          ${config.title}
        </div>
        <div class="window-controls">
          <div class="window-control minimize">_</div>
          <div class="window-control maximize">□</div>
          <div class="window-control fullscreen">⛶</div>
          <div class="window-control close">×</div>
        </div>
      </div>
      <div class="window-content">
        <div class="window-loading">
          <div class="loading-bar">
            <div class="loading-progress"></div>
          </div>
          <div class="loading-text">Loading...</div>
        </div>
        <div class="window-main-content" style="display: none;">
          ${config.content}
        </div>
      </div>
      <div class="window-resize-handle n"></div>
      <div class="window-resize-handle s"></div>
      <div class="window-resize-handle e"></div>
      <div class="window-resize-handle w"></div>
      <div class="window-resize-handle ne"></div>
      <div class="window-resize-handle nw"></div>
      <div class="window-resize-handle se"></div>
      <div class="window-resize-handle sw"></div>
    `;
    
    document.getElementById('windows-container').appendChild(windowElement);
    
    // Add opening animation
    windowElement.classList.add('window-opening');
    
    // Show loading animation for a brief moment
    setTimeout(() => {
      const loadingDiv = windowElement.querySelector('.window-loading');
      const mainContent = windowElement.querySelector('.window-main-content');
      const progressBar = windowElement.querySelector('.loading-progress');
      
      // Animate progress bar
      progressBar.style.width = '100%';
      
      setTimeout(() => {
        loadingDiv.style.display = 'none';
        mainContent.style.display = 'block';
        windowElement.classList.remove('window-opening');
        windowElement.classList.add('window-loaded');
      }, 800);
    }, 200);
    
    // Setup window controls
    this.setupWindowControls(windowElement, id);
    
    // Make window draggable
    this.makeWindowDraggable(windowElement);
    
    // Make window resizable
    this.makeWindowResizable(windowElement);
    
    // Store window reference
    this.windows.set(id, windowElement);
    
    // Add to taskbar
    this.addToTaskbar(id, config.title, config.icon);
    
    // Focus this window
    this.focusWindow(id);
  }
  
  setupWindowControls(windowElement, id) {
    const controls = windowElement.querySelector('.window-controls');
    
    controls.querySelector('.close').addEventListener('click', () => {
      this.closeWindow(id);
    });
    
    controls.querySelector('.minimize').addEventListener('click', () => {
      this.minimizeWindow(id);
    });
    
    controls.querySelector('.maximize').addEventListener('click', () => {
      this.maximizeWindow(id);
    });
    
    controls.querySelector('.fullscreen').addEventListener('click', () => {
      this.fullscreenWindow(id);
    });
    
    // Window click to focus
    windowElement.addEventListener('click', () => {
      this.focusWindow(id);
    });
  }
  
  makeWindowDraggable(windowElement) {
    const header = windowElement.querySelector('.window-header');
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(windowElement.style.left);
      startTop = parseInt(windowElement.style.top);
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
    
    function onMouseMove(e) {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      windowElement.style.left = (startLeft + deltaX) + 'px';
      windowElement.style.top = (startTop + deltaY) + 'px';
    }
    
    function onMouseUp() {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
  }
  
  makeWindowResizable(windowElement) {
    const resizeHandles = windowElement.querySelectorAll('.window-resize-handle');
    
    resizeHandles.forEach(handle => {
      handle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = parseInt(windowElement.style.width);
        const startHeight = parseInt(windowElement.style.height);
        const startLeft = parseInt(windowElement.style.left);
        const startTop = parseInt(windowElement.style.top);
        
        const handleClass = handle.className.split(' ')[1]; // Get direction (n, s, e, w, ne, etc.)
        
        const resize = (e) => {
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;
          
          let newWidth = startWidth;
          let newHeight = startHeight;
          let newLeft = startLeft;
          let newTop = startTop;
          
          // Handle horizontal resizing
          if (handleClass.includes('e')) {
            newWidth = Math.max(200, startWidth + deltaX);
          } else if (handleClass.includes('w')) {
            newWidth = Math.max(200, startWidth - deltaX);
            newLeft = startLeft + deltaX;
            if (newWidth <= 200) {
              newLeft = startLeft + startWidth - 200;
            }
          }
          
          // Handle vertical resizing
          if (handleClass.includes('s')) {
            newHeight = Math.max(150, startHeight + deltaY);
          } else if (handleClass.includes('n')) {
            newHeight = Math.max(150, startHeight - deltaY);
            newTop = startTop + deltaY;
            if (newHeight <= 150) {
              newTop = startTop + startHeight - 150;
            }
          }
          
          // Apply the new dimensions
          windowElement.style.width = newWidth + 'px';
          windowElement.style.height = newHeight + 'px';
          windowElement.style.left = newLeft + 'px';
          windowElement.style.top = newTop + 'px';
        };
        
        const stopResize = () => {
          document.removeEventListener('mousemove', resize);
          document.removeEventListener('mouseup', stopResize);
          document.body.style.cursor = '';
          document.body.style.userSelect = '';
        };
        
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
        document.body.style.cursor = handle.style.cursor;
        document.body.style.userSelect = 'none';
      });
    });
  }
  
  focusWindow(id) {
    // Remove active class from all windows
    document.querySelectorAll('.window').forEach(win => {
      win.classList.remove('active');
    });
    
    // Remove active class from all taskbar buttons
    document.querySelectorAll('.taskbar-window').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const window = this.windows.get(id);
    if (window) {
      window.classList.add('active');
      window.style.zIndex = ++this.windowZIndex;
      this.activeWindow = id;
      
      // Activate taskbar button
      const taskbarButton = document.querySelector(`[data-window-id="${id}"]`);
      if (taskbarButton) {
        taskbarButton.classList.add('active');
      }
    }
  }
  
  closeWindow(id) {
    const window = this.windows.get(id);
    if (window) {
      this.playSound('windowClose');
      window.remove();
      this.windows.delete(id);
      this.removeFromTaskbar(id);
      
      if (this.activeWindow === id) {
        this.activeWindow = null;
      }
    }
  }
  
  minimizeWindow(id) {
    const window = this.windows.get(id);
    if (window) {
      window.style.display = 'none';
      window.classList.remove('active');
      
      // Remove active state from taskbar
      const taskbarButton = document.querySelector(`[data-window-id="${id}"]`);
      if (taskbarButton) {
        taskbarButton.classList.remove('active');
      }
      
      if (this.activeWindow === id) {
        this.activeWindow = null;
      }
    }
  }
  
  maximizeWindow(id) {
    const window = this.windows.get(id);
    if (window) {
      if (window.dataset.maximized === 'true') {
        // Restore
        window.style.left = window.dataset.restoreLeft;
        window.style.top = window.dataset.restoreTop;
        window.style.width = window.dataset.restoreWidth;
        window.style.height = window.dataset.restoreHeight;
        window.dataset.maximized = 'false';
        window.classList.remove('window-maximized');
      } else {
        // Maximize
        window.dataset.restoreLeft = window.style.left;
        window.dataset.restoreTop = window.style.top;
        window.dataset.restoreWidth = window.style.width;
        window.dataset.restoreHeight = window.style.height;
        
        window.style.left = '0px';
        window.style.top = '0px';
        window.style.width = '100vw';
        window.style.height = 'calc(100vh - 32px)';
        window.dataset.maximized = 'true';
        window.classList.add('window-maximized');
      }
    }
  }
  
  fullscreenWindow(id) {
    const window = this.windows.get(id);
    if (window) {
      if (window.dataset.fullscreen === 'true') {
        // Exit fullscreen
        window.style.left = window.dataset.restoreLeft;
        window.style.top = window.dataset.restoreTop;
        window.style.width = window.dataset.restoreWidth;
        window.style.height = window.dataset.restoreHeight;
        window.dataset.fullscreen = 'false';
        window.classList.remove('window-fullscreen');
        
        // Ensure taskbar is always restored
        const taskbar = document.querySelector('.taskbar');
        if (taskbar) {
          taskbar.style.display = 'flex';
          taskbar.style.visibility = 'visible';
        }
      } else {
        // Enter fullscreen
        window.dataset.restoreLeft = window.style.left;
        window.dataset.restoreTop = window.style.top;
        window.dataset.restoreWidth = window.style.width;
        window.dataset.restoreHeight = window.style.height;
        
        window.style.left = '0px';
        window.style.top = '0px';
        window.style.width = '100vw';
        window.style.height = '100vh';
        window.dataset.fullscreen = 'true';
        window.classList.add('window-fullscreen');
        
        // Hide taskbar in fullscreen
        const taskbar = document.querySelector('.taskbar');
        if (taskbar) {
          taskbar.style.display = 'none';
        }
      }
      
      // Play sound effect
      this.playSound('click');
    }
  }
  
  addToTaskbar(id, title, icon) {
    const taskbarWindows = document.getElementById('taskbar-windows');
    const button = document.createElement('div');
    button.className = 'taskbar-window';
    button.dataset.windowId = id;
    button.innerHTML = `
      <div class="window-title-icon ${icon}"></div>
      ${title}
    `;
    
    button.addEventListener('click', () => {
      const window = this.windows.get(id);
      if (window.style.display === 'none') {
        window.style.display = 'block';
        window.classList.add('active');
        this.focusWindow(id);
      } else if (this.activeWindow === id) {
        this.minimizeWindow(id);
      } else {
        this.focusWindow(id);
      }
    });
    
    taskbarWindows.appendChild(button);
  }
  
  removeFromTaskbar(id) {
    const button = document.querySelector(`[data-window-id="${id}"]`);
    if (button) {
      button.remove();
    }
  }
  
  updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    document.getElementById('clock').textContent = timeString;
  }
  
  shutdown() {
    // Close all windows
    this.windows.forEach((window, id) => {
      this.closeWindow(id);
    });
    
    // Show shutdown screen
    const shutdownHTML = `
      <div class="loading-screen" id="shutdown-screen">
        <div class="loading-title">Min OS</div>
        <div class="loading-subtitle">Shutting down...</div>
        <div style="margin-top: 20px; font-size: 8px;">
          Thank you for visiting!<br>
          Redirecting to original portfolio...
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', shutdownHTML);
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 3000);
  }
  
  // Content creation methods
  createGamesContent() {
    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 15px; padding: 10px;">
        <div class="game-item" onclick="desktopOS.openGameWindow('QuickFlex', 'games/reaction-time/index.html')">
          <div class="icon-image games-icon" style="margin: 0 auto 8px;"></div>
          <div style="text-align: center; font-size: 8px;">QuickFlex</div>
        </div>
        <div class="game-item" onclick="desktopOS.openGameWindow('MemoryLink', 'games/memory-link/index.html')">
          <div class="icon-image games-icon" style="margin: 0 auto 8px; filter: hue-rotate(120deg);"></div>
          <div style="text-align: center; font-size: 8px;">MemoryLink</div>
        </div>
        <div class="game-item" onclick="desktopOS.openGameWindow('DefendLine', 'games/defend-line/index.html')">
          <div class="icon-image games-icon" style="margin: 0 auto 8px; filter: hue-rotate(240deg);"></div>
          <div style="text-align: center; font-size: 8px;">DefendLine</div>
        </div>
        <div class="game-item">
          <div class="icon-image games-icon" style="margin: 0 auto 8px; filter: grayscale(100%);"></div>
          <div style="text-align: center, font-size: 8px;">More Games<br>Coming Soon</div>
        </div>
      </div>
      <style>
        .game-item {
          cursor: pointer;
          padding: 10px;
          border: 1px solid #ccc;
          background: #f0f0f0;
          text-align: center;
        }
        .game-item:hover {
          background: #e0e0e0;
          border: 1px solid #000080;
        }
      </style>
    `;
  }
  
  createBrowserContent() {
    return `
      <div style="display: flex; flex-direction: column; height: 100%;">
        <!-- Browser Navigation Bar -->
        <div style="background: linear-gradient(to bottom, #e6ccff 0%, #d9b3ff 100%); padding: 8px; border-bottom: 1px solid #cc99ff; display: flex; align-items: center; gap: 8px;">
          <button onclick="desktopOS.browserGoBack()" style="background: #fff; border: 1px solid #ccc; padding: 4px 8px; font-size: 8px; cursor: pointer; border-radius: 2px;">◀ Back</button>
          <button onclick="desktopOS.browserGoForward()" style="background: #fff; border: 1px solid #ccc; padding: 4px 8px; font-size: 8px; cursor: pointer; border-radius: 2px;">▶ Forward</button>
          <button onclick="desktopOS.browserGoHome()" style="background: #fff; border: 1px solid #ccc; padding: 4px 8px; font-size: 8px; cursor: pointer; border-radius: 2px;">🏠 Home</button>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 10px; font-weight: bold; color: #4a148c; text-shadow: 1px 1px 0 rgba(255,255,255,0.5);">Mingle Browser</div>
          </div>
        </div>
        
        <!-- Browser Content Area -->
        <div id="browser-content-area" style="flex: 1; overflow: auto;">
          <!-- Search Interface (Home Page) -->
          <div id="browser-home" style="background: white; padding: 30px; text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center;">
            <div style="font-size: 36px; font-weight: bold; color: #8b4fbf; margin-bottom: 20px; text-shadow: 2px 2px 0 #ffffff; font-family: 'Press Start 2P', monospace;">
              Mingle
            </div>
            <div style="margin-bottom: 30px;">
              <input type="text" id="browser-search-input" placeholder="Search the web or visit a site..." 
                     style="width: 80%; max-width: 400px; padding: 12px 16px; border: 2px solid #e6ccff; border-radius: 24px; font-size: 10px; outline: none; font-family: 'Press Start 2P', monospace;"
                     onfocus="this.style.borderColor='#b347d9'"
                     onblur="this.style.borderColor='#e6ccff'"
                     onkeydown="if(event.key==='Enter') desktopOS.handleBrowserSearch()">
            </div>
            <div style="display: flex; gap: 12px; justify-content: center; margin-bottom: 20px; flex-wrap: wrap;">
              <button onclick="desktopOS.browserNavigateTo('games')" 
                      style="padding: 10px 20px; background: linear-gradient(to bottom, #f0e6ff, #e6ccff); border: 2px outset #f0e6ff; border-radius: 4px; font-size: 8px; cursor: pointer; font-family: 'Press Start 2P', monospace;">
                🎮 Browse Games
              </button>
              <button onclick="desktopOS.browserNavigateTo('portfolio')" 
                      style="padding: 10px 20px; background: linear-gradient(to bottom, #f0e6ff, #e6ccff); border: 2px outset #f0e6ff; border-radius: 4px; font-size: 8px; cursor: pointer; font-family: 'Press Start 2P', monospace;">
                💼 View Portfolio
              </button>
              <button onclick="desktopOS.browserNavigateTo('favorites')" 
                      style="padding: 10px 20px; background: linear-gradient(to bottom, #f0e6ff, #e6ccff); border: 2px outset #f0e6ff; border-radius: 4px; font-size: 8px; cursor: pointer; font-family: 'Press Start 2P', monospace;">
                ⭐ Bookmarks
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  createAboutContent() {
    return `
      <div style="background: white; padding: 20px; font-family: 'Press Start 2P', monospace; font-size: 8px; line-height: 1.6;">
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px;">
          <h1 style="font-size: 12px; margin-bottom: 5px;">ABOUT MIN</h1>
          <p style="font-size: 6px; opacity: 0.7;">Professional Profile Document</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 10px; margin-bottom: 10px; color: #000080;">PERSONAL INFO</h2>
          <p><strong>Name:</strong> Min</p>
          <p><strong>Role:</strong> Creative Developer</p>
          <p><strong>Location:</strong> Digital Realm</p>
          <p><strong>Status:</strong> Building Cool Stuff</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 10px; margin-bottom: 10px; color: #000080;">SKILLS</h2>
          <p>• Game Development</p>
          <p>• Web Development</p>
          <p>• Music Production</p>
          <p>• Digital Art</p>
          <p>• Creative Coding</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="font-size: 10px; margin-bottom: 10px; color: #000080;">MISSION</h2>
          <p>Creating interactive experiences that blend nostalgia with modern technology. Bringing retro aesthetics to contemporary web development and game design.</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;">
          <p style="font-size: 6px; opacity: 0.5;">© 2025 Min - All rights reserved</p>
        </div>
      </div>
    `;
  }
  
  createArtContent() {
    return `
      <div style="padding: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="font-size: 10px; margin-bottom: 10px;">🎨 ART GALLERY</h2>
          <p style="font-size: 8px; opacity: 0.7;">Digital creations and pixel art</p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
          <div style="border: 2px solid #ccc; padding: 10px; text-align: center; background: #f9f9f9;">
            <div style="width: 100%; height: 100px; background: linear-gradient(45deg, #ff6b35, #ff9500); margin-bottom: 8px; border: 1px solid #000;"></div>
            <p style="font-size: 8px;">Retro Sunset</p>
          </div>
          
          <div style="border: 2px solid #ccc; padding: 10px; text-align: center; background: #f9f9f9;">
            <div style="width: 100%; height: 100px; background: linear-gradient(45deg, #4096ff, #00ff88); margin-bottom: 8px; border: 1px solid #000;"></div>
            <p style="font-size: 8px;">Cyber Wave</p>
          </div>
          
          <div style="border: 2px solid #ccc; padding: 10px; text-align: center; background: #f9f9f9;">
            <div style="width: 100%; height: 100px; background: repeating-linear-gradient(45deg, #ff44aa, #ff44aa 10px, #8844ff 10px, #8844ff 20px); margin-bottom: 8px; border: 1px solid #000;"></div>
            <p style="font-size: 8px;">Pixel Pattern</p>
          </div>
          
          <div style="border: 2px solid #ccc; padding: 10px; text-align: center; background: #f9f9f9;">
            <div style="width: 100%; height: 100px; background: #888; margin-bottom: 8px; border: 1px solid #000; display: flex; align-items: center; justify-content: center; color: white; font-size: 8px;">Coming Soon</div>
            <p style="font-size: 8px;">New Artwork</p>
          </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center; font-size: 8px; opacity: 0.7;">
          <p>More artwork will be added as I create new pieces!</p>
        </div>
      </div>
    `;
  }
  
  createMusicContent() {
    return `
      <div style="padding: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="font-size: 10px; margin-bottom: 10px;">🎵 MUSIC STUDIO</h2>
          <p style="font-size: 8px; opacity: 0.7;">Original compositions and soundtracks</p>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 15px;">
          <div style="border: 2px inset #c0c0c0; padding: 10px; background: #e0e0e0;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 8px; font-weight: bold;">♪ Retro Dreams</span>
              <span style="margin-left: auto; font-size: 6px; opacity: 0.7;">Synthwave</span>
            </div>
            <div style="background: #000; height: 20px; position: relative; border: 1px solid #888;">
              <div style="background: linear-gradient(90deg, #00ff00, #ffff00, #ff0000); height: 100%; width: 60%;"></div>
              <div style="position: absolute; top: 50%; left: 60%; transform: translateY(-50%); color: white; font-size: 6px;">3:24</div>
            </div>
          </div>
          
          <div style="border: 2px inset #c0c0c0; padding: 10px; background: #e0e0e0;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 8px; font-weight: bold;">♪ Pixel Quest</span>
              <span style="margin-left: auto; font-size: 6px; opacity: 0.7;">Chiptune</span>
            </div>
            <div style="background: #000; height: 20px; position: relative; border: 1px solid #888;">
              <div style="background: linear-gradient(90deg, #00ff00, #ffff00, #ff0000); height: 100%; width: 45%;"></div>
              <div style="position: absolute; top: 50%; left: 45%; transform: translateY(-50%); color: white; font-size: 6px;">2:18</div>
            </div>
          </div>
          
          <div style="border: 2px inset #c0c0c0; padding: 10px; background: #e0e0e0;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 8px; font-weight: bold;">♪ Cyber City</span>
              <span style="margin-left: auto; font-size: 6px; opacity: 0.7;">Electronic</span>
            </div>
            <div style="background: #000; height: 20px; position: relative; border: 1px solid #888;">
              <div style="background: linear-gradient(90deg, #00ff00, #ffff00, #ff0000); height: 100%; width: 80%;"></div>
              <div style="position: absolute; top: 50%; left: 80%; transform: translateY(-50%); color: white; font-size: 6px;">4:12</div>
            </div>
          </div>
          
          <div style="border: 2px inset #c0c0c0; padding: 10px; background: #f0f0f0; opacity: 0.6;">
            <div style="text-align: center; font-size: 8px;">
              <p>🎼 New tracks in production...</p>
              <p style="font-size: 6px; margin-top: 5px;">Check back soon for more music!</p>
            </div>
          </div>
        </div>
        
        <div style="margin-top: 20px; text-align: center;">
          <button style="padding: 4px 12px; font-size: 8px; background: #c0c0c0; border: 2px outset #c0c0c0;">🎧 Play All</button>
        </div>
      </div>
    `;
  }
  
  openFavorites() {
    this.openApp('favorites');
  }
  
  openSearchResult(type) {
    // Handle search results from the Mingle browser
    switch(type) {
      case 'games':
        this.openApp('games');
        break;
      case 'portfolio':
      case 'about':
        this.openApp('about');
        break;
      default:
        // Could add more search results here
        break;
    }
  }
  
  handleBrowserSearch() {
    const searchInput = document.getElementById('browser-search-input');
    if (searchInput) {
      const query = searchInput.value.toLowerCase().trim();
      this.playSound('click');
      
      if (query.includes('games') || query.includes('play')) {
        this.openSearchResult('games');
      } else if (query.includes('about') || query.includes('portfolio') || query.includes('me')) {
        this.openSearchResult('about');
      } else if (query.includes('art') || query.includes('gallery')) {
        this.openApp('art');
      } else if (query.includes('music') || query.includes('audio')) {
        this.openApp('music');
      } else if (query.includes('themes') || query.includes('customize')) {
        window.open('themes.html', '_blank');
      } else if (query.includes('home') || query.includes('index')) {
        window.open('index.html', '_blank');
      } else {
        // Default action for unrecognized searches
        this.openSearchResult('about');
      }
      
      // Clear search input
      searchInput.value = '';
    }
  }

  openGameWindow(gameName, gameUrl) {
    this.playSound('click');
    
    const windowId = `game-${gameName.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Check if window already exists
    if (this.windows.has(windowId)) {
      this.focusWindow(windowId);
      return;
    }
    
    const windowConfig = {
      title: `${gameName} - Game Window`,
      icon: 'games-icon',
      content: this.createGameWindowContent(gameUrl, gameName),
      width: 800,
      height: 600
    };
    
    this.createWindow(windowId, windowConfig);
    this.playSound('windowOpen');
  }

  createGameWindowContent(gameUrl, gameName) {
    return `
      <div style="height: 100%; display: flex; flex-direction: column;">
        <div style="background: linear-gradient(to bottom, #e6ccff 0%, #d9b3ff 100%); padding: 8px; border-bottom: 1px solid #cc99ff; text-align: center;">
          <div style="font-size: 10px; font-weight: bold; color: #4a148c; text-shadow: 1px 1px 0 rgba(255,255,255,0.5);">🎮 ${gameName}</div>
        </div>
        <div style="flex: 1; position: relative; background: #fff;">
          <iframe 
            src="${gameUrl}" 
            style="width: 100%; height: 100%; border: none; display: block;"
            frameborder="0"
            allowfullscreen
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation"
            onload="this.contentWindow.addEventListener('beforeunload', function(e) { e.preventDefault(); e.returnValue = ''; });">
          </iframe>
        </div>
        <div style="background: linear-gradient(to bottom, #e6ccff 0%, #d9b3ff 100%); padding: 4px 8px; border-top: 1px solid #cc99ff; font-size: 6px; text-align: center; color: #4a148c;">
          Game running in embedded window • ESC to exit fullscreen
        </div>
      </div>
    `;
  }

  // Browser navigation methods
  browserNavigateTo(page) {
    this.playSound('click');
    const contentArea = document.getElementById('browser-content-area');
    if (!contentArea) return;
    
    // Navigate to the page
    if (page === 'games') {
      contentArea.innerHTML = this.createGamesContent();
    } else if (page === 'portfolio') {
      contentArea.innerHTML = this.createAboutContent();
    } else if (page === 'favorites') {
      contentArea.innerHTML = this.createFavoritesContent();
    } else {
      this.browserGoHome();
    }
  }
  
  browserGoBack() {
    this.playSound('click');
    // Simple back functionality - go to home for now
    this.browserGoHome();
  }
  
  browserGoForward() {
    this.playSound('click');
    // Simple forward functionality - go to home for now
    this.browserGoHome();
  }
  
  browserGoHome() {
    this.playSound('click');
    const contentArea = document.getElementById('browser-content-area');
    if (contentArea) {
      contentArea.innerHTML = `
        <div id="browser-home" style="background: white; padding: 30px; text-align: center; height: 100%; display: flex; flex-direction: column; justify-content: center;">
          <div style="font-size: 36px; font-weight: bold; color: #8b4fbf; margin-bottom: 20px; text-shadow: 2px 2px 0 #ffffff; font-family: 'Press Start 2P', monospace;">
            Mingle
          </div>
          <div style="margin-bottom: 30px;">
            <input type="text" id="browser-search-input" placeholder="Search the web or visit a site..." 
                   style="width: 80%; max-width: 400px; padding: 12px 16px; border: 2px solid #e6ccff; border-radius: 24px; font-size: 10px; outline: none; font-family: 'Press Start 2P', monospace;"
                   onfocus="this.style.borderColor='#b347d9'"
                   onblur="this.style.borderColor='#e6ccff'"
                   onkeydown="if(event.key==='Enter') desktopOS.handleBrowserSearch()">
          </div>
          <div style="display: flex; gap: 12px; justify-content: center; margin-bottom: 20px; flex-wrap: wrap;">
            <button onclick="desktopOS.browserNavigateTo('games')" 
                    style="padding: 10px 20px; background: linear-gradient(to bottom, #f0e6ff, #e6ccff); border: 2px outset #f0e6ff; border-radius: 4px; font-size: 8px; cursor: pointer; font-family: 'Press Start 2P', monospace;">
              🎮 Browse Games
            </button>
            <button onclick="desktopOS.browserNavigateTo('portfolio')" 
                    style="padding: 10px 20px; background: linear-gradient(to bottom, #f0e6ff, #e6ccff); border: 2px outset #f0e6ff; border-radius: 4px; font-size: 8px; cursor: pointer; font-family: 'Press Start 2P', monospace;">
              💼 View Portfolio
            </button>
            <button onclick="desktopOS.browserNavigateTo('favorites')" 
                    style="padding: 10px 20px; background: linear-gradient(to bottom, #f0e6ff, #e6ccff); border: 2px outset #f0e6ff; border-radius: 4px; font-size: 8px; cursor: pointer; font-family: 'Press Start 2P', monospace;">
              ⭐ Bookmarks
            </button>
          </div>
        </div>
      `;
    }
  }
}

// Additional method for favorites window
DesktopOS.prototype.createFavoritesContent = function() {
  return `
    <div style="padding: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="font-size: 10px; margin-bottom: 10px;">★ BOOKMARKS</h2>
        <p style="font-size: 8px; opacity: 0.7;">Quick links to my online presence</p>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="border: 1px solid #ccc; padding: 8px; background: #f9f9f9; cursor: pointer;" onclick="window.open('https://github.com', '_blank')">
          <div style="display: flex; align-items: center;">
            <span style="margin-right: 8px;">🐙</span>
            <div>
              <div style="font-size: 8px; font-weight: bold;">GitHub</div>
              <div style="font-size: 6px; opacity: 0.7;">github.com/yourusername</div>
            </div>
          </div>
        </div>
        
        <div style="border: 1px solid #ccc; padding: 8px; background: #f9f9f9; cursor: pointer;" onclick="window.open('https://instagram.com', '_blank')">
          <div style="display: flex; align-items: center;">
            <span style="margin-right: 8px;">📸</span>
            <div>
              <div style="font-size: 8px; font-weight: bold;">Instagram</div>
              <div style="font-size: 6px; opacity: 0.7;">@yourusername</div>
            </div>
          </div>
        </div>
        
        <div style="border: 1px solid #ccc; padding: 8px; background: #f9f9f9; cursor: pointer;" onclick="window.open('https://twitter.com', '_blank')">
          <div style="display: flex; align-items: center;">
            <span style="margin-right: 8px;">🐦</span>
            <div>
              <div style="font-size: 8px; font-weight: bold;">Twitter</div>
              <div style="font-size: 6px; opacity: 0.7;">@yourusername</div>
            </div>
          </div>
        </div>
        
        <div style="border: 1px solid #ccc; padding: 8px; background: #f9f9f9; cursor: pointer;" onclick="window.open('https://linkedin.com', '_blank')">
          <div style="display: flex; align-items: center;">
            <span style="margin-right: 8px;">💼</span>
            <div>
              <div style="font-size: 8px; font-weight: bold;">LinkedIn</div>
              <div style="font-size: 6px; opacity: 0.7;">linkedin.com/in/yourusername</div>
            </div>
          </div>
        </div>
        
        <div style="border: 1px solid #ccc; padding: 8px; background: #f9f9f9; cursor: pointer;" onclick="window.open('mailto:your.email@example.com')">
          <div style="display: flex; align-items: center;">
            <span style="margin-right: 8px;">✉️</span>
            <div>
              <div style="font-size: 8px; font-weight: bold;">Email</div>
              <div style="font-size: 6px; opacity: 0.7;">your.email@example.com</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Handle favorites app opening
const originalOpenApp = DesktopOS.prototype.openApp;
DesktopOS.prototype.openApp = function(appName) {
  if (appName === 'favorites') {
    if (this.windows.has(appName)) {
      this.focusWindow(appName);
      return;
    }
    
    const windowConfig = {
      title: 'Bookmarks - Web Browser',
      icon: 'browser-icon',
      content: this.createFavoritesContent(),
      width: 400,
      height: 500
    };
    
    this.createWindow(appName, windowConfig);
  } else {
    originalOpenApp.call(this, appName);
  }
};

// Initialize desktop when page loads
let desktopOS;
window.addEventListener('DOMContentLoaded', () => {
  desktopOS = new DesktopOS();
});
