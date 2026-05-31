# Tasks: M3-Simulation — Full Simulation Loop

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 550–750 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Foundation) → PR 2 (Core + Tests) |
| Delivery strategy | auto-forecast |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Types + Config + EventBus + ScoringEngine (no deps) | PR 1 | Base: main; foundation modules only |
| 2 | InputHandler + WeldSession + GameLoop + main.js wiring + all tests | PR 2 | Base: PR 1; integration layer |

## Phase 1: Foundation (Types, Config, EventBus, ScoringEngine)

- [ ] 1.1 Create `src/types/game.d.ts` — GameState, WeldSessionData, ScoreResult, DefectRecord, SessionLogEntry, InputState, ElectrodeConfig interfaces
- [ ] 1.2 Create `src/config/inputs.js` — MOUSE_SENSITIVITY_X/Y, STRIKE_FRAMES, STRIKE_TIMEOUT_FRAMES, POSITION_BUFFER_SIZE, ANGLE_LOOKBACK_TICKS, KEY_BINDINGS
- [ ] 1.3 Create `src/core/EventBus.js` — createEventBus() factory with emit/on/off methods and typed event map
- [ ] 1.4 Create `src/game/ScoringEngine.js` — pure score(session, electrode) function implementing all scoring rules from spec (amperage/arc/speed/straightness/slag + multiplicative defects + XP/credits)

## Phase 2: Core Implementation (InputHandler, WeldSession, GameLoop)

- [ ] 2.1 Create `src/game/InputHandler.js` — createInputHandler({ arcPhysics, weldSession, eventBus }); mouse buffer, travel speed/angle calc, keyboard chip/strike/abort handling
- [ ] 2.2 Create `src/game/WeldSession.js` — createWeldSession({ arcPhysics, scoringEngine, eventBus }); IDLE→STRIKING→WELDING→FINISHED state machine with arc-break re-strike, defect logging, session log, chip mode
- [ ] 2.3 Create `src/core/GameLoop.js` — createGameLoop({ session, arcPhysics, pool, bead, renderer }); rAF loop, fixed 60Hz accumulator, interpolation param, start/stop/isRunning
- [ ] 2.4 Modify `src/main.js` — instantiate GameLoop with all M1/M2 modules (PhysicsEngine, SceneRenderer, InputHandler, WeldSession); wire EventBus subscriptions

## Phase 3: Testing

- [ ] 3.1 Write `tests/unit/game/ScoringEngine.test.js` — frozen session.log inputs, assert byte-identical output, defect penalties, XP/credits calculation
- [ ] 3.2 Write `tests/unit/game/InputHandler.test.js` — mock EventBus, fire DOM events, assert arcLength/travelSpeed/travelAngle computation, chip/strike/abort key handling
- [ ] 3.3 Write `tests/unit/game/WeldSession.test.js` — mock ArcPhysics+EventBus, drive update() calls, assert all state transitions, defect logging, session:complete event
- [ ] 3.4 Write `tests/unit/core/GameLoop.test.js` — mock all deps, drive rAF manually, assert accumulator/tick counts, interpolation param, spiral-of-death cap

## Phase 4: Integration Verification

- [ ] 4.1 Run `npx vitest run` — all M3 tests pass
- [ ] 4.2 Run `npx eslint src/core/ src/game/` — zero errors
- [ ] 4.3 Verify full session lifecycle (mousedown→mouseup) produces score in console
