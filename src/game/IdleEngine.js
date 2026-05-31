/**
 * IdleEngine — Main-thread facade for the idle simulation Web Worker
 * @module game/IdleEngine
 */
import { getBotTier } from '../config/factory.js';
import { getUpgrade } from '../config/factory.js';

/**
 * @typedef {Object} BotState
 * @property {string} id
 * @property {number} tier
 * @property {number} quality
 * @property {string|null} assignedContractId
 */

/**
 * @typedef {Object} UpgradeState
 * @property {string} id
 */

/**
 * @typedef {Object} IdleEngineState
 * @property {number} totalCredits
 * @property {number} creditsPerSecond
 * @property {BotState[]} activeBots
 * @property {UpgradeState[]} upgrades
 * @property {number} offlineEarnings
 */

/**
 * IdleEngine — manages the Web Worker and exposes idle simulation state.
 */
export class IdleEngine {
  /**
   * @param {Object} config
   * @param {Object} config.eventBus - EventBus instance
   */
  constructor({ eventBus }) {
    this._eventBus = eventBus;
    this._worker = null;
    this._state = {
      totalCredits: 0,
      creditsPerSecond: 0,
      activeBots: [],
      upgrades: [],
      offlineEarnings: 0,
    };
  }

  /**
   * Create the Web Worker instance. Override in tests.
   * @returns {Worker}
   */
  _createWorker() {
    return new Worker('/workers/idle-worker.js');
  }

  /**
   * Start the idle simulation.
   * @param {BotState[]} bots
   * @param {UpgradeState[]} upgrades
   * @param {number} lastTickTimestamp
   * @param {number} [initialCredits=0]
   */
  start(bots, upgrades, lastTickTimestamp, initialCredits = 0) {
    this._state.activeBots = [...bots];
    this._state.upgrades = [...upgrades];

    this._worker = this._createWorker();

    this._worker.onmessage = (event) => {
      const { type, payload } = event.data;

      if (type === 'OFFLINE_CALC') {
        this._state.offlineEarnings = payload.offlineEarnings;
        this._state.totalCredits = initialCredits + payload.offlineEarnings;
      } else if (type === 'TICK') {
        this._state.totalCredits = payload.totalCredits;
        this._state.creditsPerSecond = payload.creditsEarned;
        this._eventBus.emit('idle:creditsUpdated', {
          totalCredits: this._state.totalCredits,
          creditsEarned: payload.creditsEarned,
        });
      }
    };

    this._worker.postMessage({
      type: 'START',
      payload: {
        bots: this._state.activeBots,
        upgrades: this._state.upgrades,
        lastTickTimestamp,
        initialCredits,
      },
    });
  }

  /**
   * Stop the idle simulation and terminate the worker.
   */
  stop() {
    if (!this._worker) return;

    this._worker.postMessage({ type: 'STOP' });
    this._worker.terminate();
    this._worker = null;
  }

  /**
   * Get a read-only snapshot of the current idle state.
   * @returns {IdleEngineState}
   */
  getState() {
    return {
      totalCredits: this._state.totalCredits,
      creditsPerSecond: this._state.creditsPerSecond,
      activeBots: [...this._state.activeBots],
      upgrades: [...this._state.upgrades],
      offlineEarnings: this._state.offlineEarnings,
    };
  }

  /**
   * Hire a new bot of the given tier.
   * @param {number} tier - Bot tier (1-5)
   * @param {string} botId - Unique bot id
   * @returns {{ success: boolean, error?: string }}
   */
  hireBot(tier, botId) {
    const tierData = getBotTier(tier);
    if (!tierData) {
      return { success: false, error: 'Invalid bot tier' };
    }

    const bot = {
      id: botId,
      tier,
      quality: tierData.baseQuality,
      assignedContractId: null,
    };

    this._state.activeBots.push(bot);
    this._sendUpdate();

    return { success: true };
  }

  /**
   * Assign a bot to a contract.
   * @param {string} botId
   * @param {string} contractId
   * @returns {{ success: boolean, error?: string }}
   */
  assignBot(botId, contractId) {
    const bot = this._state.activeBots.find(b => b.id === botId);
    if (!bot) {
      return { success: false, error: 'Bot not found' };
    }

    bot.assignedContractId = contractId;
    this._sendUpdate();

    return { success: true };
  }

  /**
   * Purchase a factory upgrade.
   * @param {string} upgradeId
   * @returns {{ success: boolean, error?: string }}
   */
  purchaseUpgrade(upgradeId) {
    const upgradeData = getUpgrade(upgradeId);
    if (!upgradeData) {
      return { success: false, error: 'Invalid upgrade id' };
    }

    // Avoid duplicate upgrades
    if (this._state.upgrades.some(u => u.id === upgradeId)) {
      return { success: false, error: 'Upgrade already purchased' };
    }

    this._state.upgrades.push({ id: upgradeId });
    this._sendUpdate();

    return { success: true };
  }

  /**
   * Send current state to the worker via UPDATE message.
   */
  _sendUpdate() {
    if (!this._worker) return;

    this._worker.postMessage({
      type: 'UPDATE',
      payload: {
        bots: this._state.activeBots,
        upgrades: this._state.upgrades,
      },
    });
  }
}
