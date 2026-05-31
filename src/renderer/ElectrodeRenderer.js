/**
 * Electrode Renderer
 * @module renderer/ElectrodeRenderer
 * @description Layers 6–7 — electrode stick, holder, arc glow, droplet, smoke wisps.
 */

import {
  FPS_FALLBACK,
  SMOKE_ALPHA_MAX,
  DROPLET_DETACHMENT_THRESHOLD,
  DROPLET_COLOUR,
} from '../config/renderer.js';
import { processColor } from './colorUtils.js';

/**
 * Draws the arc glow effect.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} arc
 * @param {string} arcColour
 * @param {number} tipX
 * @param {number} tipY
 * @param {number} fps
 */
function drawArcGlow(ctx, arc, arcColour, tipX, tipY, fps) {
  if (fps < FPS_FALLBACK) {
    const radii = [12, 8, 4];
    for (const radius of radii) {
      ctx.beginPath();
      ctx.fillStyle = arcColour;
      ctx.arc(tipX, tipY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    const baseRadius = 15;
    const amperage = arc.amperage || 100;
    const referenceAmperage = 100;
    const radius = baseRadius * (amperage / referenceAmperage);
    const gradient = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, radius);
    gradient.addColorStop(0, arcColour);
    gradient.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(tipX, tipY, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draws the droplet at the arc tip.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} droplet
 */
function drawDroplet(ctx, droplet) {
  if (!droplet) {
    return;
  }
  if (droplet.life > DROPLET_DETACHMENT_THRESHOLD) {
    const oscillation = Math.sin(droplet.oscillationPhase * Math.PI * 2) * 2;
    ctx.beginPath();
    ctx.fillStyle = DROPLET_COLOUR;
    ctx.arc(droplet.x + oscillation, droplet.y, 3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.fillStyle = DROPLET_COLOUR;
    ctx.arc(droplet.x, droplet.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draws smoke particles with upward drift and alpha fade.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} smokeParticles
 */
function drawSmoke(ctx, smokeParticles) {
  if (!smokeParticles || smokeParticles.length === 0) {
    return;
  }
  for (const smoke of smokeParticles) {
    if (!smoke.active) {
      continue;
    }
    ctx.globalAlpha = smoke.life * SMOKE_ALPHA_MAX;
    ctx.beginPath();
    ctx.fillStyle = smoke.color || '#888888';
    ctx.arc(smoke.x, smoke.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Draws the electrode stick and holder.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} stickColour
 * @param {number} stickHeight
 */
function drawStickAndHolder(ctx, stickColour, stickHeight) {
  const stickX = 400;
  const stickBaseY = 500;

  ctx.fillStyle = stickColour;
  ctx.fillRect(stickX - 5, stickBaseY - stickHeight, 10, stickHeight);

  ctx.fillStyle = '#555555';
  ctx.fillRect(stickX - 8, stickBaseY - stickHeight - 20, 16, 20);
}

/**
 * Creates an FPS tracker with rolling average over 10 frames.
 * @returns {(now: number) => number}
 */
function createFPSTracker() {
  /** @type {number[]} */
  const frameDeltas = [];
  /** @type {number} */
  let lastTime = 0;

  return function getFPS(now) {
    if (lastTime > 0) {
      frameDeltas.push(now - lastTime);
      if (frameDeltas.length > 10) {
        frameDeltas.shift();
      }
    }
    lastTime = now;
    if (frameDeltas.length === 0) {
      return 60;
    }
    const avgDelta = frameDeltas.reduce((a, b) => a + b, 0) / frameDeltas.length;
    return avgDelta > 0 ? 1000 / avgDelta : 60;
  };
}

/**
 * Creates an ElectrodeRenderer instance.
 * @returns {{ render: function }}
 */
export function createElectrodeRenderer() {
  const getFPS = createFPSTracker();

  /**
   * Render the electrode, arc, droplet, and smoke.
   * @param {CanvasRenderingContext2D} ctx
   * @param {GameState} state
   * @param {number} _interpolation
   */
  function render(ctx, state, _interpolation) {
    const { electrode, arc, droplet, smokeParticles } = state;
    const fps = getFPS(performance.now());
    const stickColour = processColor(electrode.type) || '#888888';
    const stickHeight = 100 * (1 - electrode.consumed);

    drawStickAndHolder(ctx, stickColour, stickHeight);

    if (arc.established) {
      const arcColour = processColor(electrode.type) || '#4488ff';
      drawArcGlow(ctx, arc, arcColour, 400, 500 - stickHeight, fps);
      ctx.fillStyle = stickColour;
    }

    drawDroplet(ctx, droplet);
    ctx.fillStyle = stickColour;
    drawSmoke(ctx, smokeParticles);
  }

  return { render };
}
