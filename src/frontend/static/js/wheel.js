/**
 * Wheel Engine - Core spinning wheel system with probability weighting
 * 
 * Features:
 * - Weight-based probability system (slice size matches selection probability)
 * - Deterministic spin targeting with mathematical precision
 * - Sound effect integration (tick sounds on segment boundaries)
 * - Physics simulation (velocity + friction model)
 * - Comprehensive error handling and edge case management
 * 
 * @module wheel-engine
 */

/**
 * Represents a wheel entry with weighted probability
 * @class WeightedEntry
 */
class WeightedEntry {
  /**
   * @param {string} name - Display name for the wheel entry
   * @param {number} weight - Probability weight (default: 1)
   */
  constructor(name, weight = 1) {
    this.name = String(name);
    this.weight = Math.max(0.001, Number(weight) || 1); // Prevent zero/negative weights
  }

  /**
   * Validate entry
   */
  isValid() {
    return this.name && this.name.trim().length > 0 && this.weight > 0;
  }
}

/**
 * Main wheel engine class - handles all spinning wheel logic
 * @class WheelEngine
 */
class WheelEngine {
  /**
   * Create a wheel engine instance
   * @param {HTMLCanvasElement} canvas - Canvas element for rendering
   * @param {Object} config - Configuration override (uses WHEEL_CONFIG as base)
   */
  constructor(canvas, config = {}) {
    if (!canvas) {
      throw new Error('Canvas element required for WheelEngine');
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.config = { ...WHEEL_CONFIG, ...config };

    // Entries and probability tracking
    this.entries = [];
    this.sliceAngles = [];      // Array of slice angles in radians
    this.cumulativeAngles = []; // Cumulative start angles for each slice

    // Rotation state
    this.rotation = 0;          // Current wheel rotation in radians
    this.targetRotation = 0;    // Target rotation for animation
    this.lastRotation = 0;      // Previous frame rotation (for speed calculation)

    // Spin state
    this.spinInProgress = false;
    this.spinVelocity = 0;      // Angular velocity in radians/frame
    this.spinStartTime = 0;
    this.spinDuration = 0;
    this.spinStartRotation = 0;
    this.animationFrameId = null;

    // Audio
    this.soundManager = getSoundManager(this.config.audio);
    this.lastPlayedSlice = -1;  // Track which slice we were on to detect boundary crossings

    // Debug
    this.debugMode = this.config.debug.enabled;
  }

  /**
   * Update wheel entries with weighted probability
   * @param {Array<WeightedEntry|string|{name:string, weight:number}>} newEntries
   */
  updateEntries(newEntries) {
    if (!Array.isArray(newEntries) || newEntries.length === 0) {
      console.warn('⚠ updateEntries: empty or invalid entries array');
      this.entries = [];
      return;
    }

    // Convert to WeightedEntry objects
    this.entries = newEntries.map(entry => {
      if (entry instanceof WeightedEntry) {
        return entry;
      } else if (typeof entry === 'string') {
        return new WeightedEntry(entry, 1);
      } else if (typeof entry === 'object' && entry.name) {
        return new WeightedEntry(entry.name, entry.weight || 1);
      } else {
        throw new Error(`Invalid entry format: ${JSON.stringify(entry)}`);
      }
    });

    // Calculate slice angles based on weights
    this.calculateSliceAngles();

    if (this.debugMode) {
      console.log('✓ Entries updated:', this.entries.length, 'entries');
      this.logSliceAngles();
    }
  }

  /**
   * Calculate slice angles based on entry weights
   * 
   * Algorithm:
   * 1. Sum all weights to get total
   * 2. For each entry: angle = (weight / totalWeight) * 2π
   * 3. Build cumulative angles array for quick lookup
   * 
   * @private
   */
  calculateSliceAngles() {
    if (this.entries.length === 0) {
      this.sliceAngles = [];
      this.cumulativeAngles = [];
      return;
    }

    const tau = Math.PI * 2;
    const totalWeight = this.entries.reduce((sum, e) => sum + e.weight, 0);

    this.sliceAngles = this.entries.map(entry => {
      return (entry.weight / totalWeight) * tau;
    });

    // Build cumulative angles for slice lookup
    this.cumulativeAngles = [0];
    for (let i = 0; i < this.sliceAngles.length - 1; i++) {
      this.cumulativeAngles.push(
        this.cumulativeAngles[i] + this.sliceAngles[i]
      );
    }
  }

  /**
   * Get slice index at a specific angle (pointer is always at 0°)
   * 
   * @param {number} angle - Angle in radians
   * @returns {number} Slice index (0 to entries.length - 1)
   * @private
   */
  findSliceAtAngle(angle) {
    if (this.entries.length === 0) return -1;
    if (this.entries.length === 1) return 0;

    // Normalize angle to [0, 2π)
    const normalizedAngle = this.normalizeAngle(angle);

    // Find which slice contains this angle
    for (let i = 0; i < this.cumulativeAngles.length; i++) {
      const currentStart = this.cumulativeAngles[i];
      const currentEnd = this.cumulativeAngles[i] + this.sliceAngles[i];

      // Handle wrap-around at 2π boundary
      if (i === this.cumulativeAngles.length - 1) {
        // Last slice wraps to 0
        if (normalizedAngle >= currentStart || normalizedAngle < this.config.precision.angleEpsilon) {
          return i;
        }
      } else {
        if (normalizedAngle >= currentStart && normalizedAngle < currentEnd - this.config.precision.angleEpsilon) {
          return i;
        }
      }
    }

    return 0; // Fallback to first slice
  }

  /**
   * Get current winner based on pointer position and rotation
   * Pointer is fixed at top (0°), wheel rotates
   * 
   * @returns {number} Index of winning entry
   */
  getWinnerIndex() {
    const pointerAngle = 0; // Pointer always at top
    const sliceIndex = this.findSliceAtAngle(this.normalizeAngle(pointerAngle - this.rotation));

    if (this.debugMode) {
      console.log(`🎯 Winner index: ${sliceIndex}, rotation: ${this.rotation.toFixed(4)} rad`);
    }

    return sliceIndex;
  }

  /**
   * Get current winner entry
   * @returns {WeightedEntry|null}
   */
  getWinner() {
    const index = this.getWinnerIndex();
    return index >= 0 && index < this.entries.length ? this.entries[index] : null;
  }

  /**
   * Select a random winner based on weights and calculate target rotation
   * 
   * @private
   * @returns {Object} {winnerIndex, targetRotation}
   */
  selectWeightedWinner() {
    if (this.entries.length === 0) {
      return { winnerIndex: -1, targetRotation: 0 };
    }

    if (this.entries.length === 1) {
      return {
        winnerIndex: 0,
        targetRotation: -(this.cumulativeAngles[0] + this.sliceAngles[0] / 2),
      };
    }

    // Generate random angle in [0, 2π)
    const randomAngle = secureRandom() * Math.PI * 2;

    // Find which slice this angle falls into
    const winnerIndex = this.findSliceAtAngle(randomAngle);

    // Calculate target rotation to land pointer at CENTER of winning slice
    const sliceCenter = this.cumulativeAngles[winnerIndex] + this.sliceAngles[winnerIndex] / 2;
    const targetRotation = -sliceCenter;

    if (this.debugMode) {
      console.log(`🎲 Selected winner #${winnerIndex} (${this.entries[winnerIndex].name})`);
      console.log(`   Slice center: ${sliceCenter.toFixed(4)}, Target rotation: ${targetRotation.toFixed(4)}`);
    }

    return { winnerIndex, targetRotation };
  }

  /**
   * Animate wheel spin
   * 
   * Uses easeOutCubic for smooth deceleration
   * Automatically detects segment boundaries and plays tick sounds
   * 
   * @private
   */
  animateSpin() {
    const now = performance.now();
    const elapsed = now - this.spinStartTime;
    const progress = Math.min(elapsed / this.spinDuration, 1);

    // Apply easing function
    const easedProgress = this.config.easing.fn(progress);

    // Calculate current rotation
    this.rotation = this.spinStartRotation + (this.targetRotation - this.spinStartRotation) * easedProgress;

    // Detect segment boundary crossings for sound effects
    this.updateAudioFeedback();

    // Draw wheel at current rotation
    this.draw();

    if (progress < 1) {
      this.animationFrameId = requestAnimationFrame(() => this.animateSpin());
    } else {
      // Animation complete - snap to exact target if needed
      this.finalizeRotation();
      this.spinInProgress = false;
      this.animationFrameId = null;
    }
  }

  /**
   * Check for segment boundary crossings and play sound
   * @private
   */
  updateAudioFeedback() {
    const currentSlice = this.findSliceAtAngle(this.normalizeAngle(-this.rotation));
    const wheelSpeed = Math.abs(this.rotation - this.lastRotation);

    // Play tick if we crossed a boundary and wheel is moving
    if (currentSlice !== this.lastPlayedSlice && wheelSpeed > this.config.audio.speedThreshold) {
      this.soundManager.playTick();
      this.lastPlayedSlice = currentSlice;
    }

    this.lastRotation = this.rotation;
  }

  /**
   * Finalize rotation after animation ends
   * Snap to exact target if drift is significant
   * @private
   */
  finalizeRotation() {
    const drift = Math.abs(this.rotation - this.targetRotation);

    if (drift > this.config.precision.snapThreshold) {
      if (this.debugMode) {
        console.log(`📌 Snapping rotation (drift: ${drift.toFixed(6)})`);
      }
      this.rotation = this.targetRotation;
    }

    // Normalize to [0, 2π) for consistency
    this.rotation = this.normalizeAngle(this.rotation);
    this.lastRotation = this.rotation;
  }

  /**
   * Start spin animation
   * 
   * @returns {Promise<WeightedEntry>} Promise resolves when spin completes with winner
   */
  spin() {
    return new Promise((resolve) => {
      // Prevent concurrent spins
      if (this.spinInProgress || this.entries.length < 1) {
        resolve(null);
        return;
      }

      this.spinInProgress = true;
      this.soundManager.stopAll();
      this.lastPlayedSlice = -1;

      // Select random winner and calculate target
      const { winnerIndex, targetRotation } = this.selectWeightedWinner();

      if (winnerIndex < 0) {
        this.spinInProgress = false;
        resolve(null);
        return;
      }

      // Calculate spin duration with slight randomness
      this.spinDuration = 
        this.config.physics.baseSpinDuration +
        secureRandomInt(this.config.physics.randomSpinVariance);

      // Add extra rotations before stopping
      const extraTurns = 
        this.config.physics.minExtraTurns +
        secureRandomInt(this.config.physics.maxExtraTurns);

      const tau = Math.PI * 2;
      this.spinStartRotation = this.normalizeAngle(this.rotation);
      
      // Calculate total rotation: extra full rotations + target offset
      const normalizedTarget = this.normalizeAngle(targetRotation);
      let delta = normalizedTarget - this.spinStartRotation;
      if (delta < 0) delta += tau;

      this.targetRotation = this.spinStartRotation + extraTurns * tau + delta;

      this.spinStartTime = performance.now();

      if (this.debugMode) {
        console.log(`🎪 Spin started:`);
        console.log(`   Duration: ${this.spinDuration}ms`);
        console.log(`   Extra turns: ${extraTurns}`);
        console.log(`   Target rotation: ${this.targetRotation.toFixed(4)} rad`);
      }

      // Start animation loop
      this.animationFrameId = requestAnimationFrame(() => this.animateSpin());

      // Return winner after animation completes
      setTimeout(() => {
        const winner = this.getWinner();
        resolve(winner);
      }, this.spinDuration + 50);
    });
  }

  /**
   * Draw wheel on canvas
   */
  draw() {
    const { width, height } = this.canvas;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 * this.config.rendering.radiusMultiplier;

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    if (this.entries.length === 0) {
      this.drawEmptyWheel(cx, cy, radius);
      return;
    }

    // Draw each slice
    for (let i = 0; i < this.entries.length; i++) {
      this.drawSlice(i, cx, cy, radius);
    }

    // Draw center circle
    this.drawCenterCircle(cx, cy);

    // Debug visualization
    if (this.debugMode && this.config.debug.drawPointerIndicator) {
      this.drawDebugPointer(cx, cy, radius);
    }
  }

  /**
   * Draw a single wheel slice
   * @private
   */
  drawSlice(index, cx, cy, radius) {
    const sliceStart = this.cumulativeAngles[index] + this.rotation;
    const sliceEnd = sliceStart + this.sliceAngles[index];

    // Create gradient from center
    const gradient = this.ctx.createLinearGradient(
      cx,
      cy,
      cx + Math.cos(sliceStart + this.sliceAngles[index] / 2) * radius,
      cy + Math.sin(sliceStart + this.sliceAngles[index] / 2) * radius
    );

    const baseColor = this.config.colors[index % this.config.colors.length];
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(1, this.adjustBrightness(baseColor, this.config.sliceStyle.brightnessAdjustment));

    // Draw slice
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy);
    this.ctx.arc(cx, cy, radius, sliceStart, sliceEnd);
    this.ctx.closePath();
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    // Draw inner border
    this.ctx.strokeStyle = this.config.sliceStyle.borderColor;
    this.ctx.lineWidth = this.config.sliceStyle.borderWidth;
    this.ctx.stroke();

    // Draw outer arc border
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, sliceStart, sliceEnd);
    this.ctx.strokeStyle = this.config.sliceStyle.outerBorderColor;
    this.ctx.lineWidth = this.config.sliceStyle.outerBorderWidth;
    this.ctx.stroke();

