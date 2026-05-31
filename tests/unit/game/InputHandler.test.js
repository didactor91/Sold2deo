/**
 * InputHandler Unit Tests
 * @module tests/unit/game/InputHandler.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createInputHandler } from '../../../src/game/InputHandler.js';

function createMockArcPhysics() {
  return {
    updateArc: vi.fn(() => ({ arcLength: 3, voltage: 4.5, heatInput: 10, status: 'OK' })),
  };
}

function createMockEventBus() {
  return {
    on: vi.fn(() => vi.fn()),
    off: vi.fn(),
    emit: vi.fn(),
  };
}

function createMockWeldSession() {
  return {
    onInput: vi.fn(),
    abort: vi.fn(),
  };
}

describe('InputHandler', () => {
  describe('createInputHandler', () => {
    it('should return an object with poll and getState methods', () => {
      const arcPhysics = createMockArcPhysics();
      const eventBus = createMockEventBus();
      const weldSession = createMockWeldSession();
      const handler = createInputHandler({ arcPhysics, weldSession, eventBus });
      expect(handler).toHaveProperty('poll');
      expect(handler).toHaveProperty('getState');
      expect(typeof handler.poll).toBe('function');
      expect(typeof handler.getState).toBe('function');
    });
  });

  describe('getState', () => {
    it('should return initial state with mouseDown false', () => {
      const arcPhysics = createMockArcPhysics();
      const eventBus = createMockEventBus();
      const weldSession = createMockWeldSession();
      const handler = createInputHandler({ arcPhysics, weldSession, eventBus });
      const state = handler.getState();
      expect(state.mouseDown).toBe(false);
      expect(state.chipMode).toBe(false);
    });
  });

  describe('mouse position buffer', () => {
    it('should store mouse positions in a circular buffer', () => {
      const arcPhysics = createMockArcPhysics();
      const eventBus = createMockEventBus();
      const weldSession = createMockWeldSession();
      const handler = createInputHandler({ arcPhysics, weldSession, eventBus });

      // Simulate mouse movements
      handler.handleMouseMove({ mouseX: 100, mouseY: 200 });
      handler.handleMouseMove({ mouseX: 110, mouseY: 205 });
      handler.handleMouseMove({ mouseX: 120, mouseY: 210 });

      const state = handler.getState();
      expect(state.mouseX).toBe(120);
      expect(state.mouseY).toBe(210);
    });
  });

  describe('travel speed calculation', () => {
    it('should compute travel speed from X displacement over buffer', () => {
      const arcPhysics = createMockArcPhysics();
      const eventBus = createMockEventBus();
      const weldSession = createMockWeldSession();
      const handler = createInputHandler({ arcPhysics, weldSession, eventBus });

      // Simulate 10 mouse moves to fill buffer
      for (let i = 0; i < 10; i++) {
        handler.handleMouseMove({ mouseX: 100 + i * 10, mouseY: 200 });
      }

      const state = handler.getState();
      // 100px over ~0.167s (10 ticks at 60fps) ≈ 600 px/s
      expect(state.travelSpeed).toBeGreaterThan(0);
    });
  });

  describe('arc length from mouse Y', () => {
    it('should compute arc length as |mouseY - surfaceY|', () => {
      const arcPhysics = createMockArcPhysics();
      const eventBus = createMockEventBus();
      const weldSession = createMockWeldSession();
      const handler = createInputHandler({ arcPhysics, weldSession, eventBus });

      // surfaceY = 300, mouseY = 303 → arcLength = 3
      handler.handleMouseMove({ mouseX: 100, mouseY: 303 });
      handler.poll({ surfaceY: 300 });

      const state = handler.getState();
      expect(state.arcLength).toBe(3);
    });
  });

  describe('keyboard chip mode toggle', () => {
    it('should toggle chip mode on C key', () => {
      const arcPhysics = createMockArcPhysics();
      const eventBus = createMockEventBus();
      const weldSession = createMockWeldSession();
      const handler = createInputHandler({ arcPhysics, weldSession, eventBus });

      expect(handler.getState().chipMode).toBe(false);
      handler.handleKeyDown({ key: 'c' });
      expect(handler.getState().chipMode).toBe(true);
      handler.handleKeyDown({ key: 'c' });
      expect(handler.getState().chipMode).toBe(false);
    });
  });

  describe('keyboard strike trigger', () => {
    it('should emit input:strike on Space when session is IDLE', () => {
      const arcPhysics = createMockArcPhysics();
      const eventBus = createMockEventBus();
      const weldSession = createMockWeldSession();
      const handler = createInputHandler({ arcPhysics, weldSession, eventBus });

      handler.handleKeyDown({ key: ' ' });
      expect(eventBus.emit).toHaveBeenCalledWith('input:strike');
    });
  });

  describe('keyboard abort', () => {
    it('should call weldSession.abort on Escape', () => {
      const arcPhysics = createMockArcPhysics();
      const eventBus = createMockEventBus();
      const weldSession = createMockWeldSession();
      const handler = createInputHandler({ arcPhysics, weldSession, eventBus });

      handler.handleKeyDown({ key: 'Escape' });
      expect(weldSession.abort).toHaveBeenCalled();
    });
  });

  describe('mousedown/mouseup', () => {
    it('should set mouseDown true on mousedown', () => {
      const arcPhysics = createMockArcPhysics();
      const eventBus = createMockEventBus();
      const weldSession = createMockWeldSession();
      const handler = createInputHandler({ arcPhysics, weldSession, eventBus });

      handler.handleMouseDown({ button: 0 });
      expect(handler.getState().mouseDown).toBe(true);
    });

    it('should set mouseDown false on mouseup', () => {
      const arcPhysics = createMockArcPhysics();
      const eventBus = createMockEventBus();
      const weldSession = createMockWeldSession();
      const handler = createInputHandler({ arcPhysics, weldSession, eventBus });

      handler.handleMouseDown({ button: 0 });
      handler.handleMouseUp({ button: 0 });
      expect(handler.getState().mouseDown).toBe(false);
    });
  });
});
