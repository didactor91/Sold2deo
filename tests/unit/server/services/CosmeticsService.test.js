/**
 * CosmeticsService Unit Tests
 * Tests catalog, purchase logic, and inventory management.
 * @module tests/unit/server/services/CosmeticsService.test.js
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CosmeticsService } from '@server/services/CosmeticsService.js';
import { COSMETICS_CATALOG } from '../../../../src/config/cosmetics.js';

describe('CosmeticsService', () => {
  let service;
  // In-memory player store for tests
  let playerInventory;

  beforeEach(() => {
    playerInventory = {};
    const getInventory = (id) => playerInventory[id] || [];
    const onPurchase = (playerId, newInventory) => {
      playerInventory[playerId] = newInventory;
    };
    service = new CosmeticsService({ getInventory, onPurchase });
  });

  describe('getCatalog()', () => {
    it('returns all 10 cosmetic items', () => {
      const catalog = service.getCatalog();
      expect(catalog).toHaveLength(10);
    });

    it('each item has id, name, category, price, effectId, description', () => {
      const catalog = service.getCatalog();
      const item = catalog[0];
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('category');
      expect(item).toHaveProperty('price');
      expect(item).toHaveProperty('effectId');
      expect(item).toHaveProperty('description');
    });

    it('categories include arc, spatter, and machine', () => {
      const catalog = service.getCatalog();
      const categories = catalog.map(c => c.category);
      expect(categories).toContain('arc');
      expect(categories).toContain('spatter');
      expect(categories).toContain('machine');
    });

    it('arc items have effectId referencing colour values', () => {
      const catalog = service.getCatalog();
      const arcItems = catalog.filter(c => c.category === 'arc');
      arcItems.forEach(item => {
        expect(item.effectId).toMatch(/blue-glow|red-arc|green-arc|purple-arc/);
      });
    });
  });

  describe('purchase()', () => {
    it('deducts correct price from balance', () => {
      const result = service.purchase('player1', 'arc-blue-glow', 500);
      expect(result.success).toBe(true);
      expect(result.newBalance).toBe(400);
    });

    it('adds item to player inventory', () => {
      const result = service.purchase('player1', 'arc-blue-glow', 500);
      expect(result.inventory).toContain('arc-blue-glow');
    });

    it('returns updated inventory array', () => {
      const result = service.purchase('player1', 'arc-blue-glow', 500);
      expect(Array.isArray(result.inventory)).toBe(true);
    });

    it('fails with INSUFFICIENT_FUNDS when balance too low', () => {
      const result = service.purchase('player1', 'arc-blue-glow', 50);
      expect(result.success).toBe(false);
      expect(result.error).toBe('INSUFFICIENT_FUNDS');
    });

    it('fails with ITEM_NOT_FOUND for invalid cosmetic id', () => {
      const result = service.purchase('player1', 'invalid-item-id', 500);
      expect(result.success).toBe(false);
      expect(result.error).toBe('ITEM_NOT_FOUND');
    });

    it('idempotent: returns success for already-owned item without double-charge', () => {
      // First purchase
      service.purchase('player1', 'arc-blue-glow', 500);
      // Second purchase of same item
      const result = service.purchase('player1', 'arc-blue-glow', 400);
      expect(result.success).toBe(true);
      expect(result.inventory).toContain('arc-blue-glow');
    });

    it('multiple items can be purchased and inventory accumulates', () => {
      service.purchase('player1', 'arc-blue-glow', 500);
      const result = service.purchase('player1', 'spatter-fire', 400);
      expect(result.inventory).toContain('arc-blue-glow');
      expect(result.inventory).toContain('spatter-fire');
    });
  });

  describe('getInventory()', () => {
    it('returns array of owned cosmetic IDs', () => {
      service.purchase('player1', 'arc-blue-glow', 500);
      const inv = service.getInventory('player1');
      expect(inv).toContain('arc-blue-glow');
    });

    it('returns empty array for player with no cosmetics', () => {
      const inv = service.getInventory('player2');
      expect(inv).toEqual([]);
    });
  });
});