    // Draw text
    this.drawSliceText(index, cx, cy, radius, sliceStart);
  }

  /**
   * Draw text for a wheel slice
   * @private
   */
  drawSliceText(index, cx, cy, radius, sliceStart) {
    const sliceMid = sliceStart + this.sliceAngles[index] / 2;
    const textRadius = radius - this.config.rendering.textRadiusOffset;

    this.ctx.save();
    this.ctx.translate(cx, cy);
    this.ctx.rotate(sliceMid);
    this.ctx.textAlign = this.config.textStyle.alignment;
    this.ctx.textBaseline = this.config.textStyle.baseline;
    this.ctx.font = `bold ${this.config.rendering.fontSize}px ${this.config.rendering.fontFamily}`;

    const text = this.entries[index].name;

    // Draw shadow/outline
    this.ctx.fillStyle = this.config.textStyle.shadowColor;
    this.ctx.fillText(text, textRadius + this.config.rendering.textOutlineOffset, this.config.rendering.textOutlineOffset);

    // Draw main text
    this.ctx.fillStyle = this.config.textStyle.mainColor;
    this.ctx.fillText(text, textRadius, 0);

    this.ctx.restore();
  }

  /**
   * Draw center circle (golden hub)
   * @private
   */
  drawCenterCircle(cx, cy) {
    const radius = this.config.rendering.centerRadius;

    // Main circle
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.config.centerCircle.fillColor;
    this.ctx.fill();
    this.ctx.strokeStyle = this.config.centerCircle.strokeColor;
    this.ctx.lineWidth = this.config.centerCircle.strokeWidth;
    this.ctx.stroke();

    // Glow effect
    const glowGradient = this.ctx.createRadialGradient(cx, cy, radius - 10, cx, cy, radius + 10);
    glowGradient.addColorStop(0, `rgba(245, 158, 11, 0.2)`);
    glowGradient.addColorStop(1, `rgba(245, 158, 11, 0)`);
    this.ctx.fillStyle = glowGradient;
    this.ctx.fill();
  }

  /**
   * Draw empty wheel message
   * @private
   */
  drawEmptyWheel(cx, cy, radius) {
    this.ctx.fillStyle = '#1f2937';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 42px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('Aucune entrée', cx, cy);
  }

  /**
   * Draw debug pointer indicator
   * @private
   */
  drawDebugPointer(cx, cy, radius) {
    const pointerLength = 40;
    this.ctx.strokeStyle = '#ff00ff';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - radius);
    this.ctx.lineTo(cx, cy - radius - pointerLength);
    this.ctx.stroke();

    // Label
    this.ctx.fillStyle = '#ff00ff';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('POINTER', cx, cy - radius - pointerLength - 10);
  }

  /**
   * Normalize angle to [0, 2π)
   * 
   * @param {number} angle - Angle in radians
   * @returns {number} Normalized angle in [0, 2π)
   */
  normalizeAngle(angle) {
    const tau = Math.PI * 2;
    return ((angle % tau) + tau) % tau;
  }

  /**
   * Adjust color brightness
   * Used for slice gradient shading
   * 
   * @param {string} color - Hex color (e.g., '#ff0000')
   * @param {number} percent - Brightness adjustment (-1 to 1)
   * @returns {string} Adjusted hex color
   * @private
   */
  adjustBrightness(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amt));
    const B = Math.max(0, Math.min(255, (num & 0xff) + amt));
    return '#' + [R, G, B].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Stop any ongoing spin
   */
  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.spinInProgress = false;
    this.soundManager.stopAll();
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stop();
    if (this.soundManager) {
      this.soundManager.destroy();
    }
  }

  /**
   * Log slice angles for debugging
   * @private
   */
  logSliceAngles() {
    const tau = Math.PI * 2;
    console.log('📊 Slice angles:');
    this.sliceAngles.forEach((angle, i) => {
      const percent = (angle / tau) * 100;
      console.log(`   [${i}] ${this.entries[i].name}: ${angle.toFixed(4)} rad (${percent.toFixed(1)}%)`);
    });
  }
}

