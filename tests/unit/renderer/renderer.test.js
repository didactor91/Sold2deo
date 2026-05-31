/**
 * Renderer Config Unit Tests
 * @module tests/unit/renderer/renderer.test
 */

import { describe, it, expect } from 'vitest';
import * as renderer from '../../../src/config/renderer.js';

describe('renderer config', () => {
  describe('TEMP_COLOURS', () => {
    it('should export all 6 temperature thresholds as non-empty strings', () => {
      expect(renderer.TEMP_COLOURS).toBeDefined();
      expect(typeof renderer.TEMP_COLOURS).toBe('object');
      // All values must be non-empty hex colour strings
      Object.values(renderer.TEMP_COLOURS).forEach((colour) => {
        expect(colour).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it('should have exactly 6 temperature entries', () => {
      expect(Object.keys(renderer.TEMP_COLOURS)).toHaveLength(6);
    });
  });

  describe('ARC_GLOW_COLOURS', () => {
    it('should export arc glow colours for all 3 process types', () => {
      expect(renderer.ARC_GLOW_COLOURS).toBeDefined();
      expect(typeof renderer.ARC_GLOW_COLOURS).toBe('object');
      expect(renderer.ARC_GLOW_COLOURS).toHaveProperty('rutile');
      expect(renderer.ARC_GLOW_COLOURS).toHaveProperty('basic');
      expect(renderer.ARC_GLOW_COLOURS).toHaveProperty('cellulosic');
    });

    it('should have valid hex colours for all arc glow types', () => {
      Object.values(renderer.ARC_GLOW_COLOURS).forEach((colour) => {
        expect(colour).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe('BASE_METAL', () => {
    it('should be a valid non-empty hex colour string', () => {
      expect(renderer.BASE_METAL).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('SLAG_FILL and SLAG_CRUST', () => {
    it('should be valid non-empty hex colour strings', () => {
      expect(renderer.SLAG_FILL).toMatch(/^#[0-9a-f]{6}$/i);
      expect(renderer.SLAG_CRUST).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should be different colours', () => {
      expect(renderer.SLAG_FILL).not.toBe(renderer.SLAG_CRUST);
    });
  });

  describe('HAZ_BLOOM', () => {
    it('should be a valid non-empty hex colour string', () => {
      expect(renderer.HAZ_BLOOM).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('UI colours', () => {
    it('should export all required UI colour constants', () => {
      expect(renderer.UI_SCORE_COLOUR).toMatch(/^#[0-9a-f]{6}$/i);
      expect(renderer.UI_ARC_OK).toMatch(/^#[0-9a-f]{6}$/i);
      expect(renderer.UI_ARC_SHORT).toMatch(/^#[0-9a-f]{6}$/i);
      expect(renderer.UI_ARC_LONG).toMatch(/^#[0-9a-f]{6}$/i);
      expect(renderer.UI_ARC_BROKEN).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('FPS_FALLBACK', () => {
    it('should be 55', () => {
      expect(renderer.FPS_FALLBACK).toBe(55);
    });
  });

  describe('particle constants', () => {
    it('should export PARTICLE_RADIUS as 1', () => {
      expect(renderer.PARTICLE_RADIUS).toBe(1);
    });

    it('should export MAX_PARTICLES as 512', () => {
      expect(renderer.MAX_PARTICLES).toBe(512);
    });

    it('should export smoke bounds and alpha max', () => {
      expect(renderer.SMOKE_MIN).toBe(3);
      expect(renderer.SMOKE_MAX).toBe(5);
      expect(renderer.SMOKE_ALPHA_MAX).toBe(0.6);
    });

    it('SMOKE_MIN should be less than SMOKE_MAX', () => {
      expect(renderer.SMOKE_MIN).toBeLessThan(renderer.SMOKE_MAX);
    });
  });
});
