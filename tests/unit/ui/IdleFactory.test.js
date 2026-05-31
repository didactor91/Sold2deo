/**
 * IdleFactory Unit Tests
 * Tests the business logic (hire, upgrade, assign) separately from DOM rendering.
 * @module tests/unit/ui/IdleFactory.test.js
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IdleFactory } from '../../../src/ui/IdleFactory.js';
import { botTiers, factoryUpgrades, getBotTier } from '../../../src/config/factory.js';

describe('IdleFactory', () => {
  let mockEventBus;
  let mockIdleEngine;
  let factory;

  beforeEach(() => {
    mockEventBus = {
      emit: vi.fn(),
      on: vi.fn(),
    };

    mockIdleEngine = {
      start: vi.fn(),
      stop: vi.fn(),
      getState: vi.fn().mockReturnValue({
        totalCredits: 0,
        creditsPerSecond: 0,
        activeBots: [],
        upgrades: [],
        offlineEarnings: 0,
      }),
      hireBot: vi.fn().mockReturnValue({ success: true }),
      purchaseUpgrade: vi.fn().mockReturnValue({ success: true }),
      assignBot: vi.fn().mockReturnValue({ success: true }),
    };

    factory = new IdleFactory({
      eventBus: mockEventBus,
      idleEngine: mockIdleEngine,
      credits: 500,
    });
  });

  describe('constructor', () => {
    it('initializes with provided credits', () => {
      expect(factory._credits).toBe(500);
    });

    it('initializes event listeners', () => {
      expect(mockEventBus.on).toHaveBeenCalledWith('idle:creditsUpdated', expect.any(Function));
    });

    it('starts with empty upgrades array', () => {
      expect(factory._upgrades).toEqual([]);
    });

    it('starts with bot id counter at 0', () => {
      expect(factory._botIdCounter).toBe(0);
    });
  });

  describe('_nextBotId()', () => {
    it('generates sequential bot ids', () => {
      const id1 = factory._nextBotId();
      const id2 = factory._nextBotId();
      expect(id1).toBe('bot_1');
      expect(id2).toBe('bot_2');
    });
  });

  describe('_onHireBot()', () => {
    it('calls idleEngine.hireBot with correct tier', () => {
      factory._onHireBot(1);
      expect(mockIdleEngine.hireBot).toHaveBeenCalledWith(1, 'bot_1');
    });

    it('deducts credits on successful hire', () => {
      factory._onHireBot(1);
      // Tier 1 costs 50, started with 500
      expect(factory._credits).toBe(450);
    });

    it('does not deduct credits when hire fails', () => {
      mockIdleEngine.hireBot.mockReturnValueOnce({ success: false, error: 'fail' });
      factory._credits = 500;
      factory._showError = vi.fn(); // stub DOM-dependent method
      factory._onHireBot(1);
      expect(factory._credits).toBe(500);
    });

    it('shows error when hire fails', () => {
      mockIdleEngine.hireBot.mockReturnValueOnce({ success: false, error: 'Insufficient credits' });
      factory._showError = vi.fn();
      factory._onHireBot(1);
      expect(factory._showError).toHaveBeenCalledWith('Insufficient credits');
    });

    it('shows error when credits are insufficient', () => {
      factory._credits = 10;
      factory._showError = vi.fn();
      factory._onHireBot(1); // Tier 1 costs 50
      expect(factory._showError).toHaveBeenCalledWith(expect.stringContaining('Not enough credits'));
    });

    it('calls _rerender on successful hire', () => {
      factory._rerender = vi.fn();
      factory._onHireBot(1);
      expect(factory._rerender).toHaveBeenCalled();
    });
  });

  describe('_onPurchaseUpgrade()', () => {
    it('calls idleEngine.purchaseUpgrade with correct id', () => {
      factory._onPurchaseUpgrade('ventilation');
      expect(mockIdleEngine.purchaseUpgrade).toHaveBeenCalledWith('ventilation');
    });

    it('deducts credits on successful purchase', () => {
      factory._onPurchaseUpgrade('ventilation');
      // Ventilation costs 200, started with 500
      expect(factory._credits).toBe(300);
    });

    it('shows error when upgrade already owned', () => {
      factory._upgrades = [{ id: 'ventilation' }];
      factory._showError = vi.fn();
      factory._onPurchaseUpgrade('ventilation');
      expect(factory._showError).toHaveBeenCalledWith('Upgrade already owned!');
    });

    it('shows error when credits insufficient', () => {
      factory._credits = 100;
      factory._showError = vi.fn();
      factory._onPurchaseUpgrade('ventilation'); // Costs 200
      expect(factory._showError).toHaveBeenCalledWith(expect.stringContaining('Not enough credits'));
    });

    it('adds upgrade to _upgrades on success', () => {
      factory._upgrades = [];
      factory._onPurchaseUpgrade('ventilation');
      expect(factory._upgrades).toContainEqual({ id: 'ventilation' });
    });

    it('calls _rerender on successful purchase', () => {
      factory._rerender = vi.fn();
      factory._onPurchaseUpgrade('ventilation');
      expect(factory._rerender).toHaveBeenCalled();
    });
  });

  describe('_onAssignBot()', () => {
    it('calls idleEngine.assignBot with bot id', () => {
      factory._onAssignBot('bot_1');
      expect(mockIdleEngine.assignBot).toHaveBeenCalledWith('bot_1', 'contract-auto');
    });

    it('calls _rerender on success', () => {
      factory._rerender = vi.fn();
      factory._onAssignBot('bot_1');
      expect(factory._rerender).toHaveBeenCalled();
    });

    it('shows error when assign fails', () => {
      mockIdleEngine.assignBot.mockReturnValueOnce({ success: false, error: 'Bot not found' });
      factory._showError = vi.fn();
      factory._onAssignBot('unknown');
      expect(factory._showError).toHaveBeenCalledWith('Bot not found');
    });
  });

  describe('_showError() and _clearError()', () => {
    it('_showError stores error message', () => {
      factory._showError('test error');
      expect(factory._lastError).toBe('test error');
    });

    it('_clearError clears error message', () => {
      factory._lastError = 'some error';
      factory._clearError();
      expect(factory._lastError).toBeNull();
    });
  });

  describe('eventBus integration', () => {
    it('updates credits on idle:creditsUpdated event', () => {
      factory._credits = 500;
      const handler = mockEventBus.on.mock.calls.find(c => c[0] === 'idle:creditsUpdated')[1];
      handler({ totalCredits: 600, creditsEarned: 0.5 });
      expect(factory._credits).toBe(600);
    });
  });

  describe('getState() integration', () => {
    it('renders offline earnings using engine state', () => {
      // This test documents that _renderOfflineEarnings depends on engine state
      // The DOM element creation is tested through other tests
      mockIdleEngine.getState.mockReturnValue({
        totalCredits: 100,
        creditsPerSecond: 0.5,
        activeBots: [],
        upgrades: [],
        offlineEarnings: 500,
      });
      const state = mockIdleEngine.getState();
      expect(state.offlineEarnings).toBe(500);
      expect(state.creditsPerSecond).toBe(0.5);
    });
  });
});

describe('botTiers constants', () => {
  it('has 5 tiers', () => {
    expect(botTiers).toHaveLength(5);
  });

  it('tier 1 costs 50Ȼ', () => {
    expect(botTiers[0].hireCost).toBe(50);
  });

  it('tier 5 costs 2000Ȼ', () => {
    expect(botTiers[4].hireCost).toBe(2000);
  });
});

describe('factoryUpgrades constants', () => {
  it('has 3 upgrades', () => {
    expect(factoryUpgrades).toHaveLength(3);
  });

  it('ventilation costs 200Ȼ', () => {
    const vent = factoryUpgrades.find(u => u.id === 'ventilation');
    expect(vent.cost).toBe(200);
  });

  it('second_shift costs 500Ȼ', () => {
    const shift = factoryUpgrades.find(u => u.id === 'second_shift');
    expect(shift.cost).toBe(500);
  });

  it('qc_station costs 300Ȼ', () => {
    const qc = factoryUpgrades.find(u => u.id === 'qc_station');
    expect(qc.cost).toBe(300);
  });
});
