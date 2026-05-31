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
   * Render the HUD DOM element
   * @returns {HTMLElement}
   */
  render() {
    const state = this._stateManager ? this._stateManager.getState() : {};

    const container = document.createElement('div');
    container.className = 'hud';
    container.innerHTML = `
      <div class="hud-stats">
        <div class="hud-item hud-credits">${state.credits ?? 0}Ȼ</div>
        <div class="hud-item hud-bots">Bots: ${(state.activeBots ?? []).length}</div>
        <div class="hud-item hud-contract">${state.activeContract ? `Contract: ${state.activeContract.id}` : 'No active contract'}</div>
      </div>
    `;

    this._container = container;
    return container;
  }
}
