/**
 * Physics Balance Constants
 * @module config/balance
 * @description All numeric constants for physics simulation, sourced from AWS D1.1 and Lincoln Electric Procedure Handbook.
 */

export const BALANCE = {
  physics: {
    SOLIDUS_TEMP: 1450, // °C — mild steel solidification
    LIQUIDUS_TEMP: 1530, // °C — mild steel
    ARC_HEAT_INPUT: 0.85, // efficiency η — AWS standard
    POOL_VISCOSITY: 0.006, // Pa·s — mild steel at liquidus
    THERMAL_DIFFUSIVITY: 8e-6, // m²/s — mild steel
    POOL_SURFACE_TENSION: 1.2, // N/m
    AMBIENT_TEMP: 293, // °C — room temperature
    MAX_TEMP: 2800, // °C — arc plasma cap
  },

  spatter: {
    POOL_SIZE: 512, // pre-allocated particles
    GRAVITY: 980, // px/s²
    BOUNCE_VELOCITY_FACTOR: -0.3, // one bounce
    STICK_LIFE_THRESHOLD: 0.1, // 0–1
    ARC_FACTOR_MIN: 0.5, // clamp lower
    ARC_FACTOR_MAX: 4.0, // clamp upper
    DECAY_RATE: 0.5, // life per second
  },

  arc: {
    IDEAL_ARC_FACTOR: 1.0,     // arc = electrode_diameter
    IDEAL_ARC_LENGTH: 3,       // px — reference arc length (electrode diameter reference)
    BROKEN_ARC_FACTOR: 3.0,    // arc > diameter × 3
    SHORT_CIRCUIT_THRESHOLD: 0.5, // px
    VOLTAGE_PER_MM: 1.5,       // V/mm — AWS standard
    MIN_ARC_LENGTH: 0.5,       // px minimum
  },

  slag: {
    HARDNESS_INITIAL: 0.3, // 0–1
    HARDNESS_MAX: 1.0, // max
    HARDNESS_GROWTH_RATE: 0.01, // per second
    CHIP_RESISTANCE: 0.5, // drag threshold multiplier
    THICKNESS_FACTOR: 0.15, // × bead height
  },

  heatDiffusion: {
    GAUSSIAN_SIGMA: 15, // pixels spread
    INTENSITY_INITIAL: 0.8, // 0–1
    DECAY_RATE: 0.001, // per second
    COLOR_HOT: '#1a0a00',
    COLOR_COLD: '#0a0500',
  },

  bead: {
    WIRE_FEED_FACTOR: 0.5, // mm/s per amp
    HEIGHT_PER_AMP: 0.01, // pixels per amp per second
    COOLING_RATE: 50, // K/s after arc leaves
    BASE_WIDTH: 3.0, // mm at 100A
    WIDTH_PER_AMP: 0.02, // mm per amp
    TYPICAL_AMPERAGE: 100, // A — default for deposition calc
  },

  tick: {
    FIXED_DT: 1 / 60, // 60Hz physics
    MAX_DT: 0.1, // 100ms clamp
    MAX_POOL_COLS: 64, // default grid
    MAX_POOL_ROWS: 32, // default grid
  },

  scoring: {
    // Component weights (must sum to 1.0)
    WEIGHT_AMPERAGE: 0.30,
    WEIGHT_ARC: 0.25,
    WEIGHT_SPEED: 0.20,
    WEIGHT_STRAIGHTNESS: 0.15,
    WEIGHT_SLAG: 0.10,
    // Defect penalties (multiplicative)
    PENALTY_POROSITY: 0.15,
    PENALTY_UNDERCUT: 0.20,
    PENALTY_INCLUSION: 0.40,
    PENALTY_ARC_BREAK: 0.10,
    // Reward base values
    BASE_XP: 100,
    BASE_CREDITS: 50,
  },
};
