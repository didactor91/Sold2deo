/**
 * HeatDiffusion Unit Tests
 * @module tests/unit/physics/HeatDiffusion.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { computeHAZParticles } from '../../../src/physics/HeatDiffusion.js';
import { BALANCE } from '../../../src/config/balance.js';

describe('HeatDiffusion', () => {
  describe('computeHAZParticles (pure function)', () => {
    it('should compute particles for new columns', () => {
      const beadColumns = [
        { col: 0, x: 0, height: 50, hasSlag: false, slagRemoved: false },
        { col: 1, x: 1, height: 50, hasSlag: false, slagRemoved: false },
      ];
      const computedColumns = new Set();
      const particles = computeHAZParticles(beadColumns, computedColumns);
      expect(particles).toHaveLength(2);
    });

    it('should skip already-computed columns', () => {
      const beadColumns = [
        { col: 0, x: 0, height: 50, hasSlag: false, slagRemoved: false },
      ];
      const computedColumns = new Set([0]); // Already computed
      const particles = computeHAZParticles(beadColumns, computedColumns);
      expect(particles).toHaveLength(0);
    });

    it('should skip columns with height <= 0', () => {
      const beadColumns = [
        { col: 0, x: 0, height: 0, hasSlag: false, slagRemoved: false },
      ];
      const computedColumns = new Set();
      const particles = computeHAZParticles(beadColumns, computedColumns);
      expect(particles).toHaveLength(0);
    });

    it('should use GAUSSIAN_SIGMA from BALANCE', () => {
      const beadColumns = [
        { col: 50, x: 50, height: 50, hasSlag: false, slagRemoved: false },
      ];
      const computedColumns = new Set();
      const particles = computeHAZParticles(beadColumns, computedColumns);
      expect(particles[0].sigma).toBe(BALANCE.heatDiffusion.GAUSSIAN_SIGMA);
    });

    it('should set intensity from BALANCE.heatDiffusion', () => {
      const beadColumns = [
        { col: 50, x: 50, height: 50, hasSlag: false, slagRemoved: false },
      ];
      const computedColumns = new Set();
      const particles = computeHAZParticles(beadColumns, computedColumns);
      expect(particles[0].intensity).toBeCloseTo(BALANCE.heatDiffusion.INTENSITY_INITIAL, 2);
    });
  });

  describe('constants', () => {
    it('should have correct COLOR_HOT and COLOR_COLD', () => {
      expect(BALANCE.heatDiffusion.COLOR_HOT).toBe('#1a0a00');
      expect(BALANCE.heatDiffusion.COLOR_COLD).toBe('#0a0500');
    });

    it('should have correct GAUSSIAN_SIGMA', () => {
      expect(BALANCE.heatDiffusion.GAUSSIAN_SIGMA).toBe(15);
    });

    it('should have correct DECAY_RATE', () => {
      expect(BALANCE.heatDiffusion.DECAY_RATE).toBe(0.001);
    });
  });
});