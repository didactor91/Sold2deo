/**
 * PhysicsEngine — getState / state propagation unit tests
 * @module tests/unit/physics/PhysicsEngine.state.test
 */

import { describe, it, expect } from 'vitest';
import { createPhysicsEngine } from '../../../src/physics/PhysicsEngine.js';
import { BALANCE } from '../../../src/config/balance.js';

if (typeof document === 'undefined') {
  global.document = {
    createElement: () => ({
      width: 0,
      height: 0,
      getContext: () => ({
        clearRect: () => {},
        createRadialGradient: () => ({ addColorStop: () => {} }),
        fill: () => {},
        beginPath: () => {},
        arc: () => {},
        globalAlpha: 0,
      }),
    }),
  };
}

const makeEngine = () => createPhysicsEngine();

describe('PhysicsEngine — getState()', () => {
  it('should return all 5 state branches', () => {
    const engine = makeEngine();
    const state = engine.getState();
    expect(state).toHaveProperty('pool');
    expect(state).toHaveProperty('bead');
    expect(state).toHaveProperty('slag');
    expect(state).toHaveProperty('particles');
    expect(state).toHaveProperty('haz');
  });

  it('should return stable references across calls', () => {
    const engine = makeEngine();
    const s1 = engine.getState();
    const s2 = engine.getState();
    expect(s1.pool).toBe(s2.pool);
    expect(s1.bead).toBe(s2.bead);
  });
});

describe('PhysicsEngine — state propagation (pool + bead)', () => {
  it('should propagate WeldPool state to bead columns', () => {
    const engine = makeEngine();
    engine.tick(BALANCE.tick.FIXED_DT, 120, 100, 150, 'mild');
    const state = engine.getState();
    expect(state.pool).toBeDefined();
    expect(state.bead).toBeDefined();
    expect(Array.isArray(state.bead)).toBe(true);
  });

  it('should accumulate pool and bead across multiple ticks', () => {
    const engine = makeEngine();
    engine.tick(BALANCE.tick.FIXED_DT, 120, 100, 150, 'mild');
    engine.tick(BALANCE.tick.FIXED_DT, 120, 100, 150, 'mild');
    const state = engine.getState();
    expect(state.pool).toBeDefined();
    expect(state.bead).toBeDefined();
  });
});

describe('PhysicsEngine — state propagation (slag + particles)', () => {
  it('should propagate slag state with getSegments method', () => {
    const engine = makeEngine();
    engine.tick(BALANCE.tick.FIXED_DT, 120, 100, 150, 'mild');
    const state = engine.getState();
    expect(state.slag).toBeDefined();
    expect(typeof state.slag.getSegments).toBe('function');
  });

  it('should propagate spatter particles as array', () => {
    const engine = makeEngine();
    engine.tick(BALANCE.tick.FIXED_DT, 120, 100, 150, 'mild');
    const state = engine.getState();
    expect(state.particles).toBeDefined();
    expect(Array.isArray(state.particles)).toBe(true);
  });

  it('should propagate HAZ particles as array', () => {
    const engine = makeEngine();
    engine.tick(BALANCE.tick.FIXED_DT, 120, 100, 150, 'mild');
    const state = engine.getState();
    expect(state.haz).toBeDefined();
    expect(Array.isArray(state.haz)).toBe(true);
  });
});