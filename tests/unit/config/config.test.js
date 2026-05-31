/**
 * Config Files Unit Tests
 * @module tests/unit/config/config.test.js
 */
import { describe, it, expect } from 'vitest';
import { electrodes, getElectrode, getAllElectrodeCodes } from '../../../src/config/electrodes.js';
import { machines, getMachine, getAllMachineIds } from '../../../src/config/machines.js';
import { contractTemplates, getContractTemplate, getAllContractTemplateIds } from '../../../src/config/contracts.js';

describe('electrodes config', () => {
  it('should have exactly 6 electrode types', () => {
    expect(electrodes).toHaveLength(6);
  });

  it('should have all required electrode codes', () => {
    const codes = getAllElectrodeCodes();
    expect(codes).toContain('E6013-2.5');
    expect(codes).toContain('E6013-3.2');
    expect(codes).toContain('E7018-3.2');
    expect(codes).toContain('E7018-4.0');
    expect(codes).toContain('E6010-3.2');
    expect(codes).toContain('E308L-2.5');
  });

  it('should have valid amp ranges for all electrodes', () => {
    for (const e of electrodes) {
      expect(e.ampRange.min).toBeLessThan(e.ampRange.max);
      expect(e.ampRange.min).toBeGreaterThan(0);
    }
  });

  it('should have unique codes for all electrodes', () => {
    const codes = electrodes.map(e => e.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it('should have correct XP unlock values from RFC', () => {
    const e = getElectrode('E6013-3.2');
    expect(e.xpUnlock).toBe(200);
  });

  it('should have E6013-2.5 unlocked at XP 0', () => {
    const e = getElectrode('E6013-2.5');
    expect(e.xpUnlock).toBe(0);
  });
});

describe('machines config', () => {
  it('should have exactly 5 machines', () => {
    expect(machines).toHaveLength(5);
  });

  it('should have all required machine ids', () => {
    const ids = getAllMachineIds();
    expect(ids).toContain('BASIC_INVERTER_100A');
    expect(ids).toContain('INVERTER_160A');
    expect(ids).toContain('PRO_INVERTER_200A');
    expect(ids).toContain('INDUSTRIAL_250A');
    expect(ids).toContain('PROFESSIONAL_315A');
  });

  it('should have unique ids for all machines', () => {
    const ids = machines.map(m => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have BASIC_INVERTER_100A free (price 0)', () => {
    const m = getMachine('BASIC_INVERTER_100A');
    expect(m.price).toBe(0);
    expect(m.xpUnlock).toBe(0);
  });

  it('should have increasing prices and XP requirements', () => {
    for (let i = 1; i < machines.length; i++) {
      expect(machines[i].price).toBeGreaterThan(machines[i - 1].price);
      expect(machines[i].xpUnlock).toBeGreaterThan(machines[i - 1].xpUnlock);
    }
  });
});

describe('contracts config', () => {
  it('should have exactly 10 contract templates', () => {
    expect(contractTemplates).toHaveLength(10);
  });

  it('should have all tutorial and beginner contracts', () => {
    const ids = getAllContractTemplateIds();
    expect(ids).toContain('TUTORIAL_A');
    expect(ids).toContain('TUTORIAL_B');
    expect(ids).toContain('BEGINNER_A');
    expect(ids).toContain('BEGINNER_B');
  });

  it('should have all advanced and expert contracts', () => {
    const ids = getAllContractTemplateIds();
    expect(ids).toContain('EXPERT_A');
    expect(ids).toContain('EXPERT_B');
  });

  it('should have positive rewards for all contracts', () => {
    for (const t of contractTemplates) {
      expect(t.rewardXp).toBeGreaterThan(0);
      expect(t.rewardCredits).toBeGreaterThan(0);
    }
  });

  it('should have quality thresholds in valid range', () => {
    for (const t of contractTemplates) {
      expect(t.qualityThreshold).toBeGreaterThanOrEqual(50);
      expect(t.qualityThreshold).toBeLessThanOrEqual(100);
    }
  });

  it('should have increasing rewards for harder contracts', () => {
    // TUTORIAL_A has rewardXp=30, EXPERT_B has rewardXp=400
    const tutorial = getContractTemplate('TUTORIAL_A');
    const expert = getContractTemplate('EXPERT_B');
    expect(expert.rewardXp).toBeGreaterThan(tutorial.rewardXp);
  });

  it('should reference only valid electrode codes', () => {
    const validCodes = getAllElectrodeCodes();
    for (const t of contractTemplates) {
      expect(validCodes).toContain(t.electrodeCode);
    }
  });

  it('should have xpTier values matching RFC contract system', () => {
    const tutorial = getContractTemplate('TUTORIAL_A');
    expect(tutorial.xpTier).toBe(0);
    const expert = getContractTemplate('EXPERT_B');
    expect(expert.xpTier).toBe(2000);
  });
});