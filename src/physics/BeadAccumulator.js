/**
 * BeadAccumulator Column Deposition
 * @module physics/BeadAccumulator
 */

import { BALANCE } from '../config/balance.js';

/**
 * @typedef {Object} BeadColumn
 * @property {number} x - Column x position
 * @property {number} baseY - Top of workpiece surface
 * @property {number} height - Accumulated bead height
 * @property {number} temperature - Current temperature in Kelvin
 * @property {boolean} hasSlag - True if slag present
 * @property {boolean} slagRemoved - True if chipped off
 */

/**
 * Creates column array tracking bead height and slag state.
 * @param {number} width
 * @returns {Object}
 */
export function createBeadAccumulator(width) {
  const columns = createColumns(width);

  function deposit(poolCells, dt) {
    clampNegativeHeights(columns, width);
    for (let c = 0; c < width; c++) {
      if (!poolCells[c]) continue;
      depositToColumn(columns[c], poolCells[c], dt);
    }
  }

  function getColumns() {
    return columns;
  }

  return { deposit, getColumns };
}

function createColumns(width) {
  const cols = [];
  for (let i = 0; i < width; i++) {
    cols[i] = {
      x: i,
      baseY: 0,
      height: 0,
      temperature: BALANCE.physics.AMBIENT_TEMP,
      hasSlag: false,
      slagRemoved: false,
    };
  }
  return cols;
}

function clampNegativeHeights(columns, width) {
  for (let c = 0; c < width; c++) {
    if (columns[c].height < 0) columns[c].height = 0;
  }
}

function depositToColumn(column, poolColumn, dt) {
  const heightPerAmp = BALANCE.bead.HEIGHT_PER_AMP;
  const typicalAmperage = BALANCE.bead.TYPICAL_AMPERAGE;

  // Find top-most liquid cell
  for (let r = 0; r < poolColumn.length; r++) {
    const cell = poolColumn[r];
    if (cell.liquid && !cell.solid) {
      const rate = heightPerAmp * typicalAmperage;
      column.height = Math.max(0, column.height + rate * dt);
      column.temperature = cell.temperature;
      break;
    }
  }

  // Check if top cell solidifies
  if (poolColumn[0] && poolColumn[0].solid && !column.hasSlag) {
    column.hasSlag = true;
    column.temperature = BALANCE.physics.SOLIDUS_TEMP;
  }
}
