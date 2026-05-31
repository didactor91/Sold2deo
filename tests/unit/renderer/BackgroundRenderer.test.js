/**
 * BackgroundRenderer Unit Tests
 * @module tests/unit/renderer/BackgroundRenderer.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('BackgroundRenderer', () => {
  /** @type {HTMLCanvasElement} */
  let mockCanvas;
  /** @type {CanvasRenderingContext2D} */
  let mockCtx;
  /** @type {HTMLCanvasElement} */
  let mockBgCanvas;
  /** @type {CanvasRenderingContext2D} */
  let mockBgCtx;

  beforeEach(() => {
    mockCtx = {
      fillStyle: '',
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    };
    mockBgCtx = {
      fillStyle: '',
      fillRect: vi.fn(),
    };
    mockBgCanvas = {
      getContext: vi.fn(() => mockBgCtx),
      width: 800,
      height: 600,
    };
    mockCanvas = {
      getContext: vi.fn(() => mockCtx),
      width: 800,
      height: 600,
    };
    // Mock document.createElement
    global.document = {
      createElement: vi.fn(() => mockBgCanvas),
    };
  });

  afterEach(() => {
    delete global.document;
  });

  describe('createBackgroundRenderer', () => {
    it('should return an object with init and redraw methods', async () => {
      const { createBackgroundRenderer } = await import('../../../src/renderer/BackgroundRenderer.js');
      const renderer = createBackgroundRenderer(mockCanvas);
      expect(renderer).toHaveProperty('init');
      expect(renderer).toHaveProperty('redraw');
      expect(typeof renderer.init).toBe('function');
      expect(typeof renderer.redraw).toBe('function');
    });

    it('should draw base metal rectangle on init', async () => {
      const { createBackgroundRenderer } = await import('../../../src/renderer/BackgroundRenderer.js');
      const renderer = createBackgroundRenderer(mockCanvas);
      renderer.init();
      expect(mockBgCtx.fillRect).toHaveBeenCalledWith(0, 0, mockBgCanvas.width, mockBgCanvas.height);
    });

    it('should draw to off-screen canvas on init (not main canvas)', async () => {
      const { createBackgroundRenderer } = await import('../../../src/renderer/BackgroundRenderer.js');
      const renderer = createBackgroundRenderer(mockCanvas);
      renderer.init();
      // init() draws to the off-screen canvas bgCtx, not the main ctx
      expect(mockBgCtx.fillRect).toHaveBeenCalled();
      expect(mockCtx.drawImage).not.toHaveBeenCalled();
    });

    it('redraw should composite the background onto the main canvas', async () => {
      const { createBackgroundRenderer } = await import('../../../src/renderer/BackgroundRenderer.js');
      const renderer = createBackgroundRenderer(mockCanvas);
      renderer.init();
      renderer.redraw(mockCtx);
      expect(mockCtx.drawImage).toHaveBeenCalledWith(mockBgCanvas, 0, 0);
    });

    it('should use BASE_METAL colour from config', async () => {
      const { createBackgroundRenderer } = await import('../../../src/renderer/BackgroundRenderer.js');
      const renderer = createBackgroundRenderer(mockCanvas);
      renderer.init();
      // Verify fillStyle was set on the off-screen canvas context
      expect(mockBgCtx.fillStyle).toBe('#2a2a2a');
    });
  });
});
