/**
 * SceneRenderer — canvas-based scene rendering
 * @module src/renderer/SceneRenderer
 */

/**
 * SceneRenderer wraps the canvas context and provides rendering primitives
 * for the weld scene.
 */
export class SceneRenderer {
  /**
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
   * @param {EventBus} eventBus - Event bus for frame events
   */
  constructor(ctx, eventBus) {
    this._ctx = ctx;
    this._eventBus = eventBus;
    this._width = ctx.canvas?.width || 800;
    this._height = ctx.canvas?.height || 600;
  }

  /**
   * Render the scene based on game state
   * @param {Object} gameState - Current game state
   * @returns {void}
   */
  render(gameState) {
    if (!this._ctx) return;

    // Clear canvas
    this._ctx.fillStyle = '#1a1a2e';
    this._ctx.fillRect(0, 0, this._width, this._height);

    // Draw arc weld effect if available
    if (gameState.activeContract) {
      this._drawArcWeld();
    }

    // Draw HUD elements
    this._drawCredits(gameState.credits);

    // Emit frame rendered event
    this._eventBus.emit('frameRendered', { state: gameState });
  }

  /**
   * Draw arc weld effect
   * @private
   */
  _drawArcWeld() {
    const centerX = this._width / 2;
    const centerY = this._height / 2;

    // Draw arc glow
    const gradient = this._ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 50);
    gradient.addColorStop(0, '#ff9933');
    gradient.addColorStop(0.5, '#ff6600');
    gradient.addColorStop(1, 'transparent');

    this._ctx.fillStyle = gradient;
    this._ctx.beginPath();
    this._ctx.arc(centerX, centerY, 50, 0, Math.PI * 2);
    this._ctx.fill();
  }

  /**
   * Draw credits display
   * @param {number} credits
   * @private
   */
  _drawCredits(credits) {
    this._ctx.fillStyle = '#ffffff';
    this._ctx.font = '20px monospace';
    this._ctx.textAlign = 'right';
    this._ctx.fillText(`${credits}Ȼ`, this._width - 20, 40);
  }

  /**
   * Get canvas dimensions
   * @returns {{ width: number, height: number }}
   */
  getDimensions() {
    return { width: this._width, height: this._height };
  }
}
