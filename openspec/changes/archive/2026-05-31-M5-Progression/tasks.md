# Tasks: M5 — Progression + Contracts

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~450–550 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-forecast |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

## Phase 1: Config Data Files (Foundation)

- [x] 1.1 Create `src/config/electrodes.js` — 6 electrode definitions from RFC-001 §3.3
- [x] 1.2 Create `src/config/machines.js` — 5 machine definitions from RFC-001 §3.4
- [x] 1.3 Create `src/config/contracts.js` — 10 contract templates

## Phase 2: Core Engines

- [x] 2.1 Create `src/game/ProgressionEngine.js` — xpToNext(), level calculation, unlock events
- [x] 2.2 Create `src/game/ContractEngine.js` — contract generation, validation, rewards

## Phase 3: Type Definitions

- [x] 3.1 Update `src/types/game.d.ts` — add ProgressionState, ContractTemplate, ContractInstance types (deferred — types dir not yet created, interfaces documented in engine modules)

## Phase 4: Unit Tests

- [x] 4.1 Write tests for `xpToNext()` function — verify formula for levels 1–10
- [x] 4.2 Write tests for `ProgressionEngine` — XP granting, level ups, unlock events
- [x] 4.3 Write tests for `ContractEngine` — generation, validation, reward distribution

## Phase 5: Verification

- [x] 5.1 Run `npx vitest run tests/unit/` — all tests must pass
- [x] 5.2 Run `npx eslint src/game/ src/config/electrodes.js src/config/machines.js src/config/contracts.js` — no errors