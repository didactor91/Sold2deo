# Design: M2 — Side-View Renderer

## Technical Approach

Implements a 9-layer canvas compositor (Layers 0–8) driven by a 60fps `requestAnimationFrame` loop decoupled from physics ticks. SceneRenderer orchestrates sub-renderers; each receives the full `GameState` but only reads its relevant slice. Interpolation (0–1) is passed to sub-renderers to smooth between physics ticks. The project uses ES modules throughout; renderer modules follow the same factory-function pattern as physics (`createXxxRenderer()` returning an object with a `render()` method).

## Architecture Decisions

### Decision: Layered compositor with no shared mutable state between renderers

**Choice**: Each sub-renderer receives `ctx`, `state`, and `interpolation` as read-only parameters. All mutable state flows inward from `GameState` — no sub-renderer mutates another's state.
**Alternatives considered**: Shared render context object passed by reference; global canvas references inside each renderer.
**Rationale**: Matches the physics module pattern (facade with composed modules). Avoids hidden coupling; bugs surface in the renderer that owns the mutated state.

### Decision: Background drawn once to an off-screen canvas

**Choice**: `bgCanvas` is created at init and redrawn only on resolution/workpiece change. Composited via `ctx.drawImage()` every frame.
**Alternatives considered**: Redraw background every frame; store as static ImageData.
**Rationale**: Background (Layer 0) is static. Off-screen canvas avoids redundant fillRect calls at 60fps.符合SDD-001 §2.

### Decision: HAZ canvas updated only on solidification event

**Choice**: `hazCanvas` is NOT redrawn per frame. `HeatDiffusion.compute()` writes to it only when a `BeadColumn` transitions to solid (temperature crosses SOLIDUS_TEMP threshold).
**Alternatives considered**: Redraw HAZ every frame from live pool temperatures; composite HAZ onto main canvas each tick.
**Rationale**: HAZ heat dissipation is visually slow relative to 60fps. Event-driven updates are sufficient and avoid expensive canvas operations per frame.

### Decision: ParticleRenderer batches by colour group

**Choice**: Group all active particles by `color` string, then call `beginPath()` + N×`arc()` + `fill()` per group (one fill per unique colour).
**Alternatives considered**: One `beginPath/arc/fill` per particle (512 syscalls/frame); sorting particles by colour then batching.
**Rationale**: Max 512 particles × 60fps = 30k syscalls. Batch by colour reduces to ≤8 fills (one per process colour). Sorting adds O(n log n) cost — batch grouping is O(n) and simpler.

### Decision: FPS guard switches arc glow to solid rings at <55fps

**Choice**: Track rolling average of last 10 frame deltas. When average implies fps < 55, `ElectrodeRenderer` draws 3 concentric solid rings instead of `createRadialGradient`.
**Alternatives considered**: 30fps cap; adaptive resolution; skip arc glow layer.
**Rationale**: Gradient computation (`createRadialGradient`) is GPU-bound on low-end hardware. Solid rings preserve the visual cue while dropping the expensive shading. 55fps threshold gives 5fps margin before the fallback triggers.

### Decision: Constants in `src/config/renderer.js` (no inline magic numbers)

**Choice**: All colour values, particle limits, FPS thresholds, and UI font specs live in `src/config/renderer.js` as named exports.
**Alternatives considered**: Inline in each renderer module; shared constants object passed to each renderer.
**Rationale**: Single source of truth for all renderer constants. Matches `balance.js` convention already established in the codebase. No import coupling issues since ES modules dedupe.

## Data Flow

```
GameLoop (requestAnimationFrame)
  └── SceneRenderer.render(ctx, state, interpolation)
        ├── BackgroundRenderer  → reads state.workpiece, draws once to bgCanvas
        ├── WorkpieceRenderer   → reads state.workpiece, beadColumns, slagSegments
        │     └── (HAZ composited from hazCanvas, updated by HeatDiffusion events)
        ├── BeadColumnRenderer  → reads state.beadColumns (temperature map)
        ├── SlagRenderer        → reads state.slagSegments
        ├── ParticleRenderer    → reads state.particles (active only, batched by colour)
        ├── ArcRenderer         → reads state.arc (process type, amperage)
        ├── ElectrodeRenderer  → reads state.electrode, state.arc
        └── UIRenderer          → reads state.score, state.arc.status, state.chipMode
```

