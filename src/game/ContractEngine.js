/**
 * ContractEngine — contract generation, validation, reward distribution
 * @module game/ContractEngine
 */
import { getContractTemplate } from '../config/contracts.js';

/**
 * @typedef {Object} ContractInstance
 * @property {string} id - Unique instance id
 * @property {string} templateId - Template id this was generated from
 * @property {string} electrodeCode
 * @property {number} minLength
 * @property {number} qualityThreshold
 * @property {number|null} timeLimit
 * @property {number} rewardXp
 * @property {number} rewardCredits
 * @property {boolean} completed
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} passed
 * @property {number} score
 * @property {string[]} defects
 */

/**
 * @typedef {Object} RewardResult
 * @property {number} xpAwarded
 * @property {number} creditsAwarded
 */

let _contractIdCounter = 0;

/**
 * Generate a unique contract instance id.
 * @returns {string}
 */
function _generateContractId() {
  return `contract_${Date.now()}_${_contractIdCounter++}`;
}

/**
 * ContractEngine — generates contracts from templates, validates completion, distributes rewards.
 */
export class ContractEngine {
  /**
   * @param {Object} config
   * @param {Array} config.electrodes - Electrode config array
   * @param {Array} config.contracts - Contract template array
   * @param {Object} config.progressionEngine - ProgressionEngine instance
   */
  constructor({ electrodes, contracts, progressionEngine }) {
    this._electrodes = electrodes;
    this._contracts = contracts;
    this._progressionEngine = progressionEngine;
  }

  /**
   * Generate a contract instance from a template.
   * @param {string} templateId
   * @returns {ContractInstance}
   */
  generateContract(templateId) {
    const template = getContractTemplate(templateId);
    if (!template) {
      throw new Error(`Unknown contract template: ${templateId}`);
    }
    return {
      id: _generateContractId(),
      templateId: template.id,
      electrodeCode: template.electrodeCode,
      minLength: template.minLength,
      qualityThreshold: template.qualityThreshold,
      timeLimit: template.timeLimit,
      rewardXp: template.rewardXp,
      rewardCredits: template.rewardCredits,
      completed: false,
    };
  }

  /**
   * Validate a contract result client-side (UX feedback only — server is authoritative).
   * @param {ContractInstance} contract
   * @param {{qualityScore: number, beadLength: number}} sessionResult
   * @returns {ValidationResult}
   */
  validateContract(contract, sessionResult) {
    const defects = [];

    if (sessionResult.qualityScore < contract.qualityThreshold) {
      defects.push('quality_below_threshold');
    }

    if (sessionResult.beadLength < contract.minLength) {
      defects.push('length_insufficient');
    }

    return {
      passed: defects.length === 0,
      score: sessionResult.qualityScore,
      defects,
    };
  }

  /**
   * Distribute rewards based on contract outcome.
   * Failed contracts award 50% XP but 0 credits.
   * @param {ContractInstance} contract
   * @param {ValidationResult} validationResult
   * @returns {RewardResult}
   */
  distributeRewards(contract, validationResult) {
    if (validationResult.passed) {
      return {
        xpAwarded: contract.rewardXp,
        creditsAwarded: contract.rewardCredits,
      };
    } else {
      return {
        xpAwarded: Math.floor(contract.rewardXp * 0.5),
        creditsAwarded: 0,
      };
    }
  }

  /**
   * Get available contracts filtered by player's XP tier.
   * @returns {ContractInstance[]}
   */
  getAvailableContracts() {
    const state = this._progressionEngine.getState();
    return this._contracts
      .filter(template => template.xpTier <= state.xp)
      .map(template => ({
        id: _generateContractId(),
        templateId: template.id,
        electrodeCode: template.electrodeCode,
        minLength: template.minLength,
        qualityThreshold: template.qualityThreshold,
        timeLimit: template.timeLimit,
        rewardXp: template.rewardXp,
        rewardCredits: template.rewardCredits,
        completed: false,
      }));
  }
}