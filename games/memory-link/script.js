// MemoryLink - Pattern Memory Game

class MemoryLinkGame {
  constructor() {
    // DOM elements
    this.startBtn = document.getElementById('startBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.settingsModal = document.getElementById('settingsModal');
    this.riskRewardModal = document.getElementById('riskRewardModal');
    this.gameGrid = document.getElementById('gameGrid');
    this.gameArea = document.querySelector('.game-area');
    this.difficultySection = document.getElementById('difficultySection');
    this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
    this.gameMessage = document.getElementById('gameMessage');
    this.levelDisplay = document.getElementById('levelDisplay');
    this.scoreDisplay = document.getElementById('scoreDisplay');
    this.popupContainer = document.getElementById('popupChatContainer');
    
    // Risk/Reward modal elements
    this.riskRewardLevel = document.getElementById('riskRewardLevel');
    this.currentPoints = document.getElementById('currentPoints');
    this.currentMultiplier = document.getElementById('currentMultiplier');
    this.currentAccuracy = document.getElementById('currentAccuracy');
    this.potentialMultiplier = document.getElementById('potentialMultiplier');
    this.cashOutBtn = document.getElementById('cashOutBtn');
    this.continueBtn = document.getElementById('continueBtn');
    
    // Stats elements
    this.currentLevelEl = document.getElementById('currentLevel');
    this.bestLevelEl = document.getElementById('bestLevel');
    this.totalGamesEl = document.getElementById('totalGames');
    this.accuracyEl = document.getElementById('accuracy');
    this.recentListEl = document.getElementById('recentList');
    this.performanceRatingEl = document.getElementById('performanceRating');
    
    // Game state
    this.gameState = 'waiting'; // waiting, showing, input, gameOver, riskReward
    this.sequence = [];
    this.playerSequence = [];
    this.currentLevel = 1;
    this.score = 0;
    this.baseScore = 0; // Score without multiplier
    this.multiplier = 1;
    this.perfectRounds = 0; // Track perfect rounds for accuracy
    this.isShowingSequence = false;
    this.currentSequenceIndex = 0;
    this.showTimeout = null;
    this.gridSize = 4; // Default 2x2 grid
    this.memoryButtons = [];
    this.countdownActive = false;
    
    // Game settings
    this.colors = ['red', 'blue', 'green', 'yellow'];
    this.colorIcons = {
      'red': 'fas fa-square',
      'blue': 'fas fa-circle', 
      'green': 'fas fa-star',
      'yellow': 'fas fa-diamond'
    };
    this.baseSpeed = 800; // milliseconds between sequence items
    this.speedReduction = 50; // speed increases by this amount each level
    this.minSpeed = 300; // minimum time between sequence items
    
    // Statistics
    this.stats = this.loadStats();
    this.recentGames = this.loadRecentGames();
    
    // Popup chat system
    this.popupChatMessages = [
      "Hey, nice pattern! 😄",
      "Don't look at me, focus! 👀",
      "Oops, did I distract you? 😅",
      "You're doing great! Keep it up! 🎉",
      "Remember: red square, blue circle! 🔴🔵",
      "Is that the right button? 🤔",
      "Fun fact: Goldfish have 3-second memory! 🐠",
      "Don't overthink it! 🧠",
      "Level " + this.currentLevel + " already? Wow! 😮",
      "I believe in you! 💪",
      "Blink and you'll miss it! 👁️",
      "Coffee helps with memory! ☕",
      "You've got this! 🚀",
      "That looked easy! 😏",
      "Memory palace time! 🏰",
      "Stay focused! 🎯",
      "Nice reflexes! ⚡",
      "Are you sure about that? 🤨",
      "Smooth brain moment? 😂",
      "Plot twist incoming! 🌪️"
    ];
    this.popupChatInterval = null;
    this.activePopups = [];
    
    this.init();
  }

  init() {
    this.generateGrid();
    this.bindEvents();
    this.updateStatsDisplay();
    this.updateRecentGames();
    this.updatePerformanceRating();
  }

  generateGrid() {
    // Clear existing grid
    this.gameGrid.innerHTML = '';
    
    // Set grid size attribute
    this.gameGrid.setAttribute('data-size', this.gridSize);
    
    // Generate optimal color distribution
    const colorDistribution = this.generateColorDistribution();
    
    // Create buttons
    this.memoryButtons = [];
    for (let i = 0; i < this.gridSize; i++) {
      const button = document.createElement('div');
      button.className = 'memory-button';
      button.setAttribute('data-color', colorDistribution[i]);
      button.setAttribute('data-index', i);
      
      const buttonInner = document.createElement('div');
      buttonInner.className = 'button-inner';
      
      const icon = document.createElement('i');
      icon.className = this.colorIcons[colorDistribution[i]];
      
      buttonInner.appendChild(icon);
      button.appendChild(buttonInner);
      
      this.gameGrid.appendChild(button);
      this.memoryButtons.push(button);
    }
  }

  generateColorDistribution() {
    const gridSide = Math.sqrt(this.gridSize);
    const distribution = [];
    
    if (this.gridSize === 4) {
      // 2x2 grid - all different colors
      return ['red', 'blue', 'green', 'yellow'];
    } else if (this.gridSize === 9) {
      // 3x3 grid - avoid adjacent same colors
      const colors = ['red', 'blue', 'green', 'yellow'];
      const grid = [
        ['red', 'blue', 'green'],
        ['green', 'yellow', 'red'],
        ['blue', 'red', 'yellow']
      ];
      return grid.flat();
    } else if (this.gridSize === 16) {
      // 4x4 grid - checkered pattern to avoid adjacent same colors
      const grid = [
        ['red', 'blue', 'green', 'yellow'],
        ['green', 'yellow', 'red', 'blue'],
        ['blue', 'red', 'yellow', 'green'],
        ['yellow', 'green', 'blue', 'red']
      ];
      return grid.flat();
    }
    
    return distribution;
  }

  bindEvents() {
    this.startBtn.addEventListener('click', () => this.startGame());
    this.resetBtn.addEventListener('click', () => this.resetStats());
    this.settingsBtn.addEventListener('click', () => this.openSettings());
    
    // Risk/Reward modal events
    this.cashOutBtn.addEventListener('click', () => this.cashOut());
    this.continueBtn.addEventListener('click', () => this.continueGame());
    
    // Difficulty button events (now in modal)
    this.difficultyButtons.forEach(button => {
      button.addEventListener('click', () => this.changeDifficulty(button));
    });
    
    // Memory button events will be bound after grid generation
    this.bindMemoryButtonEvents();
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (this.gameState === 'input') {
        let buttonIndex = -1;
        const totalButtons = this.memoryButtons.length;
        
        // Support number keys for grid positions
        const keyNum = parseInt(e.key);
        if (keyNum >= 1 && keyNum <= totalButtons) {
          buttonIndex = keyNum - 1;
        }
        
        if (buttonIndex >= 0) {
          e.preventDefault();
          this.handleButtonClick(buttonIndex);
        }
      } else if (this.gameState === 'waiting' && (e.code === 'Space' || e.key === 'Enter')) {
        e.preventDefault();
        this.startGame();
      }
    });
  }

  bindMemoryButtonEvents() {
    // Memory button events
    this.memoryButtons.forEach((button, index) => {
      button.addEventListener('click', () => this.handleButtonClick(index));
      button.addEventListener('mousedown', () => this.activateButton(button));
      button.addEventListener('mouseup', () => this.deactivateButton(button));
      button.addEventListener('mouseleave', () => this.deactivateButton(button));
    });
  }

  changeDifficulty(clickedButton) {
    if (this.gameState !== 'waiting') return;
    
    // Update active button
    this.difficultyButtons.forEach(btn => btn.classList.remove('active'));
    clickedButton.classList.add('active');
    
    // Get new grid size
    const newGridSize = parseInt(clickedButton.getAttribute('data-size'));
    if (newGridSize !== this.gridSize) {
      this.gridSize = newGridSize;
      this.generateGrid();
      this.bindMemoryButtonEvents();
    }
  }

  startGame() {
    if (this.gameState !== 'waiting') return;
    
    this.gameState = 'countdown';
    this.sequence = [];
    this.playerSequence = [];
    this.currentLevel = 1;
    this.score = 0;
    this.baseScore = 0;
    this.multiplier = 1;
    this.perfectRounds = 0;
    this.startBtn.disabled = true;
    this.settingsBtn.disabled = true;
    
    // Disable difficulty buttons during game
    this.difficultyButtons.forEach(btn => btn.disabled = true);
    
    // Hide start button and title, center game
    this.gameArea.classList.add('game-active');
    
    // Start countdown
    this.startCountdown();
  }

  startCountdown() {
    this.countdownActive = true;
    
    // Create countdown overlay
    const countdownOverlay = document.createElement('div');
    countdownOverlay.className = 'countdown-overlay';
    this.gameArea.appendChild(countdownOverlay);
    
    let count = 3;
    const updateCountdown = () => {
      if (count > 0) {
        countdownOverlay.innerHTML = `<div class="countdown-number">${count}</div>`;
        count--;
        setTimeout(updateCountdown, 1000);
      } else {
        countdownOverlay.innerHTML = `<div class="countdown-number">GO!</div>`;
        setTimeout(() => {
          countdownOverlay.remove();
          this.countdownActive = false;
          this.actualStartGame();
        }, 1000);
      }
    };
    
    updateCountdown();
  }

  actualStartGame() {
    this.gameState = 'showing';
    
    // Start popup chat distractions
    this.startPopupChats();
    
    this.updateDisplays();
    this.generateNextSequence();
    this.showSequence();
  }

  generateNextSequence() {
    // Add a new random button index to the sequence
    const randomIndex = Math.floor(Math.random() * this.gridSize);
    this.sequence.push(randomIndex);
  }

  showSequence() {
    this.gameState = 'showing';
    this.isShowingSequence = true;
    this.currentSequenceIndex = 0;
    this.gameMessage.textContent = 'Watch the pattern...';
    
    // Clear any previous highlights
    this.memoryButtons.forEach(btn => {
      btn.classList.remove('active', 'playing');
    });
    
    // Calculate speed for this level
    const speed = Math.max(
      this.minSpeed,
      this.baseSpeed - (this.currentLevel - 1) * this.speedReduction
    );
    
    this.showNextInSequence(speed);
  }

  showNextInSequence(speed) {
    if (this.currentSequenceIndex >= this.sequence.length) {
      // Sequence finished, start input phase
      this.startInputPhase();
      return;
    }
    
    const buttonIndex = this.sequence[this.currentSequenceIndex];
    const button = this.memoryButtons[buttonIndex];
    
    // Light up the button
    button.classList.add('active', 'playing');
    
    // Turn off after half the speed time
    this.showTimeout = setTimeout(() => {
      button.classList.remove('active', 'playing');
      
      // Show next button after remaining time
      this.showTimeout = setTimeout(() => {
        this.currentSequenceIndex++;
        this.showNextInSequence(speed);
      }, speed / 2);
    }, speed / 2);
  }

  startInputPhase() {
    this.gameState = 'input';
    this.isShowingSequence = false;
    this.playerSequence = [];
    this.gameMessage.textContent = 'Your turn! Repeat the pattern';
    
    // Enable buttons for input
    this.memoryButtons.forEach(btn => {
      btn.style.pointerEvents = 'auto';
    });
  }

  handleButtonClick(index) {
    if (this.gameState !== 'input') return;
    
    this.playerSequence.push(index);
    const button = this.memoryButtons[index];
    
    // Check if input is correct so far
    const currentStep = this.playerSequence.length - 1;
    const isCorrect = this.playerSequence[currentStep] === this.sequence[currentStep];
    
    if (!isCorrect) {
      // Wrong input - use aggressive shake animation
      this.flashButtonWithShake(button);
      // Wrong input - game over
      this.endGame(false);
      return;
    } else {
      // Correct input - use calm ripple animation
      this.flashButtonWithRipple(button);
    }
    
    // Check if sequence is complete
    if (this.playerSequence.length === this.sequence.length) {
      // Level complete!
      this.completeLevel();
    }
  }

  flashButton(button) {
    button.classList.add('active');
    setTimeout(() => {
      button.classList.remove('active');
    }, 200);
  }

  flashButtonWithRipple(button) {
    // Add pressed state immediately
    button.classList.add('pressed');
    
    // Add gentle pulse and ripple animation for correct clicks
    button.classList.add('gentle-pulse', 'ripple');
    
    // Add active state for visual feedback
    button.classList.add('active');
    
    // Remove pressed state quickly
    setTimeout(() => {
      button.classList.remove('pressed');
    }, 100);
    
    // Remove active state
    setTimeout(() => {
      button.classList.remove('active');
    }, 200);
    
    // Remove animation classes after animation completes
    setTimeout(() => {
      button.classList.remove('gentle-pulse', 'ripple');
    }, 600);
  }

  flashButtonWithShake(button) {
    // Add pressed state immediately
    button.classList.add('pressed');
    
    // Add aggressive shake animation for wrong clicks
    button.classList.add('shake-ripple');
    
    // Add active state for visual feedback
    button.classList.add('active');
    
    // Remove pressed state quickly
    setTimeout(() => {
      button.classList.remove('pressed');
    }, 100);
    
    // Remove active state
    setTimeout(() => {
      button.classList.remove('active');
    }, 200);
    
    // Remove animation classes after animation completes
    setTimeout(() => {
      button.classList.remove('shake-ripple');
    }, 600);
  }

  activateButton(button) {
    if (this.gameState === 'input') {
      button.classList.add('active', 'pressed');
    }
  }

  deactivateButton(button) {
    if (this.gameState === 'input') {
      button.classList.remove('active', 'pressed');
    }
  }

  completeLevel() {
    // Calculate score
    const levelBonus = this.currentLevel * 100;
    const speedBonus = Math.max(0, this.baseSpeed - this.getCurrentSpeed()) / 10;
    const levelScore = Math.round(levelBonus + speedBonus);
    
    this.baseScore += levelScore;
    this.score = Math.round(this.baseScore * this.multiplier);
    this.perfectRounds++;
    
    this.currentLevel++;
    
    // Check if this is a milestone level (every 5 levels)
    if (this.currentLevel % 5 === 1 && this.currentLevel > 1) {
      this.showRiskRewardModal();
      return;
    }
    
    this.gameMessage.textContent = `Level ${this.currentLevel - 1} complete! Get ready...`;
    
    // Brief pause before next level
    setTimeout(() => {
      this.generateNextSequence();
      this.updateDisplays();
      this.showSequence();
    }, 1500);
  }

  endGame(success = false) {
    this.gameState = 'gameOver';
    this.isShowingSequence = false;
    
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    
    // Clear any active states
    this.memoryButtons.forEach(btn => {
      btn.classList.remove('active', 'playing');
    });
    
    const finalLevel = success ? this.currentLevel : this.currentLevel - 1;
    
    if (success) {
      this.gameMessage.textContent = `Amazing! You reached level ${finalLevel}!`;
      // Record with full score and accuracy
      this.recordGame(finalLevel, this.score);
    } else {
      // Player lost - they only get base score (no multiplier bonus)
      const lostMultiplierBonus = this.score - this.baseScore;
      const finalScore = this.baseScore;
      
      if (this.multiplier > 1) {
        this.gameMessage.textContent = `Game Over! You reached level ${finalLevel}. Lost multiplier bonus of ${lostMultiplierBonus} points!`;
      } else {
        this.gameMessage.textContent = `Game Over! You reached level ${finalLevel}`;
      }
      
      // Show incorrect button briefly
      const wrongIndex = this.playerSequence[this.playerSequence.length - 1];
      const correctIndex = this.sequence[this.playerSequence.length - 1];
      
      this.memoryButtons[wrongIndex].classList.add('incorrect');
      this.memoryButtons[correctIndex].classList.add('correct');
      
      setTimeout(() => {
        this.memoryButtons[wrongIndex].classList.remove('incorrect');
        this.memoryButtons[correctIndex].classList.remove('correct');
      }, 1000);
      
      // Record with base score only (lost multiplier)
      this.recordGame(finalLevel, finalScore);
    }
    
    // Stop popup chats
    this.stopPopupChats();
    
    // Reset game state
    setTimeout(() => {
      this.gameState = 'waiting';
      this.startBtn.disabled = false;
      this.settingsBtn.disabled = false;
      
      // Re-enable difficulty buttons and show start button/title
      this.difficultyButtons.forEach(btn => btn.disabled = false);
      this.gameArea.classList.remove('game-active');
      
      this.currentLevel = 1;
      this.score = 0;
      this.baseScore = 0;
      this.multiplier = 1;
      this.perfectRounds = 0;
      this.sequence = [];
      this.playerSequence = [];
      this.updateDisplays();
      this.gameMessage.textContent = 'Click Settings to choose grid size, then Start Game!';
    }, 3000);
  }

  getCurrentSpeed() {
    return Math.max(
      this.minSpeed,
      this.baseSpeed - (this.currentLevel - 1) * this.speedReduction
    );
  }

  recordGame(level, score, cashedOut = false, preservedAccuracy = null) {
    // Update statistics
    this.stats.totalGames++;
    this.stats.totalScore += score;
    
    if (level > this.stats.bestLevel) {
      this.stats.bestLevel = level;
    }
    
    // Handle accuracy calculation
    if (cashedOut && preservedAccuracy !== null) {
      // Player cashed out with perfect accuracy - don't penalize
      this.stats.totalLevels += level;
    } else {
      // Normal game or lost game
      this.stats.totalLevels += level;
    }
    
    // Add to recent games
    const game = {
      level: level,
      score: score,
      cashedOut: cashedOut,
      accuracy: cashedOut && preservedAccuracy !== null ? preservedAccuracy : null,
      timestamp: Date.now()
    };
    
    this.recentGames.unshift(game);
    if (this.recentGames.length > 10) {
      this.recentGames.pop();
    }
    
    // Save and update displays
    this.saveStats();
    this.saveRecentGames();
    this.updateStatsDisplay();
    this.updateRecentGames();
    this.updatePerformanceRating();
  }

  updateDisplays() {
    this.levelDisplay.textContent = this.currentLevel;
    this.scoreDisplay.textContent = this.score;
    this.currentLevelEl.textContent = this.currentLevel;
  }

  updateStatsDisplay() {
    this.totalGamesEl.textContent = this.stats.totalGames;
    this.bestLevelEl.textContent = this.stats.bestLevel || '--';
    
    if (this.stats.totalGames > 0) {
      const accuracy = Math.round((this.stats.totalLevels / this.stats.totalGames) * 10);
      this.accuracyEl.textContent = Math.min(accuracy, 100);
    } else {
      this.accuracyEl.textContent = '--';
    }
  }

  updateRecentGames() {
    if (this.recentGames.length === 0) {
      this.recentListEl.innerHTML = `
        <div class="text-muted text-center py-3">
          <i class="fas fa-gamepad fa-2x mb-2"></i>
          <p>No games yet</p>
        </div>
      `;
      return;
    }
    
    this.recentListEl.innerHTML = this.recentGames.map((game, index) => {
      const timeAgo = this.timeAgo(game.timestamp);
      const cashOutBadge = game.cashedOut ? '<span class="badge bg-success ms-1">💰</span>' : '';
      return `
        <div class="recent-item">
          <div>
            <span class="recent-level">Level ${game.level}${cashOutBadge}</span>
            <small class="d-block text-muted">${timeAgo}</small>
          </div>
          <span class="recent-score">${game.score} pts</span>
        </div>
      `;
    }).join('');
  }

  updatePerformanceRating() {
    if (this.stats.totalGames === 0) {
      this.performanceRatingEl.innerHTML = `
        <div class="rating-text">Start playing to see your rating!</div>
      `;
      return;
    }
    
    const avgLevel = this.stats.totalLevels / this.stats.totalGames;
    const rating = this.getPerformanceRating(avgLevel);
    
    this.performanceRatingEl.innerHTML = `
      <div class="rating-text ${rating.class}">${rating.text}</div>
      <div class="rating-description">${rating.description}</div>
    `;
  }

  getPerformanceRating(avgLevel) {
    if (avgLevel >= 15) {
      return {
        text: 'Memory Master',
        class: 'rating-master',
        description: 'Incredible memory skills! You\'re a true master.'
      };
    } else if (avgLevel >= 10) {
      return {
        text: 'Memory Expert',
        class: 'rating-expert',
        description: 'Excellent memory performance! Keep it up.'
      };
    } else if (avgLevel >= 6) {
      return {
        text: 'Memory Skilled',
        class: 'rating-skilled',
        description: 'Good memory skills with room to grow.'
      };
    } else if (avgLevel >= 3) {
      return {
        text: 'Memory Learning',
        class: 'rating-learning',
        description: 'Developing your memory abilities.'
      };
    } else {
      return {
        text: 'Memory Beginner',
        class: 'rating-beginner',
        description: 'Just getting started. Practice makes perfect!'
      };
    }
  }

  timeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  }

  resetStats() {
    if (confirm('Are you sure you want to reset all statistics? This action cannot be undone.')) {
      this.stats = {
        totalGames: 0,
        totalLevels: 0,
        totalScore: 0,
        bestLevel: 0
      };
      this.recentGames = [];
      
      this.saveStats();
      this.saveRecentGames();
      this.updateStatsDisplay();
      this.updateRecentGames();
      this.updatePerformanceRating();
      
      this.gameMessage.textContent = 'Statistics reset! Ready to start fresh?';
    }
  }

  loadStats() {
    const saved = localStorage.getItem('memorylink-stats');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      totalGames: 0,
      totalLevels: 0,
      totalScore: 0,
      bestLevel: 0
    };
  }

  saveStats() {
    localStorage.setItem('memorylink-stats', JSON.stringify(this.stats));
  }

  loadRecentGames() {
    const saved = localStorage.getItem('memorylink-recent');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  }

  saveRecentGames() {
    localStorage.setItem('memorylink-recent', JSON.stringify(this.recentGames));
  }

  // Popup Chat System for Distractions
  startPopupChats() {
    // Clear any existing interval
    if (this.popupChatInterval) {
      clearInterval(this.popupChatInterval);
    }
    
    // Start showing popup chats at random intervals
    this.popupChatInterval = setInterval(() => {
      if (this.gameState === 'input' || this.gameState === 'showing') {
        this.showRandomPopupChat();
      }
    }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds
  }

  stopPopupChats() {
    if (this.popupChatInterval) {
      clearInterval(this.popupChatInterval);
      this.popupChatInterval = null;
    }
    
    // Clear all active popups from body and container
    this.activePopups.forEach(popup => {
      if (popup.element && popup.element.parentNode) {
        popup.element.parentNode.removeChild(popup.element);
      }
    });
    this.activePopups = [];
    
    // Also clear any remaining popup-chat elements from body
    const remainingPopups = document.querySelectorAll('.popup-chat');
    remainingPopups.forEach(popup => {
      if (popup.parentNode) {
        popup.parentNode.removeChild(popup);
      }
    });
  }

  showRandomPopupChat() {
    // Don't show too many popups at once
    if (this.activePopups.length >= 2) return;
    
    // Get random message
    const messages = [...this.popupChatMessages];
    // Add level-specific messages
    if (this.currentLevel > 5) {
      messages.push(`Level ${this.currentLevel}? Show off! 😎`);
      messages.push("You're on fire! 🔥");
    }
    if (this.currentLevel > 10) {
      messages.push("Memory master detected! 🧠👑");
      messages.push("Are you even human? 🤖");
    }
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    // Create popup element
    const popup = document.createElement('div');
    popup.className = `popup-chat style-${Math.floor(Math.random() * 4) + 1}`;
    popup.textContent = randomMessage;
    
    // Get viewport dimensions for full screen positioning
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const popupWidth = 200;
    const popupHeight = 60;
    
    // Calculate random position anywhere on screen with padding
    const padding = 50;
    const positions = [
      { // Top area (anywhere across top)
        left: Math.random() * (viewportWidth - popupWidth - padding * 2) + padding,
        top: Math.random() * 100 + padding
      },
      { // Bottom area (anywhere across bottom)
        left: Math.random() * (viewportWidth - popupWidth - padding * 2) + padding,
        top: viewportHeight - Math.random() * 120 - popupHeight - padding
      },
      { // Left side (anywhere down left side)
        left: Math.random() * 150 + padding,
        top: Math.random() * (viewportHeight - popupHeight - padding * 2) + padding
      },
      { // Right side (anywhere down right side)
        left: viewportWidth - Math.random() * 150 - popupWidth - padding,
        top: Math.random() * (viewportHeight - popupHeight - padding * 2) + padding
      },
      { // Center-left area (over stats panel)
        left: Math.random() * 200 + padding,
        top: Math.random() * (viewportHeight - popupHeight - padding * 2) + padding + 100
      },
      { // Center-right area (around game area)
        left: viewportWidth - Math.random() * 300 - popupWidth - padding,
        top: Math.random() * (viewportHeight - popupHeight - padding * 2) + padding + 100
      },
      { // Random anywhere (chaos mode)
        left: Math.random() * (viewportWidth - popupWidth - padding * 2) + padding,
        top: Math.random() * (viewportHeight - popupHeight - padding * 2) + padding
      }
    ];
    
    const randomPos = positions[Math.floor(Math.random() * positions.length)];
    
    // Use fixed positioning for full screen coverage
    popup.style.position = 'fixed';
    popup.style.left = `${randomPos.left}px`;
    popup.style.top = `${randomPos.top}px`;
    popup.style.zIndex = '9999';
    
    // Add to body instead of popup container for full screen coverage
    document.body.appendChild(popup);
    
    // Show popup
    setTimeout(() => {
      popup.classList.add('show');
    }, 100);
    
    // Track popup
    const popupObj = {
      element: popup,
      timestamp: Date.now()
    };
    this.activePopups.push(popupObj);
    
    // Remove popup after 2-4 seconds
    const duration = 2000 + Math.random() * 2000;
    setTimeout(() => {
      popup.classList.add('fade-out');
      setTimeout(() => {
        if (popup.parentNode) {
          popup.parentNode.removeChild(popup);
        }
        // Remove from active popups
        const index = this.activePopups.findIndex(p => p.element === popup);
        if (index > -1) {
          this.activePopups.splice(index, 1);
        }
      }, 300);
    }, duration);
  }

  openSettings() {
    // Open the settings modal using Bootstrap
    const modal = new bootstrap.Modal(this.settingsModal);
    modal.show();
  }

  showRiskRewardModal() {
    this.gameState = 'riskReward';
    
    // Stop popup chats during decision
    this.stopPopupChats();
    
    // Update modal content
    this.riskRewardLevel.textContent = this.currentLevel - 1;
    this.currentPoints.textContent = this.score;
    this.currentMultiplier.textContent = `${this.multiplier}x`;
    
    const currentAccuracy = Math.round((this.perfectRounds / (this.currentLevel - 1)) * 100);
    this.currentAccuracy.textContent = `${currentAccuracy}%`;
    
    const nextMultiplier = Math.round((this.multiplier + 0.5) * 10) / 10;
    this.potentialMultiplier.textContent = `${nextMultiplier}x`;
    
    // Show modal
    const modal = new bootstrap.Modal(this.riskRewardModal, {
      backdrop: 'static',
      keyboard: false
    });
    modal.show();
  }

  cashOut() {
    // Player chooses to end the game and keep their points and accuracy
    const modal = bootstrap.Modal.getInstance(this.riskRewardModal);
    modal.hide();
    
    const finalLevel = this.currentLevel - 1;
    const finalAccuracy = Math.round((this.perfectRounds / finalLevel) * 100);
    
    this.gameMessage.textContent = `Smart choice! You cashed out at level ${finalLevel} with ${finalAccuracy}% accuracy!`;
    
    // Record the game with full points and accuracy
    this.recordGame(finalLevel, this.score, true, finalAccuracy);
    
    // End the game
    this.endGameAfterCashOut();
  }

  continueGame() {
    // Player chooses to continue and risk their multiplier
    const modal = bootstrap.Modal.getInstance(this.riskRewardModal);
    modal.hide();
    
    // Increase multiplier
    this.multiplier = Math.round((this.multiplier + 0.5) * 10) / 10;
    
    // Recalculate score with new multiplier
    this.score = Math.round(this.baseScore * this.multiplier);
    
    this.gameMessage.textContent = `Risk accepted! Multiplier increased to ${this.multiplier}x. Get ready...`;
    
    // Resume popup chats
    this.startPopupChats();
    
    // Continue to next level
    setTimeout(() => {
      this.generateNextSequence();
      this.updateDisplays();
      this.showSequence();
    }, 2000);
  }

  endGameAfterCashOut() {
    this.gameState = 'gameOver';
    this.isShowingSequence = false;
    
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
    
    // Clear any active states
    this.memoryButtons.forEach(btn => {
      btn.classList.remove('active', 'playing');
    });
    
    // Stop popup chats
    this.stopPopupChats();
    
    // Reset game state
    setTimeout(() => {
      this.gameState = 'waiting';
      this.startBtn.disabled = false;
      this.settingsBtn.disabled = false;
      
      // Re-enable difficulty buttons and show start button/title
      this.difficultyButtons.forEach(btn => btn.disabled = false);
      this.gameArea.classList.remove('game-active');
      
      this.currentLevel = 1;
      this.score = 0;
      this.baseScore = 0;
      this.multiplier = 1;
      this.perfectRounds = 0;
      this.sequence = [];
      this.playerSequence = [];
      this.updateDisplays();
      this.gameMessage.textContent = 'Click Settings to choose grid size, then Start Game!';
    }, 2000);
  }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MemoryLinkGame();
});

// Apply theme on load
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Update theme toggle button
  const toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    if (savedTheme.includes('night') || savedTheme === 'dark') {
      toggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
      toggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
  }
});
