/**
 * CosmeticsService — purchase logic, catalog, and inventory management
 * @module server/src/services/CosmeticsService
 */
import { COSMETICS_CATALOG } from '../../../src/config/cosmetics.js';

/**
 * @typedef {Object} PurchaseResult
 * @property {boolean} success
 * @property {number} [newBalance]
 * @property {string[]} [inventory]
 * @property {string} [error] - 'INSUFFICIENT_FUNDS' | 'ITEM_NOT_FOUND'
 */

/**
 * @param {Object} deps
 * @param {function(string): string[]} deps.getInventory
 * @param {function(string, string[]): void} [deps.onPurchase] - Called when purchase succeeds to persist new inventory
 */
export class CosmeticsService {
  constructor({ getInventory, onPurchase } = {}) {
    this._getInventory = getInventory || (() => []);
    this._onPurchase = onPurchase || (() => {});
  }

  /**
   * Get all cosmetic items in the catalog.
   * @returns {Array<{id: string, name: string, category: string, price: number, effectId: string, description: string}>}
   */
  getCatalog() {
    return [...COSMETICS_CATALOG];
  }

  /**
   * Attempt to purchase a cosmetic for a player.
   * Idempotent — if already owned, returns success without double-charge.
   * @param {string} playerId
   * @param {string} cosmeticId
   * @param {number} currentBalance
   * @returns {PurchaseResult}
   */
  purchase(playerId, cosmeticId, currentBalance) {
    const item = COSMETICS_CATALOG.find(c => c.id === cosmeticId);
    if (!item) {
      return { success: false, error: 'ITEM_NOT_FOUND' };
    }

    const inventory = this._getInventory(playerId);
    if (inventory.includes(cosmeticId)) {
      // Idempotent — already owned, return current inventory
      return { success: true, newBalance: currentBalance, inventory: [...inventory] };
    }

    if (currentBalance < item.price) {
      return { success: false, error: 'INSUFFICIENT_FUNDS' };
    }

    const newBalance = currentBalance - item.price;
    const newInventory = [...inventory, cosmeticId];

    // Allow caller to persist the new inventory
    this._onPurchase(playerId, newInventory);

    return { success: true, newBalance, inventory: newInventory };
  }

  /**
   * Get player's cosmetic inventory.
   * @param {string} playerId
   * @returns {string[]}
   */
  getInventory(playerId) {
    return this._getInventory(playerId);
  }
}