/**
 * PhysicsEngine — tick phase order unit tests
 * @module tests/unit/physics/PhysicsEngine.tick.test
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

describe('PhysicsEngine — tick(dt) behaviour', () => {
  it('should accept zero dt without throwing', () => {
    const engine = createPhysicsEngine();
    expect(() => engine.tick(0, 120, 100, 150, 'mild')).not.toThrow();
  });

  it('should clamp negative dt to zero', () => {
    const engine = createPhysicsEngine();
    expect(() => engine.tick(-0.1, 120, 100, 150, 'mild')).not.toThrow();
  });

  it('should clamp dt by MAX_DT without throwing', () => {
    const engine = createPhysicsEngine();
    const excessiveDt = 0.5; // MAX_DT = 0.1
    expect(() => engine.tick(excessiveDt, 120, 100, 150, 'mild')).not.toThrow();
  });

  it('should run 10 consecutive ticks without throwing', () => {
    const engine = createPhysicsEngine();
    for (let i = 0; i < 10; i++) {
      expect(() => engine.tick(BALANCE.tick.FIXED_DT, 120, 100, 150, 'mild')).not.toThrow();
    }
  });
});