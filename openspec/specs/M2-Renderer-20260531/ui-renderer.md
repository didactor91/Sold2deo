# UIRenderer Specification

## Purpose

Renders HUD overlays directly onto the canvas: score, arc status indicator, and chip mode indicator.

## Requirements

### Requirement: Score Display

The system SHALL render the current score in the top-left corner of the canvas.

#### Scenario: Score rendered as text

- GIVEN `state.score = 8500`
- WHEN `UIRenderer.render()` is called
- THEN "SCORE: 8500" text is drawn at top-left position
- AND font is `'12px monospace'`
- AND colour is `'#ffffff'`

### Requirement: Arc Status Indicator

The system SHALL render arc status (ok/short/long/broken) as a coloured badge.

| Status   | Badge Colour |
|----------|--------------|
| ok       | `#44ff44`    |
| short    | `#ff4444`    |
| long     | `#ffaa00`    |
| broken   | `#ff0000`    |

#### Scenario: Arc OK shown as green badge

- GIVEN `state.arc.status = 'ok'`
- WHEN arc status is rendered
- THEN a coloured badge appears at the HUD position
- AND fill colour is `#44ff44`

### Requirement: Chip Mode Indicator

The system SHALL render a chip mode indicator when `state.chipMode === true`.

#### Scenario: Chip mode active shows hammer icon text

- GIVEN `state.chipMode = true`
- WHEN chip mode indicator is rendered
- THEN "[C] CHIP MODE" text is displayed
- AND colour is `#ffaa00`

#### Scenario: Chip mode inactive hides indicator

- GIVEN `state.chipMode = false`
- WHEN chip mode indicator is rendered
- THEN no chip mode text is drawn

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
 * @typedef {Object} ArcState
 * @property {string} status  - 'ok'|'short'|'long'|'broken'
 */

/**
 * @typedef {Object} GameState
 * @property {number} score
 * @property {boolean} chipMode
 * @property {ArcState} arc
 */
```

## Acceptance Criteria

- [ ] Score displayed top-left, white monospace text
- [ ] Arc status badge coloured by status type
- [ ] Chip mode shows "[C] CHIP MODE" in orange when active
- [ ] No DOM interaction — canvas-only overlay
- [ ] All constants from `src/config/renderer.js`
