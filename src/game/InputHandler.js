/**
 * InputHandler — Mouse/Keyboard to EventBus Bridge
 * @module game/InputHandler
 * @description Maps DOM input events to game semantics. Mouse Y → arc length,
 * mouse X velocity → travel speed, keyboard → chip/strike/abort. Maintains a
 * circular buffer of mouse positions for speed/angle computation.
 */

import { CONFIG } from '../config/inputs.js';

/**
 * @typedef {Object} BufferedPosition
 * @property {number} x
 * @property {number} y
 * @property {number} timestamp - ms
 */

/**
 * @typedef {Object} InputState
 * @property {number} mouseX
 * @property {number} mouseY
 * @property {number} arcLength
 * @property {number} travelSpeed
 * @property {number} travelAngle
 * @property {boolean} chipMode
 * @property {boolean} mouseDown
 */

/**
 * @param {Object} deps
 * @param {Object} deps.arcPhysics
 * @param {Object} deps.weldSession
 * @param {Object} deps.eventBus
 * @returns {{ poll: function(Object): void, getState: function(): InputState }}
 */
export function createInputHandler({ arcPhysics, weldSession, eventBus }) {
  /** @type {InputState} */
  let state = newInputState();
  /** @type {BufferedPosition[]} */
  const positionBuffer = [];
  /** @type {boolean} */
  let chipModeActive = false;

  const handlers = makeHandlers(
    state,
    positionBuffer,
    chipModeActive,
    arcPhysics,
    weldSession,
    eventBus
  );
  attachDOMListeners(handlers);

  return Object.freeze({
    poll: (deps) => handlers.poll(deps),
    getState: () => ({ ...state }),
    handleMouseMove: (e) => handlers.onMouseMove(e),
    handleMouseDown: (e) => handlers.onMouseDown(e),
    handleMouseUp: (e) => handlers.onMouseUp(e),
    handleKeyDown: (e) => handlers.onKeyDown(e),
  });
}

/**
 * @returns {InputState}
 */
function newInputState() {
  return {
    mouseX: 0,
    mouseY: 0,
    arcLength: 0,
    travelSpeed: 0,
    travelAngle: 0,
    chipMode: false,
    mouseDown: false,
  };
}

/**
 * @param {BufferedPosition[]} buffer
 * @param {number} x
 * @param {number} y
 */
function pushPosition(buffer, x, y) {
  buffer.push({ x, y, timestamp: performance.now() });
  if (buffer.length > CONFIG.mouse.positionBufferSize) buffer.shift();
}

/**
 * @param {BufferedPosition[]} buffer
 * @returns {number} px/s
 */
function computeTravelSpeed(buffer) {
  if (buffer.length < 2) return 0;
  const oldest = buffer[0];
  const newest = buffer[buffer.length - 1];
  const dt = (newest.timestamp - oldest.timestamp) / 1000;
  if (dt === 0) return 0;
  return Math.abs((newest.x - oldest.x) / dt) * CONFIG.mouse.sensitivityX;
}

/**
 * @param {BufferedPosition[]} buffer
 * @returns {number} radians
 */
function computeTravelAngle(buffer) {
  if (buffer.length < 2) return 0;
  const oldest = buffer[0];
  const newest = buffer[buffer.length - 1];
  return Math.atan2(newest.y - oldest.y, newest.x - oldest.x);
}

/**
 * @param {InputState} state
 * @param {BufferedPosition[]} positionBuffer
 * @param {boolean} chipModeActive
 * @param {Object} arcPhysics
 * @param {Object} weldSession
 * @param {Object} eventBus
 */
function makeHandlers(state, positionBuffer, chipModeActive, arcPhysics, weldSession, eventBus) {
  function onMouseMove({ mouseX, mouseY }) {
    state.mouseX = mouseX;
    state.mouseY = mouseY;
    pushPosition(positionBuffer, mouseX, mouseY);
    state.travelSpeed = computeTravelSpeed(positionBuffer);
    state.travelAngle = computeTravelAngle(positionBuffer);
  }

  function onMouseDown({ button }) {
    if (button !== 0) return;
    state.mouseDown = true;
    eventBus.emit('input:mousedown', { button });
  }

  function onMouseUp({ button }) {
    if (button !== 0) return;
    state.mouseDown = false;
    eventBus.emit('input:mouseup', { button });
  }

  function onKeyDown({ key }) {
    if (key === CONFIG.keys.chipMode) {
      chipModeActive = !chipModeActive;
      state.chipMode = chipModeActive;
      eventBus.emit('input:chipMode', chipModeActive);
    } else if (key === CONFIG.keys.strike) {
      eventBus.emit('input:strike');
    } else if (key === CONFIG.keys.abort) {
      weldSession.abort();
    }
  }

  function poll({ surfaceY }) {
    state.arcLength = Math.abs(state.mouseY - surfaceY);
    arcPhysics.updateArc(state.mouseY, surfaceY, 0, 'mild');
  }

  return { onMouseMove, onMouseDown, onMouseUp, onKeyDown, poll };
}

/**
 * @param {ReturnType<typeof makeHandlers>} handlers
 */
function attachDOMListeners(handlers) {
  if (typeof document === 'undefined') return;
  const { onMouseMove, onMouseDown, onMouseUp, onKeyDown } = handlers;
  document.addEventListener('mousemove', (e) =>
    onMouseMove({ mouseX: e.clientX, mouseY: e.clientY })
  );
  document.addEventListener('mousedown', (e) => onMouseDown({ button: e.button }));
  document.addEventListener('mouseup', (e) => onMouseUp({ button: e.button }));
  document.addEventListener('keydown', (e) => onKeyDown({ key: e.key }));
}
