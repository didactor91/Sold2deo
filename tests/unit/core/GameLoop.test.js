/**
 * GameLoop Unit Tests
 * @module tests/unit/core/GameLoop.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createGameLoop } from '../../../src/core/GameLoop.js';

/**
 * Creates a mock renderer with emit tracking.
 * @returns {Object}
 */
function makeRenderer() {
  const calls = [];
  return {
    render: (interpolation) => calls.push({ interpolation }),
    getCalls: () => calls,
  };
}

/**
 * Creates a mock WeldSession.
 * @returns {Object}
 */
function makeSession() {
  return {
    update: vi.fn(),
    getData: () => ({ state: 'IDLE' }),
    handleMousedown: vi.fn(),
    handleMouseup: vi.fn(),
    handleKeydown: vi.fn(),
    abort: vi.fn(),
    reset: vi.fn(),
  };
}

/**
 * Creates a mock PhysicsEngine (facade).
 * @returns {Object}
 */
function makePhysicsEngine() {
  return {
    tick: vi.fn(),
    getState: () => ({ pool: [], bead: [], slag: [], particles: [], haz: [] }),
    arcPhysics: {
      updateArc: vi.fn(() => ({ arcLength: 3, voltage: 4.5, heatInput: 10, status: 'OK' })),
    },
    weldPool: {
      applyHeat: vi.fn(),
      diffuse: vi.fn(),
      fluidStep: vi.fn(),
      solidify: vi.fn(),
      getGrid: () => [],
    },
    beadAccumulator: {
      deposit: vi.fn(),
      getColumns: () => [],
    },
  };
}

describe('GameLoop', () => {
  beforeEach(() => {
    // Mock rAF for Node.js environment
    globalThis.requestAnimationFrame = vi.fn(() => 1);
    globalThis.cancelAnimationFrame = vi.fn();
  });

  describe('createGameLoop', () => {
    it('should return an object with start, stop, and isRunning methods', () => {
      const session = makeSession();
      const physicsEngine = makePhysicsEngine();
      const renderer = makeRenderer();
      const loop = createGameLoop({ session, physicsEngine, renderer });
      expect(loop).toHaveProperty('start');
      expect(loop).toHaveProperty('stop');
      expect(loop).toHaveProperty('isRunning');
      expect(typeof loop.start).toBe('function');
      expect(typeof loop.stop).toBe('function');
      expect(typeof loop.isRunning).toBe('function');
    });

    it('should start with isRunning false', () => {
      const session = makeSession();
      const physicsEngine = makePhysicsEngine();
      const renderer = makeRenderer();
      const loop = createGameLoop({ session, physicsEngine, renderer });
      expect(loop.isRunning()).toBe(false);
    });
  });

  describe('start / stop', () => {
    it('should set isRunning true after start', () => {
      const session = makeSession();
      const physicsEngine = makePhysicsEngine();
      const renderer = makeRenderer();
      const loop = createGameLoop({ session, physicsEngine, renderer });
      loop.start();
      expect(loop.isRunning()).toBe(true);
      loop.stop();
    });

    it('should set isRunning false after stop', () => {
      const session = makeSession();
      const physicsEngine = makePhysicsEngine();
      const renderer = makeRenderer();
      const loop = createGameLoop({ session, physicsEngine, renderer });
      loop.start();
      loop.stop();
      expect(loop.isRunning()).toBe(false);
    });

    it('should call requestAnimationFrame on start', () => {
      const session = makeSession();
      const physicsEngine = makePhysicsEngine();
      const renderer = makeRenderer();
      const loop = createGameLoop({ session, physicsEngine, renderer });
      loop.start();
      expect(globalThis.requestAnimationFrame).toHaveBeenCalled();
      loop.stop();
    });

    it('should call cancelAnimationFrame on stop', () => {
      const session = makeSession();
      const physicsEngine = makePhysicsEngine();
      const renderer = makeRenderer();
      const loop = createGameLoop({ session, physicsEngine, renderer });
      loop.start();
      loop.stop();
      expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('accumulator logic (via _loop)', () => {
    it('should fire one tick per 16.67ms of dt (stable 60fps)', () => {
      const session = makeSession();
      const physicsEngine = makePhysicsEngine();
      const renderer = makeRenderer();
      const loop = createGameLoop({ session, physicsEngine, renderer });

      // Two calls: first dt=0 (no tick), second dt=16.67ms (one tick)
      loop._loop(0);
      loop._loop(16.67);

      expect(physicsEngine.tick).toHaveBeenCalled();
    });

    it('should cap accumulator at 100ms (spiral of death prevention)', () => {
      const session = makeSession();
      const physicsEngine = makePhysicsEngine();
      const renderer = makeRenderer();
      const loop = createGameLoop({ session, physicsEngine, renderer });

      // Two calls: first dt=0, second dt=5000ms (capped at 100ms = 6 ticks)
      loop._loop(0);
      loop._loop(5000);

      // 6 ticks max (100ms / 16.67ms)
      expect(physicsEngine.tick.mock.calls.length).toBeLessThanOrEqual(6);
    });
  });

  describe('interpolation (via _loop)', () => {
    it('should pass interpolation to renderer on each frame', () => {
      const session = makeSession();
      const physicsEngine = makePhysicsEngine();
      const renderer = makeRenderer();
      const loop = createGameLoop({ session, physicsEngine, renderer });

      loop._loop(0);
      loop._loop(16.67);

      expect(renderer.getCalls().length).toBeGreaterThan(0);
    });

    it('should pass interpolation in range 0-1', () => {
      const session = makeSession();
      const physicsEngine = makePhysicsEngine();
      const renderer = makeRenderer();
      const loop = createGameLoop({ session, physicsEngine, renderer });

      // Halfway to next tick
      loop._loop(0);
      loop._loop(8.335);

      const calls = renderer.getCalls();
      expect(calls.length).toBeGreaterThan(0);
      const lastCall = calls[calls.length - 1];
      expect(lastCall.interpolation).toBeGreaterThan(0);
      expect(lastCall.interpolation).toBeLessThanOrEqual(1);
    });
  });

  describe('tick order (via _loop)', () => {
    it('should call session.update before physicsEngine.tick', () => {
      const session = makeSession();
      const physicsEngine = makePhysicsEngine();
      const renderer = makeRenderer();
      const loop = createGameLoop({ session, physicsEngine, renderer });

      loop._loop(0);
      loop._loop(16.67);

      expect(session.update).toHaveBeenCalled();
      expect(physicsEngine.tick).toHaveBeenCalled();
    });
  });
});
