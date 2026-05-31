# Tasks: M8 — Cosmetics + Monetization

## Review Workload Forecast

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend services + routes | PR 1 → feature/M8-cosmetics | CosmeticsService + cosmetics routes; includes unit tests |
| 2 | Frontend shop screen + config | PR 2 → feature/M8-cosmetics | ShopScreen + cosmetics config; includes unit tests |
| 3 | Integration (AudioEngine, Renderer, GameSave) | PR 3 → feature/M8-cosmetics | Cosmetic effect application; verify suite |

## Phase 1: Backend — CosmeticsService + Routes

- [x] 1.1 Create `src/config/cosmetics.js` with cosmetic catalog (10 items, categories: arc/spatter/machine)
- [x] 1.2 Create `server/src/services/CosmeticsService.js` with getCatalog(), purchase(), getInventory()
- [x] 1.3 Create `server/src/routes/cosmetics.js` with GET /catalog, POST /purchase, GET /inventory
- [x] 1.4 Write `tests/unit/server/services/CosmeticsService.test.js` — unit tests for service layer

## Phase 2: Frontend — ShopScreen + Config

- [x] 2.1 Create `src/ui/ShopScreen.js` with shop modal DOM, purchase flow, preview on hover
- [x] 2.2 Create `tests/unit/ui/ShopScreen.test.js` — unit tests for shop business logic
- [x] 2.3 Create `src/config/cosmetics.js` with client-side catalog constants

## Phase 3: Integration — Cosmetic Effects

- [x] 3.1 Modify `src/audio/AudioEngine.js` to apply arc colour cosmetic from inventory
- [x] 3.2 Modify `src/renderer/Renderer.js` to apply spatter/machine skin cosmetic from inventory
- [x] 3.3 Modify `src/game/GameSave.js` to persist cosmetics inventory array

## Phase 4: Verification

- [x] 4.1 Run `npx vitest run tests/unit/` — all tests pass
- [x] 4.2 Verify shop displays 10 items, purchase deducts Ȼ, owned items marked
- [x] 4.3 Verify arc colour changes in-game when cosmetic equipped