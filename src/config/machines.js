/**
 * Machine Configuration — all 5 machine tiers from RFC-001 §3.4
 * @module config/machines
 */

/**
 * @typedef {Object} MachineConfig
 * @property {string} id            - Unique identifier e.g. 'BASIC_INVERTER_100A'
 * @property {string} name          - Display name e.g. 'Basic Inverter 100A'
 * @property {number} maxAmp        - Maximum amperage output
 * @property {number} dutyCycle     - Duty cycle percentage (40–100%)
 * @property {number} price         - Cost in credits (0 for starter machine)
 * @property {number} xpUnlock      - XP level required to unlock purchase
 */

/** @type {MachineConfig[]} */
export const machines = Object.freeze([
  {
    id: 'BASIC_INVERTER_100A',
    name: 'Basic Inverter 100A',
    maxAmp: 100,
    dutyCycle: 40,
    price: 0,
    xpUnlock: 0,
  },
  {
    id: 'INVERTER_160A',
    name: 'Inverter 160A',
    maxAmp: 160,
    dutyCycle: 60,
    price: 250,
    xpUnlock: 300,
  },
  {
    id: 'PRO_INVERTER_200A',
    name: 'Pro Inverter 200A',
    maxAmp: 200,
    dutyCycle: 80,
    price: 600,
    xpUnlock: 800,
  },
  {
    id: 'INDUSTRIAL_250A',
    name: 'Industrial 250A',
    maxAmp: 250,
    dutyCycle: 100,
    price: 1200,
    xpUnlock: 1800,
  },
  {
    id: 'PROFESSIONAL_315A',
    name: 'Professional 315A',
    maxAmp: 315,
    dutyCycle: 100,
    price: 2500,
    xpUnlock: 3500,
  },
]);

/**
 * Get machine by id.
 * @param {string} id
 * @returns {MachineConfig|undefined}
 */
export function getMachine(id) {
  return machines.find(m => m.id === id);
}

/**
 * Get all machine ids.
 * @returns {string[]}
 */
export function getAllMachineIds() {
  return machines.map(m => m.id);
}