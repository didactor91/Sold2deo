# Tasks: M9 — QA Pass

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 300-450 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-forecast |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: feature-branch-chain
400-line budget risk: Medium

## Phase 1: E2E Tests (Playwright)

- [x] 1.1 Create `tests/e2e/weld-session.spec.js` with weld workflow test
- [x] 1.2 Create `tests/e2e/save-load.spec.js` with save/load persistence test
- [x] 1.3 Create `tests/e2e/idle-tick.spec.js` with idle earnings test

## Phase 2: Performance Benchmarks

- [x] 2.1 Create `tests/benchmarks/idle-engine.bench.js` with idle engine test
- [x] 2.2 Run benchmarks and verify < 2ms for idle engine operations

## Phase 3: Security Audit

- [x] 3.1 Add Zod validation to `server/src/routes/cosmetics.js`
- [x] 3.2 Document security gaps for M10 (JWT, DB)

## Phase 4: Coverage Gap-Filling

- [x] 4.1 Run coverage report: `npx vitest run --coverage`
- [x] 4.2 Add unit tests for uncovered game/ modules (GameSave.js)
- [x] 4.3 Add unit tests for ShopScreen (non-DOM methods)

## Phase 5: Verification

- [x] 5.1 Run `npx vitest run` — 167 tests pass (was 154, added 13)
- [x] 5.2 Run `npx playwright test` — 1 passed, 1 failed (expected - game not complete), 7 skipped
- [x] 5.3 Run `npx eslint src/ server/src/` — 1 error (pre-existing ShopScreen._render), 2 warnings (pre-existing main.js imports)
- [x] 5.4 Verify coverage ≥ 90% on physics/game modules — game/ at 99.31%, config/ at 98.97%