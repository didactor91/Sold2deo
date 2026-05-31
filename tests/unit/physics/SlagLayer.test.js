/**
 * SlagLayer Unit Tests
 * @module tests/unit/physics/SlagLayer.test
 */

import { describe, it, expect } from 'vitest';
import { createSlagLayer } from '../../../src/physics/SlagLayer.js';
import { BALANCE } from '../../../src/config/balance.js';

describe('SlagLayer', () => {
  describe('createSlagLayer', () => {
    it('should create slag segments from columns with hasSlag=true', () => {
      const beadColumns = [
        { x: 0, height: 10, hasSlag: true, slagRemoved: false },
        { x: 1, height: 10, hasSlag: false, slagRemoved: false },
        { x: 2, height: 10, hasSlag: true, slagRemoved: false },
      ];
      const slagLayer = createSlagLayer(beadColumns);
      const segments = slagLayer.getSegments();
      expect(segments).toHaveLength(2);
    });

    it('should skip columns where slagRemoved=true', () => {
      const beadColumns = [
        { x: 0, height: 10, hasSlag: true, slagRemoved: true },
        { x: 1, height: 10, hasSlag: true, slagRemoved: false },
      ];
      const slagLayer = createSlagLayer(beadColumns);
      expect(slagLayer.getSegments()).toHaveLength(1);
    });

    it('should set initial hardness from BALANCE.slag', () => {
      const beadColumns = [
        { x: 0, height: 10, hasSlag: true, slagRemoved: false },
      ];
      const slagLayer = createSlagLayer(beadColumns);
      const segments = slagLayer.getSegments();
      expect(segments[0].hardness).toBe(BALANCE.slag.HARDNESS_INITIAL);
    });

    it('should set thickness from bead height * THICKNESS_FACTOR', () => {
      const beadColumns = [
        { x: 0, height: 100, hasSlag: true, slagRemoved: false },
      ];
      const slagLayer = createSlagLayer(beadColumns);
      const segments = slagLayer.getSegments();
      expect(segments[0].thickness).toBeCloseTo(100 * BALANCE.slag.THICKNESS_FACTOR, 2);
    });
  });

  describe('chip', () => {
    it('should return true when dragForce > CHIP_RESISTANCE * hardness', () => {
      const beadColumns = [
        { x: 0, height: 10, hasSlag: true, slagRemoved: false },
      ];
      const slagLayer = createSlagLayer(beadColumns);
      const hardness = 0.5;
      const dragForce = 0.4; // 0.4 > 0.5 * 0.5 = 0.25
      const result = slagLayer.chip(0, 20, dragForce);
      expect(result).toBe(true);
    });

    it('should return false when dragForce <= CHIP_RESISTANCE * hardness', () => {
      // Initial hardness = 0.3, threshold = 0.5 * 0.3 = 0.15
      // dragForce = 0.1 <= 0.15 → should not chip
      const beadColumns = [
        { x: 0, height: 10, hasSlag: true, slagRemoved: false },
      ];
      const slagLayer = createSlagLayer(beadColumns);
      const dragForce = 0.1;
      const result = slagLayer.chip(0, 20, dragForce);
      expect(result).toBe(false);
    });

    it('should mark segment as removed when chipped', () => {
      const beadColumns = [
        { x: 0, height: 10, hasSlag: true, slagRemoved: false },
      ];
      const slagLayer = createSlagLayer(beadColumns);
      slagLayer.chip(0, 20, 1.0);
      const segments = slagLayer.getSegments();
      expect(segments[0].removed).toBe(true);
    });
  });

  describe('age', () => {
    it('should increase hardness over time', () => {
      const beadColumns = [
        { x: 0, height: 10, hasSlag: true, slagRemoved: false },
      ];
      const slagLayer = createSlagLayer(beadColumns);
      const initialHardness = slagLayer.getSegments()[0].hardness;
      slagLayer.age(1.0); // Age 1 second
      const newHardness = slagLayer.getSegments()[0].hardness;
      expect(newHardness).toBe(initialHardness + BALANCE.slag.HARDNESS_GROWTH_RATE * 1.0);
    });

    it('should cap hardness at HARDNESS_MAX', () => {
      const beadColumns = [
        { x: 0, height: 10, hasSlag: true, slagRemoved: false },
      ];
      const slagLayer = createSlagLayer(beadColumns);
      slagLayer.age(1000); // Age 1000 seconds — should hit max
      expect(slagLayer.getSegments()[0].hardness).toBeLessThanOrEqual(BALANCE.slag.HARDNESS_MAX);
    });
  });

  describe('inclusion defect', () => {
    it('should detect INCLUSION when hasSlag && !slagRemoved', () => {
      const beadColumns = [
        { x: 0, height: 10, hasSlag: true, slagRemoved: false },
        { x: 1, height: 10, hasSlag: false, slagRemoved: false },
      ];
      const slagLayer = createSlagLayer(beadColumns);
      expect(slagLayer.hasInclusionDefect(0)).toBe(true);
      expect(slagLayer.hasInclusionDefect(1)).toBe(false);
    });
  });
});