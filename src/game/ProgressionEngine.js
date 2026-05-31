/**
 * ProgressionEngine — XP, level, unlock gating
 * @module game/ProgressionEngine
 */
import { electrodes } from '../config/electrodes.js';
import { machines } from '../config/machines.js';

/**
 * Pure function: XP required to reach the next level.
 * Formula: floor(100 * 1.45^(level-1))
 * @param {number} level - Current level (>= 1)
 * @returns {number} XP needed to reach the next level
 */
export function xpToNext(level) {
  if (level < 1) return 0;
  return Math.floor(100 * Math.pow(1.45, level - 1));
}

/**
 * @typedef {Object} ProgressionState
 * @property {number} xp
 * @property {number} level
 * @property {number} xpToNextLevel
 * @property {string[]} unlockedElectrodes
 * @property {string[]} unlockedMachines
 */

/**
 * @typedef {Object} UnlockResult
 * @property {string[]} newElectrodeUnlocks
 * @property {string[]} newMachineUnlocks
 */

/**
 * ProgressionEngine — manages XP accumulation, level calculation, and unlock events.
 */
export class ProgressionEngine {
  /**
   * @param {Object} config
   * @param {Array} config.electrodes - Electrode config array
   * @param {Array} config.machines - Machine config array
   * @param {Object} config.eventBus - EventBus instance with emit method
   */
  constructor({ electrodes: electrodeConfig, machines: machineConfig, eventBus }) {
    this._electrodes = electrodeConfig || electrodes;
    this._machines = machineConfig || machines;
    this._eventBus = eventBus;
    this._xp = 0;
    this._level = 1;
    this._unlockedElectrodes = new Set();
    this._unlockedMachines = new Set();
    // Unlock XP-0 defaults immediately
    this._electrodes.filter(e => e.xpUnlock === 0).forEach(e => this._unlockedElectrodes.add(e.code));
    this._machines.filter(m => m.xpUnlock === 0).forEach(m => this._unlockedMachines.add(m.id));
  }

  /**
   * Get read-only current state.
   * @returns {ProgressionState}
   */
  getState() {
    return {
      xp: this._xp,
      level: this._level,
      xpToNextLevel: xpToNext(this._level),
      unlockedElectrodes: [...this._unlockedElectrodes],
      unlockedMachines: [...this._unlockedMachines],
    };
  }

  /**
   * Grant XP and handle level-ups with unlock events.
   * @param {number} amount - XP to add
   * @returns {UnlockResult} New unlocks that occurred
   */
  grantXP(amount) {
    if (amount <= 0) return { newElectrodeUnlocks: [], newMachineUnlocks: [] };

    const previousXP = this._xp;
    this._xp += amount;

    // Check for level ups
    while (this._xp >= this._xpRequiredForLevel(this._level + 1)) {
      this._level++;
    }

    // Check for new unlocks
    const newElectrodeUnlocks = this._checkElectrodeUnlocks(previousXP);
    const newMachineUnlocks = this._checkMachineUnlocks(previousXP);

    return { newElectrodeUnlocks, newMachineUnlocks };
  }

  /**
   * Calculate total XP required to reach a given level.
   * @param {number} targetLevel
   * @returns {number}
   */
  _xpRequiredForLevel(targetLevel) {
    let total = 0;
    for (let lvl = 1; lvl < targetLevel; lvl++) {
      total += xpToNext(lvl);
    }
    return total;
  }

  /**
   * Check if any electrodes should be unlocked based on current XP.
   * @param {number} previousXP
   * @returns {string[]} Codes of newly unlocked electrodes
   */
  _checkElectrodeUnlocks(previousXP) {
    const newUnlocks = [];
    for (const electrode of this._electrodes) {
      if (electrode.xpUnlock > previousXP && electrode.xpUnlock <= this._xp) {
        if (!this._unlockedElectrodes.has(electrode.code)) {
          this._unlockedElectrodes.add(electrode.code);
          newUnlocks.push(electrode.code);
          this._eventBus.emit('unlock:electrode', { code: electrode.code });
        }
      }
    }
    return newUnlocks;
  }

  /**
   * Check if any machines should be unlocked based on current XP.
   * @param {number} previousXP
   * @returns {string[]} IDs of newly unlocked machines
   */
  _checkMachineUnlocks(previousXP) {
    const newUnlocks = [];
    for (const machine of this._machines) {
      if (machine.xpUnlock > previousXP && machine.xpUnlock <= this._xp) {
        if (!this._unlockedMachines.has(machine.id)) {
          this._unlockedMachines.add(machine.id);
          newUnlocks.push(machine.id);
          this._eventBus.emit('unlock:machine', { id: machine.id });
        }
      }
    }
    return newUnlocks;
  }

  /**
   * Check if an electrode is unlocked.
   * @param {string} code
   * @returns {boolean}
   */
  isElectrodeUnlocked(code) {
    return this._unlockedElectrodes.has(code);
  }

  /**
   * Check if a machine is unlocked.
   * @param {string} id
   * @returns {boolean}
   */
  isMachineUnlocked(id) {
    return this._unlockedMachines.has(id);
  }
}