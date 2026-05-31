/**
 * WorkpieceRenderer Unit Tests
 * @module tests/unit/renderer/WorkpieceRenderer.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('WorkpieceRenderer', () => {
  /** @type {CanvasRenderingContext2D} */
  let mockCtx;
  /** @type {HTMLCanvasElement} */
  let mockHazCanvas;
  /** @type {CanvasRenderingContext2D} */
  let mockHazCtx;

  beforeEach(() => {
    mockCtx = {
      fillStyle: '',
      fillRect: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      drawImage: vi.fn(),
      beginPath: vi.fn(),
    };
    mockHazCtx = {
      drawImage: vi.fn(),
    };
    mockHazCanvas = {
      getContext: vi.fn(() => mockHazCtx),
      width: 800,
      height: 600,
    };
    global.document = {
      createElement: vi.fn(() => mockHazCanvas),
    };
  });

  afterEach(() => {
    delete global.document;
  });

  describe('createWorkpieceRenderer', () => {
    it('should return an object with init and render methods', async () => {
      const { createWorkpieceRenderer } = await import('../../../src/renderer/WorkpieceRenderer.js');
      const renderer = createWorkpieceRenderer(mockHazCanvas);
      expect(renderer).toHaveProperty('init');
      expect(renderer).toHaveProperty('render');
      expect(typeof renderer.init).toBe('function');
      expect(typeof renderer.render).toBe('function');
    });
  });

  describe('render', () => {
    it('should draw base metal rectangle with BASE_METAL colour', async () => {
      const { createWorkpieceRenderer } = await import('../../../src/renderer/WorkpieceRenderer.js');
      const renderer = createWorkpieceRenderer(mockHazCanvas);
      renderer.init();
      const state = {
        workpiece: { width: 800, height: 600 },
        beadColumns: [],
        slagSegments: [],
      };
      renderer.render(mockCtx, state, 0);
      // First fillRect call is base metal
      expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
      expect(mockCtx.fillStyle).toBe('#2a2a2a');
    });

    it('should colour bead column by temperature using temperatureToColor', async () => {
      const { createWorkpieceRenderer } = await import('../../../src/renderer/WorkpieceRenderer.js');
      const renderer = createWorkpieceRenderer(mockHazCanvas);
      renderer.init();
      const state = {
        workpiece: { width: 800, height: 600 },
        beadColumns: [
          { x: 100, baseY: 500, height: 50, temperature: 1600, hasSlag: false, slagRemoved: false },
        ],
        slagSegments: [],
      };
      renderer.render(mockCtx, state, 0);
      // Verify fillStyle was set to yellow for temperature1600 (>1500)
      expect(mockCtx.fillStyle).toBe('#ffff00');
    });

    it('should render solidified column in dark brown', async () => {
      const { createWorkpieceRenderer } = await import('../../../src/renderer/WorkpieceRenderer.js');
      const renderer = createWorkpieceRenderer(mockHazCanvas);
      renderer.init();
      const state = {
        workpiece: { width: 800, height: 600 },
        beadColumns: [
          { x: 200, baseY: 500, height: 50, temperature: 280, hasSlag: false, slagRemoved: false },
        ],
        slagSegments: [],
      };
      renderer.render(mockCtx, state, 0);
      // temperature 280 ≤ 300 → '#3a2010'
      expect(mockCtx.fillStyle).toBe('#3a2010');
    });

    it('should use ctx.arc for rounded bead caps', async () => {
      const { createWorkpieceRenderer } = await import('../../../src/renderer/WorkpieceRenderer.js');
      const renderer = createWorkpieceRenderer(mockHazCanvas);
      renderer.init();
      const state = {
        workpiece: { width: 800, height: 600 },
        beadColumns: [
          { x: 100, baseY: 500, height: 50, temperature: 1000, hasSlag: false, slagRemoved: false },
        ],
        slagSegments: [],
      };
      renderer.render(mockCtx, state, 0);
      expect(mockCtx.arc).toHaveBeenCalled();
    });

    it('should composite HAZ from hazCanvas via drawImage', async () => {
      const { createWorkpieceRenderer } = await import('../../../src/renderer/WorkpieceRenderer.js');
      const renderer = createWorkpieceRenderer(mockHazCanvas);
      renderer.init();
      const state = {
        workpiece: { width: 800, height: 600 },
        beadColumns: [],
        slagSegments: [],
      };
      renderer.render(mockCtx, state, 0);
      expect(mockCtx.drawImage).toHaveBeenCalledWith(mockHazCanvas, 0, 0);
    });

    it('should render slag fill then crust via separate fillRect calls', async () => {
      const { createWorkpieceRenderer } = await import('../../../src/renderer/WorkpieceRenderer.js');
      const renderer = createWorkpieceRenderer(mockHazCanvas);
      renderer.init();
      const state = {
        workpiece: { width: 800, height: 600 },
        beadColumns: [],
        slagSegments: [
          { x: 100, width: 80, thickness: 10, removed: false },
        ],
      };
      renderer.render(mockCtx, state, 0);
      // slag fillRect call uses SLAG_FILL '#3a1f00'
      const slagFillCall = mockCtx.fillRect.mock.calls.find(
        call => call[2] === 80 && call[3] === 10
      );
      expect(slagFillCall).toBeDefined();
    });
  });
});
