/**
 * Contract Templates — 10 contracts from beginner to expert
 * @module config/contracts
 */

/**
 * @typedef {Object} ContractTemplate
 * @property {string} id            - Unique template identifier
 * @property {string} electrodeCode - Required electrode code for this contract
 * @property {number} minLength     - Minimum bead length in mm required to pass
 * @property {number} qualityThreshold - Minimum quality score (0-100) required to pass
 * @property {number|null} timeLimit - Optional time limit in seconds. null means no time limit.
 * @property {number} rewardXp     - XP awarded on successful completion
 * @property {number} rewardCredits - Credits awarded on successful completion
 * @property {number} xpTier        - Minimum XP level required to receive this contract
 */

/** @type {ContractTemplate[]} */
export const contractTemplates = Object.freeze([
  {
    id: 'TUTORIAL_A',
    electrodeCode: 'E6013-2.5',
    minLength: 50,
    qualityThreshold: 50,
    timeLimit: null,
    rewardXp: 30,
    rewardCredits: 15,
    xpTier: 0,
  },
  {
    id: 'TUTORIAL_B',
    electrodeCode: 'E6013-2.5',
    minLength: 80,
    qualityThreshold: 60,
    timeLimit: 120,
    rewardXp: 50,
    rewardCredits: 25,
    xpTier: 0,
  },
  {
    id: 'BEGINNER_A',
    electrodeCode: 'E6013-3.2',
    minLength: 100,
    qualityThreshold: 65,
    timeLimit: 150,
    rewardXp: 80,
    rewardCredits: 40,
    xpTier: 200,
  },
  {
    id: 'BEGINNER_B',
    electrodeCode: 'E6013-3.2',
    minLength: 120,
    qualityThreshold: 70,
    timeLimit: 180,
    rewardXp: 100,
    rewardCredits: 50,
    xpTier: 200,
  },
  {
    id: 'INTERMEDIATE_A',
    electrodeCode: 'E7018-3.2',
    minLength: 100,
    qualityThreshold: 72,
    timeLimit: 180,
    rewardXp: 120,
    rewardCredits: 60,
    xpTier: 500,
  },
  {
    id: 'INTERMEDIATE_B',
    electrodeCode: 'E7018-4.0',
    minLength: 80,
    qualityThreshold: 75,
    timeLimit: 200,
    rewardXp: 150,
    rewardCredits: 75,
    xpTier: 900,
  },
  {
    id: 'ADVANCED_A',
    electrodeCode: 'E6010-3.2',
    minLength: 100,
    qualityThreshold: 78,
    timeLimit: 200,
    rewardXp: 200,
    rewardCredits: 100,
    xpTier: 1200,
  },
  {
    id: 'ADVANCED_B',
    electrodeCode: 'E7018-4.0',
    minLength: 150,
    qualityThreshold: 80,
    timeLimit: 240,
    rewardXp: 250,
    rewardCredits: 125,
    xpTier: 900,
  },
  {
    id: 'EXPERT_A',
    electrodeCode: 'E6010-3.2',
    minLength: 120,
    qualityThreshold: 82,
    timeLimit: 180,
    rewardXp: 300,
    rewardCredits: 150,
    xpTier: 1200,
  },
  {
    id: 'EXPERT_B',
    electrodeCode: 'E308L-2.5',
    minLength: 100,
    qualityThreshold: 85,
    timeLimit: 240,
    rewardXp: 400,
    rewardCredits: 200,
    xpTier: 2000,
  },
]);

/**
 * Get contract template by id.
 * @param {string} id
 * @returns {ContractTemplate|undefined}
 */
export function getContractTemplate(id) {
  return contractTemplates.find(t => t.id === id);
}

/**
 * Get all contract template ids.
 * @returns {string[]}
 */
export function getAllContractTemplateIds() {
  return contractTemplates.map(t => t.id);
}