/**
 * GameSave — save/load game state including cosmetics inventory
 * @module src/game/GameSave
 */

const STORAGE_KEY = 'sold2deo_save';

/**
 * @typedef {Object} GameSaveData
 * @property {number} credits
 * @property {string[]} cosmeticsInventory
 * @property {Object} progression
 * @property {Object} idleFactory
 */

/**
 * @returns {GameSaveData}
 */
export function loadGame() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSave();
    return JSON.parse(raw);
  } catch {
    return createDefaultSave();
  }
}

/**
 * @param {GameSaveData} data
 */
export function saveGame(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * @returns {GameSaveData}
 */
function createDefaultSave() {
  return {
    credits: 0,
    cosmeticsInventory: [],
    progression: {},
    idleFactory: {},
  };
}

/**
 * Get cosmetics inventory from save.
 * @returns {string[]}
 */
export function getCosmeticsInventory() {
  const save = loadGame();
  return save.cosmeticsInventory || [];
}

/**
 * Set cosmetics inventory in save.
 * @param {string[]} inventory
 */
export function setCosmeticsInventory(inventory) {
  const save = loadGame();
  save.cosmeticsInventory = inventory;
  saveGame(save);
}

/**
 * Add a cosmetic to the inventory.
 * @param {string} cosmeticId
 */
export function addCosmeticToInventory(cosmeticId) {
  const save = loadGame();
  if (!save.cosmeticsInventory.includes(cosmeticId)) {
    save.cosmeticsInventory.push(cosmeticId);
    saveGame(save);
  }
}