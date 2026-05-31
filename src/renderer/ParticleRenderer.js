/**
 * Particle Renderer
 * @module renderer/ParticleRenderer
 * @description Layer 5 — batch particle drawing. Iterates active particles, batches by colour.
 */

import { PARTICLE_RADIUS } from '../config/renderer.js';

/**
 * Groups active particles by colour.
 * @param {Array} particles
 * @returns {Map<string, Array>}
 */
function groupByColour(particles) {
  /** @type {Map<string, Array>} */
  const groups = new Map();
  for (const particle of particles) {
    if (!particle.active) {
      continue;
    }
    const colour = particle.color || '#ffffff';
    if (!groups.has(colour)) {
      groups.set(colour, []);
    }
    groups.get(colour).push(particle);
  }
  return groups;
}

/**
 * Creates a ParticleRenderer instance.
 * @returns {{ render: function }}
 */
export function createParticleRenderer() {
  /**
   * Render all active particles, batched by colour group.
   * @param {CanvasRenderingContext2D} ctx
   * @param {GameState} state
   * @param {number} interpolation
   */
  function render(ctx, state, interpolation) {
    if (!state.particles || state.particles.length === 0) {
      return;
    }

    const groups = groupByColour(state.particles);

    for (const [colour, particles] of groups) {
      ctx.beginPath();
      ctx.fillStyle = colour;

      for (const particle of particles) {
        ctx.globalAlpha = particle.life;
        ctx.arc(particle.x, particle.y, PARTICLE_RADIUS, 0, Math.PI * 2);
      }

      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  return { render };
}