// ============================================================================
// HELPER FUNCTIONS (Global scope for backward compatibility)
// ============================================================================

/**
 * Cryptographically secure random number in [0, 1)
 */
function secureRandom() {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] / 4294967296;
}

/**
 * Cryptographically secure random integer in [0, max)
 */
function secureRandomInt(max) {
  return Math.floor(secureRandom() * max);
}

// ============================================================================
// BACKWARD COMPATIBILITY LAYER (Old API)
// ============================================================================

// Global wheel engine instance
let globalWheelEngine = null;

/**
 * Legacy global variables for backward compatibility
 */
let names = [];
let entries = [];
let rotation = 0;
let isSpinning = false;
let animationFrame = null;
let turn = 0;

/**
 * Initialize wheel engine (called from game.js)
 */
function initializeWheel(canvas) {
  if (!canvas) {
    canvas = document.getElementById('wheel');
  }
  globalWheelEngine = new WheelEngine(canvas);
  return globalWheelEngine;
}

/**
 * Get current wheel engine
 */
function getWheelEngine() {
  if (!globalWheelEngine) {
    const canvas = document.getElementById('wheel');
    if (canvas) {
      globalWheelEngine = new WheelEngine(canvas);
    }
  }
  return globalWheelEngine;
}

/**
 * Load entries from names array (legacy interface)
 */
