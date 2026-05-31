# Proposal: M7 — Idle Factory Screen

## Intent

Add the Idle Factory dedicated screen (RFC-001 §3.7): hire bot-welders across 5 tiers, assign them to contracts, upgrade factory stations, and earn credits passively with offline earnings capped at `maxOfflineHours`.

## Scope

### In Scope
- `IdleFactory.js` — DOM screen: bot management, contract assignment, upgrade purchases, offline earnings display
- `IdleEngine.js` — Web Worker (1Hz tick): bot simulation, offline delta calculation
- `config/factory.js` — Bot tier definitions, upgrade costs, rate constants from RFC-001 §3.7 table
- `public/workers/idle-worker.js` — Worker entry point with `postMessage` protocol

### Out of Scope
- Server-side idle validation (already in M6 `IdleService.js`)
- UI theming or animations beyond basic state display
- Research tree (deferred post-M7)

## Capabilities

### New Capabilities
- `idle-factory`: Dedicated DOM screen for idle factory management — bot hiring, assignment, upgrades, offline earnings
- `idle-engine`: Web Worker-based idle simulation at 1Hz tick rate with postMessage communication
- `config-factory`: Bot tier configuration (quality/speed/cost) and factory upgrade definitions

### Modified Capabilities
- None — M7 is purely additive

## Approach

Render the idle factory as a DOM screen (not Canvas) with sections: bot roster, active contracts, upgrade shop, and offline earnings summary. The simulation runs in a Web Worker at 1Hz, posting state deltas to the main thread. Offline earnings calculated as `min(elapsed, maxOfflineHours) × rate × efficiencyFactor`, server-validated on next API save.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/ui/IdleFactory.js` | New | DOM-based idle factory screen |
| `src/game/IdleEngine.js` | New | Main-thread facade for worker communication |
| `src/config/factory.js` | New | Bot tiers + upgrade definitions |
| `public/workers/idle-worker.js` | New | Web Worker with 1Hz tick loop |
| `tests/unit/ui/IdleFactory.test.js` | New | Unit tests for screen logic |
| `tests/unit/game/IdleEngine.test.js` | New | Unit tests for engine logic |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Worker termination loses tick state | Low | Worker posts state to main thread on each tick; main thread holds canonical state |
| Offline cap too generous/strict | Medium | Tunable `maxOfflineHours` constant; server validates on save |
| DOM screen inconsistent with Canvas UI | Low | Follow existing DOM screen patterns from `MachinePanel.js` |

## Rollback Plan

1. Remove `src/ui/IdleFactory.js`, `src/game/IdleEngine.js`, `src/config/factory.js`, `public/workers/idle-worker.js`
2. Remove test files `tests/unit/ui/IdleFactory.test.js`, `tests/unit/game/IdleEngine.test.js`
3. Remove any navigation references to idle screen
4. No DB migration needed — idle state is ephemeral per RFC-001

## Dependencies

- `ProgressionEngine.js` (M5) — XP state for bot hire affordability
- `ContractEngine.js` (M5) — contract pool for bot assignment
- `IdleService.js` (M6 server) — server-validates offline earnings on save

## Success Criteria

- [ ] Bot hire UI renders all 5 tiers with quality/speed/cost display
- [ ] Bots generate credits per second based on tier × quality × assigned contract rate
- [ ] Offline earnings calculated correctly: `min(delta, maxOfflineHours) × creditsPerSecond`
- [ ] Worker ticks at 1Hz, posts `postMessage` updates to main thread
- [ ] Unit tests cover: bot tier rates, offline delta cap, worker message protocol
- [ ] ESLint passes on all new files
- [ ] Vitest unit tests pass
