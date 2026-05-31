# SceneRenderer Specification

## Purpose

Master canvas compositor. Orchestrates all sub-renderers in correct layer order each animation frame.

## Requirements

### Requirement: Layer Order Enforcement

The system SHALL call each sub-renderer in the defined layer order: Background → Workpiece → HAZ → Bead → Slag → Particles → Arc → Electrode → UI.

#### Scenario: All layers rendered in sequence

- GIVEN a `GameState` with all sub-systems populated
- WHEN `SceneRenderer.render(ctx, state, interpolation)` is called
- THEN sub-renderers are invoked in layer order 0–8
- AND each layer uses `ctx.save()`/`ctx.restore()` around its draw calls

### Requirement: Interpolation Support

The system SHALL accept an `interpolation` parameter (0–1) representing render time between physics ticks.

#### Scenario: Interpolation passed to sub-renderers

- GIVEN `interpolation = 0.5`
- WHEN `render()` is called
- THEN the value is passed to all sub-renderers that support it

### Requirement: FPS Guard for Arc Glow

The system SHALL use a solid-ring fallback for arc glow when fps falls below 55.

#### Scenario: FPS below threshold triggers fallback

- GIVEN fps < 55 measured over the last 10 frames
- WHEN arc glow layer is rendered
- THEN radial gradient is replaced with solid concentric rings

## Public API

```js
/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} state
 * @param {number} interpolation  - 0–1
 */
function render(ctx, state, interpolation) {}
```

## Types

```js
/**
 * @typedef {Object} GameState
 * @property {WeldPool} pool
 * @property {BeadColumn[]} beadColumns
 * @property {SlagSegment[]} slagSegments
 * @property {SpatterParticle[]} particles
 * @property {ArcState} arc
 * @property {number} score
 * @property {string} chipMode
 * @property {ElectrodeConfig} electrode
 */
```

## Acceptance Criteria

- [ ] All 8 layers rendered in correct order per frame
- [ ] `ctx.save()`/`ctx.restore()` wraps each layer
- [ ] FPS guard switches arc glow to solid rings at <55fps
- [ ] Zero magic numbers — all constants from `src/config/renderer.js`
