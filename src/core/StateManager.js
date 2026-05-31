/**
 * StateManager — centralized game state with event emission
 * @module src/core/StateManager
 */

/**
 * @typedef {Object} GameState
 * @property {number} credits - Current credits
 * @property {Array} bots - All owned bots
 * @property {Array} activeBots - Bots assigned to contracts
 * @property {Object|null} activeContract - Current contract
 * @property {number} totalEarned - Total credits ever earned
 */

/**
 * StateManager holds canonical game state and emits events on changes.
 */
export class StateManager {
  /**
   * @param {EventBus} eventBus - EventBus instance for notifications
   */
  constructor(eventBus) {
    this._eventBus = eventBus;
    /** @type {GameState} */
    this._state = {
      credits: 0,
      bots: [],
      activeBots: [],
      activeContract: null,
      totalEarned: 0,
    };
  }

  /**
   * Get current state (immutable copy)
   * @returns {GameState}
   */
  getState() {
    return { ...this._state };
  }

  /**
   * Get state reference (mutable - use carefully)
   * @returns {GameState}
   */
  getStateRef() {
    return this._state;
  }

  /**
   * Merge new state values
   * @param {Partial<GameState>} updates
   */
  setState(updates) {
    this._state = { ...this._state, ...updates };
    this._eventBus.emit('stateChanged', this._state);
  }

  /**
   * Update credits directly
   * @param {number} amount
   */
  updateCredits(amount) {
    this._state.credits = amount;
    this._eventBus.emit('creditsUpdated', { totalCredits: amount });
    this._eventBus.emit('stateChanged', this._state);
  }

  /**
   * Add a bot to the roster
   * @param {Object} bot
   */
  addBot(bot) {
    this._state.bots.push(bot);
    this._eventBus.emit('stateChanged', this._state);
  }

  /**
   * Remove a bot from roster
   * @param {string} botId
   */
  removeBot(botId) {
    this._state.bots = this._state.bots.filter(b => b.id !== botId);
    this._state.activeBots = this._state.activeBots.filter(b => b.id !== botId);
    this._eventBus.emit('stateChanged', this._state);
  }

  /**
   * Activate a bot (assign to contract)
   * @param {string} botId
   * @param {string} contractId
   */
  activateBot(botId, contractId) {
    const bot = this._state.bots.find(b => b.id === botId);
    if (bot) {
      bot.assignedContractId = contractId;
      if (!this._state.activeBots.find(b => b.id === botId)) {
        this._state.activeBots.push(bot);
      }
      this._eventBus.emit('stateChanged', this._state);
    }
  }

  /**
   * Deactivate a bot
   * @param {string} botId
   */
  deactivateBot(botId) {
    const bot = this._state.bots.find(b => b.id === botId);
    if (bot) {
      delete bot.assignedContractId;
      this._state.activeBots = this._state.activeBots.filter(b => b.id !== botId);
      this._eventBus.emit('stateChanged', this._state);
    }
  }
}
