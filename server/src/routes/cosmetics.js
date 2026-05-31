/**
 * Cosmetics Routes — REST API for shop and inventory
 * @module server/src/routes/cosmetics
 */
import { Router } from 'express';
import { CosmeticsService } from '../services/CosmeticsService.js';
import {
  purchaseBodySchema,
  playerIdParamSchema,
} from '../validation/cosmetics-schemas.js';

// In-memory inventory store (production would use DB)
const inventoryStore = {};

export function createCosmeticsRoutes({ getBalance, setBalance }) {
  const service = new CosmeticsService({
    getInventory: (playerId) => inventoryStore[playerId] || [],
    onPurchase: (playerId, newInventory) => { inventoryStore[playerId] = newInventory; },
  });

  const router = Router();
  router
    .get('/catalog', (req, res) => res.json({ items: service.getCatalog() }))
    .get('/inventory/:playerId', handleInventoryRequest(service))
    .post('/purchase', handlePurchaseRequest(service, { getBalance, setBalance }));

  return router;
}

/** @param {CosmeticsService} service */
function handleInventoryRequest(service) {
  return (req, res) => {
    const result = playerIdParamSchema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({ error: 'INVALID_PARAMS', details: result.error.flatten() });
    }
    res.json({ inventory: service.getInventory(result.data.playerId) });
  };
}

/** @param {CosmeticsService} service @param {{getBalance?: function, setBalance?: function}} deps */
function handlePurchaseRequest(service, { getBalance, setBalance }) {
  return (req, res) => {
    const result = purchaseBodySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', details: result.error.flatten() });
    }
    const { playerId, cosmeticId } = result.data;
    const currentBalance = getBalance ? getBalance(playerId) : 0;
    const purchaseResult = service.purchase(playerId, cosmeticId, currentBalance);

    if (!purchaseResult.success) {
      return res.status(400).json({ error: purchaseResult.error });
    }
    if (setBalance) setBalance(playerId, purchaseResult.newBalance);
    res.json({ success: true, newBalance: purchaseResult.newBalance, inventory: purchaseResult.inventory });
  };
}