/**
 * @file EventBus tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventBus } from '../../../src/core/EventBus.js';

describe('EventBus', () => {
  let eventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('on()', () => {
    it('subscribes a handler to an event', () => {
      const handler = vi.fn();
      eventBus.on('testEvent', handler);
      eventBus.emit('testEvent', { data: 42 });
      expect(handler).toHaveBeenCalledWith({ data: 42 });
    });

    it('allows multiple handlers for the same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      eventBus.on('testEvent', handler1);
      eventBus.on('testEvent', handler2);
      eventBus.emit('testEvent', {});
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('subscribes with different data', () => {
      const handler = vi.fn();
      eventBus.on('creditsUpdated', handler);
      eventBus.emit('creditsUpdated', { totalCredits: 100 });
      expect(handler).toHaveBeenCalledWith({ totalCredits: 100 });
    });
  });

  describe('off()', () => {
    it('unsubscribes a handler from an event', () => {
      const handler = vi.fn();
      eventBus.on('testEvent', handler);
      eventBus.off('testEvent', handler);
      eventBus.emit('testEvent', {});
      expect(handler).not.toHaveBeenCalled();
    });

    it('only removes the specified handler', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      eventBus.on('testEvent', handler1);
      eventBus.on('testEvent', handler2);
      eventBus.off('testEvent', handler1);
      eventBus.emit('testEvent', {});
      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('emit()', () => {
    it('passes data to all handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      eventBus.on('dataEvent', handler1);
      eventBus.on('dataEvent', handler2);
      eventBus.emit('dataEvent', { value: 'test' });
      expect(handler1).toHaveBeenCalledWith({ value: 'test' });
      expect(handler2).toHaveBeenCalledWith({ value: 'test' });
    });

    it('handles emit with no subscribers', () => {
      expect(() => eventBus.emit('nonexistent', {})).not.toThrow();
    });
  });

  describe('once()', () => {
    it('calls handler only once', () => {
      const handler = vi.fn();
      eventBus.once('singleEvent', handler);
      eventBus.emit('singleEvent', {});
      eventBus.emit('singleEvent', {});
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
