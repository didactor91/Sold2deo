/**
 * Electrode Configuration — all 6 electrode types from RFC-001 §3.3
 * @module config/electrodes
 */

/**
 * @typedef {Object} ElectrodeConfig
 * @property {string} code           - Unique identifier `{type}-{diameter}` e.g. 'E6013-2.5'
 * @property {string} type          - Electrode classification (Rutile, Basic, Cellulosic, Stainless)
 * @property {number} diameter      - Wire diameter in mm (2.5, 3.2, 4.0)
 * @property {{min: number, max: number}} ampRange
 * @property {string} penetration    - 'Low' | 'Low-Med' | 'Med-High' | 'High' | 'Very High'
 * @property {string} spatter       - 'Low' | 'Very Low' | 'High'
 * @property {{thickness: string, difficulty: string}} slag
 * @property {string} difficulty    - Star rating 1-4 (★ scale)
 * @property {number} xpUnlock       - XP level required to unlock this electrode
 */

/** @type {ElectrodeConfig[]} */
export const electrodes = Object.freeze([
  {
    code: 'E6013-2.5',
    type: 'Rutile',
    diameter: 2.5,
    ampRange: { min: 60, max: 90 },
    penetration: 'Low',
    spatter: 'Low',
    slag: { thickness: 'thin', difficulty: 'easy' },
    difficulty: '★☆☆☆',
    xpUnlock: 0,
  },
  {
    code: 'E6013-3.2',
    type: 'Rutile',
    diameter: 3.2,
    ampRange: { min: 80, max: 130 },
    penetration: 'Low-Med',
    spatter: 'Low',
    slag: { thickness: 'thin', difficulty: 'easy' },
    difficulty: '★☆☆☆',
    xpUnlock: 200,
  },
  {
    code: 'E7018-3.2',
    type: 'Basic (LH)',
    diameter: 3.2,
    ampRange: { min: 100, max: 160 },
    penetration: 'Med-High',
    spatter: 'Very Low',
    slag: { thickness: 'thick', difficulty: 'rigid' },
    difficulty: '★★☆☆',
    xpUnlock: 500,
  },
  {
    code: 'E7018-4.0',
    type: 'Basic (LH)',
    diameter: 4.0,
    ampRange: { min: 140, max: 200 },
    penetration: 'High',
    spatter: 'Very Low',
    slag: { thickness: 'thick', difficulty: 'rigid' },
    difficulty: '★★★☆',
    xpUnlock: 900,
  },
  {
    code: 'E6010-3.2',
    type: 'Cellulosic',
    diameter: 3.2,
    ampRange: { min: 70, max: 140 },
    penetration: 'Very High',
    spatter: 'High',
    slag: { thickness: 'thin', difficulty: 'fluid' },
    difficulty: '★★★★',
    xpUnlock: 1200,
  },
  {
    code: 'E308L-2.5',
    type: 'Stainless',
    diameter: 2.5,
    ampRange: { min: 60, max: 100 },
    penetration: 'Low',
    spatter: 'Low',
    slag: { thickness: 'light', difficulty: 'easy' },
    difficulty: '★★★☆',
    xpUnlock: 2000,
  },
]);

/**
 * Get electrode by code.
 * @param {string} code
 * @returns {ElectrodeConfig|undefined}
 */
export function getElectrode(code) {
  return electrodes.find(e => e.code === code);
}

/**
 * Get all electrode codes.
 * @returns {string[]}
 */
export function getAllElectrodeCodes() {
  return electrodes.map(e => e.code);
}