/**
 * colorUtils Unit Tests
 * @module tests/unit/renderer/colorUtils.test
 */

import { describe, it, expect } from 'vitest';
import { temperatureToColor, processColor } from '../../../src/renderer/colorUtils.js';

describe('colorUtils', () => {
  describe('temperatureToColor', () => {
    describe('threshold mapping', () => {
      it('returns #ffff00 (yellow) for temperature above 1500°C', () => {
        expect(temperatureToColor(1501)).toBe('#ffff00');
        expect(temperatureToColor(2000)).toBe('#ffff00');
        expect(temperatureToColor(2800)).toBe('#ffff00');
      });

      it('returns #ff8800 (orange) for temperature above 1200°C but ≤ 1500°C', () => {
        expect(temperatureToColor(1201)).toBe('#ff8800');
        expect(temperatureToColor(1500)).toBe('#ff8800');
      });

      it('returns #ff3300 (red-orange) for temperature above 900°C but ≤ 1200°C', () => {
        expect(temperatureToColor(901)).toBe('#ff3300');
        expect(temperatureToColor(1200)).toBe('#ff3300');
      });

      it('returns #cc1100 (deep red) for temperature above 600°C but ≤ 900°C', () => {
        expect(temperatureToColor(601)).toBe('#cc1100');
        expect(temperatureToColor(900)).toBe('#cc1100');
      });

      it('returns #661100 (dark red) for temperature above 300°C but ≤ 600°C', () => {
        expect(temperatureToColor(301)).toBe('#661100');
        expect(temperatureToColor(600)).toBe('#661100');
      });

      it('returns #3a2010 (dark brown) for temperature at or below 300°C', () => {
        expect(temperatureToColor(300)).toBe('#3a2010');
        expect(temperatureToColor(0)).toBe('#3a2010');
        expect(temperatureToColor(-100)).toBe('#3a2010');
      });
    });

    describe('boundary conditions', () => {
      it('returns correct colour at exactly 300°C (solidified threshold)', () => {
        expect(temperatureToColor(300)).toBe('#3a2010');
      });

      it('returns correct colour at exactly 1500°C boundary', () => {
        // 1500°C is the upper boundary for orange, so it should be orange
        expect(temperatureToColor(1500)).toBe('#ff8800');
      });

      it('handles very high temperatures', () => {
        expect(temperatureToColor(5000)).toBe('#ffff00');
      });

      it('handles negative temperatures', () => {
        expect(temperatureToColor(-500)).toBe('#3a2010');
      });
    });
  });

  describe('processColor', () => {
    it('returns #4488ff for rutile electrode type', () => {
      expect(processColor('rutile')).toBe('#4488ff');
    });

    it('returns #6644ff for basic electrode type', () => {
      expect(processColor('basic')).toBe('#6644ff');
    });

    it('returns #ff8800 for cellulosic electrode type', () => {
      expect(processColor('cellulosic')).toBe('#ff8800');
    });

    it('returns undefined for unknown electrode type', () => {
      expect(processColor('unknown')).toBeUndefined();
      expect(processColor('')).toBeUndefined();
    });
  });
});
