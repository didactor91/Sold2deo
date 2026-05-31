/**
 * WeldPool Diffusion Calculations
 * @module physics/WeldPoolDiffusion
 */

import { BALANCE } from '../config/balance.js';

/**
 * Compute one diffusion step on the grid.
 * @param {Array<Array<Object>>} grid
 * @param {number} cols
 * @param {number} rows
 * @param {number} alpha
 * @param {number} dt
 */
export function computeDiffusionStep(grid, cols, rows, alpha, dt) {
  const dx = 1;
  const tempCopy = createTempCopy(grid, cols, rows);
  for (let c = 1; c < cols - 1; c++) {
    for (let r = 1; r < rows - 1; r++) {
      const n = tempCopy[c][r - 1];
      const s = tempCopy[c][r + 1];
      const e = tempCopy[c + 1][r];
      const w = tempCopy[c - 1][r];
      const center = tempCopy[c][r];
      const diffusion = (alpha * dt * (n + s + e + w - 4 * center)) / (dx * dx);
      const newTemp = center + diffusion;
      grid[c][r].temperature = Math.max(
        BALANCE.physics.AMBIENT_TEMP,
        Math.min(BALANCE.physics.MAX_TEMP, newTemp)
      );
      updateLiquidSolid(grid[c][r]);
    }
  }
}

function createTempCopy(grid, cols, rows) {
  const copy = [];
  for (let c = 0; c < cols; c++) {
    copy[c] = [];
    for (let r = 0; r < rows; r++) {
      copy[c][r] = grid[c][r].temperature;
    }
  }
  return copy;
}

function updateLiquidSolid(cell) {
  if (cell.temperature >= BALANCE.physics.LIQUIDUS_TEMP) {
    cell.liquid = true;
    cell.solid = false;
  } else if (cell.temperature < BALANCE.physics.SOLIDUS_TEMP) {
    cell.solid = true;
    cell.liquid = false;
  }
}
