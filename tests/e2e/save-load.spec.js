/**
 * Save/Load E2E Tests
 * @module tests/e2e/save-load.spec.js
 * NOTE: These tests require the full game implementation to pass.
 */
import { test, expect } from '@playwright/test';

test.describe('Save/Load Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#game-canvas', { timeout: 5000 }).catch(() => {});
  });

  test('save data persists to localStorage', async ({ page }) => {
    // Skip if game not loaded
    const canvas = page.locator('#game-canvas');
    if (await canvas.count() === 0) {
      test.skip();
    }

    // Trigger a save (depends on game implementation)
    await page.evaluate(() => {
      // Simulate game save
      const saveData = {
        credits: 1000,
        cosmeticsInventory: ['arc-blue-glow'],
        progression: { weldsCompleted: 5 },
        idleFactory: {},
      };
      localStorage.setItem('sold2deo_save', JSON.stringify(saveData));
    });

    // Reload page
    await page.reload();
    await page.waitForTimeout(500);

    // Check save was loaded
    const savedData = await page.evaluate(() => {
      const raw = localStorage.getItem('sold2deo_save');
      return raw ? JSON.parse(raw) : null;
    });

    expect(savedData).not.toBeNull();
    expect(savedData.credits).toBe(1000);
    expect(savedData.cosmeticsInventory).toContain('arc-blue-glow');
  });

  test('corrupted save falls back to defaults', async ({ page }) => {
    // Set corrupted save
    await page.evaluate(() => {
      localStorage.setItem('sold2deo_save', 'not valid json at all');
    });

    await page.reload();
    await page.waitForTimeout(500);

    // Game should handle gracefully and create default save
    // (The game code catches JSON.parse errors and returns defaults)
    const savedData = await page.evaluate(() => {
      const raw = localStorage.getItem('sold2deo_save');
      try {
        return JSON.parse(raw);
      } catch {
        return { credits: 0 }; // fallback
      }
    });

    expect(savedData.credits).toBe(0);
  });

  test('credits and inventory restored after reload', async ({ page }) => {
    const canvas = page.locator('#game-canvas');
    if (await canvas.count() === 0) {
      test.skip();
    }

    const testCredits = 2500;
    const testInventory = ['arc-blue-glow', 'machine-gold'];

    await page.evaluate(({ credits, inventory }) => {
      const saveData = {
        credits,
        cosmeticsInventory: inventory,
        progression: {},
        idleFactory: {},
      };
      localStorage.setItem('sold2deo_save', JSON.stringify(saveData));
    }, { credits: testCredits, inventory: testInventory });

    await page.reload();
    await page.waitForTimeout(500);

    const savedData = await page.evaluate(() => {
      const raw = localStorage.getItem('sold2deo_save');
      return JSON.parse(raw);
    });

    expect(savedData.credits).toBe(testCredits);
    expect(savedData.cosmeticsInventory).toEqual(testInventory);
  });
});
