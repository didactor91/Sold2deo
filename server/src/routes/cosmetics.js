/**
 * Cosmetics Routes — REST API for shop and inventory
 * @module server/src/routes/cosmetics
 */
import { Router } from 'express';
import { CosmeticsService } from '../services/CosmeticsService.js';

// In-memory inventory store (production would use DB)
const inventoryStore = {};

export function createCosmeticsRoutes({ getBalance, setBalance }) {
  const service = new CosmeticsService({
    getInventory: (playerId) => inventoryStore[playerId] || [],
    onPurchase: (playerId, newInventory) => {
      inventoryStore[playerId] = newInventory;
    },
  });

  const router = Router();

  // GET /api/cosmetics/catalog — all available cosmetic items
  router.get('/catalog', (req, res) => {
    const catalog = service.getCatalog();
    res.json({ items: catalog });
  });

  // GET /api/cosmetics/inventory/:playerId — player's owned cosmetics
  router.get('/inventory/:playerId', (req, res) => {
    const { playerId } = req.params;
    const inventory = service.getInventory(playerId);
    res.json({ inventory });
  });

  // POST /api/cosmetics/purchase — buy a cosmetic
  router.post('/purchase', (req, res) => {
    const { playerId, cosmeticId } = req.body;
    if (!playerId || !cosmeticId) {
      return res.status(400).json({ error: 'MISSING_FIELDS' });
    }

    const currentBalance = getBalance ? getBalance(playerId) : 0;
    const result = service.purchase(playerId, cosmeticId, currentBalance);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    // Update balance
    if (setBalance) {
      setBalance(playerId, result.newBalance);
    }

    res.json({
      success: true,
      newBalance: result.newBalance,
      inventory: result.inventory,
    });
  });

  return router;
}