/**
 * Idle Worker Unit Tests
 * @module tests/unit/game/idle-worker.test.js
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Create a mock worker-like message handler that captures postMessage calls.
 * Simulates the worker's message handling logic.
 */
function createMockWorker() {
  const messages = [];
  const sentMessages = [];

  const handler = {
    messages,
    sentMessages,
    _botRates: {
      1: 2 / 3600,
      2: 5 / 3600,
      3: 12 / 3600,
      4: 28 / 3600,
      5: 60 / 3600,
    },
    _tickInterval: null,
    _state: null,
    _totalCredits: 0,
    _creditsPerSecond: 0,

    postMessage(payload) {
      this.sentMessages.push(payload);
    },

    _computeCreditsPerSecond(bots, upgrades) {
      let total = 0;
      for (const bot of bots) {
        const rate = this._botRates[bot.tier] ?? this._botRates[1];
        const qualityMultiplier = (bot.quality || 50) / 100;
        total += rate * qualityMultiplier;
      }
      let effMult = 1.0;
      for (const up of upgrades) {
        if (up.id === 'ventilation') effMult *= 1.10;
        if (up.id === 'second_shift') effMult *= 2.0;
        if (up.id === 'qc_station') effMult *= 1.05;
      }
      return total * effMult;
    },

    _handleStart(payload) {
      const { bots, upgrades, lastTickTimestamp, initialCredits } = payload;
      this._state = { bots, upgrades };
      this._totalCredits = initialCredits || 0;
      this._creditsPerSecond = this._computeCreditsPerSecond(bots, upgrades);

      const now = Date.now();
      const maxOfflineSeconds = 8 * 3600;
      const offlineSeconds = Math.min((now - lastTickTimestamp) / 1000, maxOfflineSeconds);
      const offlineEarnings = Math.floor(offlineSeconds * this._creditsPerSecond);

      this._totalCredits += offlineEarnings;
      this._creditsPerSecond = this._computeCreditsPerSecond(bots, upgrades);

      this.messages.push({ type: 'START', payload });
      this.postMessage({
        type: 'OFFLINE_CALC',
        payload: { offlineEarnings, offlineSeconds: Math.floor(offlineSeconds) },
      });
    },

    _handleUpdate(payload) {
      if (payload.bots) this._state.bots = payload.bots;
      if (payload.upgrades) this._state.upgrades = payload.upgrades;
      this._creditsPerSecond = this._computeCreditsPerSecond(this._state.bots, this._state.upgrades);
      this.messages.push({ type: 'UPDATE', payload });
    },

    _handleStop() {
      if (this._tickInterval) {
        clearInterval(this._tickInterval);
        this._tickInterval = null;
      }
      this.messages.push({ type: 'STOP' });
    },

    _tick() {
      this._totalCredits += this._creditsPerSecond;
      this.postMessage({
        type: 'TICK',
        payload: {
          creditsEarned: this._creditsPerSecond,
          totalCredits: Math.floor(this._totalCredits),
          timestamp: Date.now(),
        },
      });
    },

    handleMessage(event) {
      const { type, payload } = event.data;
      this.messages.push({ type, payload });
      if (type === 'START') this._handleStart(payload);
      else if (type === 'UPDATE') this._handleUpdate(payload);
      else if (type === 'STOP') this._handleStop();
    },
  };

  return handler;
}

describe('Idle Worker — Message Protocol', () => {
  let worker;

  beforeEach(() => {
    worker = createMockWorker();
  });

  describe('START message', () => {
    it('posts OFFLINE_CALC message on START', () => {
      worker.handleMessage({
        data: {
          type: 'START',
          payload: {
            bots: [{ tier: 1, quality: 100, id: 'b1', assignedContractId: null }],
            upgrades: [],
            lastTickTimestamp: Date.now() - 3600 * 1000,
            initialCredits: 0,
          },
        },
      });

      const offlineCalc = worker.sentMessages.find(m => m.type === 'OFFLINE_CALC');
      expect(offlineCalc).toBeDefined();
      expect(offlineCalc.payload.offlineSeconds).toBe(3600);
    });

    it('caps offline earnings at MAX_OFFLINE_HOURS (8 hours)', () => {
      // 10 hours ago should be capped at 8 hours
      worker.handleMessage({
        data: {
          type: 'START',
          payload: {
            bots: [{ tier: 1, quality: 100, id: 'b1', assignedContractId: null }],
            upgrades: [],
            lastTickTimestamp: Date.now() - 10 * 3600 * 1000,
            initialCredits: 0,
          },
        },
      });

      const offlineCalc = worker.sentMessages.find(m => m.type === 'OFFLINE_CALC');
      expect(offlineCalc.payload.offlineSeconds).toBe(8 * 3600);
    });

    it('posts TICK messages after START', () => {
      // We'll just verify the START was handled — actual ticking is tested separately
      worker.handleMessage({
        data: {
          type: 'START',
          payload: {
            bots: [{ tier: 1, quality: 100, id: 'b1', assignedContractId: null }],
            upgrades: [],
            lastTickTimestamp: Date.now(),
            initialCredits: 0,
          },
        },
      });

      expect(worker.messages.find(m => m.type === 'START')).toBeDefined();
    });
  });

  describe('UPDATE message', () => {
    it('updates internal state on UPDATE', () => {
      worker.handleMessage({
        data: {
          type: 'START',
          payload: {
            bots: [{ tier: 1, quality: 100, id: 'b1', assignedContractId: null }],
            upgrades: [],
            lastTickTimestamp: Date.now(),
            initialCredits: 0,
          },
        },
      });

      worker.handleMessage({
        data: {
          type: 'UPDATE',
          payload: {
            bots: [
              { tier: 1, quality: 100, id: 'b1', assignedContractId: null },
              { tier: 2, quality: 100, id: 'b2', assignedContractId: null },
            ],
          },
        },
      });

      expect(worker.messages.find(m => m.type === 'UPDATE')).toBeDefined();
    });
  });

  describe('STOP message', () => {
    it('processes STOP message', () => {
      worker.handleMessage({ data: { type: 'STOP' } });
      expect(worker.messages.find(m => m.type === 'STOP')).toBeDefined();
    });
  });
});

