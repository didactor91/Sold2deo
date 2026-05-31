/**
 * Factory Configuration — bot tiers, upgrades, and idle constants
 * @module config/factory
 */

/**
 * @typedef {Object} BotTier
 * @property {number} id - Tier number (1-5)
 * @property {string} name - Display name
 * @property {number} baseQuality - Base quality percentage (0-100)
 * @property {number} speedMultiplier - Speed multiplier
 * @property {number} hireCost - Cost to hire in credits
 * @property {number} salaryPerHour - Salary in credits per hour
 */

/**
 * @typedef {Object} FactoryUpgrade
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {string} description - Upgrade description
 * @property {number} cost - Cost in credits
 * @property {{ type: string, value: number }} effect - Effect descriptor
 */

/** @type {BotTier[]} */
export const botTiers = Object.freeze([
  {
    id: 1,
    name: 'Apprentice',
    baseQuality: 35,
    speedMultiplier: 0.5,
    hireCost: 50,
    salaryPerHour: 2,
  },
  {
    id: 2,
    name: 'Welder B',
    baseQuality: 55,
    speedMultiplier: 0.8,
    hireCost: 150,
    salaryPerHour: 5,
  },
  {
    id: 3,
    name: 'Welder A',
    baseQuality: 70,
    speedMultiplier: 1.0,
    hireCost: 400,
    salaryPerHour: 12,
  },
  {
    id: 4,
    name: 'Specialist',
    baseQuality: 82,
    speedMultiplier: 1.2,
    hireCost: 900,
    salaryPerHour: 28,
  },
  {
    id: 5,
    name: 'Master',
    baseQuality: 93,
    speedMultiplier: 1.5,
    hireCost: 2000,
    salaryPerHour: 60,
  },
]);

/** @type {FactoryUpgrade[]} */
export const factoryUpgrades = Object.freeze([
  {
    id: 'ventilation',
    name: 'Ventilation System',
    description: '+10% duty cycle for all machines',
    cost: 200,
    effect: { type: 'efficiency_multiplier', value: 1.10 },
  },
  {
    id: 'second_shift',
    name: 'Second Shift',
    description: 'Offline earnings cap doubled',
    cost: 500,
    effect: { type: 'offline_cap_multiplier', value: 2.0 },
  },
  {
    id: 'qc_station',
    name: 'QC Station',
    description: 'Bots get +5% quality',
    cost: 300,
    effect: { type: 'quality_bonus', value: 0.05 },
  },
]);

/** Maximum offline hours before earnings cap */
export const MAX_OFFLINE_HOURS = 8;

/**
 * Get bot tier by id.
 * @param {number} id
 * @returns {BotTier|undefined}
 */
export function getBotTier(id) {
  return botTiers.find(t => t.id === id);
}

/**
 * Get all bot tier ids.
 * @returns {number[]}
 */
export function getAllBotTierIds() {
  return botTiers.map(t => t.id);
}

/**
 * Get factory upgrade by id.
 * @param {string} id
 * @returns {FactoryUpgrade|undefined}
 */
export function getUpgrade(id) {
  return factoryUpgrades.find(u => u.id === id);
}

/**
 * Get all factory upgrade ids.
 * @returns {string[]}
 */
export function getAllUpgradeIds() {
  return factoryUpgrades.map(u => u.id);
}

/**
 * Calculate credits per second for a bot on a given contract.
 * Formula: (qualityPercent/100) × speedMultiplier × (contractReward / contractDurationSeconds)
 * @param {{ tier: number, qualityPercent: number, contractReward: number, contractDurationSeconds: number }} params
 * @returns {number} Credits per second
 */
export function calculateBotCreditsPerSecond({ tier, qualityPercent, contractReward, contractDurationSeconds }) {
  const tierData = getBotTier(tier);
  if (!tierData) return 0;

  const qualityMultiplier = qualityPercent / 100;
  const ratePerSecond = contractReward / contractDurationSeconds;
  return qualityMultiplier * tierData.speedMultiplier * ratePerSecond;
}
