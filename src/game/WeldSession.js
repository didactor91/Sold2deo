/**
 * WeldSession — Weld Pass State Machine
 * @module game/WeldSession
 * @description Owns one welding pass (electrode strike → weld → finish). Tracks
 * state machine transitions (IDLE→STRIKING→WELDING→FINISHED), session data logging,
 * defect tracking, and chip mode. Emits events for scoring and UI.
 */

import { CONFIG } from '../config/inputs.js';

/**
 * @param {Object} deps
 * @param {Object} deps.arcPhysics
 * @param {Function} deps.scoringEngine
 * @param {Object} deps.eventBus
 * @returns {{ update: function(number): void, getData: function(): Object, reset: function(): void, abort: function(): void, handleMousedown: function(): void, handleMouseup: function(): void, handleKeydown: function({ key: string }): void }}
 */
export function createWeldSession({ arcPhysics, scoringEngine, eventBus }) {
  const s = makeState();

  const api = {
    update: (_dt) => stepWeldSession(s, arcPhysics, eventBus),
    getData: () =>
      Object.freeze({
        state: s.state,
        log: [...s.log],
        defects: [...s.defects],
        startTime: s.startTime,
        endTime: s.endTime,
        mode: s.mode,
      }),
    reset: () => {
      s.state = 'IDLE';
      s.log = [];
      s.defects = [];
      s.startTime = 0;
      s.endTime = 0;
      s.mode = 'welding';
      s.strikeFrameCount = 0;
      s.arcBreakFrameCount = 0;
    },
    abort: () => {
      if (s.state === 'IDLE' || s.state === 'FINISHED') return;
      s.state = 'FINISHED';
      s.endTime = performance.now();
      eventBus.emit('session:aborted');
    },
    handleMousedown: () => {
      if (s.state !== 'IDLE') return;
      s.state = 'STRIKING';
      s.startTime = performance.now();
      s.strikeFrameCount = 0;
      eventBus.emit('session:started');
    },
    handleMouseup: () => {
      if (s.state !== 'WELDING' && s.state !== 'STRIKING') return;
      s.state = 'FINISHED';
      s.endTime = performance.now();
      const sessionData = {
        log: s.log,
        defects: s.defects,
        beadColumns: [],
        slagSegments: [],
        totalTime: (s.endTime - s.startTime) / 1000,
        electrodeDiameter: 3,
        finalState: 'finished',
      };
      const electrodeData = {
        type: 'rutile',
        diameter: 3,
        idealAmperage: 100,
        difficultyMultiplier: 1.0,
        idealSpeed: 200,
        idealArcLength: 3,
      };
      eventBus.emit('session:complete', scoringEngine(sessionData, electrodeData));
    },
    handleKeydown: ({ key }) => {
      if (key === CONFIG.keys.chipMode && (s.state === 'WELDING' || s.state === 'ARC_BREAK')) {
        s.mode = s.mode === 'welding' ? 'chipping' : 'welding';
        eventBus.emit('session:chipMode', s.mode);
      }
    },
  };

  return Object.freeze(api);
}

/** @returns {Object} */
function makeState() {
  return {
    state: 'IDLE',
    log: [],
    defects: [],
    startTime: 0,
    endTime: 0,
    mode: 'welding',
    strikeFrameCount: 0,
    arcBreakFrameCount: 0,
    mouseX: 0,
    mouseY: 0,
    travelSpeed: 0,
    travelAngle: 0,
  };
}

/** @param {ReturnType<typeof makeState>} s @param {Object} arcPhysics @param {Object} eventBus */
function stepWeldSession(s, arcPhysics, eventBus) {
  if (s.state === 'IDLE' || s.state === 'FINISHED') return;
  const arcState = arcPhysics.updateArc(s.mouseY, 0, 100, 'mild');
  const arcEstablished = arcState.status === 'OK';
  if (s.state === 'STRIKING') onStrikingTick(s, arcEstablished, arcState, eventBus);
  else if (s.state === 'WELDING') onWeldingTick(s, arcEstablished, arcState, eventBus);
  else if (s.state === 'ARC_BREAK') onArcBreakTick(s, arcEstablished, eventBus);
}

/** @param {ReturnType<typeof makeState>} s @param {boolean} arcEstablished @param {Object} arcState @param {Object} eventBus */
function onStrikingTick(s, arcEstablished, arcState, eventBus) {
  s.strikeFrameCount++;
  if (arcEstablished && s.strikeFrameCount >= CONFIG.strike.frames) {
    s.state = 'WELDING';
    eventBus.emit('session:welding');
  } else if (s.strikeFrameCount >= CONFIG.strike.timeoutFrames) {
    s.state = 'FINISHED';
    s.endTime = performance.now();
    eventBus.emit('session:finished', { score: null });
  }
}

/** @param {ReturnType<typeof makeState>} s @param {boolean} arcEstablished @param {Object} arcState @param {Object} eventBus */
function onWeldingTick(s, arcEstablished, arcState, eventBus) {
  if (!arcEstablished) {
    s.state = 'ARC_BREAK';
    s.arcBreakFrameCount = 0;
    s.defects.push({ type: 'ARC_BREAK', x: s.mouseX, timestamp: performance.now(), severity: 1 });
    eventBus.emit('session:defect', { type: 'ARC_BREAK', x: s.mouseX });
  } else {
    s.log.push({
      timestamp: performance.now() / 1000,
      amperage: 100,
      arcLength: arcState.arcLength,
      travelSpeed: s.travelSpeed,
      travelAngle: s.travelAngle,
      beadX: s.mouseX,
      beadY: s.mouseY,
      chipMode: s.mode === 'chipping',
      arcEstablished: true,
    });
  }
}

/** @param {ReturnType<typeof makeState>} s @param {boolean} arcEstablished @param {Object} eventBus */
function onArcBreakTick(s, arcEstablished, eventBus) {
  if (arcEstablished) {
    s.arcBreakFrameCount++;
    if (s.arcBreakFrameCount >= CONFIG.strike.frames) {
      s.state = 'WELDING';
      eventBus.emit('session:welding');
    }
  } else {
    s.arcBreakFrameCount = 0;
  }
}
