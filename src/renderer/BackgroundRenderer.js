/**
 * Background Renderer
 * @module renderer/BackgroundRenderer
 * @description Layer 0 — static background. Draws base metal rectangle once to an off-screen canvas.
 */

import { BASE_METAL } from '../config/renderer.js';

/**
 * Creates a BackgroundRenderer instance.
 * Layer 0 — static background, drawn once at init and composited each frame.
 * @param {HTMLCanvasElement} canvas - The main canvas element
 * @returns {{ init: function, redraw: function }}
 */
export function createBackgroundRenderer(canvas) {
  /** @type {HTMLCanvasElement} */
  let bgCanvas;
  /** @type {CanvasRenderingContext2D} */
  let bgCtx;

  /**
   * Initialise the off-screen background canvas.
   * Draws the base metal rectangle once.
   */
  function init() {
    bgCanvas = document.createElement('canvas');
    bgCanvas.width = canvas.width;
    bgCanvas.height = canvas.height;
    bgCtx = bgCanvas.getContext('2d');
    bgCtx.fillStyle = BASE_METAL;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
  }

  /**
   * Composite the background onto the main canvas.
   * Called each frame by SceneRenderer.
   * @param {CanvasRenderingContext2D} ctx
   */
  function redraw(ctx) {
    if (!bgCanvas) {
      return;
    }
    ctx.drawImage(bgCanvas, 0, 0);
  }

  return { init, redraw };
}
