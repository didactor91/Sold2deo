# WorkpieceRenderer Specification

## Purpose

Renders base metal, bead columns with temperature-mapped colour, slag layer, and HAZ off-screen compositing.

## Requirements

### Requirement: Base Metal Layer

The system SHALL draw a flat rectangular base metal layer in `#2a2a2a`.

#### Scenario: Base metal covers workpiece area

- GIVEN workpiece dimensions from `state.workpiece`
- WHEN `WorkpieceRenderer.render()` is called
- THEN a filled rectangle covers the full workpiece area
- AND fill colour is `#2a2a2a`

### Requirement: Bead Column Temperature Colour Map

The system SHALL colour each bead column according to the temperature map.

| Temperature | Colour   |
|-------------|----------|
| > 1500°C    | `#ffff00` |
| > 1200°C    | `#ff8800` |
| > 900°C     | `#ff3300` |
| > 600°C     | `#cc1100` |
| > 300°C     | `#661100` |
| ≤ 300°C     | `#3a2010` |

#### Scenario: Hot column renders yellow

- GIVEN a `BeadColumn` with `temperature = 1600`
- WHEN columns are rendered
- THEN that column's fill is `#ffff00`

#### Scenario: Solidified column renders dark brown

- GIVEN a `BeadColumn` with `temperature = 280`
- WHEN columns are rendered
- THEN that column's fill is `#3a2010`

### Requirement: Rounded Bead Caps

The system SHALL draw rounded caps on each bead column using `ctx.arc`.

#### Scenario: Column top is rounded

- GIVEN a `BeadColumn` at position `x`, `baseY` with `height > 0`
- WHEN bead columns are rendered
- THEN the top of the column uses `ctx.arc()` for the rounded cap

### Requirement: HAZ Off-Screen Compositing

The system SHALL composite the HAZ layer from an off-screen `hazCanvas`.

#### Scenario: HAZ canvas composited onto main canvas

- GIVEN an off-screen `hazCanvas` with HAZ gradient data
- WHEN `WorkpieceRenderer.render()` reaches the HAZ layer
- THEN `ctx.drawImage(hazCanvas, 0, 0)` is called
- AND HAZ is drawn below bead columns (layer 2)

### Requirement: Slag Layer Rendering

The system SHALL render slag segments in dark brown with lighter crust.

#### Scenario: Slag renders on top of bead

- GIVEN a `SlagSegment` with `removed = false`
- WHEN slag layer is rendered
- THEN fill is `#3a1f00` with crust highlight `#5a3010`

## Public API

```js
/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} state
 * @param {number} interpolation
 */
function render(ctx, state, interpolation) {}
```

## Types

```js
/**
 * @typedef {Object} BeadColumn
 * @property {number} x
 * @property {number} baseY
 * @property {number} height
 * @property {number} temperature
 * @property {boolean} hasSlag
 * @property {boolean} slagRemoved
 */

/**
 * @typedef {Object} SlagSegment
 * @property {number} x
 * @property {number} width
 * @property {number} thickness
 * @property {boolean} removed
 */
```

## Acceptance Criteria

- [ ] Base metal `#2a2a2a` flat rect drawn
- [ ] Bead columns coloured by temperature map (6 thresholds)
- [ ] Rounded caps on each column top
- [ ] HAZ composited from off-screen canvas
- [ ] Slag rendered with `#3a1f00` fill and `#5a3010` crust
- [ ] All constants from `src/config/renderer.js`
