/**
 * IdleEngine Unit Tests
 * @module tests/unit/game/IdleEngine.test.js
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IdleEngine } from '../../../src/game/IdleEngine.js';

// Mock worker class that captures postMessage calls
class MockWorker {
  constructor() {
    this.messages = [];
    this.terminateCalls = 0;
    this.onmessage = null;
  }

  postMessage(data) {
    this.messages.push(data);
    // Simulate synchronous handling for START — worker posts OFFLINE_CALC immediately
    if (data.type === 'START') {
      const payload = data.payload;
      const offlineSeconds = payload.lastTickTimestamp
        ? Math.min((Date.now() - payload.lastTickTimestamp) / 1000, 8 * 3600)
        : 0;
      const offlineEarnings = Math.floor(offlineSeconds * 0.000555); // Tier 1 default
      if (this.onmessage) {
        this.onmessage({ data: { type: 'OFFLINE_CALC', payload: { offlineEarnings, offlineSeconds: Math.floor(offlineSeconds) } } });
      }
    }
  }

  terminate() {
    this.terminateCalls++;
  }

  // Helper to simulate worker sending a TICK back
  simulateTick(creditsEarned, totalCredits) {
    if (this.onmessage) {
      this.onmessage({
        data: {
          type: 'TICK',
          payload: { creditsEarned, totalCredits, timestamp: Date.now() },
        },
      });
    }
  }
}

describe('IdleEngine', () => {
  let mockEventBus;
  let mockWorker;
  let engine;

  beforeEach(() => {
    mockEventBus = {
      emit: vi.fn(),
    };
    mockWorker = new MockWorker();
    // We need to override the worker's onmessage after IdleEngine creates it
  });

  describe('constructor', () => {
    it('initializes with empty state', () => {
      engine = new IdleEngine({ eventBus: mockEventBus });
      const state = engine.getState();
      expect(state.totalCredits).toBe(0);
      expect(state.creditsPerSecond).toBe(0);
      expect(state.activeBots).toEqual([]);
      expect(state.offlineEarnings).toBe(0);
    });
  });

  describe('start()', () => {
    it('creates a worker and sends START message', () => {
      engine = new IdleEngine({ eventBus: mockEventBus });
      // Override the worker factory
      engine._createWorker = () => mockWorker;

      engine.start([], [], Date.now());

      const startMsg = mockWorker.messages.find(m => m.type === 'START');
      expect(startMsg).toBeDefined();
      expect(startMsg.payload.bots).toEqual([]);
      expect(startMsg.payload.upgrades).toEqual([]);
    });

    it('sets lastTickTimestamp in START payload', () => {
      engine = new IdleEngine({ eventBus: mockEventBus });
      engine._createWorker = () => mockWorker;

      const ts = Date.now() - 3600000;
      engine.start([], [], ts);

      const startMsg = mockWorker.messages.find(m => m.type === 'START');
      expect(startMsg.payload.lastTickTimestamp).toBe(ts);
    });
  });

  describe('stop()', () => {
    it('sends STOP to worker and terminates it', () => {
      engine = new IdleEngine({ eventBus: mockEventBus });
      engine._createWorker = () => mockWorker;

      engine.start([], [], Date.now());
      engine.stop();

      const stopMsg = mockWorker.messages.find(m => m.type === 'STOP');
      expect(stopMsg).toBeDefined();
      expect(mockWorker.terminateCalls).toBe(1);
    });

    it('is idempotent (calling stop twice does not crash)', () => {
      engine = new IdleEngine({ eventBus: mockEventBus });
      engine._createWorker = () => mockWorker;

      engine.start([], [], Date.now());
      engine.stop();
      engine.stop(); // Should not throw

      expect(mockWorker.terminateCalls).toBe(1);
    });
  });

  describe('getState()', () => {
    it('returns current state object', () => {
      engine = new IdleEngine({ eventBus: mockEventBus });
      engine._createWorker = () => mockWorker;

      engine.start([{ id: 'b1', tier: 1, quality: 100, assignedContractId: null }], [], Date.now());

      const state = engine.getState();
      expect(state).toHaveProperty('totalCredits');
      expect(state).toHaveProperty('creditsPerSecond');
      expect(state).toHaveProperty('activeBots');
      expect(state).toHaveProperty('offlineEarnings');
    });

    it('reflects TICK updates from worker', () => {
      engine = new IdleEngine({ eventBus: mockEventBus });
      engine._createWorker = () => mockWorker;

      engine.start([{ id: 'b1', tier: 1, quality: 100, assignedContractId: null }], [], Date.now());

      // Simulate a TICK from worker
      mockWorker.simulateTick(0.5, 100);

      const state = engine.getState();
      expect(state.totalCredits).toBe(100);
    });
  });

  describe('hireBot()', () => {
    it('adds bot to state and sends UPDATE to worker', () => {
      engine = new IdleEngine({ eventBus: mockEventBus });
      engine._createWorker = () => mockWorker;

      engine.start([], [], Date.now());
      const result = engine.hireBot(1, 'b1');

      expect(result.success).toBe(true);
      expect(engine.getState().activeBots).toHaveLength(1);
      expect(engine.getState().activeBots[0].tier).toBe(1);

      const updateMsg = mockWorker.messages.find(m => m.type === 'UPDATE');
      expect(updateMsg.payload.bots).toHaveLength(1);
    });

    it('returns error for invalid tier', () => {
      engine = new IdleEngine({ eventBus: mockEventBus });
      engine._createWorker = () => mockWorker;

      engine.start([], [], Date.now());
      const result = engine.hireBot(99, 'b1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid bot tier');
    });
  });

  describe('purchaseUpgrade()', () => {
    it('adds upgrade to state and sends UPDATE to worker', () => {
      engine = new IdleEngine({ eventBus: mockEventBus });
      engine._createWorker = () => mockWorker;

      engine.start([], [], Date.now());
      const result = engine.purchaseUpgrade('ventilation');

      expect(result.success).toBe(true);
      expect(engine.getState().upgrades).toHaveLength(1);
      expect(engine.getState().upgrades[0].id).toBe('ventilation');

      const updateMsg = mockWorker.messages.find(m => m.type === 'UPDATE');
      expect(updateMsg.payload.upgrades).toHaveLength(1);
    });

    it('returns error for invalid upgrade id', () => {
      engine = new IdleEngine({ eventBus: mockEventBus });
      engine._createWorker = () => mockWorker;

      engine.start([], [], Date.now());
      const result = engine.purchaseUpgrade('nonexistent');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid upgrade id');
    });
  });

  describe('assignBot()', () => {
    it('updates bot assignment and sends UPDATE to worker', () => {
      engine = new IdleEngine({ eventBus: mockEventBus });
      engine._createWorker = () => mockWorker;

      engine.start([{ id: 'b1', tier: 1, quality: 100, assignedContractId: null }], [], Date.now());
      engine.assignBot('b1', 'contract-123');

      const state = engine.getState();
      expect(state.activeBots.find(b => b.id === 'b1').assignedContractId).toBe('contract-123');

      const updateMsg = mockWorker.messages.find(m => m.type === 'UPDATE');
      expect(updateMsg.payload.bots[0].assignedContractId).toBe('contract-123');
    });

    it('returns error for unknown bot id', () => {
      engine = new IdleEngine({ eventBus: mockEventBus });
      engine._createWorker = () => mockWorker;

      engine.start([], [], Date.now());
      const result = engine.assignBot('unknown-bot', 'contract-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Bot not found');
    });
  });

  describe('event emission', () => {
    it('emits idle:creditsUpdated when TICK is received', () => {
      engine = new IdleEngine({ eventBus: mockEventBus });
      engine._createWorker = () => mockWorker;

      engine.start([], [], Date.now());
      mockWorker.simulateTick(0.5, 100);

      expect(mockEventBus.emit).toHaveBeenCalledWith(
        'idle:creditsUpdated',
        expect.objectContaining({ totalCredits: 100 })
      );
    });
  });
});
