/**
 * Workpiece Renderer
 * @module renderer/WorkpieceRenderer
 * @description Layers 1–4 — base metal, bead columns with temperature colour, rounded caps, slag, HAZ composite.
 */

import { BASE_METAL, SLAG_FILL, SLAG_CRUST, COLUMN_WIDTH } from '../config/renderer.js';
import { temperatureToColor } from './colorUtils.js';

/**
 * Draws a single bead column with rounded cap.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} column
 */
function drawBeadColumn(ctx, column) {
  const colour = temperatureToColor(column.temperature);
  ctx.fillStyle = colour;

  const topY = column.baseY - column.height;

  ctx.fillRect(column.x, topY, COLUMN_WIDTH, column.height);

  ctx.beginPath();
  ctx.arc(column.x + COLUMN_WIDTH / 2, topY, COLUMN_WIDTH / 2, Math.PI, 0);
  ctx.fill();
}

/**
 * Draws a single slag segment with crust highlight.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} slag
 * @param {number} workpieceHeight
 */
function drawSlagSegment(ctx, slag, workpieceHeight) {
  if (slag.removed) {
    return;
  }
  ctx.fillStyle = SLAG_FILL;
  ctx.fillRect(slag.x, workpieceHeight - slag.thickness, slag.width, slag.thickness);

  ctx.fillStyle = SLAG_CRUST;
  ctx.fillRect(slag.x, workpieceHeight - slag.thickness, slag.width, 2);
}

/**
 * Creates a WorkpieceRenderer instance.
 * @param {HTMLCanvasElement} hazCanvas
 * @returns {{ init: function, render: function }}
 */
export function createWorkpieceRenderer(hazCanvas) {
  /**
   * Initialise (hazCanvas is pre-created externally).
   */
  function init() {}

  /**
   * Render the workpiece layers.
   * @param {CanvasRenderingContext2D} ctx
   * @param {GameState} state
   * @param {number} interpolation
   */
  function render(ctx, state, interpolation) {
    const { workpiece, beadColumns, slagSegments } = state;

    ctx.fillStyle = BASE_METAL;
    ctx.fillRect(0, 0, workpiece.width, workpiece.height);

    if (hazCanvas) {
      ctx.drawImage(hazCanvas, 0, 0);
    }

    for (const column of beadColumns) {
      drawBeadColumn(ctx, column);
    }

    for (const slag of slagSegments) {
      drawSlagSegment(ctx, slag, workpiece.height);
    }
  }

  return { init, render };
}
