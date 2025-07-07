// PathGuard - Advanced Tower Defense Game
class PathGuardGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gameRunning = false;
    this.gamePaused = false;
    this.selectedTower = null;
    this.selectedExistingTower = null;
    this.placementMode = false;
    this.gameSpeed = 1;
    
    // Path building mode
    this.pathBuildingMode = false;
    this.isDrawingPath = false;
    this.tempPath = [];
    this.minPathDistance = 30; // Minimum distance between path points
    
    // Mobile detection
    this.isMobile = window.innerWidth <= 768;
    this.isTouch = 'ontouchstart' in window;
    
    // Game state
    this.wave = 1;
    this.lives = 10;
    this.gold = 100;
    this.score = 0;
    
    // Game objects
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    
    // Game settings
    this.towerTypes = {
      sniper: { 
        cost: 15, 
        damage: 25, 
        range: 120, 
        fireRate: 90, 
        projectileSpeed: 8, 
        color: '#4CAF50',
        name: 'Sniper Tower',
        description: 'High damage, long range, slow fire rate'
      },
      machine: { 
        cost: 30, 
        damage: 8, 
        range: 80, 
        fireRate: 15, 
        projectileSpeed: 6, 
        color: '#FF9800',
        name: 'Machine Gun',
        description: 'Fast firing, moderate damage'
      },
      explosive: { 
        cost: 50, 
        damage: 40, 
        range: 100, 
        fireRate: 120, 
        projectileSpeed: 4, 
        color: '#F44336',
        name: 'Explosive Tower',
        description: 'High damage, area effect'
      },
      freeze: { 
        cost: 40, 
        damage: 10, 
        range: 90, 
        fireRate: 60, 
        projectileSpeed: 5, 
        color: '#2196F3',
        name: 'Freeze Tower',
        description: 'Slows enemies, moderate damage'
      },
      poison: { 
        cost: 35, 
        damage: 15, 
        range: 85, 
        fireRate: 45, 
        projectileSpeed: 5, 
        color: '#9C27B0',
        name: 'Poison Tower',
        description: 'Damage over time effect'
      },
      electric: { 
        cost: 45, 
        damage: 20, 
        range: 95, 
        fireRate: 50, 
        projectileSpeed: 10, 
        color: '#FFEB3B',
        name: 'Electric Tower',
        description: 'Chain lightning between enemies'
      },
      trap: {
        cost: 20,
        damage: 50,
        range: 25,
        fireRate: 0,
        projectileSpeed: 0,
        color: '#8D6E63',
        name: 'Spike Trap',
        description: 'Damages enemies that walk over it',
        isTrap: true,
        uses: 3
      }
    };
    
    // Predefined path for enemies
    this.path = [
      { x: 50, y: 350 },
      { x: 200, y: 350 },
      { x: 200, y: 200 },
      { x: 400, y: 200 },
      { x: 400, y: 500 },
      { x: 600, y: 500 },
      { x: 600, y: 350 },
      { x: 800, y: 350 },
      { x: 950, y: 350 }
    ];
    
    this.init();
  }
  
  init() {
    this.setupEventListeners();
    this.updateUI();
    this.gameLoop();
    
    // Initialize canvas size
    this.resizeCanvas();
  }
  
  resizeCanvas() {
    const container = this.canvas.parentElement;
    const containerRect = container.getBoundingClientRect();
    
    // Maintain aspect ratio
    const aspectRatio = 1000 / 700;
    let width = containerRect.width - 40; // Padding
    let height = width / aspectRatio;
    
    // Mobile adjustments
    if (this.isMobile) {
      width = containerRect.width - 20; // Less padding on mobile
      height = width / aspectRatio;
      
      // In portrait mode, limit height
      if (window.innerHeight > window.innerWidth) {
        const maxHeight = window.innerHeight * 0.5; // 50% of viewport height
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
      }
    }
    
    if (height > containerRect.height - 40) {
      height = containerRect.height - 40;
      width = height * aspectRatio;
    }
    
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    
    // Disable touch scrolling on canvas
    if (this.isTouch) {
      this.canvas.style.touchAction = 'none';
    }
  }
  
  setupEventListeners() {
    // Tower selection
    document.querySelectorAll('.tower-option').forEach(option => {
      option.addEventListener('click', (e) => {
        const towerType = e.currentTarget.dataset.tower;
        this.selectTower(towerType);
      });
    });
    
    // Canvas interaction for both mouse and touch
    const handleCanvasInteraction = (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      
      let clientX, clientY;
      if (e.type.startsWith('touch')) {
        const touch = e.touches[0] || e.changedTouches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      
      const x = (clientX - rect.left) * scaleX;
      const y = (clientY - rect.top) * scaleY;
      
      if (this.pathBuildingMode) {
        this.addPathPoint(x, y);
      } else if (this.selectedTower && this.placementMode) {
        this.placeTower(x, y);
      } else {
        // Check if clicking on an existing tower
        const clickedTower = this.getTowerAt(x, y);
        if (clickedTower) {
          this.selectExistingTower(clickedTower);
        } else {
          this.deselectTower();
        }
      }
    };
    
    // Add both mouse and touch listeners
    this.canvas.addEventListener('click', handleCanvasInteraction);
    this.canvas.addEventListener('touchend', handleCanvasInteraction);
    
    // Canvas mouse/touch move for placement preview
    const handleCanvasMove = (e) => {
      if (this.placementMode) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        let clientX, clientY;
        if (e.type.startsWith('touch')) {
          const touch = e.touches[0];
          if (!touch) return;
          clientX = touch.clientX;
          clientY = touch.clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }
        
        this.mouseX = (clientX - rect.left) * scaleX;
        this.mouseY = (clientY - rect.top) * scaleY;
      }
    };
    
    this.canvas.addEventListener('mousemove', handleCanvasMove);
    this.canvas.addEventListener('touchmove', handleCanvasMove);
    

    // Game controls
    document.getElementById('startWaveBtn').addEventListener('click', () => {
      this.startWave();
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.key === 'Enter') {
         this.startWave();
      }
    });
    
    document.getElementById('pauseBtn').addEventListener('click', () => {
      this.togglePause();
    });
    
    document.getElementById('resetBtn').addEventListener('click', () => {
      this.resetGame();
    });
    
    // Speed controls
    document.getElementById('slowBtn').addEventListener('click', () => {
      this.setGameSpeed(0.5);
    });
    
    document.getElementById('normalBtn').addEventListener('click', () => {
      this.setGameSpeed(1);
    });
    
    document.getElementById('fastBtn').addEventListener('click', () => {
      this.setGameSpeed(2);
    });
    
    // Start building button
    document.getElementById('startBuildingBtn').addEventListener('click', () => {
      document.getElementById('gameOverlay').classList.add('hidden');
    });
    
    // Enhanced keyboard controls
    document.addEventListener('keydown', (e) => {
      // Cancel placement or path building with Escape
      if (e.key === 'Escape') {
        if (this.placementMode) {
          this.cancelPlacement();
        } else if (this.pathBuildingMode) {
          this.togglePathBuildingMode();
        }
        return;
      }
      
      // Start wave or game with Enter/Space
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!this.gameRunning) {
          this.startWave();
        }
        return;
      }
      
      // Quick tower selection hotkeys
      const towerHotkeys = {
        '1': 'sniper',
        '2': 'machine', 
        '3': 'explosive',
        '4': 'freeze',
        '5': 'poison',
        '6': 'electric',
        '7': 'trap'
      };
      
      if (towerHotkeys[e.key]) {
        this.selectTower(towerHotkeys[e.key]);
        return;
      }
      
      // Pause/Resume with P
      if (e.key === 'p' || e.key === 'P') {
        this.togglePause();
        return;
      }
      
      // Speed controls
      if (e.key === '-' || e.key === '_') {
        this.setGameSpeed(0.5);
        return;
      }
      if (e.key === '=' || e.key === '+') {
        this.setGameSpeed(2);
        return;
      }
      if (e.key === '0') {
        this.setGameSpeed(1);
        return;
      }
    });
    
    // Path building controls
    const pathModeBtn = document.getElementById('pathModeBtn');
    if (pathModeBtn) {
      pathModeBtn.addEventListener('click', () => {
        this.togglePathBuildingMode();
      });
    }
    
    // Window resize
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
      this.resizeCanvas();
    });
  }
  
  setGameSpeed(speed) {
    this.gameSpeed = speed;
    
    // Update button styles
    document.querySelectorAll('.speed-controls .btn').forEach(btn => {
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-outline-secondary');
    });
    
    const buttons = {
      0.5: document.getElementById('slowBtn'),
      1: document.getElementById('normalBtn'),
      2: document.getElementById('fastBtn')
    };
    
    if (buttons[speed]) {
      buttons[speed].classList.remove('btn-outline-secondary');
      buttons[speed].classList.add('btn-primary');
    }
  }
  
  selectTower(towerType) {
    if (!this.towerTypes[towerType]) return;
    
    const towerData = this.towerTypes[towerType];
    if (this.gold >= towerData.cost) {
      this.selectedTower = towerType;
      this.placementMode = true;
      this.canvas.style.cursor = 'crosshair';
      
      // Update UI
      document.querySelectorAll('.tower-option').forEach(option => {
        option.classList.remove('selected');
      });
      
      const selectedOption = document.querySelector(`[data-tower="${towerType}"]`);
      if (selectedOption) {
        selectedOption.classList.add('selected');
      }
    } else {
      // Not enough gold - show feedback
      this.showMessage('Not enough gold!', '#F44336');
    }
  }
  
  cancelPlacement() {
    this.selectedTower = null;
    this.placementMode = false;
    this.canvas.style.cursor = 'default';
    
    // Clear selection
    document.querySelectorAll('.tower-option').forEach(option => {
      option.classList.remove('selected');
    });
  }
  
  placeTower(x, y) {
    if (!this.selectedTower) return;
    
    const towerData = this.towerTypes[this.selectedTower];
    
    // Check if position is valid
    if (this.isValidTowerPosition(x, y, towerData.isTrap)) {
      const newTower = {
        x: x,
        y: y,
        type: this.selectedTower,
        ...towerData,
        lastFired: 0,
        target: null,
        level: 1
      };
      
      // Add trap-specific properties
      if (towerData.isTrap) {
        newTower.remainingUses = towerData.uses;
        newTower.triggered = false;
      }
      
      this.towers.push(newTower);
      
      this.gold -= towerData.cost;
      this.cancelPlacement();
      this.updateUI();
      
      // Visual feedback
      this.createPlacementParticles(x, y);
      this.showMessage(`${towerData.name} placed!`, towerData.color);
    } else {
      // Invalid placement - show feedback
      this.showMessage('Invalid placement location!', '#F44336');
    }
  }
  
  isValidTowerPosition(x, y, isTrap = false) {
    const minDistance = isTrap ? 20 : 40; // Traps can be closer together
    
    // Check distance from other towers (except for traps which can be closer)
    for (let tower of this.towers) {
      const dist = Math.sqrt((x - tower.x) ** 2 + (y - tower.y) ** 2);
      if (dist < minDistance) return false;
    }
    
    // Traps can be placed ON the path, regular towers cannot
    if (!isTrap) {
      // Check if not on path (for regular towers)
      for (let i = 0; i < this.path.length - 1; i++) {
        const pathStart = this.path[i];
        const pathEnd = this.path[i + 1];
        const distToPath = this.distanceToLineSegment(x, y, pathStart.x, pathStart.y, pathEnd.x, pathEnd.y);
        if (distToPath < 30) return false;
      }
    } else {
      // For traps, check if they're close enough to the path
      let onPath = false;
      for (let i = 0; i < this.path.length - 1; i++) {
        const pathStart = this.path[i];
        const pathEnd = this.path[i + 1];
        const distToPath = this.distanceToLineSegment(x, y, pathStart.x, pathStart.y, pathEnd.x, pathEnd.y);
        if (distToPath < 35) {
          onPath = true;
          break;
        }
      }
      if (!onPath) return false;
    }
    
    return true;
  }
  
  distanceToLineSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    
    const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (length * length)));
    const projection = { x: x1 + t * dx, y: y1 + t * dy };
    return Math.sqrt((px - projection.x) ** 2 + (py - projection.y) ** 2);
  }
  
  startWave() {
    if (this.gameRunning) return;
    
    this.gameRunning = true;
    this.spawnEnemies();
    document.getElementById('startWaveBtn').disabled = true;
  }
  
  spawnEnemies() {
    const enemyCount = Math.min(5 + this.wave * 2, 20);
    const spawnInterval = Math.max(1000 - this.wave * 40, 400);
    
    for (let i = 0; i < enemyCount; i++) {
      setTimeout(() => {
        const enemyType = this.getEnemyType();
        this.enemies.push({
          x: this.path[0].x,
          y: this.path[0].y,
          pathIndex: 0,
          progress: 0,
          health: enemyType.health,
          maxHealth: enemyType.health,
          speed: enemyType.speed,
          reward: enemyType.reward,
          color: enemyType.color,
          size: enemyType.size || 12,
          type: enemyType.name
        });
      }, i * spawnInterval);
    }
  }
  
  getEnemyType() {
    const types = [
      {
        name: 'Basic',
        health: 20 + this.wave * 5,
        speed: 0.6 + this.wave * 0.05,
        reward: 5 + this.wave,
        color: '#FF6B6B',
        size: 12
      },
      {
        name: 'Fast',
        health: 15 + this.wave * 3,
        speed: 1.0 + this.wave * 0.08,
        reward: 7 + this.wave,
        color: '#4ECDC4',
        size: 10
      },
      {
        name: 'Tank',
        health: 40 + this.wave * 10,
        speed: 0.3 + this.wave * 0.02,
        reward: 12 + this.wave * 2,
        color: '#45B7D1',
        size: 16
      }
    ];
    
    // More variety in later waves
    if (this.wave < 3) {
      return types[0]; // Only basic enemies
    } else if (this.wave < 6) {
      return types[Math.random() < 0.7 ? 0 : 1]; // Basic and fast
    } else {
      const rand = Math.random();
      return rand < 0.5 ? types[0] : rand < 0.8 ? types[1] : types[2];
    }
  }
  
  togglePause() {
    this.gamePaused = !this.gamePaused;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.innerHTML = this.gamePaused ? 
      '<i class="fas fa-play me-2"></i>Resume' : 
      '<i class="fas fa-pause me-2"></i>Pause';
  }
  
  resetGame() {
    this.gameRunning = false;
    this.gamePaused = false;
    this.wave = 1;
    this.lives = 10;
    this.gold = 100;
    this.score = 0;
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.selectedTower = null;
    this.selectedExistingTower = null;
    this.placementMode = false;
    this.canvas.style.cursor = 'default';
    
    document.getElementById('startWaveBtn').disabled = false;
    document.getElementById('startWaveBtn').innerHTML = '<i class="fas fa-play me-2"></i>Start Wave 1';
    document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause me-2"></i>Pause';
    document.getElementById('gameOverlay').classList.remove('hidden');
    
    // Clear tower selections
    document.querySelectorAll('.tower-option').forEach(option => {
      option.classList.remove('selected');
    });
    
    this.updateUI();
  }
  
  updateUI() {
    document.getElementById('waveDisplay').textContent = this.wave;
    document.getElementById('livesDisplay').textContent = this.lives;
    document.getElementById('goldDisplay').textContent = this.gold;
    document.getElementById('scoreDisplay').textContent = this.score;
    
    // Update tower affordability
    document.querySelectorAll('.tower-option').forEach(option => {
      const towerType = option.dataset.tower;
      const cost = this.towerTypes[towerType].cost;
      if (this.gold < cost) {
        option.classList.add('disabled');
      } else {
        option.classList.remove('disabled');
      }
    });
  }
  
  // Path Building Methods
  togglePathBuildingMode() {
    // Don't allow path building during an active game
    if (this.gameRunning) {
      this.showMessage('Cannot modify path during active game!', '#F44336');
      return;
    }
    
    this.pathBuildingMode = !this.pathBuildingMode;
    
    if (this.pathBuildingMode) {
      // Enable path building mode
      this.cancelPlacement();
      this.tempPath = [];
      this.isDrawingPath = false;
      this.canvas.style.cursor = 'crosshair';
      
      // Update button state
      document.getElementById('pathModeBtn').classList.add('active');
      document.getElementById('pathModeBtn').innerHTML = '<i class="fas fa-check me-1"></i>Finish Path';
      
      this.showMessage('Click to build your path! Start near the left edge and end near the right edge.', '#2196F3');
    } else {
      // Exit path building mode
      if (this.tempPath.length >= 2) {
        this.applyNewPath();
      }
      this.canvas.style.cursor = 'default';
      
      // Update button state
      document.getElementById('pathModeBtn').classList.remove('active');
      document.getElementById('pathModeBtn').innerHTML = '<i class="fas fa-route me-1"></i>Build Path';
      
      this.pathBuildingMode = false;
      this.tempPath = [];
    }
  }
  
  addPathPoint(x, y) {
    if (!this.pathBuildingMode) return;
    
    // Check if we should add this point
    if (this.tempPath.length === 0) {
      // First point
      this.tempPath.push({ x, y });
      this.showMessage('Great! Keep clicking to extend your path.', '#4CAF50');
    } else {
      // Check distance from last point
      const lastPoint = this.tempPath[this.tempPath.length - 1];
      const distance = Math.sqrt((x - lastPoint.x) ** 2 + (y - lastPoint.y) ** 2);
      
      if (distance >= this.minPathDistance) {
        this.tempPath.push({ x, y });
        
        // Provide feedback based on path length
        if (this.tempPath.length >= 2 && this.tempPath.length < 5) {
          this.showMessage(`Path has ${this.tempPath.length} points. Continue or finish!`, '#FF9800');
        } else if (this.tempPath.length >= 5) {
          this.showMessage('Nice path! You can finish building now.', '#4CAF50');
        }
      }
    }
  }
  
  applyNewPath() {
    if (this.tempPath.length >= 2) {
      // Validate path (should go roughly from left to right)
      const startX = this.tempPath[0].x;
      const endX = this.tempPath[this.tempPath.length - 1].x;
      
      if (endX > startX + 100) { // Path should progress from left to right
        this.path = [...this.tempPath];
        this.showMessage('New path applied! Start your first wave!', '#4CAF50');
      } else {
        this.showMessage('Path should go from left to right! Try again.', '#F44336');
        return false;
      }
    } else {
      this.showMessage('Path needs at least 2 points!', '#F44336');
      return false;
    }
    return true;
  }
  
  drawPathBuilding() {
    if (!this.pathBuildingMode) return;
    
    const ctx = this.ctx;
    
    // Draw temporary path
    if (this.tempPath.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#2196F3';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([10, 5]); // Dashed line to indicate it's temporary
      
      ctx.beginPath();
      ctx.moveTo(this.tempPath[0].x, this.tempPath[0].y);
      for (let i = 1; i < this.tempPath.length; i++) {
        ctx.lineTo(this.tempPath[i].x, this.tempPath[i].y);
      }
      ctx.stroke();
      
      // Draw path points
      this.tempPath.forEach((point, index) => {
        ctx.fillStyle = index === 0 ? '#4CAF50' : index === this.tempPath.length - 1 ? '#F44336' : '#2196F3';
        ctx.beginPath();
        ctx.arc(point.x, point.y, this.isMobile ? 12 : 8, 0, Math.PI * 2); // Larger touch targets on mobile
        ctx.fill();
        
        // Add labels
        ctx.fillStyle = '#FFFFFF';
        ctx.font = this.isMobile ? 'bold 10px Arial' : 'bold 12px Arial';
        ctx.textAlign = 'center';
        if (index === 0) {
          ctx.fillText('START', point.x, point.y - (this.isMobile ? 18 : 15));
        } else if (index === this.tempPath.length - 1) {
          ctx.fillText('END', point.x, point.y - (this.isMobile ? 18 : 15));
        }
      });
      
      ctx.restore();
    }
    
    // Draw helpful guides
    ctx.save();
    ctx.strokeStyle = 'rgba(76, 175, 80, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // Start area guide (adjusted for mobile)
    const guideWidth = this.isMobile ? 60 : 80;
    const guideMargin = this.isMobile ? 5 : 10;
    
    ctx.strokeRect(guideMargin, 50, guideWidth, this.canvas.height - 100);
    ctx.fillStyle = 'rgba(76, 175, 80, 0.1)';
    ctx.fillRect(guideMargin, 50, guideWidth, this.canvas.height - 100);
    
    // End area guide  
    ctx.strokeStyle = 'rgba(244, 67, 54, 0.3)';
    ctx.fillStyle = 'rgba(244, 67, 54, 0.1)';
    const endX = this.canvas.width - guideWidth - guideMargin;
    ctx.strokeRect(endX, 50, guideWidth, this.canvas.height - 100);
    ctx.fillRect(endX, 50, guideWidth, this.canvas.height - 100);
    
    // Labels (smaller on mobile)
    ctx.fillStyle = '#4CAF50';
    ctx.font = this.isMobile ? 'bold 10px Arial' : 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('START', guideMargin + guideWidth/2, this.canvas.height / 2);
    ctx.fillText('AREA', guideMargin + guideWidth/2, this.canvas.height / 2 + (this.isMobile ? 12 : 16));
    
    ctx.fillStyle = '#F44336';
    ctx.fillText('END', endX + guideWidth/2, this.canvas.height / 2);
    ctx.fillText('AREA', endX + guideWidth/2, this.canvas.height / 2 + (this.isMobile ? 12 : 16));
    
    // Mobile instructions overlay
    if (this.isMobile && this.tempPath.length === 0) {
      ctx.fillStyle = 'rgba(33, 150, 243, 0.9)';
      ctx.fillRect(20, 20, this.canvas.width - 40, 60);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('TAP TO BUILD PATH', this.canvas.width / 2, 40);
      ctx.fillText('Start in green area, end in red area', this.canvas.width / 2, 55);
    }
    
    ctx.restore();
  }
  
  gameLoop() {
    if (!this.gamePaused) {
      this.update();
    }
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }
  
  update() {
    if (!this.gameRunning) return;
    
    // Apply game speed to all updates
    for (let i = 0; i < this.gameSpeed; i++) {
      // Update enemies
      this.updateEnemies();
      
      // Update towers
      this.updateTowers();
      
      // Update projectiles
      this.updateProjectiles();
    }
    
    // Update particles (not affected by game speed)
    this.updateParticles();
    
    // Check wave completion
    if (this.enemies.length === 0 && this.gameRunning) {
      this.completeWave();
    }
    
    // Check game over
    if (this.lives <= 0) {
      this.gameOver();
    }
  }
  
  updateEnemies() {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      
      // Apply slow effects, freeze effects, etc.
      let actualSpeed = enemy.speed;
      if (enemy.slowEffect) {
        actualSpeed *= 0.5;
        enemy.slowEffect--;
        if (enemy.slowEffect <= 0) {
          delete enemy.slowEffect;
        }
      }
      
      // Move enemy along path
      if (enemy.pathIndex < this.path.length - 1) {
        const currentPoint = this.path[enemy.pathIndex];
        const nextPoint = this.path[enemy.pathIndex + 1];
        
        const dx = nextPoint.x - currentPoint.x;
        const dy = nextPoint.y - currentPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        enemy.progress += (actualSpeed * this.gameSpeed) / distance;
        
        if (enemy.progress >= 1) {
          enemy.pathIndex++;
          enemy.progress = 0;
        }
        
        // Update position
        enemy.x = currentPoint.x + dx * enemy.progress;
        enemy.y = currentPoint.y + dy * enemy.progress;
      } else {
        // Enemy reached the end
        this.lives--;
        this.enemies.splice(i, 1);
        this.showMessage('Enemy escaped!', '#F44336');
        this.updateUI();
        continue;
      }
      
      // Handle poison damage
      if (enemy.poisonEffect) {
        enemy.health -= enemy.poisonDamage;
        enemy.poisonEffect--;
        if (enemy.poisonEffect <= 0) {
          delete enemy.poisonEffect;
          delete enemy.poisonDamage;
        }
      }
      
      // Check trap collisions
      for (let tower of this.towers) {
        if (tower.isTrap && tower.remainingUses > 0) {
          const distance = Math.sqrt((enemy.x - tower.x) ** 2 + (enemy.y - tower.y) ** 2);
          if (distance < tower.range) {
            // Trigger trap
            enemy.health -= tower.damage;
            tower.remainingUses--;
            tower.triggered = true;
            
            this.createHitParticles(tower.x, tower.y);
            this.showMessage(`Trap activated! -${tower.damage} damage`, tower.color);
            
            // Remove trap if no uses left
            if (tower.remainingUses <= 0) {
              setTimeout(() => {
                const index = this.towers.indexOf(tower);
                if (index > -1) {
                  this.towers.splice(index, 1);
                }
              }, 500); // Small delay for visual effect
            }
            
            break; // One trap per enemy per frame
          }
        }
      }
      
      // Remove dead enemies
      if (enemy.health <= 0) {
        this.gold += enemy.reward;
        this.score += enemy.reward * 10;
        this.enemies.splice(i, 1);
        this.createDeathParticles(enemy.x, enemy.y);
        this.updateUI();
      }
    }
  }
  
  updateTowers() {
    for (let tower of this.towers) {
      tower.lastFired++;
      
      // Find target
      if (!tower.target || tower.target.health <= 0) {
        tower.target = this.findNearestEnemy(tower);
      }
      
      // Fire at target
      if (tower.target && tower.lastFired >= tower.fireRate) {
        const distance = Math.sqrt((tower.x - tower.target.x) ** 2 + (tower.y - tower.target.y) ** 2);
        if (distance <= tower.range) {
          this.fireProjectile(tower, tower.target);
          tower.lastFired = 0;
        }
      }
    }
  }
  
  findNearestEnemy(tower) {
    let nearest = null;
    let minDistance = Infinity;
    
    for (let enemy of this.enemies) {
      const distance = Math.sqrt((tower.x - enemy.x) ** 2 + (tower.y - enemy.y) ** 2);
      if (distance <= tower.range && distance < minDistance) {
        minDistance = distance;
        nearest = enemy;
      }
    }
    
    return nearest;
  }
  
  fireProjectile(tower, target) {
    const dx = target.x - tower.x;
    const dy = target.y - tower.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    this.projectiles.push({
      x: tower.x,
      y: tower.y,
      vx: (dx / distance) * tower.projectileSpeed,
      vy: (dy / distance) * tower.projectileSpeed,
      damage: tower.damage,
      color: tower.color,
      target: target,
      type: tower.type,
      towerRef: tower
    });
  }
  
  updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      
      projectile.x += projectile.vx * this.gameSpeed;
      projectile.y += projectile.vy * this.gameSpeed;
      
      // Check collision with target
      if (projectile.target && projectile.target.health > 0) {
        const distance = Math.sqrt((projectile.x - projectile.target.x) ** 2 + (projectile.y - projectile.target.y) ** 2);
        if (distance < 15) {
          this.handleProjectileHit(projectile);
          this.projectiles.splice(i, 1);
          continue;
        }
      }
      
      // Remove projectiles that are off screen
      if (projectile.x < 0 || projectile.x > this.canvas.width || 
          projectile.y < 0 || projectile.y > this.canvas.height) {
        this.projectiles.splice(i, 1);
      }
    }
  }
  
  handleProjectileHit(projectile) {
    const target = projectile.target;
    
    // Apply base damage
    target.health -= projectile.damage;
    this.createHitParticles(projectile.x, projectile.y);
    
    // Apply special effects based on tower type
    switch (projectile.type) {
      case 'freeze':
        target.slowEffect = 60; // 60 frames of slowness
        break;
        
      case 'poison':
        target.poisonEffect = 120; // 120 frames of poison
        target.poisonDamage = 2; // damage per frame
        break;
        
      case 'explosive':
        // Area damage
        this.createExplosion(projectile.x, projectile.y, projectile.damage * 0.6);
        break;
        
      case 'electric':
        // Chain lightning
        this.createChainLightning(projectile.x, projectile.y, projectile.damage * 0.7, target);
        break;
    }
  }
  
  createExplosion(x, y, damage) {
    const explosionRadius = 60;
    
    // Damage nearby enemies
    for (let enemy of this.enemies) {
      const distance = Math.sqrt((x - enemy.x) ** 2 + (y - enemy.y) ** 2);
      if (distance <= explosionRadius) {
        enemy.health -= damage * (1 - distance / explosionRadius);
      }
    }
    
    // Create explosion particles
    for (let i = 0; i < 15; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 30,
        maxLife: 30,
        alpha: 1,
        color: '#FF4444'
      });
    }
  }
  
  createChainLightning(x, y, damage, originalTarget) {
    const chainRange = 80;
    const maxChains = 3;
    let chainsUsed = 0;
    let currentX = x;
    let currentY = y;
    
    // Find nearby enemies to chain to
    for (let enemy of this.enemies) {
      if (enemy === originalTarget || chainsUsed >= maxChains) continue;
      
      const distance = Math.sqrt((currentX - enemy.x) ** 2 + (currentY - enemy.y) ** 2);
      if (distance <= chainRange) {
        enemy.health -= damage;
        this.createHitParticles(enemy.x, enemy.y);
        
        // Create lightning effect particles
        const steps = 10;
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const lx = currentX + (enemy.x - currentX) * t;
          const ly = currentY + (enemy.y - currentY) * t;
          
          this.particles.push({
            x: lx + (Math.random() - 0.5) * 10,
            y: ly + (Math.random() - 0.5) * 10,
            vx: 0,
            vy: 0,
            life: 15,
            maxLife: 15,
            alpha: 1,
            color: '#FFFF00'
          });
        }
        
        currentX = enemy.x;
        currentY = enemy.y;
        chainsUsed++;
        damage *= 0.8; // Reduce damage for each chain
      }
    }
  }
  
  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;
      particle.alpha = particle.life / particle.maxLife;
      
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  createHitParticles(x, y) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 20,
        maxLife: 20,
        alpha: 1,
        color: '#FFD700'
      });
    }
  }
  
  createDeathParticles(x, y) {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        life: 30,
        maxLife: 30,
        alpha: 1,
        color: '#FF6B6B'
      });
    }
  }
  
  completeWave() {
    this.gameRunning = false;
    this.wave++;
    this.gold += 20;
    this.score += 100 * this.wave;
    
    document.getElementById('startWaveBtn').disabled = false;
    document.getElementById('startWaveBtn').innerHTML = `<i class="fas fa-play me-2"></i>Start Wave ${this.wave}`;
    
    this.updateUI();
  }
  
  gameOver() {
    this.gameRunning = false;
    alert(`Game Over! Final Score: ${this.score}`);
    this.resetGame();
  }
  
  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw path
    this.drawPath();
    
    // Draw towers
    this.drawTowers();
    
    // Draw enemies
    this.drawEnemies();
    
    // Draw projectiles
    this.drawProjectiles();
    
    // Draw particles
    this.drawParticles();
    
    // Draw placement preview
    if (this.placementMode && this.selectedTower) {
      this.drawPlacementPreview();
    }
    
    // Draw path building
    this.drawPathBuilding();
  }
  
  drawPath() {
    // Draw path shadow first
    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.lineWidth = 35;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.path[0].x + 2, this.path[0].y + 2);
    for (let i = 1; i < this.path.length; i++) {
      this.ctx.lineTo(this.path[i].x + 2, this.path[i].y + 2);
    }
    this.ctx.stroke();
    this.ctx.restore();
    
    // Draw main path
    this.ctx.strokeStyle = '#555';
    this.ctx.lineWidth = 30;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.path[0].x, this.path[0].y);
    for (let i = 1; i < this.path.length; i++) {
      this.ctx.lineTo(this.path[i].x, this.path[i].y);
    }
    this.ctx.stroke();
    
    // Draw path center line
    this.ctx.strokeStyle = '#777';
    this.ctx.lineWidth = 4;
    this.ctx.setLineDash([10, 10]);
    
    this.ctx.beginPath();
    this.ctx.moveTo(this.path[0].x, this.path[0].y);
    for (let i = 1; i < this.path.length; i++) {
      this.ctx.lineTo(this.path[i].x, this.path[i].y);
    }
    this.ctx.stroke();
    this.ctx.setLineDash([]); // Reset line dash
    
    // Draw start and end markers
    // Start marker (green)
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.beginPath();
    this.ctx.arc(this.path[0].x, this.path[0].y, 20, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#FFF';
    this.ctx.font = 'bold 14px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('START', this.path[0].x, this.path[0].y + 4);
    
    // End marker (red)
    const endPoint = this.path[this.path.length - 1];
    this.ctx.fillStyle = '#F44336';
    this.ctx.beginPath();
    this.ctx.arc(endPoint.x, endPoint.y, 20, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#FFF';
    this.ctx.fillText('END', endPoint.x, endPoint.y + 4);
  }
  
  drawTowers() {
    for (let tower of this.towers) {
      // Draw range for selected tower
      if (this.selectedExistingTower === tower) {
        this.ctx.save();
        this.ctx.strokeStyle = tower.color + '40';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.restore();
      }
      
      // Draw tower/trap differently
      if (tower.isTrap) {
        // Draw trap shadow
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.translate(tower.x + 2, tower.y + 2);
        this.ctx.rotate(Math.PI / 4);
        this.ctx.fillRect(-7, -7, 14, 14);
        this.ctx.restore();
        
        // Draw trap as a square/diamond
        const size = 12;
        this.ctx.fillStyle = tower.remainingUses > 0 ? tower.color : '#666';
        this.ctx.save();
        this.ctx.translate(tower.x, tower.y);
        this.ctx.rotate(Math.PI / 4);
        this.ctx.fillRect(-size/2, -size/2, size, size);
        this.ctx.restore();
        
        // Draw trap border with glow effect
        this.ctx.save();
        this.ctx.strokeStyle = this.selectedExistingTower === tower ? '#FFD700' : '#333';
        this.ctx.lineWidth = this.selectedExistingTower === tower ? 3 : 2;
        if (this.selectedExistingTower === tower) {
          this.ctx.shadowBlur = 10;
          this.ctx.shadowColor = '#FFD700';
        }
        this.ctx.translate(tower.x, tower.y);
        this.ctx.rotate(Math.PI / 4);
        this.ctx.strokeRect(-size/2, -size/2, size, size);
        this.ctx.restore();
        
        // Show remaining uses
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(tower.remainingUses.toString(), tower.x, tower.y + 3);
      } else {
        // Draw tower shadow
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(tower.x + 3, tower.y + 3, 15, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        // Draw regular tower as circle with gradient
        const gradient = this.ctx.createRadialGradient(tower.x - 5, tower.y - 5, 0, tower.x, tower.y, 15);
        gradient.addColorStop(0, tower.color);
        gradient.addColorStop(1, this.darkenColor(tower.color, 0.3));
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(tower.x, tower.y, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Highlight selected tower with glow
        this.ctx.save();
        this.ctx.strokeStyle = this.selectedExistingTower === tower ? '#FFD700' : '#333';
        this.ctx.lineWidth = this.selectedExistingTower === tower ? 3 : 2;
        if (this.selectedExistingTower === tower) {
          this.ctx.shadowBlur = 15;
          this.ctx.shadowColor = '#FFD700';
        }
        this.ctx.stroke();
        this.ctx.restore();
        
        // Draw tower type indicator with better styling
        this.ctx.save();
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        const typeChar = tower.type.charAt(0).toUpperCase();
        this.ctx.strokeText(typeChar, tower.x, tower.y + 4);
        this.ctx.fillText(typeChar, tower.x, tower.y + 4);
        this.ctx.restore();
        
        // Draw firing indicator with enhanced visuals
        if (tower.target && tower.lastFired < 10) {
          this.ctx.save();
          this.ctx.strokeStyle = tower.color;
          this.ctx.lineWidth = 4;
          this.ctx.shadowBlur = 8;
          this.ctx.shadowColor = tower.color;
          this.ctx.beginPath();
          this.ctx.moveTo(tower.x, tower.y);
          this.ctx.lineTo(tower.target.x, tower.target.y);
          this.ctx.stroke();
          this.ctx.restore();
        }
      }
    }
  }
  
  // Helper function to darken colors
  darkenColor(color, factor) {
    // Simple color darkening - works with hex colors
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - factor));
    const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - factor));
    const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - factor));
    return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
  }
  
  drawEnemies() {
    for (let enemy of this.enemies) {
      // Draw enemy
      this.ctx.fillStyle = enemy.color;
      this.ctx.beginPath();
      this.ctx.arc(enemy.x, enemy.y, enemy.size || 12, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.strokeStyle = '#333';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      // Draw health bar
      const barWidth = (enemy.size || 12) * 1.8;
      const barHeight = 4;
      const healthPercent = enemy.health / enemy.maxHealth;
      
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(enemy.x - barWidth/2, enemy.y - (enemy.size || 12) - 12, barWidth, barHeight);
      
      this.ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : healthPercent > 0.25 ? '#FF9800' : '#F44336';
      this.ctx.fillRect(enemy.x - barWidth/2, enemy.y - (enemy.size || 12) - 12, barWidth * healthPercent, barHeight);
      
      // Draw enemy type indicator
      if (enemy.type && enemy.type !== 'Basic') {
        this.ctx.fillStyle = '#FFF';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(enemy.type.charAt(0), enemy.x, enemy.y + 3);
      }
    }
  }
  
  drawProjectiles() {
    for (let projectile of this.projectiles) {
      this.ctx.fillStyle = projectile.color;
      this.ctx.beginPath();
      this.ctx.arc(projectile.x, projectile.y, 4, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  drawParticles() {
    for (let particle of this.particles) {
      this.ctx.save();
      this.ctx.globalAlpha = particle.alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }
  
  drawPlacementPreview() {
    if (this.mouseX && this.mouseY) {
      const towerData = this.towerTypes[this.selectedTower];
      const isValid = this.isValidTowerPosition(this.mouseX, this.mouseY);
      
      // Draw range circle
      this.ctx.strokeStyle = isValid ? towerData.color + '40' : '#FF000040';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(this.mouseX, this.mouseY, towerData.range, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Draw tower preview
      this.ctx.fillStyle = isValid ? towerData.color + '80' : '#FF000080';
      this.ctx.beginPath();
      this.ctx.arc(this.mouseX, this.mouseY, 15, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.strokeStyle = isValid ? '#333' : '#FF0000';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }
  
  showMessage(message, color = '#4CAF50') {
    // Create a temporary message element
    const messageDiv = document.createElement('div');
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.background = color;
    messageDiv.style.color = 'white';
    messageDiv.style.padding = '10px 20px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.zIndex = '1000';
    messageDiv.style.fontSize = '16px';
    messageDiv.style.fontWeight = 'bold';
    messageDiv.style.animation = 'fadeInOut 2s ease-in-out';
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
      document.body.removeChild(messageDiv);
    }, 2000);
  }
  
  createPlacementParticles(x, y) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 25,
        maxLife: 25,
        alpha: 1,
        color: '#4CAF50'
      });
    }
  }
  
  getTowerAt(x, y) {
    for (let tower of this.towers) {
      const distance = Math.sqrt((x - tower.x) ** 2 + (y - tower.y) ** 2);
      if (distance <= 15) {
        return tower;
      }
    }
    return null;
  }
  
  selectExistingTower(tower) {
    this.selectedExistingTower = tower;
    this.cancelPlacement(); // Cancel any placement mode
  }
  
  deselectTower() {
    this.selectedExistingTower = null;
  }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
  new PathGuardGame();
});
