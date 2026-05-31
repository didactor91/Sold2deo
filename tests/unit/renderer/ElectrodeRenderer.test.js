/**
 * ElectrodeRenderer Unit Tests
 * @module tests/unit/renderer/ElectrodeRenderer.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ElectrodeRenderer', () => {
  /** @type {CanvasRenderingContext2D} */
  let mockCtx;

  beforeEach(() => {
    // Wrap fillStyle as a spy that records the last value set
    let _fillStyle = '';
    const fillStyleCalls = [];
    mockCtx = {
      _fillStyle: _fillStyle,
      get fillStyle() { return _fillStyle; },
      set fillStyle(v) {
        _fillStyle = v;
        fillStyleCalls.push(v);
      },
      fillStyleCalls,
      fillRect: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      beginPath: vi.fn(),
      createRadialGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
      fillText: vi.fn(),
    };
    // Mock performance.now for FPS guard
    global.performance = { now: vi.fn(() => 1000) };
  });

  afterEach(() => {
    delete global.performance;
  });

  describe('createElectrodeRenderer', () => {
    it('should return an object with render method', async () => {
      const { createElectrodeRenderer } = await import('../../../src/renderer/ElectrodeRenderer.js');
      const renderer = createElectrodeRenderer();
      expect(renderer).toHaveProperty('render');
      expect(typeof renderer.render).toBe('function');
    });
  });

  describe('render', () => {
    it('should draw electrode stick with rutile colour via fillRect', async () => {
      const { createElectrodeRenderer } = await import('../../../src/renderer/ElectrodeRenderer.js');
      const renderer = createElectrodeRenderer();
      const state = {
        electrode: { type: 'rutile', consumed: 0 },
        arc: { arcLength: 10, voltage: 20, heatInput: 5000, status: 'ok', established: true, amperage: 100 },
        droplet: { x: 400, y: 300, vy: 0, life: 0.8, detached: false, oscillationPhase: 0 },
        smokeParticles: [],
      };
      renderer.render(mockCtx, state, 0);
      // Stick is drawn via fillRect — find the call with 10x100 dimensions
      const stickCall = mockCtx.fillRect.mock.calls.find(
        call => call[2] === 10 && call[3] === 100
      );
      expect(stickCall).toBeDefined();
      // The fillStyle must have been '#4488ff' at the time of the stick fillRect
      // Since fillStyle is tracked via fillStyleCalls, find the call index
      const stickCallIndex = mockCtx.fillRect.mock.calls.indexOf(stickCall);
      // Verify fillStyle was rutile colour when stick was drawn
      expect(mockCtx.fillStyleCalls[stickCallIndex]).toBe('#4488ff');
    });

    it('should draw electrode stick with basic colour via fillRect', async () => {
      const { createElectrodeRenderer } = await import('../../../src/renderer/ElectrodeRenderer.js');
      const renderer = createElectrodeRenderer();
      const state = {
        electrode: { type: 'basic', consumed: 0 },
        arc: { arcLength: 10, voltage: 20, heatInput: 5000, status: 'ok', established: true, amperage: 100 },
        droplet: { x: 400, y: 300, vy: 0, life: 0.8, detached: false, oscillationPhase: 0 },
        smokeParticles: [],
      };
      renderer.render(mockCtx, state, 0);
      const stickCall = mockCtx.fillRect.mock.calls.find(
        call => call[2] === 10 && call[3] === 100
      );
      expect(stickCall).toBeDefined();
      const stickCallIndex = mockCtx.fillRect.mock.calls.indexOf(stickCall);
      expect(mockCtx.fillStyleCalls[stickCallIndex]).toBe('#6644ff');
    });

    it('should draw electrode stick with cellulosic colour via fillRect', async () => {
      const { createElectrodeRenderer } = await import('../../../src/renderer/ElectrodeRenderer.js');
      const renderer = createElectrodeRenderer();
      const state = {
        electrode: { type: 'cellulosic', consumed: 0 },
        arc: { arcLength: 10, voltage: 20, heatInput: 5000, status: 'ok', established: true, amperage: 100 },
        droplet: { x: 400, y: 300, vy: 0, life: 0.8, detached: false, oscillationPhase: 0 },
        smokeParticles: [],
      };
      renderer.render(mockCtx, state, 0);
      const stickCall = mockCtx.fillRect.mock.calls.find(
        call => call[2] === 10 && call[3] === 100
      );
      expect(stickCall).toBeDefined();
      const stickCallIndex = mockCtx.fillRect.mock.calls.indexOf(stickCall);
      expect(mockCtx.fillStyleCalls[stickCallIndex]).toBe('#ff8800');
    });

    it('should draw grey holder clamp via fillRect', async () => {
      const { createElectrodeRenderer } = await import('../../../src/renderer/ElectrodeRenderer.js');
      const renderer = createElectrodeRenderer();
      const state = {
        electrode: { type: 'rutile', consumed: 0 },
        arc: { arcLength: 10, voltage: 20, heatInput: 5000, status: 'ok', established: true, amperage: 100 },
        droplet: { x: 400, y: 300, vy: 0, life: 0.8, detached: false, oscillationPhase: 0 },
        smokeParticles: [],
      };
      renderer.render(mockCtx, state, 0);
      // Holder is 16x20 at stickX-8
      const holderCall = mockCtx.fillRect.mock.calls.find(
        call => call[2] === 16 && call[3] === 20
      );
      expect(holderCall).toBeDefined();
      const holderCallIndex = mockCtx.fillRect.mock.calls.indexOf(holderCall);
      expect(mockCtx.fillStyleCalls[holderCallIndex]).toBe('#555555');
    });

    it('should create radial gradient for arc glow', async () => {
      const { createElectrodeRenderer } = await import('../../../src/renderer/ElectrodeRenderer.js');
      const renderer = createElectrodeRenderer();
      const state = {
        electrode: { type: 'rutile', consumed: 0 },
        arc: { arcLength: 10, voltage: 20, heatInput: 5000, status: 'ok', established: true, amperage: 100 },
        droplet: { x: 400, y: 300, vy: 0, life: 0.8, detached: false, oscillationPhase: 0 },
        smokeParticles: [],
      };
      renderer.render(mockCtx, state, 0);
      expect(mockCtx.createRadialGradient).toHaveBeenCalled();
    });

    it('should draw droplet as filled circle', async () => {
      const { createElectrodeRenderer } = await import('../../../src/renderer/ElectrodeRenderer.js');
      const renderer = createElectrodeRenderer();
      const state = {
        electrode: { type: 'rutile', consumed: 0 },
        arc: { arcLength: 10, voltage: 20, heatInput: 5000, status: 'ok', established: true, amperage: 100 },
        droplet: { x: 400, y: 300, vy: 0, life: 0.8, detached: false, oscillationPhase: 0 },
        smokeParticles: [],
      };
      renderer.render(mockCtx, state, 0);
      expect(mockCtx.arc).toHaveBeenCalled();
    });

    it('should render smoke particles with upward drift', async () => {
      const { createElectrodeRenderer } = await import('../../../src/renderer/ElectrodeRenderer.js');
      const renderer = createElectrodeRenderer();
      const state = {
        electrode: { type: 'rutile', consumed: 0 },
        arc: { arcLength: 10, voltage: 20, heatInput: 5000, status: 'ok', established: true, amperage: 100 },
        droplet: { x: 400, y: 300, vy: 0, life: 0.8, detached: false, oscillationPhase: 0 },
        smokeParticles: [
          { x: 400, y: 300, vy: -1, life: 0.5, active: true, color: '#888888' },
          { x: 402, y: 298, vy: -1.2, life: 0.4, active: true, color: '#888888' },
        ],
      };
      renderer.render(mockCtx, state, 0);
      // smoke particles use arc for circles
      expect(mockCtx.arc).toHaveBeenCalled();
    });
  });
});
