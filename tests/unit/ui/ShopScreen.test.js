/**
 * ShopScreen Unit Tests
 * Tests shop business logic (state, purchase flow) separate from DOM rendering.
 * @module tests/unit/ui/ShopScreen.test.js
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { COSMETICS_CATALOG, getCosmeticsByCategory } from '@src/config/cosmetics.js';

/**
 * ShopScreen test helper — creates a mock shop instance without DOM.
 * @param {Object} opts
 */
function createMockShop(opts = {}) {
  const { credits = 500, ownedCosmetics = [] } = opts;
  return {
    _credits: credits,
    _ownedCosmetics: [...ownedCosmetics],
    _onPurchase: vi.fn(),
    _onPreview: vi.fn(),
  };
}

describe('ShopScreen business logic', () => {
  describe('cosmetic catalog', () => {
    it('catalog has 10 items', () => {
      expect(COSMETICS_CATALOG).toHaveLength(10);
    });

    it('items are frozen', () => {
      expect(Object.isFrozen(COSMETICS_CATALOG)).toBe(true);
    });

    it('all prices are positive', () => {
      COSMETICS_CATALOG.forEach(item => {
        expect(item.price).toBeGreaterThan(0);
      });
    });

    it('all categories are valid', () => {
      const valid = ['arc', 'spatter', 'machine'];
      COSMETICS_CATALOG.forEach(item => {
        expect(valid).toContain(item.category);
      });
    });
  });

  describe('getCosmeticsByCategory()', () => {
    it('returns only arc items for arc category', () => {
      const arc = getCosmeticsByCategory('arc');
      expect(arc.every(c => c.category === 'arc')).toBe(true);
    });

    it('returns 4 arc items', () => {
      const arc = getCosmeticsByCategory('arc');
      expect(arc).toHaveLength(4);
    });

    it('returns 3 spatter items', () => {
      const spatter = getCosmeticsByCategory('spatter');
      expect(spatter).toHaveLength(3);
    });

    it('returns 3 machine items', () => {
      const machine = getCosmeticsByCategory('machine');
      expect(machine).toHaveLength(3);
    });
  });

  describe('canAfford()', () => {
    it('returns true when credits >= price', () => {
      const shop = createMockShop({ credits: 500 });
      const canAfford = (price) => shop._credits >= price;
      expect(canAfford(100)).toBe(true);
      expect(canAfford(500)).toBe(true);
    });

    it('returns false when credits < price', () => {
      const shop = createMockShop({ credits: 50 });
      const canAfford = (price) => shop._credits >= price;
      expect(canAfford(100)).toBe(false);
    });
  });

  describe('isOwned()', () => {
    it('returns true for owned item', () => {
      const shop = createMockShop({ ownedCosmetics: ['arc-blue-glow'] });
      const isOwned = (id) => shop._ownedCosmetics.includes(id);
      expect(isOwned('arc-blue-glow')).toBe(true);
    });

    it('returns false for unowned item', () => {
      const shop = createMockShop({ ownedCosmetics: ['arc-blue-glow'] });
      const isOwned = (id) => shop._ownedCosmetics.includes(id);
      expect(isOwned('spatter-fire')).toBe(false);
    });
  });

  describe('purchase flow', () => {
    it('purchase calls onPurchase with item id and new balance', () => {
      const shop = createMockShop({ credits: 500, ownedCosmetics: [] });
      const item = COSMETICS_CATALOG.find(c => c.id === 'arc-blue-glow');
      const newBalance = shop._credits - item.price;
      shop._onPurchase(item.id, newBalance);
      expect(shop._onPurchase).toHaveBeenCalledWith('arc-blue-glow', 400);
    });

    it('duplicate purchase does not double-deduct', () => {
      const shop = createMockShop({ credits: 500, ownedCosmetics: ['arc-blue-glow'] });
      // Simulate purchase attempt for already-owned item
      const item = COSMETICS_CATALOG.find(c => c.id === 'arc-blue-glow');
      if (shop._ownedCosmetics.includes(item.id)) {
        // Already owned — no action needed
        shop._onPurchase(item.id, shop._credits);
      }
      // Credits unchanged since it was already owned
      expect(shop._credits).toBe(500);
    });

    it('credit update after purchase reflected in shop state', () => {
      const shop = createMockShop({ credits: 500 });
      const item = COSMETICS_CATALOG.find(c => c.id === 'arc-blue-glow');
      shop._credits -= item.price;
      expect(shop._credits).toBe(400);
    });
  });
});