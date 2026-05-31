/**
 * Zod Schemas for Cosmetics API Validation
 * @module server/src/validation/cosmetics-schemas
 */
import { z } from 'zod';

/** Schema for purchase request body */
export const purchaseBodySchema = z.object({
  playerId: z.string().min(1, 'playerId is required'),
  cosmeticId: z.string().min(1, 'cosmeticId is required'),
});

/** Schema for playerId route param */
export const playerIdParamSchema = z.object({
  playerId: z.string().min(1, 'playerId is required'),
});

/** Schema for catalog query (no params needed) */
export const catalogQuerySchema = z.object({}).optional();
