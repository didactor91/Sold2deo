# Proposal: M3 — Full Simulation Loop

## Intent

Integrate the completed M1 PhysicsEngine and M2 SceneRenderer into a playable simulation loop with electrode control, session state management, and deterministic scoring. Closes SDD-001 §3.

## Scope

### In Scope
- `GameLoop.js`: fixed-timestep physics (60Hz), variable render with interpolation
- `WeldSession.js`: IDLE → STRIKING → WELDING → FINISHED state machine with ARC_BREAK re-strike
- `ScoringEngine.js`: pure function scoring with all four defect types (porosity, undercut, inclusion, arc break)
- Mouse input handling: arc length via mouse Y, travel speed via X velocity, travel angle from movement vector
- Keyboard shortcuts: `C` for chip mode (slag removal), `Space` for strike attempt, `Escape` to abort

### Out of Scope
- Machine panel (M4)
- Audio engine (M4)
- Progression/contracts (M5)
- Backend save/load (M6)

## Capabilities

### New Capabilities
- `game-loop`: Fixed-timestep simulation orchestrator; owns accumulator, interpolation, and rAF loop
- `weld-session`: Single welding-pass state machine; tracks strike, weld, finish events
- `scoring-engine`: Deterministic score + defect report from session data and electrode config
- `input-handler`: Mouse/keyboard → game action mapping; electrode control semantics

### Modified Capabilities
- None — M1 and M2 modules are consumed unchanged; their specs are already finalised

## Approach

1. **GameLoop** — Implement the fixed-timestep loop from SDD-001 §3.1. Physics runs at 1/60s per tick; render uses `accumulator / FIXED_DT` for interpolation between ticks. Calls `WeldSession.update(dt)` and `SceneRenderer.render()` each frame.
2. **WeldSession** — State machine owning one pass. On mousedown: enter STRIKING. Strike succeeds when ArcPhysics reports `arcEstablished`. Transition to WELDING. On mouseup: enter FINISHED, call ScoringEngine, emit `session:complete`. ARC_BREAK from ArcPhysics returns to WELDING (re-strike).
3. **ScoringEngine** — Pure function. Inputs: session log (amperage samples, arc lengths, travel speeds, bead columns, slag segments). Weights from `balance.js`: amperage 30%, arc 25%, speed 20%, straightness 15%, slag 10%. Defect penalties applied multiplicatively.
4. **InputHandler** — Normalised mouse position → arc length validation → ArcPhysics → WeldPool heat input. Movement vector over last 10 ticks → travel angle. Keyboard events for chip mode toggle and abort.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/core/GameLoop.js` | New | rAF loop, accumulator, tick/render orchestration |
| `src/game/WeldSession.js` | New | State machine, session lifecycle, strike/weld/finish |
| `src/game/ScoringEngine.js` | New | Pure scoring function, defect detection |
| `src/core/InputHandler.js` | New | Mouse/keyboard → game action mapping |
| `src/physics/ArcPhysics.js` | Modified | Consumed by WeldSession for strike detection |
| `src/renderer/SceneRenderer.js` | Modified | Called by GameLoop with interpolation param |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Input latency causes poor strike detection | Low | Buffer last 10 mouse positions, validate arc establishment over 3 frames |
| Scoring non-deterministic across runs | Low | All randomness seeded; ScoringEngine is pure with no Date.now() |
| Physics/render coupling causes spiral of death | Low | Fixed timestep with capped accumulator prevents runaway |

## Rollback Plan

If the loop destabilises: revert `GameLoop.js` and `WeldSession.js` only. M1 and M2 modules are unchanged. Delete `InputHandler.js`. Restore renderer call to old signature.

## Dependencies

- M1 PhysicsEngine (complete, archived)
- M2 SceneRenderer (complete, in progress archive)
- `src/config/balance.js` weights and constants

## Success Criteria

- [ ] GameLoop runs at stable 60fps physics with < 2ms tick cost (benchmarked)
- [ ] WeldSession state transitions match the full state diagram (including ARC_BREAK re-strike)
- [ ] ScoringEngine produces identical results for the same session data (determinism test)
- [ ] All four defect types correctly flag and penalise
- [ ] Mouse Y controls arc length with correct short/long arc detection
- [ ] `C` key toggles chip mode; slag removal mechanic fires correctly
- [ ] `npx vitest run` passes all new and existing tests