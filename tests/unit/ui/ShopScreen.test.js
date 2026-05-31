/**
 * ShopScreen Unit Tests
 * @module tests/unit/ui/ShopScreen.test.js
 *
 * Note: Full DOM rendering tests require jsdom environment.
 * These tests focus on non-DOM methods and basic state management.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShopScreen } from '../../../src/ui/ShopScreen.js';

describe('ShopScreen', () => {
  let shop;
  let mockEventBus;
  let mockGetCredits;
  let mockSetCredits;
  let mockGetInventory;
  let mockPurchaseCosmetic;
  let mockOnEquipCosmetic;
  let mockOnError;

  beforeEach(() => {
    mockEventBus = { emit: vi.fn() };
    mockGetCredits = vi.fn(() => 500);
    mockSetCredits = vi.fn();
    mockGetInventory = vi.fn(() => []);
    mockPurchaseCosmetic = vi.fn(async () => ({ success: true, newBalance: 400 }));
    mockOnEquipCosmetic = vi.fn();
    mockOnError = vi.fn();

    shop = new ShopScreen({
      eventBus: mockEventBus,
      getCredits: mockGetCredits,
      setCredits: mockSetCredits,
      getInventory: mockGetInventory,
      purchaseCosmetic: mockPurchaseCosmetic,
      onEquipCosmetic: mockOnEquipCosmetic,
      onError: mockOnError,
    });
  });

  describe('constructor', () => {
    it('initializes with default options', () => {
      const shopWithDefaults = new ShopScreen();
      expect(shopWithDefaults.isOpen()).toBe(false);
    });

    it('stores provided callbacks', () => {
      expect(shop._getCredits).toBe(mockGetCredits);
      expect(shop._setCredits).toBe(mockSetCredits);
      expect(shop._getInventory).toBe(mockGetInventory);
      expect(shop._purchaseCosmetic).toBe(mockPurchaseCosmetic);
      expect(shop._onEquipCosmetic).toBe(mockOnEquipCosmetic);
      expect(shop._onError).toBe(mockOnError);
    });

    it('initializes isOpen to false', () => {
      expect(shop._isOpen).toBe(false);
    });

    it('initializes previewId to null', () => {
      expect(shop._previewId).toBeNull();
    });
  });

  describe('isOpen', () => {
    it('returns false initially', () => {
      expect(shop.isOpen()).toBe(false);
    });
  });

  describe('_getPreviewColor', () => {
    it('returns correct color for blue-glow', () => {
      const color = shop._getPreviewColor('arc', 'blue-glow');
      expect(color).toBe('#0077ff');
    });

    it('returns correct color for red-arc', () => {
      const color = shop._getPreviewColor('arc', 'red-arc');
      expect(color).toBe('#ff3333');
    });

    it('returns correct color for green-arc', () => {
      const color = shop._getPreviewColor('arc', 'green-arc');
      expect(color).toBe('#33cc33');
    });

    it('returns correct color for purple-arc', () => {
      const color = shop._getPreviewColor('arc', 'purple-arc');
      expect(color).toBe('#9933ff');
    });

    it('returns correct color for fire-spatter', () => {
      const color = shop._getPreviewColor('spatter', 'fire-spatter');
      expect(color).toBe('#ff6600');
    });

    it('returns correct color for snow-spatter', () => {
      const color = shop._getPreviewColor('spatter', 'snow-spatter');
      expect(color).toBe('#e6f2ff');
    });

    it('returns correct color for toxic-spatter', () => {
      const color = shop._getPreviewColor('spatter', 'toxic-spatter');
      expect(color).toBe('#33cc33');
    });

    it('returns correct color for chrome', () => {
      const color = shop._getPreviewColor('machine', 'chrome');
      expect(color).toBe('#d9d9d9');
    });

    it('returns correct color for rust', () => {
      const color = shop._getPreviewColor('machine', 'rust');
      expect(color).toBe('#cc6633');
    });

    it('returns correct color for gold', () => {
      const color = shop._getPreviewColor('machine', 'gold');
      expect(color).toBe('#ffd700');
    });

    it('returns grey for unknown effectId', () => {
      const color = shop._getPreviewColor('arc', 'unknown-effect');
      expect(color).toBe('#888');
    });
  });

  describe('_startPreview', () => {
    it('sets previewId and calls onEquipCosmetic', () => {
      shop._startPreview('blue-glow');
      expect(shop._previewId).toBe('blue-glow');
      expect(mockOnEquipCosmetic).toHaveBeenCalledWith('blue-glow');
    });
  });

  describe('_endPreview', () => {
    it('clears previewId', () => {
      shop._previewId = 'blue-glow';
      shop._endPreview();
      expect(shop._previewId).toBeNull();
    });
  });
});