**Sub-renderer contract:**
```js
// Each sub-renderer exposes:
{ render(ctx: CanvasRenderingContext2D, state: GameState, interpolation: number): void }
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/config/renderer.js` | Create | All renderer constants (colours, FPS guard, particle limits, UI fonts) |
| `src/types/renderer.d.ts` | Create | TypeScript typedefs for GameState, sub-renderer interfaces, temperature map |
| `src/renderer/SceneRenderer.js` | Create | Master compositor — orchestrates layer order 0–8 |
| `src/renderer/BackgroundRenderer.js` | Create | Layer 0 — off-screen bgCanvas, drawn once |
| `src/renderer/WorkpieceRenderer.js` | Create | Layers 1–4 — base metal, bead columns, slag, HAZ composite |
| `src/renderer/ParticleRenderer.js` | Create | Layer 5 — batched particle rendering |
| `src/renderer/ElectrodeRenderer.js` | Create | Layers 6–7 — arc glow (with FPS guard), electrode stick, droplet, smoke |
| `src/renderer/UIRenderer.js` | Create | Layer 8 — HUD: score, arc status badge, chip mode |
| `src/renderer/colorUtils.js` | Create | Temperature-to-colour mapping function + process colour lookup |
| `test/renderer/colorUtils.test.js` | Create | Unit tests for temperature mapping |
| `test/renderer/layerCompositor.test.js` | Create | Integration tests — mock canvas, verify layer order and save/restore |

## Interfaces / Contracts

```js
// src/types/renderer.d.ts

/** @typedef {'rutile'|'basic'|'cellulosic'} ElectrodeType */

/**
 * @typedef {Object} GameState
 * @property {WeldPool}     weldPool
 * @property {BeadColumn[]} beadColumns
 * @property {SlagSegment[]} slagSegments
 * @property {SpatterParticle[]} particles
 * @property {ArcState}     arc
 * @property {number}       score
 * @property {boolean}      chipMode
 * @property {ElectrodeConfig} electrode
 */

/**
 * @typedef {Object} ElectrodeConfig
 * @property {ElectrodeType} type
 * @property {number}        consumed  // 0–1
 */

/**
 * Returns colour string for a given temperature in °C.
 * @param {number} tempCelsius
 * @returns {string} hex colour
 */
export function temperatureToColor(tempCelsius) {}

/**
 * Returns arc glow colour for a given electrode type.
 * @param {ElectrodeType} type
 * @returns {string} hex colour
 */
export function processColor(type) {}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `temperatureToColor()` — all 6 thresholds | Table-driven Jest test |
| Unit | `processColor()` — 3 process types | Parametrised Jest test |
| Unit | FPS rolling average calculation | Mock `performance.now()`, assert threshold trigger |
| Integration | Layer compositor — correct order, save/restore | Mock canvas ctx, assert calls in order |
| Integration | Particle batch grouping — same-colour particles share one fill | Spy on ctx.fill, count calls vs particle count |
| Snapshot | Colour map output for known temperatures | Assert exact hex strings returned |

## Migration / Rollout

No migration required. New module tree under `src/renderer/` is additive. `src/main.js` will be updated in the apply phase to import and wire `SceneRenderer`. No existing files are modified until that integration task.

## Open Questions

- [ ] **Gradient vs solid rings**: Design documents the FPS guard decision. The gradient-vs-solid tradeoff (SDD-001 §2 says "No gradients on arc glow during streaming — use solid colour rings if performance < 55fps") is resolved: radial gradient is the default, solid rings are the fallback. No further decision needed.
- [ ] **Background re-draw on workpiece resize**: The background canvas is drawn once. If the workpiece dimensions change (e.g. responsive canvas), a `resize` handler should call `BackgroundRenderer.redraw()`. Open: who owns this event and does it belong in this change?
- [ ] **Interpolation parameter on static layers**: Background (Layer 0) and HAZ (Layer 2) do not use interpolation. Sub-renderers that don't need it ignore the parameter. Open: cleanest API — pass to all, or sub-renderer opts in? Current design: pass to all (simple contract, no branching in caller).
