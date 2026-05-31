/**
 * UIRenderer Unit Tests
 * @module tests/unit/renderer/UIRenderer.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('UIRenderer', () => {
  /** @type {CanvasRenderingContext2D} */
  let mockCtx;

  beforeEach(() => {
    mockCtx = {
      fillStyle: '',
      fillRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      font: '',
      globalAlpha: 1,
    };
  });

  describe('createUIRenderer', () => {
    it('should return an object with render method', async () => {
      const { createUIRenderer } = await import('../../../src/renderer/UIRenderer.js');
      const renderer = createUIRenderer();
      expect(renderer).toHaveProperty('render');
      expect(typeof renderer.render).toBe('function');
    });
  });

  describe('render', () => {
    it('should render score text in top-left with correct font and colour', async () => {
      const { createUIRenderer } = await import('../../../src/renderer/UIRenderer.js');
      const renderer = createUIRenderer();
      const state = {
        score: 8500,
        chipMode: false,
        arc: { status: 'ok' },
      };
      renderer.render(mockCtx, state, 0);
      // Verify the fillText call for score contains correct text
      const scoreCall = mockCtx.fillText.mock.calls.find(
        call => call[0] && call[0].toString().includes('8500')
      );
      expect(scoreCall).toBeDefined();
      expect(mockCtx.font).toBe('12px monospace');
    });

    it('should display arc status ok as green badge', async () => {
      const { createUIRenderer } = await import('../../../src/renderer/UIRenderer.js');
      const renderer = createUIRenderer();
      const state = {
        score: 0,
        chipMode: false,
        arc: { status: 'ok' },
      };
      renderer.render(mockCtx, state, 0);
      // Badge is a fillRect — find12x12 rect at y=30
      const badgeCall = mockCtx.fillRect.mock.calls.find(
        call => call[0] === 10 && call[1] === 30 && call[2] === 12 && call[3] === 12
      );
      expect(badgeCall).toBeDefined();
      expect(mockCtx.fillStyle).toBe('#44ff44');
    });

    it('should display arc status short as red badge', async () => {
      const { createUIRenderer } = await import('../../../src/renderer/UIRenderer.js');
      const renderer = createUIRenderer();
      const state = {
        score: 0,
        chipMode: false,
        arc: { status: 'short' },
      };
      renderer.render(mockCtx, state, 0);
      const badgeCall = mockCtx.fillRect.mock.calls.find(
        call => call[0] === 10 && call[1] === 30 && call[2] === 12 && call[3] === 12
      );
      expect(badgeCall).toBeDefined();
      expect(mockCtx.fillStyle).toBe('#ff4444');
    });

    it('should display arc status long as orange badge', async () => {
      const { createUIRenderer } = await import('../../../src/renderer/UIRenderer.js');
      const renderer = createUIRenderer();
      const state = {
        score: 0,
        chipMode: false,
        arc: { status: 'long' },
      };
      renderer.render(mockCtx, state, 0);
      const badgeCall = mockCtx.fillRect.mock.calls.find(
        call => call[0] === 10 && call[1] === 30 && call[2] === 12 && call[3] === 12
      );
      expect(badgeCall).toBeDefined();
      expect(mockCtx.fillStyle).toBe('#ffaa00');
    });

    it('should display arc status broken as red badge', async () => {
      const { createUIRenderer } = await import('../../../src/renderer/UIRenderer.js');
      const renderer = createUIRenderer();
      const state = {
        score: 0,
        chipMode: false,
        arc: { status: 'broken' },
      };
      renderer.render(mockCtx, state, 0);
      const badgeCall = mockCtx.fillRect.mock.calls.find(
        call => call[0] === 10 && call[1] === 30 && call[2] === 12 && call[3] === 12
      );
      expect(badgeCall).toBeDefined();
      expect(mockCtx.fillStyle).toBe('#ff0000');
    });

    it('should show chip mode indicator when chipMode is true', async () => {
      const { createUIRenderer } = await import('../../../src/renderer/UIRenderer.js');
      const renderer = createUIRenderer();
      const state = {
        score: 0,
        chipMode: true,
        arc: { status: 'ok' },
      };
      renderer.render(mockCtx, state, 0);
      const chipModeCall = mockCtx.fillText.mock.calls.find(
        call => call[0] && call[0].toString().includes('CHIP MODE')
      );
      expect(chipModeCall).toBeDefined();
      expect(mockCtx.fillStyle).toBe('#ffaa00');
    });

    it('should hide chip mode indicator when chipMode is false', async () => {
      const { createUIRenderer } = await import('../../../src/renderer/UIRenderer.js');
      const renderer = createUIRenderer();
      const state = {
        score: 0,
        chipMode: false,
        arc: { status: 'ok' },
      };
      renderer.render(mockCtx, state, 0);
      // No call should contain 'CHIP MODE'
      const chipModeCalls = mockCtx.fillText.mock.calls.filter(call =>
        call[0] && call[0].toString().includes('CHIP MODE')
      );
      expect(chipModeCalls).toHaveLength(0);
    });
  });
});
