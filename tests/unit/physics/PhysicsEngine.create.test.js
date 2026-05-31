/**
 * PhysicsEngine — createPhysicsEngine unit tests
 * @module tests/unit/physics/PhysicsEngine.create.test
 */

import { describe, it, expect } from 'vitest';
import { createPhysicsEngine } from '../../../src/physics/PhysicsEngine.js';

// Mock document.createElement for Node.js (no DOM)
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

describe('PhysicsEngine — creation', () => {
  it('should instantiate all 6 physics modules', () => {
    const engine = createPhysicsEngine();
    expect(engine.arcPhysics).toBeDefined();
    expect(engine.weldPool).toBeDefined();
    expect(engine.beadAccumulator).toBeDefined();
    expect(engine.slagLayer).toBeDefined();
    expect(engine.spatterSystem).toBeDefined();
    expect(engine.heatDiffusion).toBeDefined();
  });

  it('should expose tick function', () => {
    expect(typeof createPhysicsEngine().tick).toBe('function');
  });

  it('should expose getState function', () => {
    expect(typeof createPhysicsEngine().getState).toBe('function');
  });

  it('should initialise pool as 2D array', () => {
    const state = createPhysicsEngine().getState();
    expect(state.pool).toBeDefined();
    expect(Array.isArray(state.pool)).toBe(true);
  });
});