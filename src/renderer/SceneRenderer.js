/**
 * Scene Renderer
 * @module renderer/SceneRenderer
 * @description Master compositor — orchestrates all 9 sub-renderers in layer order 0–8 each animation frame.
 */

/**
 * Creates a SceneRenderer instance.
 * Orchestrates all sub-renderers in layer order, wrapping each in ctx.save/restore.
 *
 * Layer order:
 *   0: BackgroundRenderer
 *   1: WorkpieceRenderer   (includes HAZ via hazCanvas)
 *   2: BeadRenderer
 *   3: SlagRenderer
 *   4: ParticleRenderer
 *   5: ArcRenderer
 *   6: ElectrodeRenderer
 *   7: UIRenderer
 *   8: reserved (future extension)
 *
 * @param {Array<object>} subRenderers - Array of 9 sub-renderer objects with render(ctx, state, interpolation) method
 * @returns {{ render: function }}
 */
export function createSceneRenderer(subRenderers) {
  /**
   * Render all layers in order.
   * @param {CanvasRenderingContext2D} ctx
   * @param {GameState} state
   * @param {number} interpolation - 0–1, time between physics ticks
   */
  function render(ctx, state, interpolation) {
    for (const sr of subRenderers) {
      if (!sr) {
        continue;
      }
      ctx.save();
      sr.render(ctx, state, interpolation);
      ctx.restore();
    }
  }

  return { render };
}
