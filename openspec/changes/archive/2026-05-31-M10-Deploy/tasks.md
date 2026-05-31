# Tasks: M10-Deploy — Production Deployment

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 600-900 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Foundation) → PR 2 (Frontend Modules) → PR 3 (Server + CI) |
| Delivery strategy | auto-chain |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation (package.json, Dockerfile, .github) | PR 1 → main | Base infrastructure |
| 2 | Frontend modules (EventBus, StateManager, SaveManager, GameLoop, SceneRenderer, MachinePanel, HUD, Navigation) | PR 2 → main | Core wiring |
| 3 | Server (JWT auth, PostgreSQL queries, migrations) + CI/CD | PR 3 → main | Backend + CI |

## Phase 1: Foundation Infrastructure

- [x] 1.1 Create `server/package.json` with dependencies (express, pg, jose, bcrypt)
- [x] 1.2 Create `Dockerfile` for production build
- [x] 1.3 Create `.github/workflows/ci.yml` with lint + vitest + playwright jobs

## Phase 2: Frontend Core Modules

- [x] 2.1 Implement `src/core/EventBus.js` (pub/sub event system)
- [x] 2.2 Implement `src/core/StateManager.js` (centralized state with event emission)
- [x] 2.3 Implement `src/core/SaveManager.js` (localStorage persistence)
- [x] 2.4 Implement `src/core/GameLoop.js` (60fps requestAnimationFrame loop)
- [x] 2.5 Implement `src/renderer/SceneRenderer.js` (canvas rendering wrapper)
- [x] 2.6 Implement `src/ui/MachinePanel.js` (machine control UI)
- [x] 2.7 Implement `src/ui/HUD.js` (heads-up display)
- [x] 2.8 Implement `src/ui/Navigation.js` (screen navigation)
- [x] 2.9 Update `src/main.js` to wire all modules together
- [x] 2.10 Write unit tests for EventBus, StateManager, SaveManager

## Phase 3: Server Backend

- [x] 3.1 Create `server/src/db/migrations/001_initial.sql` (users + game_saves tables)
- [x] 3.2 Create `server/src/db/queries/users.js` (findUserByUsername, createUser)
- [x] 3.3 Create `server/src/db/queries/gameSaves.js` (findGameSaveByUserId, upsertGameSave)
- [x] 3.4 Implement `server/src/middleware/auth.js` (JWT verification middleware)
- [x] 3.5 Create `server/src/routes/auth.js` (login, register endpoints)
- [x] 3.6 Create `server/src/index.js` (Express app entry point)
- [ ] 3.7 Write integration tests for auth routes (deferred - no PostgreSQL in CI)

## Phase 4: Testing and Verification

- [x] 4.1 Run `npx vitest run` — all tests pass
- [x] 4.2 Run `npx playwright test` — all E2E tests pass (7 passed, 2 skipped)
- [x] 4.3 Run `npx eslint src/ server/src/` — no errors (ShopScreen pre-existing error ignored)
- [x] 4.4 Verify production build (`npm run build`)
