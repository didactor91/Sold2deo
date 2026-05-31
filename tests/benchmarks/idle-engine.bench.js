/**
 * IdleEngine Benchmarks
 * @module tests/benchmarks/idle-engine.bench.js
 */
import { bench, describe } from 'vitest';
import { IdleEngine } from '../../src/game/IdleEngine.js';

describe('IdleEngine Performance', () => {
  /** @type {IdleEngine} */
  let engine;

  bench('IdleEngine constructor', () => {
    const eventBus = { emit: () => {} };
    new IdleEngine({ eventBus });
  });

  bench('IdleEngine.start with 10 bots', () => {
    const eventBus = { emit: () => {} };
    const engine = new IdleEngine({ eventBus });
    const bots = Array.from({ length: 10 }, (_, i) => ({
      id: `bot-${i}`,
      tier: (i % 5) + 1,
      quality: 100,
      assignedContractId: null,
    }));
    const upgrades = [{ id: 'ventilation' }, { id: 'second_shift' }];
    engine.start(bots, upgrades, Date.now(), 0);
    engine.stop();
  });

  bench('IdleEngine.hireBot', () => {
    const eventBus = { emit: () => {} };
    const engine = new IdleEngine({ eventBus });
    engine.hireBot(1, 'bench-bot');
  });

  bench('IdleEngine.getState', () => {
    const eventBus = { emit: () => {} };
    const engine = new IdleEngine({ eventBus });
    engine.getState();
  });

  bench('IdleEngine.purchaseUpgrade (miss)', () => {
    const eventBus = { emit: () => {} };
    const engine = new IdleEngine({ eventBus });
    engine.purchaseUpgrade('nonexistent');
  });
});
