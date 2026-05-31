/**
 * ParticleRenderer Unit Tests
 * @module tests/unit/renderer/ParticleRenderer.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ParticleRenderer', () => {
  /** @type {CanvasRenderingContext2D} */
  let mockCtx;

  beforeEach(() => {
    const globalAlphaCalls = [];
    let _globalAlpha = 1;
    mockCtx = {
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      fillStyle: '',
      get globalAlpha() { return _globalAlpha; },
      set globalAlpha(v) {
        _globalAlpha = v;
        globalAlphaCalls.push(v);
      },
      globalAlphaCalls,
    };
  });

  describe('createParticleRenderer', () => {
    it('should return an object with a render method', async () => {
      const { createParticleRenderer } = await import('../../../src/renderer/ParticleRenderer.js');
      const renderer = createParticleRenderer();
      expect(renderer).toHaveProperty('render');
      expect(typeof renderer.render).toBe('function');
    });
  });

  describe('render', () => {
    it('should skip inactive particles', async () => {
      const { createParticleRenderer } = await import('../../../src/renderer/ParticleRenderer.js');
      const renderer = createParticleRenderer();
      const state = {
        particles: [
          { x: 10, y: 20, vx: 1, vy: 2, life: 0.5, active: false, color: '#ff8800' },
          { x: 30, y: 40, vx: 1, vy: 2, life: 0.8, active: true, color: '#ff8800' },
        ],
      };
      renderer.render(mockCtx, state, 0);
      // arc should only be called for the active particle
      expect(mockCtx.arc).toHaveBeenCalledTimes(1);
      expect(mockCtx.arc).toHaveBeenCalledWith(30, 40, 1, 0, Math.PI * 2);
    });

    it('should draw 2px diameter circles for active particles', async () => {
      const { createParticleRenderer } = await import('../../../src/renderer/ParticleRenderer.js');
      const renderer = createParticleRenderer();
      const state = {
        particles: [
          { x: 100, y: 200, vx: 0, vy: 0, life: 1.0, active: true, color: '#ffff00' },
        ],
      };
      renderer.render(mockCtx, state, 0);
      // radius 1 =2px diameter circle
      expect(mockCtx.arc).toHaveBeenCalledWith(100, 200, 1, 0, Math.PI * 2);
    });

    it('should set globalAlpha from particle.life', async () => {
      const { createParticleRenderer } = await import('../../../src/renderer/ParticleRenderer.js');
      const renderer = createParticleRenderer();
      const state = {
        particles: [
          { x: 50, y: 60, vx: 0, vy: 0, life: 0.3, active: true, color: '#ff8800' },
        ],
      };
      renderer.render(mockCtx, state, 0);
      // globalAlpha should have been set to 0.3 for this particle
      expect(mockCtx.globalAlphaCalls).toContain(0.3);
    });

    it('should set fillStyle from particle.color', async () => {
      const { createParticleRenderer } = await import('../../../src/renderer/ParticleRenderer.js');
      const renderer = createParticleRenderer();
      const state = {
        particles: [
          { x: 50, y: 60, vx: 0, vy: 0, life: 1.0, active: true, color: '#ff8800' },
        ],
      };
      renderer.render(mockCtx, state, 0);
      expect(mockCtx.fillStyle).toBe('#ff8800');
    });

    it('should batch same-colour particles in one fill call', async () => {
      const { createParticleRenderer } = await import('../../../src/renderer/ParticleRenderer.js');
      const renderer = createParticleRenderer();
      const state = {
        particles: [
          { x: 10, y: 20, vx: 0, vy: 0, life: 1.0, active: true, color: '#ff8800' },
          { x: 30, y: 40, vx: 0, vy: 0, life: 0.9, active: true, color: '#ff8800' },
          { x: 50, y: 60, vx: 0, vy: 0, life: 0.8, active: true, color: '#ff8800' },
        ],
      };
      renderer.render(mockCtx, state, 0);
      // one beginPath, 3 arcs, one fill for same colour
      expect(mockCtx.beginPath).toHaveBeenCalledTimes(1);
      expect(mockCtx.arc).toHaveBeenCalledTimes(3);
      expect(mockCtx.fill).toHaveBeenCalledTimes(1);
    });

    it('should use separate batches for different colours', async () => {
      const { createParticleRenderer } = await import('../../../src/renderer/ParticleRenderer.js');
      const renderer = createParticleRenderer();
      const state = {
        particles: [
          { x: 10, y: 20, vx: 0, vy: 0, life: 1.0, active: true, color: '#ff8800' },
          { x: 30, y: 40, vx: 0, vy: 0, life: 0.9, active: true, color: '#ffff00' },
        ],
      };
      renderer.render(mockCtx, state, 0);
      // two batches: one per colour
      expect(mockCtx.beginPath).toHaveBeenCalledTimes(2);
      expect(mockCtx.fill).toHaveBeenCalledTimes(2);
    });

    it('should handle empty particles array gracefully', async () => {
      const { createParticleRenderer } = await import('../../../src/renderer/ParticleRenderer.js');
      const renderer = createParticleRenderer();
      const state = { particles: [] };
      renderer.render(mockCtx, state, 0);
      expect(mockCtx.beginPath).not.toHaveBeenCalled();
      expect(mockCtx.arc).not.toHaveBeenCalled();
      expect(mockCtx.fill).not.toHaveBeenCalled();
    });
  });
});
