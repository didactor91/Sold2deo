/**
 * Input Configuration Constants
 * @module config/inputs
 * @description Mouse sensitivity, keyboard bindings, and strike detection
 * thresholds for the simulation input system.
 */

// Mouse sensitivity multipliers
export const MOUSE_SENSITIVITY_X = 1.0; // Range: 0.5–2.0 — travel speed multiplier
export const MOUSE_SENSITIVITY_Y = 1.0; // Range: 0.5–2.0 — arc length sensitivity

// Arc establishment: consecutive frames needed to confirm stable arc
export const STRIKE_FRAMES = 3; // Range: 2–5 — consecutive frames to confirm arc
export const STRIKE_TIMEOUT_FRAMES = 60; // Range: 30–120 — max frames without arc before fail
export const STRIKE_THRESHOLD = 5; // px — minimum arc length to establish weld

// Mouse position buffer for travel speed/angle calculation
export const POSITION_BUFFER_SIZE = 10; // Range: 5–20 — mouse position history length

// Travel angle calculation lookback
export const ANGLE_LOOKBACK_TICKS = 10; // Range: 5–20 — ticks for travel angle calc

// Keyboard action bindings
export const KEY_CHIP_MODE = 'c';
export const KEY_PAUSE = 'Escape';
export const KEY_STRIKE = ' ';
export const KEY_ABORT = 'Escape';
export const KEY_AMPRANGE_START = '1';
export const KEY_AMPRANGE_END = '5';

/**
 * Key bindings map — action to key
 * @readonly
 */
export const KEY_BINDINGS = Object.freeze({
  chipMode: KEY_CHIP_MODE,
  pause: KEY_PAUSE,
  strike: KEY_STRIKE,
  abort: KEY_ABORT,
  ampPreset1: '1',
  ampPreset2: '2',
  ampPreset3: '3',
  ampPreset4: '4',
  ampPreset5: '5',
});

export const CONFIG = Object.freeze({
  mouse: {
    sensitivityX: MOUSE_SENSITIVITY_X,
    sensitivityY: MOUSE_SENSITIVITY_Y,
    positionBufferSize: POSITION_BUFFER_SIZE,
    angleLookbackTicks: ANGLE_LOOKBACK_TICKS,
  },
  strike: {
    frames: STRIKE_FRAMES,
    timeoutFrames: STRIKE_TIMEOUT_FRAMES,
    threshold: STRIKE_THRESHOLD,
  },
  keys: KEY_BINDINGS,
});
