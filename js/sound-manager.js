// Sound Manager for Web Browser Games
// Handles sound effects using Web Audio API for immediate use

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.masterVolume = 0.5;
    this.soundsEnabled = true;
    this.initialized = false;
    
    // Load volume setting from localStorage
    const savedVolume = localStorage.getItem('gameVolume');
    if (savedVolume !== null) {
      this.masterVolume = parseFloat(savedVolume);
    }
    
    // Load sound setting from localStorage
    const savedSoundsEnabled = localStorage.getItem('soundsEnabled');
    if (savedSoundsEnabled !== null) {
      this.soundsEnabled = savedSoundsEnabled === 'true';
    }
  }

  async init() {
    if (this.initialized) return;
    
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create gain node for master volume
      this.masterGainNode = this.audioContext.createGain();
      this.masterGainNode.connect(this.audioContext.destination);
      this.masterGainNode.gain.value = this.masterVolume;
      
      // Generate sounds programmatically
      this.generateSounds();
      
      this.initialized = true;
      console.log('Sound Manager initialized');
    } catch (error) {
      console.warn('Could not initialize audio:', error);
      this.soundsEnabled = false;
    }
  }

  generateSounds() {
    // Memory game sounds - removed buttonHover to avoid disrupting game rhythm
    this.sounds.wrongClick = this.createTone(200, 0.3, 'square', 0.5);
    this.sounds.levelComplete = this.createChord([523, 659, 784], 0.5, 'sine', 0.4);
    this.sounds.gameOver = this.createDescendingTone(400, 200, 0.8, 'triangle', 0.5);
    this.sounds.countdown = this.createTone(440, 0.2, 'square', 0.3);
    this.sounds.gameStart = this.createAscendingTone(200, 400, 0.6, 'sine', 0.4);
    this.sounds.cashOut = this.createChord([523, 659, 784, 988], 0.8, 'sine', 0.5);
    this.sounds.riskReward = this.createTone(660, 0.4, 'triangle', 0.4);
    
    // Color-specific sounds for buttons
    this.sounds.red = this.createTone(523, 0.15, 'sine', 0.3);      // C5 - Red square
    this.sounds.blue = this.createTone(659, 0.15, 'sine', 0.3);     // E5 - Blue circle  
    this.sounds.green = this.createTone(784, 0.15, 'sine', 0.3);    // G5 - Green star
    this.sounds.yellow = this.createTone(988, 0.15, 'sine', 0.3);   // B5 - Yellow diamond
    
    // Sequence showing sounds (same as button colors but quieter)
    this.sounds.sequenceRed = this.createTone(523, 0.08, 'sine', 0.2);
    this.sounds.sequenceBlue = this.createTone(659, 0.08, 'sine', 0.2);
    this.sounds.sequenceGreen = this.createTone(784, 0.08, 'sine', 0.2);
    this.sounds.sequenceYellow = this.createTone(988, 0.08, 'sine', 0.2);
  }

  createTone(frequency, duration, waveType = 'sine', volume = 0.3) {
    return () => {
      if (!this.soundsEnabled || !this.initialized) return;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGainNode);
      
      oscillator.frequency.value = frequency;
      oscillator.type = waveType;
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    };
  }

  createChord(frequencies, duration, waveType = 'sine', volume = 0.3) {
    return () => {
      if (!this.soundsEnabled || !this.initialized) return;
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(this.masterGainNode);
          
          oscillator.frequency.value = freq;
          oscillator.type = waveType;
          
          const adjustedVolume = volume / frequencies.length; // Reduce volume for chords
          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(adjustedVolume, this.audioContext.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
          
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + duration);
        }, index * 50); // Slight delay between chord notes
      });
    };
  }

  createAscendingTone(startFreq, endFreq, duration, waveType = 'sine', volume = 0.3) {
    return () => {
      if (!this.soundsEnabled || !this.initialized) return;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGainNode);
      
      oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
      oscillator.frequency.linearRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);
      oscillator.type = waveType;
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    };
  }

  createDescendingTone(startFreq, endFreq, duration, waveType = 'triangle', volume = 0.3) {
    return () => {
      if (!this.soundsEnabled || !this.initialized) return;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGainNode);
      
      oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);
      oscillator.type = waveType;
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    };
  }

  // Play a specific sound
  play(soundName) {
    if (!this.soundsEnabled || !this.initialized) return;
    
    if (this.sounds[soundName]) {
      // Resume audio context if it's suspended (required by browser policies)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      this.sounds[soundName]();
    } else {
      console.warn(`Sound "${soundName}" not found`);
    }
  }

  // Set master volume (0-1)
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.masterVolume;
    }
    localStorage.setItem('gameVolume', this.masterVolume.toString());
  }

  // Get current volume
  getVolume() {
    return this.masterVolume;
  }

  // Toggle sounds on/off
  toggleSounds() {
    this.soundsEnabled = !this.soundsEnabled;
    localStorage.setItem('soundsEnabled', this.soundsEnabled.toString());
    return this.soundsEnabled;
  }

  // Check if sounds are enabled
  isSoundsEnabled() {
    return this.soundsEnabled;
  }

  // Enable sounds
  enableSounds() {
    this.soundsEnabled = true;
    localStorage.setItem('soundsEnabled', 'true');
  }

  // Disable sounds
  disableSounds() {
    this.soundsEnabled = false;
    localStorage.setItem('soundsEnabled', 'false');
  }
}

// Export for use in other scripts
window.SoundManager = SoundManager;
