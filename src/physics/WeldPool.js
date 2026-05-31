/**
 * WeldPool 2D Grid Physics
 * @module physics/WeldPool
 */

import { BALANCE } from '../config/balance.js';
import { initializeGrid } from './WeldPoolGrid.js';
import { computeDiffusionStep } from './WeldPoolDiffusion.js';

function applyHeatToCell(cell, heatInput, maxDt) {
  const deltaT = (heatInput * maxDt) / 100;
  cell.temperature = Math.min(2800, cell.temperature + deltaT);
  if (cell.temperature >= BALANCE.physics.LIQUIDUS_TEMP) {
    cell.liquid = true;
    cell.solid = false;
  }
}

function computeFluidShift(cell, below, flowFactor) {
  const massShift = cell.mass * flowFactor;
  below.mass += massShift;
  cell.mass -= massShift;
}

function processColumnForFluid(grid, col, rows, flowFactor) {
  for (let r = rows - 2; r >= 0; r--) {
    const cell = grid[col][r];
    if (cell.solid || !cell.liquid) continue;
    const below = grid[col][r + 1];
    if (below.solid || below.liquid) {
      computeFluidShift(cell, below, flowFactor);
    }
  }
}

function solidifyColumn(grid, col, rows) {
  let topLiquidRow = findTopLiquidRow(grid[col], rows);
  for (let r = 0; r < rows; r++) {
    const cell = grid[col][r];
    if (cell.temperature < BALANCE.physics.SOLIDUS_TEMP) {
      const wasLiquid = cell.liquid;
      cell.solid = true;
      cell.liquid = false;
      cell.mass = 0;
      if (wasLiquid && r === topLiquidRow && topLiquidRow !== -1) {
        cell.slag = true;
      }
    }
  }
}

function findTopLiquidRow(column, rows) {
  for (let r = 0; r < rows; r++) {
    if (!column[r].solid && column[r].liquid) return r;
  }
  return -1;
}

export function createWeldPool(cols, rows) {
  const grid = initializeGrid(cols, rows);
  const maxDt = BALANCE.tick.MAX_DT;

  /** @param {number} col @param {number} row @param {number} heatInput @param {number} dt */
  function applyHeat(col, row, heatInput, dt) {
    if (col < 0 || col >= cols || row < 0 || row >= rows) return;
    applyHeatToCell(grid[col][row], heatInput, maxDt);
  }

  /** @param {number} dt */
  function diffuse(dt) {
    const clampedDt = Math.min(dt, maxDt);
    computeDiffusionStep(grid, cols, rows, BALANCE.physics.THERMAL_DIFFUSIVITY, clampedDt);
  }

  function fluidStep() {
    const flowFactor = Math.min(1, BALANCE.physics.POOL_VISCOSITY * 100);
    for (let c = 0; c < cols; c++) {
      processColumnForFluid(grid, c, rows, flowFactor);
    }
  }

  function solidify() {
    for (let c = 0; c < cols; c++) {
      solidifyColumn(grid, c, rows);
    }
  }

  function getGrid() {
    return grid;
  }

  return { applyHeat, diffuse, fluidStep, solidify, getGrid };
}