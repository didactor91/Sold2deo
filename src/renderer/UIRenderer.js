/**
 * UI Renderer
 * @module renderer/UIRenderer
 * @description Layer 8 — HUD overlays on canvas: score, arc status badge, chip mode indicator.
 */

import {
  UI_SCORE_COLOUR,
  UI_ARC_OK,
  UI_ARC_SHORT,
  UI_ARC_LONG,
  UI_ARC_BROKEN,
} from '../config/renderer.js';

/**
 * Returns the badge colour for a given arc status.
 * @param {string} status
 * @returns {string}
 */
function getArcBadgeColour(status) {
  switch (status) {
    case 'ok':
      return UI_ARC_OK;
    case 'short':
      return UI_ARC_SHORT;
    case 'long':
      return UI_ARC_LONG;
    case 'broken':
      return UI_ARC_BROKEN;
    default:
      return UI_ARC_OK;
  }
}

/**
 * Renders score text.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} score
 */
function renderScore(ctx, score) {
  ctx.font = '12px monospace';
  ctx.fillStyle = UI_SCORE_COLOUR;
  ctx.fillText(`SCORE: ${score}`, 10, 20);
}

/**
 * Renders arc status badge.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} status
 */
function renderArcBadge(ctx, status) {
  ctx.fillStyle = getArcBadgeColour(status);
  ctx.fillRect(10, 30, 12, 12);
}

/**
 * Renders chip mode indicator.
 * @param {CanvasRenderingContext2D} ctx
 * @param {boolean} chipMode
 */
function renderChipMode(ctx, chipMode) {
  if (!chipMode) {
    return;
  }
  ctx.fillStyle = '#ffaa00';
  ctx.fillText('[C] CHIP MODE', 10, 50);
}

/**
 * Creates a UIRenderer instance.
 * @returns {{ render: function }}
 */
export function createUIRenderer() {
  /**
   * Render HUD overlays.
   * @param {CanvasRenderingContext2D} ctx
   * @param {GameState} state
   * @param {number} interpolation
   */
  function render(ctx, state, interpolation) {
    const { score, chipMode, arc } = state;
    renderScore(ctx, score);
    renderArcBadge(ctx, arc.status);
    renderChipMode(ctx, chipMode);
  }

  return { render };
}
