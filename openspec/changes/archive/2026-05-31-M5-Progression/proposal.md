# Proposal: M5 — Progression + Contracts

## Intent

Implement the progression system (XP, levels, unlock gating) and contract/job system for Weld Master. This delivers the core RPG loop: earn XP and credits by completing welding contracts, unlock better electrodes and machines, and progress through increasing difficulty tiers.

## Scope

### In Scope
- `ProgressionEngine.js`: XP accumulation, level calculation, unlock events for electrodes and machines
- `ContractEngine.js`: contract generation, dual-validation (client UX + server authoritative), reward distribution
- `src/config/electrodes.js`: all 6 electrode types from RFC-001 §3.3
- `src/config/machines.js`: all 5 machine tiers from RFC-001 §3.4
- `src/config/contracts.js`: contract template definitions

### Out of Scope
- Backend server validation (stubbed; server-validated in M6)
- Idle factory bots (M7)
- UI screens for progression/contracts (M4/M7)

## Capabilities

### New Capabilities
- `progression-engine`: XP curve, level calculation, electrode/machine unlock events
- `contract-engine`: contract generation, client/server dual validation, reward distribution

### Modified Capabilities
- None

## Approach

Event-driven: ProgressionEngine emits `unlock:electrode` and `unlock:machine` events. ContractEngine validates against both client (UX) and server (authoritative) rules. Config files are plain data objects with no business logic.

XP curve: `xpToNext(level) = floor(100 * pow(1.45, level-1))`

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/game/ProgressionEngine.js` | New | XP/level/unlock engine |
| `src/game/ContractEngine.js` | New | Contract generation + validation |
| `src/config/electrodes.js` | New | 6 electrode type definitions |
| `src/config/machines.js` | New | 5 machine tier definitions |
| `src/config/contracts.js` | New | Contract templates |
| `src/types/game.d.ts` | Modified | Add ProgressionState, Contract types |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| XP curve produces too-fast or too-slow progression | Medium | Calibrate pow base (1.45) against playtesting data |
| Client-side contract validation exploited | Low | Server authoritative in M6; rewards are stubs until then |

## Rollback Plan

1. Delete `src/game/ProgressionEngine.js`, `src/game/ContractEngine.js`
2. Delete `src/config/electrodes.js`, `src/config/machines.js`, `src/config/contracts.js`
3. Revert `src/types/game.d.ts` to previous state
4. Run tests: `npx vitest run tests/unit/` — all must pass

## Dependencies

- RFC-001 §3.3 (electrode roster), §3.4 (machine roster), §3.6 (contract system)
- SDD-001 §5.1–5.2 (ProgressionEngine, ContractEngine interfaces)

## Success Criteria

- [ ] `xpToNext(level)` matches formula for levels 1–10
- [ ] `grantXP(amount)` correctly levels up and emits unlock events
- [ ] Contract validation returns correct pass/fail with reason
- [ ] All 6 electrode types defined with correct stats from RFC
- [ ] All 5 machine tiers defined with correct stats from RFC
- [ ] Contract templates generate valid contracts with XP/credit rewards
- [ ] `npx vitest run tests/unit/` passes 100%
- [ ] `npx eslint` passes on new files