/**
 * BeadAccumulator Unit Tests
 * @module tests/unit/physics/BeadAccumulator.test
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createBeadAccumulator } from '../../../src/physics/BeadAccumulator.js';
import { BALANCE } from '../../../src/config/balance.js';

describe('BeadAccumulator', () => {
  /** @type {ReturnType<typeof createBeadAccumulator>} */
  let accumulator;

  describe('createBeadAccumulator', () => {
    it('should create array of columns matching width', () => {
      accumulator = createBeadAccumulator(200);
      const columns = accumulator.getColumns();
      expect(columns).toHaveLength(200);
    });

    it('should initialize all columns with height=0', () => {
      accumulator = createBeadAccumulator(50);
      const columns = accumulator.getColumns();
      columns.forEach(col => {
        expect(col.height).toBe(0);
      });
    });

    it('should initialize hasSlag=false and slagRemoved=false', () => {
      accumulator = createBeadAccumulator(50);
      const columns = accumulator.getColumns();
      columns.forEach(col => {
        expect(col.hasSlag).toBe(false);
        expect(col.slagRemoved).toBe(false);
      });
    });
  });

  describe('deposit', () => {
    it('should increment height when pool cell is liquid', () => {
      accumulator = createBeadAccumulator(64);
      // Create a mock pool grid with a liquid cell at column 32
      const mockGrid = [];
      for (let c = 0; c < 64; c++) {
        mockGrid[c] = [];
        for (let r = 0; r < 32; r++) {
          mockGrid[c][r] = {
            temperature: 293,
            solid: true,
            liquid: false,
            slag: false,
          };
        }
      }
      // Set column 32 to have liquid cells
      mockGrid[32][0] = { temperature: 1600, solid: false, liquid: true, slag: false };
      mockGrid[32][1] = { temperature: 1600, solid: false, liquid: true, slag: false };

      accumulator.deposit(mockGrid, BALANCE.tick.FIXED_DT);
      const columns = accumulator.getColumns();
      expect(columns[32].height).toBeGreaterThan(0);
    });

    it('should not increment height when pool cell is solid', () => {
      accumulator = createBeadAccumulator(64);
      // Create a mock pool grid with solid cells only
      const mockGrid = [];
      for (let c = 0; c < 64; c++) {
        mockGrid[c] = [];
        for (let r = 0; r < 32; r++) {
          mockGrid[c][r] = {
            temperature: 293,
            solid: true,
            liquid: false,
            slag: false,
          };
        }
      }

      const initialHeight = accumulator.getColumns()[32].height;
      accumulator.deposit(mockGrid, BALANCE.tick.FIXED_DT);
      expect(accumulator.getColumns()[32].height).toBe(initialHeight);
    });

    it('should set hasSlag when top pool cell solidifies', () => {
      accumulator = createBeadAccumulator(64);
      // Create a mock grid where top cell at column 32 is just below liquidus
      const mockGrid = [];
      for (let c = 0; c < 64; c++) {
        mockGrid[c] = [];
        for (let r = 0; r < 32; r++) {
          mockGrid[c][r] = {
            temperature: 293,
            solid: true,
            liquid: false,
            slag: false,
          };
        }
      }
      // Make column 32 have a liquid cell at top that will be detected as solidifying
      mockGrid[32][0] = { temperature: BALANCE.physics.SOLIDUS_TEMP + 5, solid: false, liquid: true, slag: false };
      // Next tick, it cools below solidus
      mockGrid[32][0].temperature = BALANCE.physics.SOLIDUS_TEMP - 5;
      mockGrid[32][0].solid = true;
      mockGrid[32][0].liquid = false;

      accumulator.deposit(mockGrid, BALANCE.tick.FIXED_DT);
      // hasSlag should be set when top cell solidifies
      expect(accumulator.getColumns()[32].hasSlag).toBe(true);
    });

    it('should use HEIGHT_PER_AMP from balance for deposition rate', () => {
      accumulator = createBeadAccumulator(64);
      const mockGrid = [];
      for (let c = 0; c < 64; c++) {
        mockGrid[c] = [];
        for (let r = 0; r < 32; r++) {
          mockGrid[c][r] = {
            temperature: 293,
            solid: true,
            liquid: false,
            slag: false,
          };
        }
      }
      // Column 32 with liquid cell
      mockGrid[32][0] = { temperature: 1600, solid: false, liquid: true, slag: false };

      const initialHeight = accumulator.getColumns()[32].height;
      accumulator.deposit(mockGrid, BALANCE.tick.FIXED_DT);
      const heightIncrement = accumulator.getColumns()[32].height - initialHeight;
      // Height should be based on HEIGHT_PER_AMP * dt (at 100A typical)
      expect(heightIncrement).toBeCloseTo(BALANCE.bead.HEIGHT_PER_AMP * 100 * BALANCE.tick.FIXED_DT, 1);
    });
  });

  describe('edge cases', () => {
    it('should clamp negative height to 0', () => {
      accumulator = createBeadAccumulator(64);
      // Manually set negative height
      accumulator.getColumns()[32].height = -5;
      const mockGrid = [];
      for (let c = 0; c < 64; c++) {
        mockGrid[c] = [];
        for (let r = 0; r < 32; r++) {
          mockGrid[c][r] = {
            temperature: 293,
            solid: true,
            liquid: false,
            slag: false,
          };
        }
      }
      accumulator.deposit(mockGrid, BALANCE.tick.FIXED_DT);
      expect(accumulator.getColumns()[32].height).toBeGreaterThanOrEqual(0);
    });
  });
});