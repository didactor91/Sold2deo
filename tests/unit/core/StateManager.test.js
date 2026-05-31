/**
 * @file StateManager tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StateManager } from '../../../src/core/StateManager.js';
import { EventBus } from '../../../src/core/EventBus.js';

describe('StateManager', () => {
  let eventBus;
  let stateManager;

  beforeEach(() => {
    eventBus = new EventBus();
    stateManager = new StateManager(eventBus);
  });

  describe('getState()', () => {
    it('returns current state', () => {
      const state = stateManager.getState();
      expect(state).toBeDefined();
      expect(typeof state).toBe('object');
    });

    it('returns state with expected shape', () => {
      const state = stateManager.getState();
      expect(state).toHaveProperty('credits');
      expect(state).toHaveProperty('bots');
      expect(state).toHaveProperty('activeBots');
    });
  });

  describe('setState()', () => {
    it('merges new state with existing', () => {
      stateManager.setState({ credits: 100 });
      const state = stateManager.getState();
      expect(state.credits).toBe(100);
    });

    it('emits stateChanged event', () => {
      const handler = vi.fn();
      eventBus.on('stateChanged', handler);
      stateManager.setState({ credits: 200 });
      expect(handler).toHaveBeenCalled();
    });
  });

  describe('updateCredits()', () => {
    it('updates credits value', () => {
      stateManager.updateCredits(500);
      expect(stateManager.getState().credits).toBe(500);
    });
  });

  describe('addBot()', () => {
    it('adds a bot to state', () => {
      const bot = { id: 'bot_1', tier: 1, quality: 80 };
      stateManager.addBot(bot);
      const state = stateManager.getState();
      expect(state.bots).toContainEqual(expect.objectContaining({ id: 'bot_1' }));
    });
  });
});
