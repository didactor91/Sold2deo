/**
 * WeldSession Unit Tests
 * @module tests/unit/game/WeldSession.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createWeldSession } from '../../../src/game/WeldSession.js';
import { score } from '../../../src/game/ScoringEngine.js';

/**
 * Creates a plain mock ArcPhysics (no vi.fn() to avoid edge cases).
 * @returns {Object}
 */
function makeArcPhysics(overrides = {}) {
  return {
    updateArc: () => ({ arcLength: 6, voltage: 9, heatInput: 15, status: 'OK', ...overrides }),
  };
}

/**
 * Creates a tracking mock EventBus.
 * @returns {Object}
 */
function makeEventBus() {
  /** @type {Array<[string, any]>} */
  const calls = [];
  return {
    on: () => () => {},
    off: () => {},
    emit: (name, data) => calls.push([name, data]),
    calls,
    getCalls(name) {
      return calls.filter((c) => c[0] === name);
    },
  };
}

describe('WeldSession', () => {
  describe('createWeldSession', () => {
    it('should return an object with update, getData, reset, and abort methods', () => {
      const arcPhysics = makeArcPhysics();
      const eventBus = makeEventBus();
      const session = createWeldSession({ arcPhysics, scoringEngine: score, eventBus });
      expect(session).toHaveProperty('update');
      expect(session).toHaveProperty('getData');
      expect(session).toHaveProperty('reset');
      expect(session).toHaveProperty('abort');
      expect(typeof session.update).toBe('function');
      expect(typeof session.getData).toBe('function');
      expect(typeof session.reset).toBe('function');
      expect(typeof session.abort).toBe('function');
    });

    it('should start in IDLE state', () => {
      const arcPhysics = makeArcPhysics();
      const eventBus = makeEventBus();
      const session = createWeldSession({ arcPhysics, scoringEngine: score, eventBus });
      expect(session.getData().state).toBe('IDLE');
    });
  });

  describe('state transitions', () => {
    it('should transition IDLE → STRIKING on mousedown', () => {
      const arcPhysics = makeArcPhysics();
      const eventBus = makeEventBus();
      const session = createWeldSession({ arcPhysics, scoringEngine: score, eventBus });
      session.handleMousedown();
      expect(session.getData().state).toBe('STRIKING');
    });

    it('should transition STRIKING → WELDING when arc established for 3 frames', () => {
      const arcPhysics = makeArcPhysics();
      const eventBus = makeEventBus();
      const session = createWeldSession({ arcPhysics, scoringEngine: score, eventBus });
      session.handleMousedown();

      session.update(1 / 60);
      session.update(1 / 60);
      session.update(1 / 60);

      expect(session.getData().state).toBe('WELDING');
    });

    it('should transition WELDING → FINISHED on mouseup', () => {
      const arcPhysics = makeArcPhysics();
      const eventBus = makeEventBus();
      const session = createWeldSession({ arcPhysics, scoringEngine: score, eventBus });
      session.handleMousedown();

      session.update(1 / 60);
      session.update(1 / 60);
      session.update(1 / 60);

      session.handleMouseup();
      expect(session.getData().state).toBe('FINISHED');
    });

    it('should transition WELDING → ARC_BREAK when arc lost', () => {
      const arcPhysics = makeArcPhysics();
      const eventBus = makeEventBus();
      const session = createWeldSession({ arcPhysics, scoringEngine: score, eventBus });
      session.handleMousedown();

      session.update(1 / 60);
      session.update(1 / 60);
      session.update(1 / 60);

      // Arc breaks — status 'short' means arcLength < 0.5
      arcPhysics.updateArc = () => ({ arcLength: 0, voltage: 0, heatInput: 0, status: 'short' });
      session.update(1 / 60);

      expect(session.getData().state).toBe('ARC_BREAK');
    });

    it('should transition ARC_BREAK → WELDING when arc re-established for 3 frames', () => {
      const arcPhysics = makeArcPhysics();
      const eventBus = makeEventBus();
      const session = createWeldSession({ arcPhysics, scoringEngine: score, eventBus });
      session.handleMousedown();

      session.update(1 / 60);
      session.update(1 / 60);
      session.update(1 / 60);

      expect(session.getData().state).toBe('WELDING');

      // Arc breaks
      arcPhysics.updateArc = () => ({ arcLength: 0, voltage: 0, heatInput: 0, status: 'short' });
      session.update(1 / 60);

      expect(session.getData().state).toBe('ARC_BREAK');

      // Arc re-established
      arcPhysics.updateArc = () => ({ arcLength: 6, voltage: 9, heatInput: 15, status: 'OK' });
      session.update(1 / 60);
      session.update(1 / 60);
      session.update(1 / 60);

      expect(session.getData().state).toBe('WELDING');
    });

    it('should abort on Escape during STRIKING', () => {
      const arcPhysics = makeArcPhysics();
      const eventBus = makeEventBus();
      const session = createWeldSession({ arcPhysics, scoringEngine: score, eventBus });
      session.handleMousedown();
      expect(session.getData().state).toBe('STRIKING');

      session.abort();
      expect(session.getData().state).toBe('FINISHED');
    });

    it('should NOT emit session:complete on abort', () => {
      const arcPhysics = makeArcPhysics();
      const eventBus = makeEventBus();
      const session = createWeldSession({ arcPhysics, scoringEngine: score, eventBus });
      session.handleMousedown();
      session.abort();

      const completeCalls = eventBus.getCalls('session:complete');
      expect(completeCalls).toHaveLength(0);
    });

    it('should emit session:aborted on abort', () => {
      const arcPhysics = makeArcPhysics();
      const eventBus = makeEventBus();
      const session = createWeldSession({ arcPhysics, scoringEngine: score, eventBus });
      session.handleMousedown();
      session.abort();

      const abortedCalls = eventBus.getCalls('session:aborted');
      expect(abortedCalls).toHaveLength(1);
    });
  });

  describe('session logging', () => {
    it('should log tick data during WELDING', () => {
      const arcPhysics = makeArcPhysics();
      const eventBus = makeEventBus();
      const session = createWeldSession({ arcPhysics, scoringEngine: score, eventBus });
      session.handleMousedown();

      session.update(1 / 60);
      session.update(1 / 60);
      session.update(1 / 60);
      // Now in WELDING — one more tick to log
      session.update(1 / 60);

      const data = session.getData();
      expect(data.log.length).toBeGreaterThan(0);
    });
  });

  describe('chip mode toggle', () => {
    it('should toggle mode between welding and chipping on C key', () => {
      const arcPhysics = makeArcPhysics();
      const eventBus = makeEventBus();
      const session = createWeldSession({ arcPhysics, scoringEngine: score, eventBus });
      session.handleMousedown();

      session.update(1 / 60);
      session.update(1 / 60);
      session.update(1 / 60);

      expect(session.getData().mode).toBe('welding');
      session.handleKeydown({ key: 'c' });
      expect(session.getData().mode).toBe('chipping');
      session.handleKeydown({ key: 'c' });
      expect(session.getData().mode).toBe('welding');
    });
  });

  describe('session:complete event', () => {
    it('should emit session:complete with score on mouseup', () => {
      const arcPhysics = makeArcPhysics();
      const eventBus = makeEventBus();
      const session = createWeldSession({ arcPhysics, scoringEngine: score, eventBus });
      session.handleMousedown();

      session.update(1 / 60);
      session.update(1 / 60);
      session.update(1 / 60);

      session.handleMouseup();

      const completeCalls = eventBus.getCalls('session:complete');
      expect(completeCalls).toHaveLength(1);
      expect(completeCalls[0][1]).toHaveProperty('total');
    });
  });

  describe('strike failure timeout', () => {
    it('should transition to FINISHED after 60 frames without arc', () => {
      const arcPhysics = makeArcPhysics();
      const eventBus = makeEventBus();
      const session = createWeldSession({ arcPhysics, scoringEngine: score, eventBus });
      session.handleMousedown();

      // No arc established for 60 frames — status 'short' = arcLength < 0.5
      arcPhysics.updateArc = () => ({ arcLength: 0, voltage: 0, heatInput: 0, status: 'short' });
      for (let i = 0; i < 60; i++) {
        session.update(1 / 60);
      }

      expect(session.getData().state).toBe('FINISHED');
    });
  });
});
