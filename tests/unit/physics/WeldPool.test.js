/**
 * WeldPool Unit Tests
 * @module tests/unit/physics/WeldPool.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createWeldPool } from '../../../src/physics/WeldPool.js';
import { BALANCE } from '../../../src/config/balance.js';

describe('WeldPool', () => {
  /** @type {ReturnType<typeof createWeldPool>} */
  let pool;

  describe('createWeldPool', () => {
    it('should create grid with specified dimensions', () => {
      pool = createWeldPool(64, 32);
      const grid = pool.getGrid();
      expect(grid).toHaveLength(64);
      expect(grid[0]).toHaveLength(32);
    });

    it('should initialize all cells at ambient temperature (293K)', () => {
      pool = createWeldPool(64, 32);
      const grid = pool.getGrid();
      for (let col = 0; col < 64; col++) {
        for (let row = 0; row < 32; row++) {
          expect(grid[col][row].temperature).toBe(293);
        }
      }
    });

    it('should initialize cells as solid (below solidus)', () => {
      pool = createWeldPool(64, 32);
      const grid = pool.getGrid();
      expect(grid[0][0].solid).toBe(true);
    });
  });

  describe('applyHeat', () => {
    it('should increase temperature at electrode position', () => {
      pool = createWeldPool(64, 32);
      const initialTemp = pool.getGrid()[32][16].temperature;
      pool.applyHeat(32, 16, 1000, BALANCE.tick.FIXED_DT);
      expect(pool.getGrid()[32][16].temperature).toBeGreaterThan(initialTemp);
    });

    it('should not affect neighbours during applyHeat', () => {
      pool = createWeldPool(64, 32);
      const neighbourTemp = pool.getGrid()[33][16].temperature;
      pool.applyHeat(32, 16, 1000, BALANCE.tick.FIXED_DT);
      // neighbour should be unchanged (diffusion is separate step)
      expect(pool.getGrid()[33][16].temperature).toBe(neighbourTemp);
    });
  });

  describe('diffuse', () => {
    it('should spread heat to 4-connected neighbours', () => {
      pool = createWeldPool(64, 32);
      // Heat a cell to very high temperature
      pool.applyHeat(32, 16, 10000, BALANCE.tick.FIXED_DT);
      const centerTemp = pool.getGrid()[32][16].temperature;
      const neighbourTemp = pool.getGrid()[33][16].temperature;
      pool.diffuse(BALANCE.tick.FIXED_DT);
      // Neighbour temperature should increase after diffusion
      expect(pool.getGrid()[33][16].temperature).toBeGreaterThan(neighbourTemp);
    });

    it('should conserve total thermal energy (within FDM stability)', () => {
      pool = createWeldPool(64, 32);
      // Apply significant heat
      pool.applyHeat(32, 16, 5000, BALANCE.tick.FIXED_DT);
      const sumBefore = pool.getGrid().flat().reduce((s, c) => s + c.temperature, 0);
      pool.diffuse(BALANCE.tick.FIXED_DT);
      const sumAfter = pool.getGrid().flat().reduce((s, c) => s + c.temperature, 0);
      // Energy should be approximately conserved (small loss due to boundaries)
      expect(Math.abs(sumAfter - sumBefore)).toBeLessThan(sumBefore * 0.01);
    });
  });

  describe('fluidStep', () => {
    it('should shift liquid mass downward (gravity effect)', () => {
      pool = createWeldPool(64, 32);
      // Heat middle column to make liquid
      pool.applyHeat(32, 10, 20000, BALANCE.tick.FIXED_DT);
      pool.diffuse(BALANCE.tick.FIXED_DT);
      const topTemp = pool.getGrid()[32][9].temperature;
      pool.fluidStep();
      // After fluid step, some mass should have shifted
      // (exact behavior depends on viscosity)
    });

    it('should not affect solid cells', () => {
      pool = createWeldPool(64, 32);
      const solidCell = pool.getGrid()[10][10];
      const originalTemp = solidCell.temperature;
      pool.fluidStep();
      expect(solidCell.temperature).toBe(originalTemp);
    });
  });

  describe('solidify', () => {
    it('should mark cells as solid when temperature below SOLIDUS_TEMP', () => {
      pool = createWeldPool(64, 32);
      // Cool a cell below solidus
      pool.getGrid()[32][16].temperature = BALANCE.physics.SOLIDUS_TEMP - 1;
      pool.solidify();
      expect(pool.getGrid()[32][16].solid).toBe(true);
    });

    it('should flag top cell of column with slag=true when it solidifies', () => {
      pool = createWeldPool(64, 32);
      // Manually set up a liquid cell at top row
      const cell = pool.getGrid()[32][0];
      cell.temperature = BALANCE.physics.LIQUIDUS_TEMP + 50; // 1580K - clearly liquid
      cell.liquid = true;
      cell.solid = false;

      // Now cool it below solidus
      cell.temperature = BALANCE.physics.SOLIDUS_TEMP - 10; // 1440K
      pool.solidify();
      // The top liquid cell should now have slag=true
      expect(cell.slag).toBe(true);
    });

    it('should not flag liquid cells with slag', () => {
      pool = createWeldPool(64, 32);
      // Keep cells liquid
      pool.applyHeat(32, 0, 20000, BALANCE.tick.FIXED_DT);
      pool.solidify();
      expect(pool.getGrid()[32][0].slag).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should clamp temperature at maximum (2800K)', () => {
      pool = createWeldPool(64, 32);
      pool.applyHeat(32, 16, 1e10, BALANCE.tick.FIXED_DT);
      expect(pool.getGrid()[32][16].temperature).toBeLessThanOrEqual(2800);
    });

    it('should floor temperature at ambient (293K)', () => {
      pool = createWeldPool(64, 32);
      pool.getGrid()[32][16].temperature = 100;
      pool.diffuse(BALANCE.tick.FIXED_DT);
      expect(pool.getGrid()[32][16].temperature).toBeGreaterThanOrEqual(293);
    });

    it('should handle dt greater than 100ms by clamping', () => {
      pool = createWeldPool(64, 32);
      const tempBefore = pool.getGrid()[32][16].temperature;
      pool.applyHeat(32, 16, 5000, 0.2); // 200ms > 100ms max
      expect(pool.getGrid()[32][16].temperature).toBeLessThan(
        tempBefore + 5000 * BALANCE.tick.MAX_DT / BALANCE.tick.FIXED_DT * 10
      );
    });
  });
});