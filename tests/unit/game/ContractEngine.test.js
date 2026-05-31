/**
 * ContractEngine Unit Tests
 * @module tests/unit/game/ContractEngine.test.js
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { electrodes } from '../../../src/config/electrodes.js';
import { contractTemplates } from '../../../src/config/contracts.js';

// Import the module under test
import { ContractEngine } from '../../../src/game/ContractEngine.js';

describe('ContractEngine', () => {
  let mockProgressionEngine;
  let engine;

  beforeEach(() => {
    // Mock progression engine for testing
    mockProgressionEngine = {
      getState: vi.fn(() => ({
        xp: 0,
        level: 1,
        xpToNextLevel: 100,
        unlockedElectrodes: ['E6013-2.5'],
        unlockedMachines: ['BASIC_INVERTER_100A'],
      })),
      isElectrodeUnlocked: vi.fn(() => true),
    };
    engine = new ContractEngine({
      electrodes,
      contracts: contractTemplates,
      progressionEngine: mockProgressionEngine,
    });
  });

  describe('generateContract()', () => {
    it('should create a contract instance from a template', () => {
      const contract = engine.generateContract('TUTORIAL_A');
      expect(contract.templateId).toBe('TUTORIAL_A');
      expect(contract.electrodeCode).toBe('E6013-2.5');
      expect(contract.minLength).toBe(50);
      expect(contract.qualityThreshold).toBe(50);
      expect(contract.rewardXp).toBe(30);
      expect(contract.rewardCredits).toBe(15);
      expect(contract.id).toBeDefined();
    });

    it('should generate a unique instance id each time', () => {
      const contract1 = engine.generateContract('TUTORIAL_A');
      const contract2 = engine.generateContract('TUTORIAL_A');
      expect(contract1.id).not.toBe(contract2.id);
    });

    it('should set completed to false by default', () => {
      const contract = engine.generateContract('TUTORIAL_A');
      expect(contract.completed).toBe(false);
    });

    it('should throw for unknown template id', () => {
      expect(() => engine.generateContract('NONEXISTENT')).toThrow();
    });
  });

  describe('validateContract()', () => {
    it('should return passed=true when quality and length meet thresholds', () => {
      const contract = engine.generateContract('BEGINNER_A');
      const sessionResult = {
        qualityScore: 85,
        beadLength: 120,
      };
      const result = engine.validateContract(contract, sessionResult);
      expect(result.passed).toBe(true);
      expect(result.score).toBe(85);
      expect(result.defects).toHaveLength(0);
    });

    it('should return passed=false with quality_below_threshold when quality is low', () => {
      const contract = engine.generateContract('BEGINNER_A'); // qualityThreshold: 65
      const sessionResult = {
        qualityScore: 55,
        beadLength: 120,
      };
      const result = engine.validateContract(contract, sessionResult);
      expect(result.passed).toBe(false);
      expect(result.score).toBe(55);
      expect(result.defects).toContain('quality_below_threshold');
    });

    it('should return passed=false with length_insufficient when length is too short', () => {
      const contract = engine.generateContract('BEGINNER_A'); // minLength: 100
      const sessionResult = {
        qualityScore: 80,
        beadLength: 80,
      };
      const result = engine.validateContract(contract, sessionResult);
      expect(result.passed).toBe(false);
      expect(result.score).toBe(80);
      expect(result.defects).toContain('length_insufficient');
    });

    it('should return multiple defects when both quality and length fail', () => {
      const contract = engine.generateContract('BEGINNER_A');
      const sessionResult = {
        qualityScore: 50,
        beadLength: 50,
      };
      const result = engine.validateContract(contract, sessionResult);
      expect(result.passed).toBe(false);
      expect(result.defects).toContain('quality_below_threshold');
      expect(result.defects).toContain('length_insufficient');
    });
  });

  describe('distributeRewards()', () => {
    it('should return full XP and credits when contract passed', () => {
      const contract = engine.generateContract('BEGINNER_A');
      const validationResult = { passed: true, score: 80, defects: [] };
      const rewards = engine.distributeRewards(contract, validationResult);
      // BEGINNER_A: rewardXp=80, rewardCredits=40
      expect(rewards.xpAwarded).toBe(80);
      expect(rewards.creditsAwarded).toBe(40);
    });

    it('should return 50% XP and 0 credits when contract failed', () => {
      const contract = engine.generateContract('BEGINNER_A');
      const validationResult = { passed: false, score: 55, defects: ['quality_below_threshold'] };
      const rewards = engine.distributeRewards(contract, validationResult);
      // 50% of 80 = 40
      expect(rewards.xpAwarded).toBe(40);
      expect(rewards.creditsAwarded).toBe(0);
    });
  });

  describe('getAvailableContracts()', () => {
    it('should return contracts for XP tier', () => {
      const available = engine.getAvailableContracts();
      // Player at XP 0 should see TUTORIAL_A and TUTORIAL_B (xpTier: 0)
      const tutorialContracts = available.filter(c => c.templateId.startsWith('TUTORIAL'));
      expect(tutorialContracts).toHaveLength(2);
    });

    it('should filter contracts by progression XP tier', () => {
      mockProgressionEngine.getState.mockReturnValue({
        xp: 250,
        level: 2,
        xpToNextLevel: 145,
        unlockedElectrodes: ['E6013-2.5', 'E6013-3.2'],
        unlockedMachines: ['BASIC_INVERTER_100A', 'INVERTER_160A'],
      });
      const available = engine.getAvailableContracts();
      // XP 250 should include xpTier 0 and 200 contracts
      const hasBeginner = available.some(c => c.templateId === 'BEGINNER_A');
      expect(hasBeginner).toBe(true);
    });
  });
});