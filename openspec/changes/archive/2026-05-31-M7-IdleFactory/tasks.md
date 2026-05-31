# Tasks: M7 — Idle Factory Screen

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~700-850 (4 new source files + 2 test files) |
| 400-line budget risk | High |
| Chained PRs recommended | No |
| Suggested split | Single PR — greenfield feature, clearly delineated files |
| Delivery strategy | auto-forecast |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: feature-branch-chain
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Full idle factory feature | PR 1 (feature/M7-idle-factory → main) | All 4 source files + 2 test files, committed together |

## Phase 1: Infrastructure (config/factory.js)

- [x] 1.1 Create `src/config/factory.js` with bot tier definitions (5 tiers from RFC-001 §3.7)
- [x] 1.2 Create `src/config/factory.js` with factory upgrade definitions (ventilation, second_shift, qc_station)
- [x] 1.3 Export `MAX_OFFLINE_HOURS = 8` constant
- [x] 1.4 Write unit tests for bot tier rate calculations in `tests/unit/config/factory.test.js`
- [x] 1.5 Write unit tests for offline cap constant

## Phase 2: Web Worker (idle-worker.js)

- [x] 2.1 Create `public/workers/idle-worker.js` with START/UPDATE/STOP message handlers
- [x] 2.2 Implement 1Hz tick loop using `setInterval(1000)`
- [x] 2.3 Implement offline delta calculation: `min(now - lastTickTimestamp, maxOfflineHours * 3600)`
- [x] 2.4 Implement earnings formula: `botQuality × botSpeed × (contractReward / contractDuration)`
- [x] 2.5 Implement TICK and OFFLINE_CALC postMessage payloads
- [x] 2.6 Write unit tests for worker message protocol and offline cap

## Phase 3: IdleEngine Facade (src/game/IdleEngine.js)

- [x] 3.1 Create `IdleEngine` class with constructor accepting `{ eventBus }`
- [x] 3.2 Implement `start(bots, upgrades, lastTickTimestamp)` — creates worker, sends START
- [x] 3.3 Implement `stop()` — sends STOP to worker
- [x] 3.4 Implement `getState()` — returns `{ totalCredits, creditsPerSecond, activeBots, offlineEarnings }`
- [x] 3.5 Implement `hireBot(tier)` — adds bot, sends UPDATE to worker
- [x] 3.6 Implement `assignBot(botId, contractId)` — updates assignment, sends UPDATE
- [x] 3.7 Implement `purchaseUpgrade(upgradeId)` — adds upgrade, sends UPDATE
- [x] 3.8 Wire TICK messages to update internal state and emit events
- [x] 3.9 Write unit tests for all public methods with mock worker

## Phase 4: IdleFactory DOM Screen (src/ui/IdleFactory.js)

- [x] 4.1 Create `IdleFactory` class with render method producing DOM elements
- [x] 4.2 Render bot roster: 5 tier cards with name, quality, speed, cost, hire button
- [x] 4.3 Render active bot list: assigned bots with contract info
- [x] 4.4 Render upgrade shop: ventilation, second_shift, qc_station cards
- [x] 4.5 Render offline earnings display: delta, capped amount, real amount
- [x] 4.6 Wire hire button to `idleEngine.hireBot()`
- [x] 4.7 Wire upgrade purchase to `idleEngine.purchaseUpgrade()`
- [x] 4.8 Wire bot assignment dropdown to `idleEngine.assignBot()`
- [x] 4.9 Listen to `idle:creditsUpdated` events to re-render credits display
- [x] 4.10 Write unit tests for hire/upgrade/assignment logic with mock engine

## Phase 5: Verification

- [x] 5.1 Run `npx vitest run tests/unit/` — all 126 tests pass
- [x] 5.2 Run ESLint — no errors on new files
- [x] 5.3 Server IdleService tests — N/A (not present in this branch)
