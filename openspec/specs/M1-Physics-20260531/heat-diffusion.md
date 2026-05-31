# HeatDiffusion Specification

## Purpose
Off-screen HAZ canvas with Gaussian colour spread per solidified column. Pure visual, computed once on solidification.

## Types
```js
/**
 * @typedef {Object} HAZParticle
 * @property {number} x - center x
 * @property {number} y - center y
 * @property {number} radius - Gaussian spread radius
 * @property {number} intensity - 0–1, fades over time
 */
```

## Constants (balance.js)
| Constant | Value | Source |
|----------|-------|--------|
| HAZ_GAUSSIAN_SIGMA | 15 | pixels, spread width |
| HAZ_COLOR_HOT | #1a0a00 | peak heat colour |
| HAZ_COLOR_COLD | #0a0500 | fade colour |
| HAZ_INTENSITY_INITIAL | 0.8 | peak intensity |
| HAZ_DECAY_RATE | 0.001 | per second fade |

## Public API
```js
/**
 * @param {number} width - canvas width
 * @param {number} height - canvas height
 * @returns {HeatDiffusion}
 */
function createHeatDiffusion(width, height) {}

/**
 * @param {BeadColumn[]} beadColumns
 * @returns {HTMLCanvasElement} - off-screen HAZ canvas
 */
HeatDiffusion.prototype.compute(beadColumns) {}

/**
 * @returns {CanvasRenderingContext2D}
 */
HeatDiffusion.prototype.getContext() {}
```

## Requirements

### Requirement: Off-screen Canvas
The system MUST create a separate off-screen canvas for HAZ rendering. Canvas is NOT attached to DOM.

#### Scenario: Off-screen canvas created
- GIVEN width=800, height=600
- WHEN createHeatDiffusion(800, 600)
- THEN new CanvasRenderingContext2D created
- AND canvas.hidden = true (if supported)
- AND canvas dimensions match

### Requirement: Gaussian Spread on Solidification
The system MUST compute Gaussian colour spread for each solidified BeadColumn exactly once.

#### Scenario: Gaussian computed per column
- GIVEN BeadColumn at x=100, height=50, solid
- WHEN compute(columns)
- THEN HAZ rendered at column position
- AND Gaussian spread with sigma=HAZ_GAUSSIAN_SIGMA
- AND intensity = HAZ_INTENSITY_INITIAL

### Requirement: HAZ Colour Mapping
The system MUST map temperature to HAZ colour gradient: peak (#1a0a00) to cold (#0a0500).

#### Scenario: Colour mapped from temperature
- GIVEN column at 1500K (solidifying)
- WHEN compute(columns)
- THEN HAZ colour interpolated between hot/cold
- AND alpha proportional to intensity

### Requirement: One-time Computation
The system MUST compute HAZ per column only on first solidification. Subsequent calls skip already-computed columns.

#### Scenario: Skip already-computed
- GIVEN column.x already has HAZ
- WHEN compute(columns) called again
- THEN that column skipped
- AND only new solidified columns computed

### Requirement: Composite-ready Output
The system MUST return canvas ready for compositing by SceneRenderer at Layer 2 (HAZ).

#### Scenario: Canvas returned for compositing
- GIVEN HeatDiffusion with computed HAZ
- WHEN getContext() called
- THEN context returned for renderer
- AND clearRect() called before each compute

## Edge Cases
| Case | Handling |
|------|----------|
| Column already computed | Skip silently |
| Column temp > SOLIDUS | Skip (not solidified) |
| Canvas too large (> 4096px) | Warn, allow anyway |
| Zero columns | Return empty canvas |
