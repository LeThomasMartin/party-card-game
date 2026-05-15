/**
 * Wheel Configuration & Constants
 * Centralized configuration for the spinning wheel system
 */

const WHEEL_CONFIG = {
  // Wheel physics
  physics: {
    friction: 0.99,           // Velocity multiplier per frame (0.99 = smooth deceleration)
    baseSpinDuration: 5200,   // Base spin duration in milliseconds
    randomSpinVariance: 1200, // Random variance added to spin duration
    minExtraTurns: 6,         // Minimum complete rotations before stopping
    maxExtraTurns: 4,         // Random variance in extra turns
  },

  // Canvas & rendering
  rendering: {
    canvasId: 'wheel',
    radiusMultiplier: 0.95,   // Circle radius as % of min(width, height) / 2
    centerRadius: 70,         // Radius of center circle (golden hub)
    textRadiusOffset: 60,     // Distance from edge where text is placed
    fontSize: 28,             // Main text font size
    fontFamily: "'Rubik', Arial",
    textOutlineOffset: 2,     // Shadow/outline offset in pixels
  },

  // Color palette (12 vibrant colors for wheel slices)
  colors: [
    "#ef4444", "#f97316", "#f59e0b", "#84cc16",
    "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6",
    "#6366f1", "#8b5cf6", "#d946ef", "#ec4899"
  ],

  // Center circle styling
  centerCircle: {
    fillColor: "#f59e0b",     // Golden yellow
    strokeColor: "#fbbf24",   // Lighter gold
    strokeWidth: 5,
  },

  // Slice borders & styling
  sliceStyle: {
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 3,
    outerBorderColor: "rgba(0, 0, 0, 0.4)",
    outerBorderWidth: 2,
    brightnessAdjustment: -0.2, // Darken color for gradient depth
  },

  // Text rendering
  textStyle: {
    mainColor: "white",
    shadowColor: "rgba(0, 0, 0, 0.3)",
    alignment: "right",
    baseline: "middle",
  },

  // Audio
  audio: {
    tickSoundPath: "sounds/thick.mp3",
    tickVolume: 0.3,           // Volume for tick sounds (0-1)
    speedThreshold: 0.01,      // Min wheel speed to trigger tick (radians/frame)
    preloadOnInit: true,       // Load sound file on page load
  },

  // Easing function for spin animation
  easing: {
    name: "easeOutCubic",
    fn: (t) => 1 - Math.pow(1 - t, 3),
  },

  // UI elements
  ui: {
    modalId: 'wheelModal',
    spinButtonId: 'spinBtn',
    pointerClass: 'pointer',
    spinButtonClass: 'spin-center',
  },

  // Debug mode (set to false in production)
  debug: {
    enabled: false,
    logRotation: false,
    logWinnerCalculation: false,
    drawPointerIndicator: false,
    showSliceAngles: false,
  },

  // Precision & tolerance
  precision: {
    angleEpsilon: 0.0001,      // Tolerance for floating-point angle comparisons
    snapThreshold: 0.01,       // If final rotation drifts > this, snap to target
  },
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WHEEL_CONFIG;
}
