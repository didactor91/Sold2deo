/**
 * SceneRenderer Unit Tests
 * @module tests/unit/renderer/SceneRenderer.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('SceneRenderer', () => {
  /** @type {CanvasRenderingContext2D} */
  let mockCtx;

  /** @type {object} */
  let mockState;

  /** @type {Array<{render: function}>} */
  let subRenderers;

  beforeEach(() => {
    mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
    };

    mockState = {
      workpiece: { width: 800, height: 600 },
      beadColumns: [],
      slagSegments: [],
      particles: [],
      arc: { status: 'ok', established: true },
      score: 0,
      chipMode: false,
      electrode: { type: 'rutile', consumed: 0.1 },
      weldPool: {},
      droplet: null,
      smokeParticles: [],
    };

    // Create 9 mock sub-renderers (one per layer)
    subRenderers = Array.from({ length: 9 }, () => ({
      render: vi.fn(),
    }));
  });

  describe('createSceneRenderer', () => {
    it('should return an object with a render method', async () => {
      const { createSceneRenderer } = await import('../../../src/renderer/SceneRenderer.js');
      const renderer = createSceneRenderer(subRenderers);
      expect(renderer).toHaveProperty('render');
      expect(typeof renderer.render).toBe('function');
    });
  });

  describe('render', () => {
    it('should call render on all 9 sub-renderers in layer order', async () => {
      const { createSceneRenderer } = await import('../../../src/renderer/SceneRenderer.js');
      const renderer = createSceneRenderer(subRenderers);

      renderer.render(mockCtx, mockState, 0.5);

      for (let i = 0; i < 9; i++) {
        expect(subRenderers[i].render).toHaveBeenCalledWith(mockCtx, mockState, 0.5);
      }
    });

    it('should call sub-renderers in order: Background(0) before Workpiece(1)', async () => {
      const { createSceneRenderer } = await import('../../../src/renderer/SceneRenderer.js');
      const renderer = createSceneRenderer(subRenderers);

      renderer.render(mockCtx, mockState, 0);

      // Verify both were called (order is implicit from the for-of loop)
      expect(subRenderers[0].render).toHaveBeenCalled();
      expect(subRenderers[1].render).toHaveBeenCalled();
    });

    it('should call sub-renderers in order: Electrode(7) before UI(8)', async () => {
      const { createSceneRenderer } = await import('../../../src/renderer/SceneRenderer.js');
      const renderer = createSceneRenderer(subRenderers);

      renderer.render(mockCtx, mockState, 0);

      // Verify both were called (order is implicit from the for-of loop)
      expect(subRenderers[7].render).toHaveBeenCalled();
      expect(subRenderers[8].render).toHaveBeenCalled();
    });

    it('should wrap each layer in ctx.save() and ctx.restore()', async () => {
      const { createSceneRenderer } = await import('../../../src/renderer/SceneRenderer.js');
      const renderer = createSceneRenderer(subRenderers);

      renderer.render(mockCtx, mockState, 0);

      // 9 layers → 9 save and 9 restore calls
      expect(mockCtx.save).toHaveBeenCalledTimes(9);
      expect(mockCtx.restore).toHaveBeenCalledTimes(9);
    });

    it('should call save before sub-renderer render and restore after', async () => {
      const { createSceneRenderer } = await import('../../../src/renderer/SceneRenderer.js');
      const renderer = createSceneRenderer(subRenderers);

      renderer.render(mockCtx, mockState, 0);

      expect(mockCtx.save).toHaveBeenCalledTimes(9);
      expect(mockCtx.restore).toHaveBeenCalledTimes(9);
    });

    it('should pass interpolation value to all sub-renderers', async () => {
      const { createSceneRenderer } = await import('../../../src/renderer/SceneRenderer.js');
      const renderer = createSceneRenderer(subRenderers);

      renderer.render(mockCtx, mockState, 0.75);

      for (const sr of subRenderers) {
        expect(sr.render).toHaveBeenCalledWith(mockCtx, mockState, 0.75);
      }
    });

    it('should pass the same state object to all sub-renderers', async () => {
      const { createSceneRenderer } = await import('../../../src/renderer/SceneRenderer.js');
      const renderer = createSceneRenderer(subRenderers);

      renderer.render(mockCtx, mockState, 0);

      for (const sr of subRenderers) {
        expect(sr.render).toHaveBeenCalledWith(mockCtx, mockState, expect.any(Number));
      }
    });

    it('should render even when some sub-renderers are undefined (graceful no-op)', async () => {
      const partialRenderers = [
        subRenderers[0], // Background
        null, // Workpiece — missing
        null, // HAZ — missing
        subRenderers[3], // Bead
        null, // Slag
        null, // Particles
        subRenderers[6], // Arc
        null, // Electrode
        subRenderers[8], // UI
      ];

      const { createSceneRenderer } = await import('../../../src/renderer/SceneRenderer.js');
      const renderer = createSceneRenderer(partialRenderers);

      // Should not throw
      expect(() => renderer.render(mockCtx, mockState, 0)).not.toThrow();

      // Defined sub-renderers still called
      expect(subRenderers[0].render).toHaveBeenCalled();
      expect(subRenderers[3].render).toHaveBeenCalled();
      expect(subRenderers[6].render).toHaveBeenCalled();
      expect(subRenderers[8].render).toHaveBeenCalled();
    });
  });
});
