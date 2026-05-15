/**
 * Sound Manager Module
 * Handles all audio playback for the wheel system
 */

class SoundManager {
  constructor(config = {}) {
    this.config = {
      tickSoundPath: 'sounds/thick.mp3',
      tickVolume: 0.3,
      speedThreshold: 0.01,
      preloadOnInit: true,
      ...config,
    };

    this.audioElement = null;
    this.isLoaded = false;
    this.lastTickTime = 0;
    this.tickCooldown = 50; // Minimum ms between ticks to prevent overlap

    if (this.config.preloadOnInit) {
      this.initialize();
    }
  }

  /**
   * Initialize audio element and load sound file
   */
  initialize() {
    try {
      this.audioElement = new Audio();
      this.audioElement.src = this.config.tickSoundPath;
      this.audioElement.volume = this.config.tickVolume;
      this.audioElement.preload = 'auto';

      // Mark as loaded when ready
      this.audioElement.addEventListener('canplaythrough', () => {
        this.isLoaded = true;
        if (WHEEL_CONFIG.debug.enabled) {
          console.log('✓ Sound loaded:', this.config.tickSoundPath);
        }
      }, { once: true });

      // Error handling
      this.audioElement.addEventListener('error', (e) => {
        console.warn('⚠ Failed to load sound:', this.config.tickSoundPath, e);
        this.isLoaded = false;
      });

    } catch (error) {
      console.warn('⚠ SoundManager initialization failed:', error);
      this.isLoaded = false;
    }
  }

  /**
   * Play a tick sound
   * Uses cooldown to prevent audio overlap and spam
   */
  playTick() {
    if (!this.isLoaded || !this.audioElement) {
      return;
    }

    // Enforce cooldown to prevent overlapping sounds
    const now = performance.now();
    if (now - this.lastTickTime < this.tickCooldown) {
      return;
    }

    try {
      // Reset audio to start for rapid-fire playback
      this.audioElement.currentTime = 0;
      
      // Attempt to play - may fail due to browser autoplay policy
      const playPromise = this.audioElement.play();
      if (playPromise) {
        playPromise.catch((error) => {
          // Autoplay policy or other browser restriction
          if (WHEEL_CONFIG.debug.enabled) {
            console.debug('Audio playback prevented:', error);
          }
        });
      }

      this.lastTickTime = now;
    } catch (error) {
      console.warn('⚠ Error playing tick sound:', error);
    }
  }

  /**
   * Stop all audio playback
   */
  stopAll() {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch (error) {
        console.warn('⚠ Error stopping audio:', error);
      }
    }
    this.lastTickTime = 0;
  }

  /**
   * Set volume for tick sounds
   * @param {number} volume - Volume level (0-1)
   */
  setVolume(volume) {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume));
      this.config.tickVolume = this.audioElement.volume;
    }
  }

  /**
   * Get current volume
   */
  getVolume() {
    return this.audioElement ? this.audioElement.volume : 0;
  }

  /**
   * Check if audio is ready to play
   */
  isReady() {
    return this.isLoaded && this.audioElement !== null;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopAll();
    if (this.audioElement) {
      this.audioElement.src = '';
      this.audioElement = null;
    }
    this.isLoaded = false;
  }
}

// Global instance for wheel system
let globalSoundManager = null;

/**
 * Get or create global sound manager
 */
function getSoundManager(config = null) {
  if (!globalSoundManager) {
    globalSoundManager = new SoundManager(config || WHEEL_CONFIG.audio);
  }
  return globalSoundManager;
}
