/**
 * @file SaveManager tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SaveManager } from '../../../src/core/SaveManager.js';
import { StateManager } from '../../../src/core/StateManager.js';
import { EventBus } from '../../../src/core/EventBus.js';

// Mock localStorage for Node environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] ?? null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('SaveManager', () => {
  let eventBus;
  let stateManager;
  let saveManager;
  const SAVE_KEY = 'sold2deo_save';

  beforeEach(() => {
    localStorage.clear();
    eventBus = new EventBus();
    stateManager = new StateManager(eventBus);
    saveManager = new SaveManager(stateManager, eventBus);
  });

  describe('save()', () => {
    it('serializes state to localStorage', () => {
      stateManager.updateCredits(500);
      saveManager.save();
      const saved = localStorage.getItem(SAVE_KEY);
      expect(saved).toBeTruthy();
    });

    it('includes credits in saved data', () => {
      stateManager.updateCredits(1000);
      saveManager.save();
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      expect(saved.credits).toBe(1000);
    });
  });

  describe('load()', () => {
    it('returns true when save exists', () => {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ credits: 500 }));
      const result = saveManager.load();
      expect(result).toBe(true);
    });

    it('returns false when no save exists', () => {
      const result = saveManager.load();
      expect(result).toBe(false);
    });

    it('emits stateLoaded event', () => {
      const handler = vi.fn();
      eventBus.on('stateLoaded', handler);
      localStorage.setItem(SAVE_KEY, JSON.stringify({ credits: 300 }));
      saveManager.load();
      expect(handler).toHaveBeenCalled();
    });
  });
});
