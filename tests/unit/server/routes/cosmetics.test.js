/**
 * Cosmetics Routes Unit Tests
 * @module tests/unit/server/routes/cosmetics.test.js
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createCosmeticsRoutes } from '../../../../server/src/routes/cosmetics.js';

describe('Cosmetics Routes', () => {
  /** @type {Object} */
  let mockDeps;
  /** @type {Object} */
  let router;

  beforeEach(() => {
    const inventoryStore = {};
    mockDeps = {
      getBalance: vi.fn(() => 500),
      setBalance: vi.fn(),
    };
    router = createCosmeticsRoutes(mockDeps);
  });

  describe('GET /catalog', () => {
    it('returns cosmetics catalog', async () => {
      const req = { method: 'GET', url: '/catalog' };
      const res = {
        json: vi.fn(),
      };
      // Match the route
      const handler = router.stack.find(r => r.route?.path === '/catalog')?.route?.stack[0]?.handle;
      await handler(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ items: expect.any(Array) })
      );
    });
  });

  describe('POST /purchase validation', () => {
    it('rejects request without playerId', async () => {
      const req = {
        method: 'POST',
        body: { cosmeticId: 'arc-blue-glow' },
      };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      const handler = router.stack.find(r => r.route?.path === '/purchase')?.route?.stack[0]?.handle;
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'VALIDATION_ERROR' })
      );
    });

    it('rejects request without cosmeticId', async () => {
      const req = {
        method: 'POST',
        body: { playerId: 'player-1' },
      };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      const handler = router.stack.find(r => r.route?.path === '/purchase')?.route?.stack[0]?.handle;
      await handler(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('accepts valid purchase request', async () => {
      const req = {
        method: 'POST',
        body: { playerId: 'player-1', cosmeticId: 'arc-blue-glow' },
      };
      const res = {
        status: vi.fn(() => res),
        json: vi.fn(),
      };

      const handler = router.stack.find(r => r.route?.path === '/purchase')?.route?.stack[0]?.handle;
      await handler(req, res);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          newBalance: expect.any(Number),
          inventory: expect.any(Array),
        })
      );
    });
  });
});
