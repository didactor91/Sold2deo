# GameLoop Specification

## Purpose

Fixed-timestep simulation orchestrator. Owns the rAF loop, accumulator, tick/render separation, and interpolation parameter.

## Constants

```js
const FIXED_DT = 1 / 60; // 60Hz physics
const MAX_ACCUMULATOR = 0.1; // 100ms cap prevents spiral of death
```

## Requirements

### Requirement: Fixed Timestep Physics

The system SHALL run physics updates at exactly 1/60s per tick, decoupled from render frame rate.

### Requirement: Accumulator Capping

The system MUST cap the accumulator at 100ms. If `dt > 0.1s`, the excess is discarded. This prevents the spiral of death on slow frames.

### Requirement: Interpolation Parameter

The system MUST pass `interpolation = accumulator / FIXED_DT` to the renderer on every frame. Values range from 0 (just ticked) to ~1 (about to tick).

### Requirement: Start/Stop Control

The system SHALL expose `start()` and `stop()` methods. `start()` begins the rAF loop; `stop()` cancels it and resets accumulator.

### Requirement: Tick Order

Each physics tick MUST call in order: `WeldSession.update(FIXED_DT)`, then `ArcPhysics.validate()`, then `WeldPool.tick(FIXED_DT)`, then `BeadAccumulator.tick(FIXED_DT)`.

### Requirement: No Side Effects in Tick

The tick function SHALL NOT emit events, write to DOM, or perform I/O. These belong in the render phase or via EventBus.

---

## Scenarios

#### Scenario: Stable 60fps render

- GIVEN GameLoop is started with a stable 60fps rAF cadence
- WHEN rAF fires with `timestamp` advancing by ~16.67ms
- THEN `dt = 16.67/1000 = 0.0167`, accumulator becomes 0.0167, one tick fires, accumulator returns to 0
- AND interpolation = 0

#### Scenario: Fast render (120fps)

- GIVEN GameLoop is started at 120fps
- WHEN rAF fires twice before a tick is needed
- THEN accumulator grows to ~0.0333, two ticks fire sequentially, accumulator returns to ~0.0167
- AND interpolation ≈ 1.0 (about to tick again)

#### Scenario: Spiral of death prevention

- GIVEN GameLoop is started but the tab is backgrounded for 5 seconds
- WHEN rAF fires with `timestamp - lastTime = 5000ms`
- THEN dt is capped at 100ms, accumulator becomes 100ms, 6 ticks fire (not 300)
- AND accumulator = ~0 after ticks, loop continues normally

#### Scenario: Stop resets accumulator

- GIVEN GameLoop is running with accumulator > 0
- WHEN `stop()` is called
- THEN accumulator is reset to 0 AND rAF is cancelled
- AND calling `start()` begins fresh

---

## Public API

```js
/**
 * @typedef {Object} GameLoop
 * @property {() => void} start
 * @property {() => void} stop
 * @property {() => boolean} isRunning
 */

/**
 * @param {Object} deps
 * @param {import('../game/WeldSession.js').WeldSession} deps.session
 * @param {import('../physics/ArcPhysics.js').ArcPhysics} deps.arcPhysics
 * @param {import('../physics/WeldPool.js').WeldPool} deps.pool
 * @param {import('../physics/BeadAccumulator.js').BeadAccumulator} deps.bead
 * @param {import('../renderer/SceneRenderer.js').SceneRenderer} deps.renderer
 * @returns {GameLoop}
 */
function createGameLoop({ session, arcPhysics, pool, bead, renderer }) {}
```
