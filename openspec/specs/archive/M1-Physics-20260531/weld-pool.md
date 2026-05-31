# WeldPool Specification

## Purpose
2D grid molten pool fluid simulation with heat diffusion via explicit FDM, solidification detection, slag emission flag.

## Constants (balance.js)
| Constant | Value | Source |
|----------|-------|--------|
| SOLIDUS_TEMP | 1450°C | AWS D1.1 mild steel |
| LIQUIDUS_TEMP | 1530°C | AWS D1.1 |
| ARC_HEAT_INPUT | 0.85 | efficiency η |
| POOL_VISCOSITY | 0.006 Pa·s | mild steel at liquidus |
| THERMAL_DIFFUSIVITY | 8e-6 m²/s | mild steel |

## Types
```js
/**
 * @typedef {Object} PoolCell
 * @property {number} temperature - Kelvin, range 293–2800
 * @property {number} mass - normalized 0–1
 * @property {boolean} solid - true below solidus
 * @property {boolean} slag - true if slag cell
 */
```

## Public API
```js
/**
 * @param {number} cols - grid columns
 * @param {number} rows - grid rows
 * @returns {WeldPool}
 */
function createWeldPool(cols, rows) {}

/**
 * @param {number} col
 * @param {number} row
 * @param {number} heatInput - J/s
 * @param {number} dt - seconds
 */
WeldPool.prototype.applyHeat(col, row, heatInput, dt) {}

/** @param {number} dt */
WeldPool.prototype.diffuse(dt) {}
WeldPool.prototype.fluidStep() {}
WeldPool.prototype.solidify() {}
```

## Requirements

### Requirement: Grid Initialization
The system MUST create a 2D grid of PoolCells with dimensions specified at creation.

#### Scenario: 64×32 grid
- GIVEN cols=64, rows=32
- WHEN createWeldPool(64, 32)
- THEN 64×32 PoolCell array returned
- AND all temps=293K, mass=0, solid=true

### Requirement: Heat Application
The system MUST apply Q = I × V × η × dt at electrode contact point.

#### Scenario: Heat raises temperature
- GIVEN pool cell at 293K
- WHEN applyHeat(col, row, 1000, 0.016)
- THEN temperature increases proportionally
- AND neighbours unaffected

### Requirement: Heat Diffusion
The system MUST diffuse heat via 2D FDM explicit scheme to 4-connected neighbours.

#### Scenario: Heat spreads to neighbours
- GIVEN cell at 2000K with neighbours at 293K
- WHEN diffuse(0.016)
- THEN heat spreads to neighbours
- AND total thermal energy conserved

### Requirement: Solidification
The system MUST mark cells solid when temp < SOLIDUS_TEMP.

#### Scenario: Cell solidifies
- GIVEN liquid cell at 1500K
- WHEN temp → 1449K
- THEN solid = true
- AND mass excluded from fluidStep

### Requirement: Slag Emission
The system MUST flag top cell of solidifying column with slag=true.

#### Scenario: Slag flag on solidification
- GIVEN column solidifying from base upward
- WHEN cell → solid
- THEN cell.slag = true
- AND excluded from fluidStep

## Edge Cases
| Case | Handling |
|------|----------|
| dt > 100ms | Clamp to 100ms |
| Temp > 2800K | Cap at 2800K |
| Temp < 293K | Floor at 293K |