function loadEntriesFromNames(excludeIndex = null) {
  const engine = getWheelEngine();
  if (!engine) return;

  entries = [...names];
  if (excludeIndex !== null && excludeIndex >= 0 && excludeIndex < entries.length) {
    entries.splice(excludeIndex, 1);
  }

  // Convert to WeightedEntry objects
  engine.updateEntries(entries.map(name => new WeightedEntry(name, 1)));
  engine.draw();
}

/**
 * Shuffle entries (legacy function)
 */
function shuffleEntries() {
  for (let i = entries.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [entries[i], entries[j]] = [entries[j], entries[i]];
  }

  const engine = getWheelEngine();
  if (engine) {
    engine.updateEntries(entries.map(name => new WeightedEntry(name, 1)));
    engine.draw();
  }
}

/**
 * Get winner from wheel (legacy interface)
 */
function getWheelWinner() {
  const engine = getWheelEngine();
  if (!engine) return Promise.resolve(null);
  return engine.spin().then(winner => winner ? winner.name : null);
}

/**
 * Get winner index (legacy interface)
 */
function getWinnerIndex() {
  const engine = getWheelEngine();
  return engine ? engine.getWinnerIndex() : -1;
}

/**
 * Normalize angle (legacy function)
 */
function normalizeAngle(a) {
  const tau = Math.PI * 2;
  return ((a % tau) + tau) % tau;
}

/**
 * Draw wheel (legacy interface)
 */
function drawWheel() {
  const engine = getWheelEngine();
  if (engine) {
    engine.draw();
  }
}

/**
 * Show wheel modal
 */
function showWheel() {
  const modal = document.getElementById(WHEEL_CONFIG.ui.modalId);
  if (modal) {
    modal.classList.remove('hidden');
  }
}

/**
 * Hide wheel modal
 */
function hideWheel() {
  const modal = document.getElementById(WHEEL_CONFIG.ui.modalId);
  if (modal) {
    modal.classList.add('hidden');
  }
}