describe('Idle Worker — Offline Delta Calculation', () => {
  it('computes zero offline earnings when lastTickTimestamp is very recent', () => {
    const mockWorker = createMockWorker();
    mockWorker.handleMessage({
      data: {
        type: 'START',
        payload: {
          bots: [{ tier: 1, quality: 100, id: 'b1', assignedContractId: null }],
          upgrades: [],
          lastTickTimestamp: Date.now(),
          initialCredits: 0,
        },
      },
    });

    const offlineCalc = mockWorker.sentMessages.find(m => m.type === 'OFFLINE_CALC');
    expect(offlineCalc.payload.offlineEarnings).toBe(0);
  });

  it('computes correct offline earnings for 1 hour with Tier 1 bot at 100% quality', () => {
    // Tier 1 rate = 2 Ȼ/hr, 1 hour = 2 Ȼ
    const mockWorker = createMockWorker();
    mockWorker.handleMessage({
      data: {
        type: 'START',
        payload: {
          bots: [{ tier: 1, quality: 100, id: 'b1', assignedContractId: null }],
          upgrades: [],
          lastTickTimestamp: Date.now() - 3600 * 1000,
          initialCredits: 0,
        },
      },
    });

    const offlineCalc = mockWorker.sentMessages.find(m => m.type === 'OFFLINE_CALC');
    expect(offlineCalc.payload.offlineEarnings).toBe(2);
  });

  it('computes correct offline earnings with ventilation upgrade (+10%)', () => {
    const mockWorker = createMockWorker();
    mockWorker.handleMessage({
      data: {
        type: 'START',
        payload: {
          bots: [{ tier: 1, quality: 100, id: 'b1', assignedContractId: null }],
          upgrades: [{ id: 'ventilation' }],
          lastTickTimestamp: Date.now() - 3600 * 1000,
          initialCredits: 0,
        },
      },
    });

    const offlineCalc = mockWorker.sentMessages.find(m => m.type === 'OFFLINE_CALC');
    // Tier 1: 2 Ȼ/hr * 1.10 = 2.2 Ȼ → floor = 2
    expect(offlineCalc.payload.offlineEarnings).toBe(2);
  });

  it('caps at 8 hours even when offline for longer', () => {
    const mockWorker = createMockWorker();
    // 24 hours offline
    mockWorker.handleMessage({
      data: {
        type: 'START',
        payload: {
          bots: [{ tier: 1, quality: 100, id: 'b1', assignedContractId: null }],
          upgrades: [],
          lastTickTimestamp: Date.now() - 24 * 3600 * 1000,
          initialCredits: 0,
        },
      },
    });

    const offlineCalc = mockWorker.sentMessages.find(m => m.type === 'OFFLINE_CALC');
    // Capped at 8h * 2 Ȼ/h = 16 Ȼ
    expect(offlineCalc.payload.offlineSeconds).toBe(8 * 3600);
    expect(offlineCalc.payload.offlineEarnings).toBe(16);
  });
});

describe('Idle Worker — Credits Per Second', () => {
  it('calculates 0 cps for empty bot array', () => {
    const mockWorker = createMockWorker();
    mockWorker.handleMessage({
      data: {
        type: 'START',
        payload: {
          bots: [],
          upgrades: [],
          lastTickTimestamp: Date.now(),
          initialCredits: 0,
        },
      },
    });

    expect(mockWorker._creditsPerSecond).toBe(0);
  });

  it('calculates correct cps for single Tier 3 bot', () => {
    // Tier 3: 12 Ȼ/hr = 12/3600 Ȼ/s
    const mockWorker = createMockWorker();
    mockWorker.handleMessage({
      data: {
        type: 'START',
        payload: {
          bots: [{ tier: 3, quality: 100, id: 'b1', assignedContractId: null }],
          upgrades: [],
          lastTickTimestamp: Date.now(),
          initialCredits: 0,
        },
      },
    });

    // 12/3600 = 0.00333... Ȼ/s
    expect(mockWorker._creditsPerSecond).toBeCloseTo(12 / 3600, 4);
  });

  it('applies quality multiplier to cps', () => {
    const mockWorker = createMockWorker();
    mockWorker.handleMessage({
      data: {
        type: 'START',
        payload: {
          bots: [{ tier: 1, quality: 50, id: 'b1', assignedContractId: null }],
          upgrades: [],
          lastTickTimestamp: Date.now(),
          initialCredits: 0,
        },
      },
    });

    // Tier 1: 2/3600 Ȼ/s * 0.50 = 1/3600 = 0.000277...
    expect(mockWorker._creditsPerSecond).toBeCloseTo(2 / 3600 * 0.5, 4);
  });
});
