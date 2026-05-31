/**
 * HUD — Heads-up display showing game stats
 * @module src/ui/HUD
 */

/**
 * HUD displays current game statistics overlay.
 */
export class HUD {
  /**
   * @param {Object} options
   * @param {EventBus} options.eventBus
   * @param {StateManager} options.stateManager
   */
  constructor({ eventBus, stateManager } = {}) {
    this._eventBus = eventBus;
    this._stateManager = stateManager;
    this._container = null;

    // Subscribe to state changes
    if (eventBus) {
      eventBus.on('stateChanged', (state) => this._onStateChanged(state));
    }
  }

  /**
   * Handle state changes
   * @param {Object} state
   * @private
   */
  _onStateChanged(state) {
    if (this._container) {
      this._updateDisplay(state);
    }
  }

  /**
   * Update the HUD display
   * @param {Object} state
   * @private
   */
  _updateDisplay(state) {
    const creditsEl = this._container.querySelector('.hud-credits');
    const botsEl = this._container.querySelector('.hud-bots');
    const contractEl = this._container.querySelector('.hud-contract');

    if (creditsEl) creditsEl.textContent = `${state.credits ?? 0}Ȼ`;
    if (botsEl) botsEl.textContent = `Bots: ${(state.activeBots ?? []).length}`;
    if (contractEl) {
      contractEl.textContent = state.activeContract
        ? `Contract: ${state.activeContract.id}`
        : 'No active contract';
    }
  }

  /**
   * Mount HUD — attaches to existing #hud DOM element.
   * @returns {HTMLElement|null}
   */
  mount() {
    this._container = document.getElementById('hud');
    if (this._container) {
      this._updateFromState();
    }
    return this._container;
  }

  /**
   * Update HUD from current state manager state.
   * @private
   */
  _updateFromState() {
    const state = this._stateManager ? this._stateManager.getState() : {};
    const statLevel = document.getElementById('stat-level');
    const statXp = document.getElementById('stat-xp');
    const statCredits = document.getElementById('stat-credits');
    const statQuality = document.getElementById('stat-quality');

    if (statCredits) statCredits.textContent = `${(state.credits ?? 0).toLocaleString()}`;
    if (statXp) statXp.textContent = `${(state.xp ?? 0).toLocaleString()}`;
    if (statLevel) statLevel.textContent = state.level ?? 1;
    if (statQuality) {
      const q = state.session?.quality ?? null;
      statQuality.textContent = q !== null ? `${Math.round(q * 100)}%` : '—';
    }
  }
}
