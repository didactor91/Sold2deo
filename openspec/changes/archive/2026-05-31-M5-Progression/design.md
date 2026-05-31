# Design: M5 — Progression + Contracts

## Technical Approach

Event-driven progression with pure functions. ProgressionEngine manages XP/level state and emits unlock events. ContractEngine generates contracts from templates and validates them client-side (UX) with server-authoritative rewards deferred to M6.

## Architecture Decisions

### Decision: XP curve as pure function

**Choice**: `xpToNext(level) = Math.floor(100 * pow(1.45, level-1))` implemented as a pure static function with no side effects.
**Alternatives considered**: Lookup table (hard to tune), exponential with different base.
**Rationale**: Pure function is trivially testable. 1.45 base calibrated against playtesting targets.

### Decision: Unlock events as EventBus emissions

**Choice**: ProgressionEngine emits `unlock:electrode` and `unlock:machine` events via EventBus rather than callback injection.
**Alternatives considered**: Callback functions, direct mutation of game state.
**Rationale**: Decoupled — the engine doesn't need to know who consumes unlock notifications. UI layer subscribes independently.

### Decision: Config files as plain data objects

**Choice**: `src/config/electrodes.js`, `machines.js`, `contracts.js` export plain objects/arrays only. No business logic.
**Alternatives considered**: Classes with methods, dynamic generation.
**Rationale**: Config is data, not logic. Easy to review, audit, and modify without touching engine code.

### Decision: Dual-validation contract model

**Choice**: Client validates for immediate UX feedback; server is authoritative (stubbed in M5, implemented in M6).
**Alternatives considered**: Client-only validation, server-only with no feedback.
**Rationale**: UX requires instant feedback. Security requires server validation. The architecture supports both without conflict.

## Data Flow

```
WeldSession.complete(sessionResult)
    → ContractEngine.validateContract(contract, sessionResult)
    → (client result for UX, server result authoritative)
    → ProgressionEngine.grantXP(xpEarned)
    → ProgressionEngine.checkUnlocks()
    → EventBus.emit('unlock:electrode', { code })
    → UI subscribes, shows unlock notification
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/config/electrodes.js` | Create | 6 electrode definitions from RFC-001 §3.3 |
| `src/config/machines.js` | Create | 5 machine definitions from RFC-001 §3.4 |
| `src/config/contracts.js` | Create | 10 contract templates |
| `src/game/ProgressionEngine.js` | Create | XP/level management, unlock logic, event emission |
| `src/game/ContractEngine.js` | Create | Contract generation, validation, reward distribution |
| `src/types/game.d.ts` | Modify | Add ProgressionState, ContractInstance, ContractTemplate types |

## Interfaces / Contracts

### ProgressionEngine

```js
// Pure function
export function xpToNext(level) {}

// Constructor
export class ProgressionEngine {
  constructor({ electrodes, machines, eventBus })
  getState() → ProgressionState
  grantXP(amount) → { xp, level, newUnlocks }
  isElectrodeUnlocked(code) → boolean
  isMachineUnlocked(id) → boolean
}
```

### ContractEngine

```js
export class ContractEngine {
  constructor({ electrodes, contracts, progressionEngine })
  generateContract(templateId) → ContractInstance
  validateContract(contract, sessionResult) → ValidationResult
  distributeRewards(contract, validationResult) → RewardResult
  getAvailableContracts() → ContractInstance[]
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | xpToNext, level calculation, unlock logic | Direct function calls, assert outputs |
| Unit | contract generation, validation, reward calc | Mock electrodes/contracts data |
| Integration | Full contract completion flow | Test with real ProgressionEngine + mocked EventBus |

## Migration / Rollout

No migration required. Greenfield implementation. Test coverage must exceed 90% before merge.

## Open Questions

- None.