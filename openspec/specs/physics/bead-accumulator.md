# BeadAccumulator Specification

## Purpose
Pixel-column deposition array with temperature tracking and slag state per column.

## Types
```js
/**
 * @typedef {Object} BeadColumn
 * @property {number} x - canvas x position
 * @property {number} baseY - top of workpiece surface
 * @property {number} height - accumulated bead height in pixels
 * @property {number} temperature - current temp in Kelvin
 * @property {boolean} hasSlag - true if slag present
 * @property {boolean} slagRemoved - true if chip tool used
 */
```

## Constants (balance.js)
| Constant | Value | Source |
|----------|-------|--------|
| DEPOSITION_RATE | derived | wire_feed_equivalent(amperage) |

## Public API
```js
/**
 * @param {number} width - number of columns
 * @returns {BeadAccumulator}
 */
function createBeadAccumulator(width) {}

/**
 * Deposit material from pool state
 * @param {PoolCell[][]} poolCells - 2D pool grid
 * @param {number} dt - timestep
 */
BeadAccumulator.prototype.deposit(poolCells, dt) {}
```

## Requirements

### Requirement: Column Initialization
The system MUST create an array of BeadColumns matching workpiece width.

#### Scenario: 200px wide workpiece
- GIVEN width=200
- WHEN createBeadAccumulator(200)
- THEN array of 200 BeadColumns returned
- AND all heights=0, hasSlag=false, slagRemoved=false

### Requirement: Deposition Rate
The system MUST increment column height by deposition_rate = wire_feed_equivalent(amperage) × dt when pool cell is liquid.

#### Scenario: Liquid pool deposits material
- GIVEN column with height=10, pool cell at column x is liquid (>LIQUIDUS_TEMP)
- WHEN deposit(pool, 0.016)
- THEN height increases by rate×dt
- AND temperature updated from pool

### Requirement: Solidification
The system MUST set hasSlag=true when column's top pool cell solidifies.

#### Scenario: Slag forms on solidification
- GIVEN column with pool cell transitioning liquid→solid
- WHEN deposit(pool, dt)
- THEN column.hasSlag = true
- AND temperature set to SOLIDUS_TEMP

## Edge Cases
| Case | Handling |
|------|----------|
| Column index out of range | No-op, warn to console |
| Temperature NaN | Use 293K fallback |
| Negative height | Clamp to 0 |
