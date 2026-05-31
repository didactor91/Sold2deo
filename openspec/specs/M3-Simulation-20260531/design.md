# Design: M3-Simulation — Full Simulation Loop

## Technical Approach

Implements the fixed-timestep simulation loop (GameLoop), event-driven weld session (WeldSession), pure-function scoring (ScoringEngine), and input-to-event mapping (InputHandler). All modules communicate via a shared EventBus. Physics runs at 60Hz fixed step; rendering runs at variable rAF cadence with interpolation.

## Architecture Decisions

### Decision: Fixed60Hz Physics with Accumulator Cap

**Choice**: `FIXED_DT = 1/60`, accumulator capped at 100ms (`MAX_DT = 0.1`)
**Alternatives considered**: Variable-step physics (simpler but non-deterministic);30Hz fixed (misses fast arc events)
**Rationale**:60Hz gives16.7ms granularity — sufficient for arc validation (3-frame confirmation = 50ms). 100ms cap prevents spiral-of-death on backgrounded tabs. Interpolation smooths render between ticks without changing physics.

### Decision: EventBus as Sole Communication Layer

**Choice**: All modules emit/consume via EventBus; no direct method calls between game-loop modules
**Alternatives considered**: Direct dependency injection (tight coupling, harder to test); Redux-style global store (overkill for real-time loop)
**Rationale**: Decouples InputHandler, WeldSession, and StateManager. EventBus is already imported in `src/main.js`. Enables easy mocking in unit tests. StateManager subscribes to EventBus for immutable state updates.

### Decision: WeldSession as Event-Driven State Machine

**Choice**: WeldSession is not polled — transitions driven by ArcPhysics results and input events
**Alternatives considered**: Polling ArcPhysics every tick (wastes CPU); Co-routine based session (not native ESM)
**Rationale**: Arc validation is discrete (3 consecutive frames), so event-driven transition is clean. No polling overhead. State transitions are explicit and testable.

### Decision: ScoringEngine is Pure Function

**Choice**: `score(session, electrode) → ScoreResult` — no side effects, no Date.now(), no Math.random()
**Alternatives considered**: Method on WeldSession (couples scoring to session lifecycle); Instance with internal state (non-deterministic replay impossible)
**Rationale**: Determinism enables replay scoring, leaderboard verification (server recalculates from same log), and easy unit testing with frozen inputs. No hidden dependencies.

### Decision: InputHandler Separate from GameLoop

**Choice**: InputHandler owns mouse/keyboard, emits events to EventBus; GameLoop consumes InputState from EventBus
**Alternatives considered**: Input handling inside GameLoop tick (blocks tick on input lag); DOM event listeners directly in WeldSession (tight coupling)
**Rationale**: Separation of concerns: input is interrupt-driven, game loop is time-driven. InputHandler can be tested with mock EventBus without running the loop. Mouse buffer maintained independently of tick rate.

## Data Flow

```
InputHandler (DOM events)
    │  emits: input:mousemove, input:mousedown, input:keydown
    ▼
EventBus
    │  distributes to: GameLoop, WeldSession, StateManager
    ▼
GameLoop.tick() — called every FIXED_DT by accumulator loop
    │
    ├─→ WeldSession.update(FIXED_DT)   [session state machine]
    ├─→ ArcPhysics.validate()          [arc state from InputHandler state]
    ├─→ WeldPool.tick(FIXED_DT)        [M1 physics]
    ├─→ BeadAccumulator.tick(FIXED_DT) [M1 physics]
    │
    ▼
SceneRenderer.render(interpolation)  [M2 renderer, variable rate]
```

## Module Dependency Graph

```
GameLoop
 ├─→ PhysicsEngine (M1 existing)
 │    ├─→ ArcPhysics
 │    ├─→ WeldPool
 │    ├─→ BeadAccumulator
 │    └─→ SpatterSystem
 ├─→ SceneRenderer (M2 existing)
 ├─→ WeldSession
 │    ├─→ ArcPhysics
 │    ├─→ ScoringEngine
 │    └─→ EventBus
 ├─→ InputHandler
 │    └─→ EventBus
 └─→ StateManager
      └─→ EventBus
```

## GameLoop Tick Sequence

```js
let accumulator = 0;
let lastTime = 0;

function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, BALANCE.tick.MAX_DT);
  lastTime = timestamp;
  accumulator += dt;

  while (accumulator >= BALANCE.tick.FIXED_DT) {
    InputHandler.poll();           // flush pending input state
    WeldSession.update(FIXED_DT);  // state machine tick
    PhysicsEngine.tick(FIXED_DT); // M1 physics modules
    accumulator -= BALANCE.tick.FIXED_DT;
  }

  const interpolation = accumulator / BALANCE.tick.FIXED_DT;
  SceneRenderer.render(interpolation);
  requestAnimationFrame(loop);
}
```

## WeldSession State Transitions

```
IDLE ──mousedown──→ STRIKING
 ↑ │
  │            arc confirmed3 frames
  │                     ↓
  │                  WELDING ←──arc re-established 3 frames────┐
  │                     │ │
  │              mouseup│                              arc lost
  │                     ↓                                      │
  │                 FINISHED                                  │
  │                                                       ARC_BREAK
  │ │
  └───────────────────Escape (abort)──────────────────────────┘
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/core/EventBus.js` | Create | Singleton pub/sub, typed event map |
| `src/core/GameLoop.js` | Create | Fixed-timestep orchestrator, rAF loop |
| `src/game/WeldSession.js` | Create | State machine, session log, defect tracking |
| `src/game/ScoringEngine.js` | Create | Pure scoring function |
| `src/game/InputHandler.js` | Create | DOM→EventBus bridge, mouse buffer |
| `src/types/game.d.ts` | Create | All shared game types |
| `src/main.js` | Modify | Bootstrap GameLoop with dependencies |

## Interfaces / Contracts

```js
// EventBus
function createEventBus() {}
eventBus.emit(eventName, payload)
eventBus.on(eventName, handler) → unsubscribe
eventBus.off(eventName, handler)

// GameLoop
createGameLoop({ session, arcPhysics, pool, bead, renderer })
// → { start(), stop(), isRunning() }

// WeldSession
createWeldSession({ arcPhysics, scoringEngine, eventBus })
// → { update(dt), getData(), reset() }

// ScoringEngine
score(session: WeldSessionData, electrode: ElectrodeConfig): ScoreResult

// InputHandler
createInputHandler({ arcPhysics, weldSession, eventBus })
// → { poll(), getState() }
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | ScoringEngine determinism | Freeze `session.log` + `electrode`, assert byte-identical output across calls |
| Unit | WeldSession state transitions | Mock ArcPhysics + EventBus, drive with `update()` calls, assert state + events |
| Unit | InputHandler event emission | Mock EventBus, fire DOM events, assert correct events emitted |
| Integration | GameLoop tick sequence | Mock all deps, drive rAF manually, assert accumulator/tick counts |
| Integration | Full session lifecycle | Simulate mousedown→mouseup, assert score computed and event emitted |

## Migration / Rollout

No migration required. New modules only. GameLoop is instantiated in `src/main.js` on top of existing renderer/physics (M1/M2).

## Open Questions

- [ ] Should `StateManager` also subscribe to `session:complete` to persist score to savegame?
- [ ] Does `InputHandler.poll()` need to read from a shared `InputState` object or emit fresh events each tick?
