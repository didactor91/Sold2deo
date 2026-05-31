/**
 * GameSave Unit Tests
 * @module tests/unit/game/GameSave.test.js
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadGame, saveGame, getCosmeticsInventory, setCosmeticsInventory, addCosmeticToInventory } from '../../../src/game/GameSave.js';

// Mock localStorage
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

const STORAGE_KEY = 'sold2deo_save';

describe('GameSave.loadGame', () => {
  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('given no save exists, returns default save', () => {
    localStorage.removeItem(STORAGE_KEY);
    const save = loadGame();
    expect(save.credits).toBe(0);
    expect(save.cosmeticsInventory).toEqual([]);
    expect(save.progression).toEqual({});
    expect(save.idleFactory).toEqual({});
  });

  it('given valid save exists, returns parsed save data', () => {
    const saveData = {
      credits: 1000,
      cosmeticsInventory: ['blue-glow'],
      progression: { weldsCompleted: 5 },
      idleFactory: { bots: [] },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    const save = loadGame();
    expect(save.credits).toBe(1000);
    expect(save.cosmeticsInventory).toEqual(['blue-glow']);
  });

  it('given corrupted save, returns default save', () => {
    localStorage.setItem(STORAGE_KEY, 'not valid json');
    const save = loadGame();
    expect(save.credits).toBe(0);
    expect(save.cosmeticsInventory).toEqual([]);
  });
});

describe('GameSave.saveGame', () => {
  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('persists data to localStorage', () => {
    const data = {
      credits: 500,
      cosmeticsInventory: ['red-arc'],
      progression: {},
      idleFactory: {},
    };
    saveGame(data);
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(stored)).toEqual(data);
  });
});

describe('GameSave.getCosmeticsInventory', () => {
  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('given save with cosmetics, returns inventory array', () => {
    const saveData = {
      credits: 0,
      cosmeticsInventory: ['blue-glow', 'green-arc'],
      progression: {},
      idleFactory: {},
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    expect(getCosmeticsInventory()).toEqual(['blue-glow', 'green-arc']);
  });

  it('given save with no cosmeticsInventory key, returns empty array', () => {
    const saveData = {
      credits: 0,
      progression: {},
      idleFactory: {},
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    expect(getCosmeticsInventory()).toEqual([]);
  });
});

describe('GameSave.setCosmeticsInventory', () => {
  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('updates cosmetics inventory in save', () => {
    const saveData = {
      credits: 100,
      cosmeticsInventory: [],
      progression: {},
      idleFactory: {},
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    setCosmeticsInventory(['purple-arc', 'red-arc']);
    const save = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(save.cosmeticsInventory).toEqual(['purple-arc', 'red-arc']);
  });
});

describe('GameSave.addCosmeticToInventory', () => {
  afterEach(() => {
    localStorage.removeItem(STORAGE_KEY);
  });

  it('adds cosmetic to empty inventory', () => {
    const saveData = {
      credits: 0,
      cosmeticsInventory: [],
      progression: {},
      idleFactory: {},
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    addCosmeticToInventory('blue-glow');
    const save = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(save.cosmeticsInventory).toEqual(['blue-glow']);
  });

  it('does not add duplicate cosmetic', () => {
    const saveData = {
      credits: 0,
      cosmeticsInventory: ['blue-glow'],
      progression: {},
      idleFactory: {},
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    addCosmeticToInventory('blue-glow');
    const save = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(save.cosmeticsInventory).toEqual(['blue-glow']);
  });

  it('adds new cosmetic alongside existing', () => {
    const saveData = {
      credits: 0,
      cosmeticsInventory: ['blue-glow'],
      progression: {},
      idleFactory: {},
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
    addCosmeticToInventory('red-arc');
    const save = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(save.cosmeticsInventory).toEqual(['blue-glow', 'red-arc']);
  });
});
