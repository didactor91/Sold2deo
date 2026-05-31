/**
 * ArcPhysics Unit Tests
 * @module tests/unit/physics/ArcPhysics.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createArcPhysics } from '../../../src/physics/ArcPhysics.js';
import { BALANCE } from '../../../src/config/balance.js';

describe('ArcPhysics', () => {
  /** @type {ReturnType<typeof createArcPhysics>} */
  let arcPhysics;

  beforeEach(() => {
    arcPhysics = createArcPhysics();
  });

  describe('updateArc', () => {
    it('should compute arc length as absolute difference between mouseY and surfaceY', () => {
      // mouseY=100, surfaceY=120 → arcLength = |100-120| = 20
      const state = arcPhysics.updateArc(100, 120, 150, 'mild');
      expect(state.arcLength).toBe(20);
    });

    it('should compute arc length correctly when electrode above surface', () => {
      // mouseY=150, surfaceY=100 → arcLength = |150-100| = 50
      const state = arcPhysics.updateArc(150, 100, 150, 'mild');
      expect(state.arcLength).toBe(50);
    });

    it('should compute voltage as arcLength × VOLTAGE_PER_MM', () => {
      const state = arcPhysics.updateArc(100, 100, 150, 'mild');
      // arcLength = 0, voltage = 0 * 1.5 = 0
      expect(state.voltage).toBe(0);
    });

    it('should compute voltage correctly for non-zero arc length', () => {
      // mouseY=103, surfaceY=100 → arcLength=3px
      const state = arcPhysics.updateArc(103, 100, 150, 'mild');
      // voltage = 3 * 1.5 = 4.5
      expect(state.voltage).toBeCloseTo(4.5, 5);
    });

    it('should compute heat input as I × V × η × dt', () => {
      // arcLength=0, voltage=0 → heatInput=0
      const state = arcPhysics.updateArc(100, 100, 150, 'mild');
      expect(state.heatInput).toBe(0);
    });

    it('should compute non-zero heat input for non-zero arc', () => {
      // mouseY=130, surfaceY=100 → arcLength=30
      // voltage = 30 * 1.5 = 45V
      // heatInput = 150 * 45 * 0.85 * (1/60)
      const state = arcPhysics.updateArc(130, 100, 150, 'mild');
      const expectedHeat = 150 * 45 * BALANCE.physics.ARC_HEAT_INPUT * BALANCE.tick.FIXED_DT;
      expect(state.heatInput).toBeCloseTo(expectedHeat, 5);
    });

    it('should clamp heat input by MAX_DT', () => {
      // Large arc should still respect MAX_DT
      const state = arcPhysics.updateArc(500, 100, 200, 'mild');
      // heatInput = 200 * (400 * 1.5) * 0.85 * FIXED_DT
      // but MAX_DT clamp applies
      expect(state.heatInput).toBeLessThanOrEqual(
        200 * 600 * BALANCE.physics.ARC_HEAT_INPUT * BALANCE.tick.MAX_DT
      );
    });

    it('should return OK status when arc is within normal range', () => {
      // arcLength = 3px (mild steel electrode ~3mm diameter)
      const state = arcPhysics.updateArc(103, 100, 150, 'mild');
      expect(state.status).toBe('OK');
    });

    it('should transition to broken when arc > IDEAL_ARC × BROKEN_ARC_FACTOR', () => {
      // IDEAL_ARC = 3px (electrode diameter), BROKEN_ARC_FACTOR = 3
      // broken threshold = 3 × 3 = 9px
      // mouseY=109, surfaceY=100 → arcLength=9px → OK (at boundary)
      const stateAtBoundary = arcPhysics.updateArc(109, 100, 150, 'mild');
      expect(stateAtBoundary.status).toBe('OK');

      // mouseY=200, surfaceY=100 → arcLength=100px → broken
      const state = arcPhysics.updateArc(200, 100, 150, 'mild');
      expect(state.status).toBe('broken');
    });

    it('should transition to short when arc < SHORT_CIRCUIT_THRESHOLD', () => {
      // SHORT_CIRCUIT_THRESHOLD = 0.5px
      const state = arcPhysics.updateArc(100.2, 100, 150, 'mild');
      expect(state.status).toBe('short');
    });

    it('should return short when electrode touching surface (arc=0)', () => {
      const state = arcPhysics.updateArc(100, 100, 150, 'mild');
      expect(state.status).toBe('short');
    });
  });

  describe('electrode types', () => {
    it('should accept mild steel electrode type and return arc state', () => {
      const state = arcPhysics.updateArc(100, 120, 150, 'mild');
      expect(state.arcLength).toBe(20);
      expect(state).toHaveProperty('voltage');
      expect(state).toHaveProperty('heatInput');
      expect(state).toHaveProperty('status');
    });

    it('should accept stainless electrode type and return arc state', () => {
      const state = arcPhysics.updateArc(100, 120, 150, 'stainless');
      expect(state.arcLength).toBe(20);
    });

    it('should accept flux-core electrode type and return arc state', () => {
      const state = arcPhysics.updateArc(100, 120, 150, 'flux');
      expect(state.arcLength).toBe(20);
    });
  });
});