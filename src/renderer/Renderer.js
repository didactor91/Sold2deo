/**
 * Renderer — canvas rendering for weld visuals and cosmetic effects
 * @module src/renderer/Renderer
 */

const SPATTER_EFFECTS = {
  'fire-spatter': { color: '#ff6600', particleCount: 12 },
  'snow-spatter': { color: '#e6f2ff', particleCount: 8 },
  'toxic-spatter': { color: '#33cc33', particleCount: 10 },
};

const MACHINE_SKINS = {
  'chrome': { baseColor: '#d9d9d9', highlight: '#ffffff', shadow: '#999999' },
  'rust': { baseColor: '#cc6633', highlight: '#dd8844', shadow: '#994422' },
  'gold': { baseColor: '#ffd700', highlight: '#ffec80', shadow: '#cc9900' },
};

/**
 * Renderer manages canvas drawing including spatter particles and machine skins.
 */
export class Renderer {
  constructor({ canvas, eventBus } = {}) {
    this._canvas = canvas;
    this._ctx = canvas ? canvas.getContext('2d') : null;
    this._eventBus = eventBus;
    this._equippedSpatter = null;
    this._equippedMachine = null;
  }

  /**
   * Get the current spatter effect config.
   * @returns {{ color: string, particleCount: number } | null}
   */
  getSpatterEffect() {
    if (!this._equippedSpatter) return null;
    return SPATTER_EFFECTS[this._equippedSpatter] || null;
  }

  /**
   * Apply a spatter cosmetic effect.
   * @param {string|null} cosmeticId
   */
  applySpatterCosmetic(cosmeticId) {
    this._equippedSpatter = cosmeticId;
  }

  /**
   * Get the current machine skin config.
   * @returns {{ baseColor: string, highlight: string, shadow: string } | null}
   */
  getMachineSkin() {
    if (!this._equippedMachine) return null;
    return MACHINE_SKINS[this._equippedMachine] || null;
  }

  /**
   * Apply a machine skin cosmetic effect.
   * @param {string|null} cosmeticId
   */
  applyMachineCosmetic(cosmeticId) {
    this._equippedMachine = cosmeticId;
  }

  /**
   * Get the equipped cosmetic ids.
   * @returns {{ spatter: string|null, machine: string|null }}
   */
  getEquippedCosmetics() {
    return {
      spatter: this._equippedSpatter,
      machine: this._equippedMachine,
    };
  }
}