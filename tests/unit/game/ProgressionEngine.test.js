/**
 * ProgressionEngine Unit Tests
 * @module tests/unit/game/ProgressionEngine.test.js
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { electrodes } from '../../../src/config/electrodes.js';
import { machines } from '../../../src/config/machines.js';

// Import the module under test (will fail until we write the implementation)
import * as ProgressionModule from '../../../src/game/ProgressionEngine.js';

// xpToNext is a pure function we expect to be exported
const { xpToNext, ProgressionEngine } = ProgressionModule;

describe('xpToNext', () => {
  it('should return 100 for level 1', () => {
    expect(xpToNext(1)).toBe(100);
  });

  it('should return floor(100 * 1.45) = 145 for level 2', () => {
    expect(xpToNext(2)).toBe(Math.floor(100 * Math.pow(1.45, 1)));
  });

  it('should return floor(100 * 1.45^4) ≈ 720 for level 5', () => {
    expect(xpToNext(5)).toBe(Math.floor(100 * Math.pow(1.45, 4)));
  });

  it('should be monotonically increasing', () => {
    const results = [];
    for (let lvl = 1; lvl <= 10; lvl++) {
      results.push(xpToNext(lvl));
    }
    for (let i = 1; i < results.length; i++) {
      expect(results[i]).toBeGreaterThan(results[i - 1]);
    }
  });
});

describe('ProgressionEngine', () => {
  let mockEventBus;
  let engine;

  beforeEach(() => {
    mockEventBus = {
      emit: vi.fn(),
    };
  });

  describe('constructor', () => {
    it('should initialize with xp=0 and level=1', () => {
      engine = new ProgressionEngine({ electrodes, machines, eventBus: mockEventBus });
      const state = engine.getState();
      expect(state.xp).toBe(0);
      expect(state.level).toBe(1);
    });
  });

  describe('getState()', () => {
    it('should return current xp, level, and empty unlocked arrays for new player', () => {
      engine = new ProgressionEngine({ electrodes, machines, eventBus: mockEventBus });
      const state = engine.getState();
      expect(state.xp).toBe(0);
      expect(state.level).toBe(1);
      expect(state.unlockedElectrodes).toContain('E6013-2.5'); // XP 0 always unlocked
      expect(state.unlockedMachines).toContain('BASIC_INVERTER_100A'); // XP 0 always unlocked
    });
  });

  describe('grantXP()', () => {
    it('should add XP without leveling up when below threshold', () => {
      engine = new ProgressionEngine({ electrodes, machines, eventBus: mockEventBus });
      engine.grantXP(30);
      const state = engine.getState();
      expect(state.xp).toBe(30);
      expect(state.level).toBe(1);
    });

    it('should level up when XP crosses threshold', () => {
      engine = new ProgressionEngine({ electrodes, machines, eventBus: mockEventBus });
      // Set XP to 90, need 100 to level up
      // We need to access internal state for setup - use grantXP to approach level
      engine.grantXP(90); // xp=90, level=1
      engine.grantXP(20); // xp=110, should level up to 2
      const state = engine.getState();
      expect(state.xp).toBe(110);
      expect(state.level).toBe(2);
    });

    it('should carry over remaining XP after level up', () => {
      engine = new ProgressionEngine({ electrodes, machines, eventBus: mockEventBus });
      engine.grantXP(90);
      engine.grantXP(20); // cross threshold, remaining 10
      const state = engine.getState();
      // Level 1 requires 100 XP. 90+20=110. Level up, 10 XP remaining into level 2.
      expect(state.xp).toBe(110);
    });

    it('should handle multiple level ups in single grant', () => {
      engine = new ProgressionEngine({ electrodes, machines, eventBus: mockEventBus });
      // Give a large amount of XP - should cross multiple levels
      engine.grantXP(2000);
      const state = engine.getState();
      expect(state.level).toBeGreaterThan(2);
    });
  });

  describe('unlock events', () => {
    it('should emit unlock:electrode when crossing XP threshold', () => {
      engine = new ProgressionEngine({ electrodes, machines, eventBus: mockEventBus });
      // E6013-3.2 unlocks at XP 200
      engine.grantXP(200); // Crosses 200 threshold
      expect(mockEventBus.emit).toHaveBeenCalledWith('unlock:electrode', expect.objectContaining({
        code: 'E6013-3.2',
      }));
    });

    it('should emit unlock:machine when crossing XP threshold', () => {
      engine = new ProgressionEngine({ electrodes, machines, eventBus: mockEventBus });
      // INVERTER_160A unlocks at XP 300
      engine.grantXP(300);
      expect(mockEventBus.emit).toHaveBeenCalledWith('unlock:machine', expect.objectContaining({
        id: 'INVERTER_160A',
      }));
    });

    it('should not emit duplicate unlock events for same threshold', () => {
      engine = new ProgressionEngine({ electrodes, machines, eventBus: mockEventBus });
      engine.grantXP(200);
      engine.grantXP(50);
      // Should only emit unlock:electrode once for E6013-3.2
      const electrodeEvents = mockEventBus.emit.mock.calls.filter(
        call => call[0] === 'unlock:electrode' && call[1].code === 'E6013-3.2'
      );
      expect(electrodeEvents).toHaveLength(1);
    });
  });

  describe('isElectrodeUnlocked()', () => {
    it('should return true for E6013-2.5 at XP 0', () => {
      engine = new ProgressionEngine({ electrodes, machines, eventBus: mockEventBus });
      expect(engine.isElectrodeUnlocked('E6013-2.5')).toBe(true);
    });

    it('should return false for E6013-3.2 at XP 199', () => {
      engine = new ProgressionEngine({ electrodes, machines, eventBus: mockEventBus });
      engine.grantXP(199);
      expect(engine.isElectrodeUnlocked('E6013-3.2')).toBe(false);
    });

    it('should return true for E6013-3.2 at XP 200', () => {
      engine = new ProgressionEngine({ electrodes, machines, eventBus: mockEventBus });
      engine.grantXP(200);
      expect(engine.isElectrodeUnlocked('E6013-3.2')).toBe(true);
    });
  });

  describe('isMachineUnlocked()', () => {
    it('should return true for BASIC_INVERTER_100A at XP 0', () => {
      engine = new ProgressionEngine({ electrodes, machines, eventBus: mockEventBus });
      expect(engine.isMachineUnlocked('BASIC_INVERTER_100A')).toBe(true);
    });

    it('should return false for INVERTER_160A at XP 299', () => {
      engine = new ProgressionEngine({ electrodes, machines, eventBus: mockEventBus });
      engine.grantXP(299);
      expect(engine.isMachineUnlocked('INVERTER_160A')).toBe(false);
    });

    it('should return true for INVERTER_160A at XP 300', () => {
      engine = new ProgressionEngine({ electrodes, machines, eventBus: mockEventBus });
      engine.grantXP(300);
      expect(engine.isMachineUnlocked('INVERTER_160A')).toBe(true);
    });
  });
});