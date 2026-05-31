/**
 * AudioEngine — arc sound synthesis and effects
 * @module src/audio/AudioEngine
 */

export const DEFAULT_ARC_COLOR = '#ff9933'; // default orange arc

const ARC_COLORS = {
  'blue-glow': '#0077ff',
  'red-arc': '#ff3333',
  'green-arc': '#33cc33',
  'purple-arc': '#9933ff',
};

/**
 * AudioEngine manages arc sound synthesis and arc visual colour.
 */
export class AudioEngine {
  constructor({ eventBus } = {}) {
    this._eventBus = eventBus;
    this._arcColor = DEFAULT_ARC_COLOR;
    this._equippedCosmetic = null;
  }

  /**
   * Get the current arc colour (affected by equipped cosmetic).
   * @returns {string}
   */
  getArcColor() {
    return this._arcColor;
  }

  /**
   * Apply a cosmetic effect to the arc.
   * @param {string|null} cosmeticId - Cosmetic item id or null to reset
   */
  applyArcCosmetic(cosmeticId) {
    if (!cosmeticId) {
      this._arcColor = DEFAULT_ARC_COLOR;
      this._equippedCosmetic = null;
      return;
    }

    // Map cosmetic effectId to arc colour
    // In a real implementation, this would resolve through a cosmetic config
    const cosmeticColor = ARC_COLORS[cosmeticId] || DEFAULT_ARC_COLOR;
    this._arcColor = cosmeticColor;
    this._equippedCosmetic = cosmeticId;
  }

  /**
   * Get the equipped arc cosmetic id.
   * @returns {string|null}
   */
  getEquippedArcCosmetic() {
    return this._equippedCosmetic;
  }
}