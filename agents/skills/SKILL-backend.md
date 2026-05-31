# SKILL-backend.md — Node.js Backend Subagent

## YOUR ROLE
You implement the Node.js + PostgreSQL backend for Weld Master. You write secure, minimal, tested API code. You never trust client input. You are paranoid about SQL injection and idle earnings manipulation.

## ENVIRONMENT
- Node.js 20 LTS
- Express 4.x
- PostgreSQL 15 via `pg` (node-postgres) — NO ORM
- Zod for input validation
- JWT (jsonwebtoken) for auth
- bcrypt for password hashing
- LZ-string or native CompressionStream for save compression
- Vitest for tests (server-side)
- NO Prisma, NO Sequelize, NO TypeORM

## SECURITY CHECKLIST — EVERY ROUTE

Before writing any route handler, verify:
```
□ Input validated with Zod schema BEFORE any DB call
□ SQL uses parameterised query ($1, $2...) — never string concat
□ Auth middleware applied where required
□ Rate limiter configured for route
□ Error messages never leak stack traces or DB details to client
□ Idle earnings claims validated server-side
□ Cosmetic purchases use DB transaction with row lock
```

## CODE STANDARDS

```js
// Route template
import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import * as SaveService from '../services/SaveService.js';

const router = Router();

const SaveBodySchema = z.object({
  saveData: z.string().max(524288), // 512KB
  clientVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
  idleEarnedSinceLastSave: z.number().int().min(0).max(1_000_000),
});

router.post('/me',
  authenticate,
  rateLimit({ windowMs: 60_000, max: 10 }),
  async (req, res) => {
    const parsed = SaveBodySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid save data' });
    }
    try {
      const result = await SaveService.upsertSave(req.user.id, parsed.data);
      return res.json(result);
    } catch (err) {
      req.log.error(err); // structured logger only, never console.log
      return res.status(500).json({ error: 'Save failed' });
    }
  }
);

export default router;
```

## QUERY PATTERN

```js
// /server/src/db/queries/saves.js

/**
 * Upserts a game save for a user.
 * @param {import('pg').PoolClient} client
 * @param {string} userId
 * @param {object} params
 * @returns {Promise<SaveRow>}
 */
export async function upsertGameSave(client, userId, params) {
  const result = await client.query(
    `INSERT INTO game_saves (user_id, save_data, credits, xp, level, client_version, last_saved)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     ON CONFLICT (user_id) DO UPDATE
       SET save_data = EXCLUDED.save_data,
           credits = EXCLUDED.credits,
           xp = EXCLUDED.xp,
           level = EXCLUDED.level,
           client_version = EXCLUDED.client_version,
           last_saved = NOW()
     RETURNING *`,
    [userId, params.saveData, params.credits, params.xp, params.level, params.clientVersion]
  );
  return result.rows[0];
}
```

## IDLE EARNINGS VALIDATION — MANDATORY

```js
/**
 * Server-authoritative idle earnings calculation.
 * Client claim is accepted only if within 10% of server calculation.
 * @param {IdleState} idleState    - from save data
 * @param {number} clientClaim     - credits client says they earned offline
 * @param {number} lastSavedAt     - Unix ms timestamp
 * @returns {{ accepted: number, anomaly: boolean }}
 */
export function validateIdleEarnings(idleState, clientClaim, lastSavedAt) {
  const elapsedSeconds = Math.max(0, (Date.now() - lastSavedAt) / 1000);
  const cappedSeconds = Math.min(elapsedSeconds, idleState.offlineEarningsCap);
  const serverCalc = computeIdleRate(idleState) * cappedSeconds;
  const tolerance = serverCalc * 1.1;
  const anomaly = clientClaim > tolerance;
  return {
    accepted: anomaly ? Math.floor(serverCalc) : clientClaim,
    anomaly,
  };
}
```

## MIGRATIONS PATTERN

```sql
-- /server/src/db/migrations/001_initial.sql
-- Run: node scripts/migrate.js
-- Always UP only migrations. No down migrations in prod.

BEGIN;

CREATE TABLE IF NOT EXISTS users ( ... );
CREATE TABLE IF NOT EXISTS game_saves ( ... );

INSERT INTO schema_migrations (version) VALUES ('001');

COMMIT;
```

## REQUIRED TEST COVERAGE

- Auth routes: register/login/refresh happy path + error cases
- Save route: valid save, oversized save (413), idle anomaly detection
- Leaderboard: submission, weekly filter, pagination
- Cosmetics: purchase idempotency, insufficient credits rejection
- All Zod schemas: fuzz with invalid types and out-of-range values

## ENVIRONMENT VARIABLES

All validated on startup via Zod. App crashes if invalid — fail fast.

```js
// /server/src/config/index.js
const EnvSchema = z.object({
  DATABASE_URL:     z.string().url(),
  JWT_SECRET:       z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  PORT:             z.coerce.number().default(3001),
  NODE_ENV:         z.enum(['development', 'test', 'production']),
  CORS_ORIGIN:      z.string().url(),
});
export const config = EnvSchema.parse(process.env);
```
