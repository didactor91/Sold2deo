/**
 * Grid initialization helpers
 * @module physics/WeldPoolGrid
 */

import { BALANCE } from '../config/balance.js';

/**
 * Initialize a 2D grid of PoolCells.
 * @param {number} cols
 * @param {number} rows
 * @returns {Array<Array<Object>>}
 */
export function initializeGrid(cols, rows) {
  const grid = [];
  for (let c = 0; c < cols; c++) {
    grid[c] = [];
    for (let r = 0; r < rows; r++) {
      grid[c][r] = {
        temperature: BALANCE.physics.AMBIENT_TEMP,
        mass: 0,
        solid: true,
        liquid: false,
        slag: false,
      };
    }
  }
  return grid;
}
