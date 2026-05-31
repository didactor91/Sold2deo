/**
 * Factory Config Unit Tests
 * @module tests/unit/config/factory.test.js
 */
import { describe, it, expect } from 'vitest';
import {
  botTiers,
  factoryUpgrades,
  MAX_OFFLINE_HOURS,
  getBotTier,
  getAllBotTierIds,
  getUpgrade,
  getAllUpgradeIds,
  calculateBotCreditsPerSecond,
} from '../../../src/config/factory.js';

describe('botTiers', () => {
  it('should have exactly 5 bot tiers', () => {
    expect(botTiers).toHaveLength(5);
  });

  it('Tier 1 (Apprentice) should have correct values', () => {
    const t1 = botTiers.find(t => t.id === 1);
    expect(t1.name).toBe('Apprentice');
    expect(t1.baseQuality).toBe(35);
    expect(t1.speedMultiplier).toBe(0.5);
    expect(t1.hireCost).toBe(50);
    expect(t1.salaryPerHour).toBe(2);
  });

  it('Tier 5 (Master) should have correct values', () => {
    const t5 = botTiers.find(t => t.id === 5);
    expect(t5.name).toBe('Master');
    expect(t5.baseQuality).toBe(93);
    expect(t5.speedMultiplier).toBe(1.5);
    expect(t5.hireCost).toBe(2000);
    expect(t5.salaryPerHour).toBe(60);
  });

  it('Tier 3 (Welder A) should have correct values from RFC-001 §3.7', () => {
    const t3 = botTiers.find(t => t.id === 3);
    expect(t3.name).toBe('Welder A');
    expect(t3.baseQuality).toBe(70);
    expect(t3.speedMultiplier).toBe(1.0);
    expect(t3.hireCost).toBe(400);
    expect(t3.salaryPerHour).toBe(12);
  });

  it('Tier 2 (Welder B) should have correct values', () => {
    const t2 = botTiers.find(t => t.id === 2);
    expect(t2.name).toBe('Welder B');
    expect(t2.baseQuality).toBe(55);
    expect(t2.speedMultiplier).toBe(0.8);
    expect(t2.hireCost).toBe(150);
    expect(t2.salaryPerHour).toBe(5);
  });

  it('Tier 4 (Specialist) should have correct values', () => {
    const t4 = botTiers.find(t => t.id === 4);
    expect(t4.name).toBe('Specialist');
    expect(t4.baseQuality).toBe(82);
    expect(t4.speedMultiplier).toBe(1.2);
    expect(t4.hireCost).toBe(900);
    expect(t4.salaryPerHour).toBe(28);
  });
});

describe('MAX_OFFLINE_HOURS', () => {
  it('should equal 8', () => {
    expect(MAX_OFFLINE_HOURS).toBe(8);
  });
});

describe('getBotTier', () => {
  it('returns tier for valid id', () => {
    const tier = getBotTier(1);
    expect(tier.id).toBe(1);
    expect(tier.name).toBe('Apprentice');
  });

  it('returns undefined for invalid id', () => {
    expect(getBotTier(99)).toBeUndefined();
  });
});

describe('getAllBotTierIds', () => {
  it('returns array of 5 ids', () => {
    const ids = getAllBotTierIds();
    expect(ids).toHaveLength(5);
    expect(ids).toContain(1);
    expect(ids).toContain(5);
  });
});

describe('factoryUpgrades', () => {
  it('should have ventilation upgrade', () => {
    const vent = factoryUpgrades.find(u => u.id === 'ventilation');
    expect(vent.name).toBe('Ventilation System');
    expect(vent.cost).toBe(200);
    expect(vent.effect.type).toBe('efficiency_multiplier');
    expect(vent.effect.value).toBe(1.10);
  });

  it('should have second_shift upgrade', () => {
    const shift = factoryUpgrades.find(u => u.id === 'second_shift');
    expect(shift.name).toBe('Second Shift');
    expect(shift.cost).toBe(500);
    expect(shift.effect.type).toBe('offline_cap_multiplier');
    expect(shift.effect.value).toBe(2.0);
  });

  it('should have qc_station upgrade', () => {
    const qc = factoryUpgrades.find(u => u.id === 'qc_station');
    expect(qc.name).toBe('QC Station');
    expect(qc.cost).toBe(300);
    expect(qc.effect.type).toBe('quality_bonus');
    expect(qc.effect.value).toBe(0.05);
  });
});

describe('getUpgrade', () => {
  it('returns upgrade for valid id', () => {
    const upgrade = getUpgrade('ventilation');
    expect(upgrade.id).toBe('ventilation');
    expect(upgrade.cost).toBe(200);
  });

  it('returns undefined for invalid id', () => {
    expect(getUpgrade('nonexistent')).toBeUndefined();
  });
});

describe('getAllUpgradeIds', () => {
  it('returns all upgrade ids', () => {
    const ids = getAllUpgradeIds();
    expect(ids).toContain('ventilation');
    expect(ids).toContain('second_shift');
    expect(ids).toContain('qc_station');
    expect(ids).toHaveLength(3);
  });
});

describe('calculateBotCreditsPerSecond', () => {
  it('calculates credits per second for Tier 1 bot on a contract', () => {
    // Tier 1: quality=35%, speed=0.5
    // Contract: 100Ȼ over 3600s = 100/3600 Ȼ/s
    // Expected: 0.35 * 0.5 * (100/3600) = 0.00486... Ȼ/s
    const cps = calculateBotCreditsPerSecond({
      tier: 1,
      qualityPercent: 35,
      contractReward: 100,
      contractDurationSeconds: 3600,
    });
    expect(cps).toBeCloseTo(0.00486, 4);
  });

  it('calculates credits per second for Tier 5 bot', () => {
    // Tier 5: quality=93%, speed=1.5
    // Contract: 200Ȼ over 3600s
    // Expected: 0.93 * 1.5 * (200/3600) = 0.0775
    const cps = calculateBotCreditsPerSecond({
      tier: 5,
      qualityPercent: 93,
      contractReward: 200,
      contractDurationSeconds: 3600,
    });
    expect(cps).toBeCloseTo(0.0775, 4);
  });

  it('returns 0 for invalid tier', () => {
    const cps = calculateBotCreditsPerSecond({
      tier: 99,
      qualityPercent: 100,
      contractReward: 100,
      contractDurationSeconds: 3600,
    });
    expect(cps).toBe(0);
  });
});
