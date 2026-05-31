# SlagLayer Specification

## Purpose
Slag segment array with hardness, chip detection, and inclusion defect flagging.

## Types
```js
/**
 * @typedef {Object} SlagSegment
 * @property {number} x - start x position
 * @property {number} width - segment width in pixels
 * @property {number} thickness - pixels
 * @property {boolean} removed - true if chipped off
 * @property {number} hardness - 0–1, increases with age
 */
```

## Constants (balance.js)
| Constant | Value | Source |
|----------|-------|--------|
| SLAG_HARDNESS_INITIAL | 0.3 | initial hardness |
| SLAG_HARDNESS_MAX | 1.0 | max hardness |
| CHIP_RESISTANCE | 0.5 | drag force threshold multiplier |
| HARDNESS_GROWTH_RATE | 0.01 | per-second increase |

## Public API
```js
/**
 * @param {BeadColumn[]} beadColumns
 * @returns {SlagLayer}
 */
function createSlagLayer(beadColumns) {}

/**
 * @param {number} x - cursor x
 * @param {number} width - drag width
 * @param {number} dragForce - player drag force
 * @returns {boolean} - true if any segment removed
 */
SlagLayer.prototype.chip(x, width, dragForce) {}
```

## Requirements

### Requirement: Slag Deposition
The system MUST create slag segments on columns where hasSlag=true and slagRemoved=false.

#### Scenario: Slag forms on bead
- GIVEN BeadAccumulator with column.hasSlag=true
- WHEN createSlagLayer(columns)
- THEN SlagSegment created at column.x
- AND thickness derived from bead height
- AND hardness = SLAG_HARDNESS_INITIAL

### Requirement: Chip Mechanic
The system MUST remove slag when drag_force > hardness × CHIP_RESISTANCE.

#### Scenario: Slag chips off
- GIVEN segment with hardness=0.5, CHIP_RESISTANCE=0.5
- WHEN chip(x, width, dragForce=0.3)
- THEN segment.removed = true if dragForce > 0.25
- AND returns true

### Requirement: Inclusion Defect
The system MUST flag INCLUSION defect when deposit() called on column with hasSlag=true && !slagRemoved.

#### Scenario: Inclusion detected
- GIVEN column.hasSlag=true, column.slagRemoved=false
- WHEN deposit() called on that column
- THEN defect INCLUSION flagged
- AND defect report emitted

### Requirement: Hardness Aging
The system MUST increase slag hardness over time up to HARDNESS_MAX.

#### Scenario: Hardness increases
- GIVEN segment with hardness=0.3
- WHEN time passes (dt seconds)
- THEN hardness += HARDNESS_GROWTH_RATE × dt
- AND capped at 1.0

## Edge Cases
| Case | Handling |
|------|----------|
| Empty chip drag (< 5px) | No-op |
| Segment already removed | Skip, return false |
| Hardness > max | Cap at 1.0 |
