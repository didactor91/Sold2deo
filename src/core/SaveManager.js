/**
 * SaveManager — localStorage persistence for game state
 * @module src/core/SaveManager
 */

const SAVE_KEY = 'sold2deo_save';
const MAX_OFFLINE_HOURS = 8;
const TIER_1_RATE = 2; // Ȼ per hour per Tier 1 bot
const TIER_2_RATE = 5; // Ȼ per hour per Tier 2 bot

/**
 * Calculate offline earnings based on time delta and bots
 * @param {number} lastTickTimestamp - Last tick timestamp in ms
 * @param {Array} bots - Array of bot objects
 * @returns {number} Offline earnings in Ȼ
 */
function calculateOfflineEarnings(lastTickTimestamp, bots) {
  if (!lastTickTimestamp || !bots || bots.length === 0) return 0;

  const now = Date.now();
  const elapsedSeconds = (now - lastTickTimestamp) / 1000;
  const maxOfflineSeconds = MAX_OFFLINE_HOURS * 3600;
  const cappedSeconds = Math.min(elapsedSeconds, maxOfflineSeconds);

  let earningsPerHour = 0;
  for (const bot of bots) {
    if (bot.tier === 1) earningsPerHour += TIER_1_RATE;
    if (bot.tier === 2) earningsPerHour += TIER_2_RATE;
  }

  const earnings = (cappedSeconds / 3600) * earningsPerHour;
  return Math.floor(earnings);
}

/**
 * SaveManager handles serializing and deserializing game state to localStorage.
 */
export class SaveManager {
  /**
   * @param {StateManager} stateManager
   * @param {EventBus} eventBus
   */
  constructor(stateManager, eventBus) {
    this._stateManager = stateManager;
    this._eventBus = eventBus;
  }

  /**
   * Save current state to localStorage
   * @returns {void}
   */
  save() {
    const state = this._stateManager.getState();
    const saveData = {
      credits: state.credits,
      bots: state.bots,
      activeBots: state.activeBots,
      activeContract: state.activeContract,
      totalEarned: state.totalEarned,
      idleFactory: state.idleFactory || {},
      cosmeticsInventory: state.cosmeticsInventory || [],
      progression: state.progression || {},
      savedAt: Date.now(),
    };

    // Update lastTickTimestamp in idleFactory
    if (saveData.idleFactory) {
      saveData.idleFactory.lastTickTimestamp = Date.now();
    }

    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    this._eventBus.emit('gameSaved', { savedAt: saveData.savedAt });
  }

  /**
   * Load state from localStorage
   * @returns {boolean} true if save existed and was loaded, false otherwise
   */
  load() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (!saved) {
      return false;
    }

    try {
      const saveData = JSON.parse(saved);
      this._applyOfflineEarnings(saveData);
      this._stateManager.setState({
        credits: saveData.credits ?? 0,
        bots: saveData.bots ?? [],
        activeBots: saveData.activeBots ?? [],
        activeContract: saveData.activeContract ?? null,
        totalEarned: saveData.totalEarned ?? 0,
        idleFactory: saveData.idleFactory || {},
        cosmeticsInventory: saveData.cosmeticsInventory || [],
        progression: saveData.progression || {},
      });

      // Persist updated save with offline earnings calculated
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      this._eventBus.emit('stateLoaded', saveData);
      return true;
    } catch (e) {
      console.error('Failed to load save:', e);
      return false;
    }
  }

  /**
   * Apply offline earnings calculation to save data
   * @param {Object} saveData
   * @private
   */
  _applyOfflineEarnings(saveData) {
    if (!saveData.idleFactory || !saveData.idleFactory.bots) return;

    const earnings = calculateOfflineEarnings(
      saveData.idleFactory.lastTickTimestamp,
      saveData.idleFactory.bots
    );
    saveData.idleFactory.offlineEarnings = earnings;
    saveData.credits = (saveData.credits || 0) + earnings;
  }

  /**
   * Check if a save exists
   * @returns {boolean}
   */
  hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  /**
   * Delete the save
   * @returns {void}
   */
  deleteSave() {
    localStorage.removeItem(SAVE_KEY);
  }
}
