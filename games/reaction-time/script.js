// QuickFlex - Enhanced Reaction Time Game

class QuickFlexGame {
  constructor() {
    this.gameBox = document.getElementById('gameBox');
    this.startBtn = document.getElementById('startBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.currentResult = document.getElementById('currentResult');
    
    // Stats elements
    this.totalAttemptsEl = document.getElementById('totalAttempts');
    this.averageTimeEl = document.getElementById('averageTime');
    this.bestTimeEl = document.getElementById('bestTime');
    this.worstTimeEl = document.getElementById('worstTime');
    this.recentListEl = document.getElementById('recentList');
    this.performanceRatingEl = document.getElementById('performanceRating');
    
    // Game state
    this.gameState = 'waiting';
    this.startTime = null;
    this.timeoutId = null;
    this.gameActive = false;
    
    // Statistics
    this.stats = this.loadStats();
    this.recentAttempts = this.loadRecentAttempts();
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.updateStatsDisplay();
    this.updateRecentAttempts();
    this.updatePerformanceRating();
  }

  bindEvents() {
    this.startBtn.addEventListener('click', () => this.startGame());
    this.resetBtn.addEventListener('click', () => this.resetStats());
    this.gameBox.addEventListener('click', () => this.handleGameBoxClick());
    
    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        if (this.gameState === 'waiting' || this.gameState === 'success' || this.gameState === 'too-early') {
          this.startGame();
        } else if (this.gameState === 'ready') {
          // Pressed too early
          this.endGame('too-early');
        } else if (this.gameState === 'go') {
          this.handleGameBoxClick();
        }
      }
    });
  }

  startGame() {
    if (this.gameActive) return;
    
    this.gameActive = true;
    this.gameState = 'ready';
    this.startBtn.disabled = true;
    this.currentResult.textContent = '';
    
    this.updateGameBox('ready', 'fas fa-exclamation-triangle', 'Get Ready!', 'Wait for the green signal...');
    
    // Random delay between 1-5 seconds
    const delay = Math.random() * 4000 + 1000;
    
    this.timeoutId = setTimeout(() => {
      if (this.gameActive) {
        this.gameState = 'go';
        this.startTime = Date.now();
        this.updateGameBox('go', 'fas fa-bolt', 'GO!', 'Click now!');
        
        // Auto-timeout after 3 seconds
        this.timeoutId = setTimeout(() => {
          if (this.gameActive && this.gameState === 'go') {
            this.endGame('timeout');
          }
        }, 3000);
      }
    }, delay);
  }

  handleGameBoxClick() {
    if (this.gameState === 'waiting' || this.gameState === 'success' || this.gameState === 'too-early') {
      // Allow starting the game by clicking the box
      this.startGame();
    } else if (!this.gameActive) {
      return;
    } else if (this.gameState === 'ready') {
      // Clicked too early
      this.endGame('too-early');
    } else if (this.gameState === 'go') {
      // Valid click
      const reactionTime = Date.now() - this.startTime;
      this.endGame('success', reactionTime);
    }
  }

  endGame(result, reactionTime = null) {
    this.gameActive = false;
    this.startBtn.disabled = false;
    
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    
    switch (result) {
      case 'too-early':
        this.gameState = 'too-early';
        this.updateGameBox('too-early', 'fas fa-times', 'Too Early!', 'Click to try again');
        this.showResult('Try again! Wait for the green signal.', 'result-warning');
        break;
        
      case 'timeout':
        this.gameState = 'waiting';
        this.updateGameBox('waiting', 'fas fa-clock', 'Too Slow!', 'Click to try again');
        this.showResult('Time\'s up! Try to be faster.', 'result-error');
        break;
        
      case 'success':
        this.gameState = 'success';
        this.updateGameBox('success', 'fas fa-check', 'Success!', `${reactionTime}ms - Click to play again`);
        this.recordAttempt(reactionTime);
        this.showResult(`Excellent! ${reactionTime}ms`, 'result-success');
        break;
    }
    
    // Reset to waiting state after delay
    setTimeout(() => {
      if (!this.gameActive) {
        this.gameState = 'waiting';
        this.updateGameBox('waiting', 'fas fa-hourglass-start', 'Ready to start?', 'Click to begin your reaction test');
      }
    }, 2000);
  }

  updateGameBox(state, iconClass, title, subtitle) {
    this.gameBox.setAttribute('data-state', state);
    this.gameBox.querySelector('.game-icon').className = `game-icon ${iconClass}`;
    this.gameBox.querySelector('.game-text h3').textContent = title;
    this.gameBox.querySelector('.game-text p').textContent = subtitle;
  }

  showResult(message, className) {
    this.currentResult.textContent = message;
    this.currentResult.className = `current-result ${className}`;
  }

  recordAttempt(time) {
    // Update statistics
    this.stats.totalAttempts++;
    this.stats.totalTime += time;
    
    if (this.stats.bestTime === null || time < this.stats.bestTime) {
      this.stats.bestTime = time;
    }
    
    if (this.stats.worstTime === null || time > this.stats.worstTime) {
      this.stats.worstTime = time;
    }
    
    // Add to recent attempts
    const attempt = {
      time: time,
      timestamp: Date.now(),
      rating: this.getRating(time)
    };
    
    this.recentAttempts.unshift(attempt);
    if (this.recentAttempts.length > 10) {
      this.recentAttempts.pop();
    }
    
    // Save and update displays
    this.saveStats();
    this.saveRecentAttempts();
    this.updateStatsDisplay();
    this.updateRecentAttempts();
    this.updatePerformanceRating();
  }

  getRating(time) {
    if (time < 200) return { text: 'Excellent', class: 'rating-excellent' };
    if (time < 250) return { text: 'Good', class: 'rating-good' };
    if (time < 300) return { text: 'Average', class: 'rating-average' };
    return { text: 'Poor', class: 'rating-poor' };
  }

  updateStatsDisplay() {
    this.totalAttemptsEl.textContent = this.stats.totalAttempts;
    
    if (this.stats.totalAttempts > 0) {
      const average = Math.round(this.stats.totalTime / this.stats.totalAttempts);
      this.averageTimeEl.textContent = average;
      this.bestTimeEl.textContent = this.stats.bestTime;
      this.worstTimeEl.textContent = this.stats.worstTime;
    } else {
      this.averageTimeEl.textContent = '--';
      this.bestTimeEl.textContent = '--';
      this.worstTimeEl.textContent = '--';
    }
  }

  updateRecentAttempts() {
    if (this.recentAttempts.length === 0) {
      this.recentListEl.innerHTML = `
        <div class="text-muted text-center py-3">
          <i class="fas fa-stopwatch fa-2x mb-2"></i>
          <p>No attempts yet</p>
        </div>
      `;
      return;
    }
    
    this.recentListEl.innerHTML = this.recentAttempts.map((attempt, index) => {
      const timeAgo = this.timeAgo(attempt.timestamp);
      return `
        <div class="recent-item">
          <div>
            <span class="recent-time">${attempt.time}ms</span>
            <small class="d-block text-muted">${timeAgo}</small>
          </div>
          <span class="recent-rating ${attempt.rating.class}">${attempt.rating.text}</span>
        </div>
      `;
    }).join('');
  }

  updatePerformanceRating() {
    if (this.stats.totalAttempts === 0) {
      this.performanceRatingEl.innerHTML = `
        <div class="rating-text">Start playing to see your rating!</div>
      `;
      return;
    }
    
    const average = this.stats.totalTime / this.stats.totalAttempts;
    const rating = this.getRating(average);
    
    let description = '';
    if (rating.text === 'Excellent') {
      description = 'Lightning fast reflexes! You\'re in the top tier.';
    } else if (rating.text === 'Good') {
      description = 'Great reaction time! Keep practicing.';
    } else if (rating.text === 'Average') {
      description = 'Decent reflexes. Room for improvement.';
    } else {
      description = 'Keep practicing to improve your reaction time.';
    }
    
    this.performanceRatingEl.innerHTML = `
      <div class="rating-text ${rating.class}">${rating.text}</div>
      <div class="rating-description">${description}</div>
    `;
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
        totalAttempts: 0,
        totalTime: 0,
        bestTime: null,
        worstTime: null
      };
      this.recentAttempts = [];
      
      this.saveStats();
      this.saveRecentAttempts();
      this.updateStatsDisplay();
      this.updateRecentAttempts();
      this.updatePerformanceRating();
      
      this.showResult('Statistics reset successfully!', 'result-success');
    }
  }

  loadStats() {
    const saved = localStorage.getItem('quickflex-stats');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      totalAttempts: 0,
      totalTime: 0,
      bestTime: null,
      worstTime: null
    };
  }

  saveStats() {
    localStorage.setItem('quickflex-stats', JSON.stringify(this.stats));
  }

  loadRecentAttempts() {
    const saved = localStorage.getItem('quickflex-recent');
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  }

  saveRecentAttempts() {
    localStorage.setItem('quickflex-recent', JSON.stringify(this.recentAttempts));
  }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new QuickFlexGame();
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
