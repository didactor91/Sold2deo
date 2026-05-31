/**
 * HeatDiffusion HAZ Computation
 * @module physics/HeatDiffusion
 */

import { BALANCE } from '../config/balance.js';

/**
 * Pure function: compute HAZ particles from bead columns.
 * @param {Array<Object>} beadColumns
 * @param {Set<number>} computedColumns
 * @returns {Array<Object>}
 */
export function computeHAZParticles(beadColumns, computedColumns) {
  const particles = [];
  for (const col of beadColumns) {
    if (computedColumns.has(col.col)) continue;
    if (col.height <= 0) continue;
    particles.push({
      col: col.col,
      intensity: BALANCE.heatDiffusion.INTENSITY_INITIAL,
      sigma: BALANCE.heatDiffusion.GAUSSIAN_SIGMA,
    });
    computedColumns.add(col.col);
  }
  return particles;
}

/**
 * Creates off-screen HAZ canvas with Gaussian spread per column.
 * @param {number} width
 * @param {number} height
 * @returns {Object}
 */
export function createHeatDiffusion(width, height) {
  let ctx = null;
  const computedColumns = new Set();

  function ensureContext() {
    if (!ctx) {
      ctx = createOffscreenContext(width, height);
    }
  }

  /**
   * @param {Array<Object>} beadColumns
   * @returns {Array<Object>}
   */
  function compute(beadColumns) {
    ensureContext();
    ctx.clearRect(0, 0, width, height);
    const particles = computeHAZParticles(beadColumns, computedColumns);
    for (const p of particles) {
      drawGaussianOnContext(ctx, p, width, height);
    }
    return particles;
  }

  function getContext() {
    ensureContext();
    return ctx;
  }

  return { compute, getContext };
}

function createOffscreenContext(w, h) {
  // Canvas creation — browser only. Node tests must mock this.
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas.getContext('2d');
}

function drawGaussianOnContext(context, particle, width, height) {
  const colorHot = BALANCE.heatDiffusion.COLOR_HOT;
  const sigma = particle.sigma || BALANCE.heatDiffusion.GAUSSIAN_SIGMA;
  const x = particle.col;
  const y = height / 2;

  const gradient = context.createRadialGradient(x, y, 0, x, y, sigma * 2);
  gradient.addColorStop(0, colorHot);
  gradient.addColorStop(1, 'transparent');

  context.globalAlpha = particle.intensity || BALANCE.heatDiffusion.INTENSITY_INITIAL;
  context.fillStyle = gradient;
  context.beginPath();
  context.arc(x, y, sigma * 2, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;
}