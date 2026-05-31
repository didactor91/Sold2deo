/**
 * EventBus Unit Tests
 * @module tests/unit/game/EventBus.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEventBus } from '../../../src/core/EventBus.js';

describe('EventBus', () => {
  /** @type {ReturnType<typeof createEventBus>} */
  let eventBus;

  beforeEach(() => {
    eventBus = createEventBus();
  });

  describe('createEventBus', () => {
    it('should return an object with on, off, and emit methods', () => {
      expect(eventBus).toHaveProperty('on');
      expect(eventBus).toHaveProperty('off');
      expect(eventBus).toHaveProperty('emit');
      expect(typeof eventBus.on).toBe('function');
      expect(typeof eventBus.off).toBe('function');
      expect(typeof eventBus.emit).toBe('function');
    });
  });

  describe('emit and on', () => {
    it('should call handler when event is emitted', () => {
      const handler = vi.fn();
      eventBus.on('test:event', handler);
      eventBus.emit('test:event', { data: 42 });
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ data: 42 });
    });

    it('should pass multiple arguments to handler', () => {
      const handler = vi.fn();
      eventBus.on('test:multi', handler);
      eventBus.emit('test:multi', 'arg1', 'arg2', 42);
      expect(handler).toHaveBeenCalledWith('arg1', 'arg2', 42);
    });

    it('should call multiple handlers for same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      eventBus.on('test:multiHandler', handler1);
      eventBus.on('test:multiHandler', handler2);
      eventBus.emit('test:multiHandler', {});
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should NOT call handler after unsubscribe', () => {
      const handler = vi.fn();
      const unsubscribe = eventBus.on('test:off', handler);
      unsubscribe();
      eventBus.emit('test:off', {});
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('off', () => {
    it('should remove handler when off is called', () => {
      const handler = vi.fn();
      eventBus.on('test:remove', handler);
      eventBus.off('test:remove', handler);
      eventBus.emit('test:remove', {});
      expect(handler).not.toHaveBeenCalled();
    });

    it('should only remove the specified handler', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      eventBus.on('test:specific', handler1);
      eventBus.on('test:specific', handler2);
      eventBus.off('test:specific', handler1);
      eventBus.emit('test:specific', {});
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });
  });

  describe('emit without listeners', () => {
    it('should not throw when emitting event with no listeners', () => {
      expect(() => eventBus.emit('nonexistent', {})).not.toThrow();
    });
  });

  describe('event isolation', () => {
    it('should not share listeners between bus instances', () => {
      const bus1 = createEventBus();
      const bus2 = createEventBus();
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      bus1.on('isolated', handler1);
      bus2.on('isolated', handler2);
      bus1.emit('isolated', {});
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();
    });
  });
});
