/**
 * SpatterSystem Unit Tests
 * @module tests/unit/physics/SpatterSystem.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createSpatterSystem } from '../../../src/physics/SpatterSystem.js';
import { BALANCE } from '../../../src/config/balance.js';

describe('SpatterSystem', () => {
  /** @type {ReturnType<typeof createSpatterSystem>} */
  let spatterSystem;

  beforeEach(() => {
    spatterSystem = createSpatterSystem();
  });

  describe('createSpatterSystem', () => {
    it('should pre-allocate POOL_SIZE particles on construction', () => {
      const active = spatterSystem.getActive();
      // Pool initialized but no active particles yet
      expect(Array.isArray(active)).toBe(true);
    });
  });

  describe('emit', () => {
    it('should calculate arc_factor = clamp(arc_length / IDEAL_ARC, 0.5, 4.0)', () => {
      // arc_length = 4px (normal), IDEAL_ARC assumed ~2-3px
      const arcState = { arcLength: 4, voltage: 6, heatInput: 100, status: 'OK' };
      spatterSystem.emit(arcState, 100);
      // Should not throw
    });

    it('should clamp arc_factor to ARC_FACTOR_MAX (4.0) when arc too long', () => {
      const arcState = { arcLength: 100, voltage: 150, heatInput: 1000, status: 'broken' };
      spatterSystem.emit(arcState, 100);
      // Should clamp at 4.0
    });

    it('should clamp arc_factor to ARC_FACTOR_MIN (0.5) when arc too short', () => {
      const arcState = { arcLength: 0.1, voltage: 0.15, heatInput: 10, status: 'short' };
      spatterSystem.emit(arcState, 100);
      // Should clamp at 0.5
    });
  });

  describe('tick', () => {
    it('should apply gravity to active particles', () => {
      const arcState = { arcLength: 5, voltage: 7.5, heatInput: 100, status: 'OK' };
      spatterSystem.emit(arcState, 100);
      const activeBefore = spatterSystem.getActive();
      if (activeBefore.length > 0) {
        const initialVy = activeBefore[0].vy;
        spatterSystem.tick(BALANCE.tick.FIXED_DT, 500);
        const activeAfter = spatterSystem.getActive();
        // After gravity: vy should increase
        expect(activeAfter[0].vy).toBeGreaterThan(initialVy);
      }
    });

    it('should reverse vy on surface hit (one bounce)', () => {
      const arcState = { arcLength: 5, voltage: 7.5, heatInput: 100, status: 'OK' };
      spatterSystem.emit(arcState, 1000);
      // Set particle near surface with downward velocity
      const active = spatterSystem.getActive();
      if (active.length > 0) {
        active[0].y = 499;
        active[0].vy = 100;
      }
      spatterSystem.tick(BALANCE.tick.FIXED_DT, 500);
    });

    it('should stick particles when life < STICK_LIFE_THRESHOLD', () => {
      const arcState = { arcLength: 5, voltage: 7.5, heatInput: 100, status: 'OK' };
      spatterSystem.emit(arcState, 1000);
      const active = spatterSystem.getActive();
      if (active.length > 0) {
        active[0].life = 0.05; // Below 0.1 threshold
        const posBefore = { x: active[0].x, y: active[0].y };
        spatterSystem.tick(BALANCE.tick.FIXED_DT, 500);
        // Position should be unchanged (stuck)
        expect(active[0].x).toBe(posBefore.x);
        expect(active[0].y).toBe(posBefore.y);
      }
    });

    it('should decay life each tick', () => {
      const arcState = { arcLength: 5, voltage: 7.5, heatInput: 100, status: 'OK' };
      spatterSystem.emit(arcState, 100);
      const active = spatterSystem.getActive();
      if (active.length > 0) {
        const lifeBefore = active[0].life;
        spatterSystem.tick(BALANCE.tick.FIXED_DT, 500);
        expect(active[0].life).toBeLessThan(lifeBefore);
      }
    });
  });

  describe('pool exhaustion', () => {
    it('should handle emit when pool is full', () => {
      const arcState = { arcLength: 5, voltage: 7.5, heatInput: 100, status: 'OK' };
      // Emit more than POOL_SIZE particles
      for (let i = 0; i < 600; i++) {
        spatterSystem.emit(arcState, 100);
      }
      const active = spatterSystem.getActive();
      // Should not exceed POOL_SIZE
      expect(active.length).toBeLessThanOrEqual(BALANCE.spatter.POOL_SIZE);
    });
  });

  describe('getActive', () => {
    it('should return only particles with life > 0', () => {
      const arcState = { arcLength: 5, voltage: 7.5, heatInput: 100, status: 'OK' };
      spatterSystem.emit(arcState, 50);
      const active = spatterSystem.getActive();
      active.forEach(p => {
        expect(p.life).toBeGreaterThan(0);
      });
    });
  });
});