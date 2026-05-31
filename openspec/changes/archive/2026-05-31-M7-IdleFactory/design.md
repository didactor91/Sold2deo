# Design: M7 — Idle Factory Screen

## Technical Approach

A DOM-based screen (no Canvas) renders the idle factory UI. The idle simulation runs in a Web Worker at 1Hz to avoid blocking the main thread. The main thread holds canonical state; the worker posts TICK messages with state deltas. Offline earnings are computed on worker startup from the `lastTickTimestamp` delta, capped at `maxOfflineHours`.

## Architecture Decisions

### Decision: Web Worker over main-thread timer

**Choice**: Web Worker with `setInterval(1000)` for the tick loop
**Alternatives considered**: `requestAnimationFrame` on main thread, `setInterval` on main thread
**Rationale**: Workers are isolated — a crash doesn't affect game loop. 1Hz is too slow for rAF. Main-thread interval competes with physics.

### Decision: Worker posts state, main thread holds canonical state

**Choice**: Worker posts full state on each TICK; main thread `IdleEngine` receives and stores it
**Alternatives considered**: Worker holds state, main thread queries via `postMessage`
**Rationale**: Simpler — main thread always has ready state for UI renders without async query round-trips.

### Decision: Offline delta computed in worker on START

**Choice**: Worker receives `lastTickTimestamp` on START and computes offline earnings immediately
**Alternatives considered**: Compute offline delta in main thread before creating worker
**Rationale**: Keeps all earnings logic in one place (worker). Avoids duplicated calculation logic.

## Data Flow

```
[IdleFactory.js DOM screen]
        ↓ user actions (hire, upgrade, assign)
[IdleEngine.js — main thread facade]
        ↓ postMessage(START/STOP/UPDATE)
[idle-worker.js — Web Worker]
        ↓ setInterval 1Hz
        ↓ postMessage(TICK, { creditsEarned, totalCredits, timestamp })
[IdleEngine.js receives TICK, updates internal state]
        ↓ state change triggers UI re-render
[IdleFactory.js DOM screen updates]
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/config/factory.js` | Create | Bot tiers, upgrade definitions, MAX_OFFLINE_HOURS constant |
| `src/game/IdleEngine.js` | Create | Main-thread facade: creates worker, handles postMessage, exposes state |
| `src/ui/IdleFactory.js` | Create | DOM screen: bot roster, upgrade shop, contract assignment, offline earnings |
| `public/workers/idle-worker.js` | Create | Web Worker entry: 1Hz tick loop, offline calc, earnings formula |
| `tests/unit/game/IdleEngine.test.js` | Create | Unit tests for IdleEngine message handling and state |
| `tests/unit/ui/IdleFactory.test.js` | Create | Unit tests for hire logic, upgrade logic, offline display |

## Interfaces / Contracts

### Worker Message Protocol

```javascript
// Main → Worker
{ type: 'START', payload: { bots: Bot[], upgrades: Upgrade[], lastTickTimestamp: number } }
{ type: 'STOP' }
{ type: 'UPDATE', payload: { bots?: Bot[], upgrades?: Upgrade[] } }

// Worker → Main
{ type: 'TICK', payload: { creditsEarned: number, totalCredits: number, timestamp: number } }
{ type: 'OFFLINE_CALC', payload: { offlineEarnings: number, offlineSeconds: number } }
```

### Bot Object

```javascript
{
  id: string,        // unique bot id
  tier: 1 | 2 | 3 | 4 | 5,
  quality: number,   // 0-100, modified by upgrades
  assignedContractId: string | null
}
```

### IdleEngine Public API

```javascript
class IdleEngine {
  constructor({ eventBus })
  start(bots, upgrades, lastTickTimestamp)
  stop()
  getState() -> { totalCredits, creditsPerSecond, activeBots, offlineEarnings }
  hireBot(tier) -> { success: boolean, error?: string }
  assignBot(botId, contractId) -> void
  purchaseUpgrade(upgradeId) -> { success: boolean, error?: string }
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Bot tier rates, offline cap formula, worker message protocol | Vitest with `vi.stubGlobal('postMessage')` and message capture |
| Unit | IdleEngine state transitions, hire/upgrade logic | Vitest with mock worker |
| Integration | Worker ↔ Engine communication | Test message round-trip with real Worker (via Blob URL) |

## Migration / Rollback

No migration required — idle state is ephemeral (not persisted separately). Factory state is saved as part of the game save blob via `SaveManager.js`. No new DB columns.

## Open Questions

- None
