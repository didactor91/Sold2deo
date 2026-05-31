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

- [ ] 1.1 Create `src/config/factory.js` with bot tier definitions (5 tiers from RFC-001 §3.7)
- [ ] 1.2 Create `src/config/factory.js` with factory upgrade definitions (ventilation, second_shift, qc_station)
- [ ] 1.3 Export `MAX_OFFLINE_HOURS = 8` constant
- [ ] 1.4 Write unit tests for bot tier rate calculations in `tests/unit/config/factory.test.js`
- [ ] 1.5 Write unit tests for offline cap constant

## Phase 2: Web Worker (idle-worker.js)

- [ ] 2.1 Create `public/workers/idle-worker.js` with START/UPDATE/STOP message handlers
- [ ] 2.2 Implement 1Hz tick loop using `setInterval(1000)`
- [ ] 2.3 Implement offline delta calculation: `min(now - lastTickTimestamp, maxOfflineHours * 3600)`
- [ ] 2.4 Implement earnings formula: `botQuality × botSpeed × (contractReward / contractDuration)`
- [ ] 2.5 Implement TICK and OFFLINE_CALC postMessage payloads
- [ ] 2.6 Write unit tests for worker message protocol and offline cap

## Phase 3: IdleEngine Facade (src/game/IdleEngine.js)

- [ ] 3.1 Create `IdleEngine` class with constructor accepting `{ eventBus }`
- [ ] 3.2 Implement `start(bots, upgrades, lastTickTimestamp)` — creates worker, sends START
- [ ] 3.3 Implement `stop()` — sends STOP to worker
- [ ] 3.4 Implement `getState()` — returns `{ totalCredits, creditsPerSecond, activeBots, offlineEarnings }`
- [ ] 3.5 Implement `hireBot(tier)` — adds bot, sends UPDATE to worker
- [ ] 3.6 Implement `assignBot(botId, contractId)` — updates assignment, sends UPDATE
- [ ] 3.7 Implement `purchaseUpgrade(upgradeId)` — adds upgrade, sends UPDATE
- [ ] 3.8 Wire TICK messages to update internal state and emit events
- [ ] 3.9 Write unit tests for all public methods with mock worker

## Phase 4: IdleFactory DOM Screen (src/ui/IdleFactory.js)

- [ ] 4.1 Create `IdleFactory` class with render method producing DOM elements
- [ ] 4.2 Render bot roster: 5 tier cards with name, quality, speed, cost, hire button
- [ ] 4.3 Render active bot list: assigned bots with contract info
- [ ] 4.4 Render upgrade shop: ventilation, second_shift, qc_station cards
- [ ] 4.5 Render offline earnings display: delta, capped amount, real amount
- [ ] 4.6 Wire hire button to `idleEngine.hireBot()`
- [ ] 4.7 Wire upgrade purchase to `idleEngine.purchaseUpgrade()`
- [ ] 4.8 Wire bot assignment dropdown to `idleEngine.assignBot()`
- [ ] 4.9 Listen to `idle:creditsUpdated` events to re-render credits display
- [ ] 4.10 Write unit tests for hire/upgrade/assignment logic with mock engine

## Phase 5: Verification

- [ ] 5.1 Run `npx vitest run tests/unit/` — all tests must pass
- [ ] 5.2 Run `npx eslint src/ui/IdleFactory.js src/game/IdleEngine.js src/config/factory.js public/workers/idle-worker.js` — no errors
- [ ] 5.3 Verify OfflineService.test.js in server still passes (no regression)
