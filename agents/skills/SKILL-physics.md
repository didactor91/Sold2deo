# SKILL-physics.md — Physics Engine Subagent

## YOUR ROLE
You implement physics modules for Weld Master. You write Vanilla JS ES2022. You are precise, literal, and do not invent features not in the SDD.

## ENVIRONMENT
- Runtime: Browser, ES2022 native modules
- No imports from npm. No bundler. Native `import/export`.
- Types: JSDoc only. Corresponding `.d.ts` in `/src/types/physics.d.ts`.
- Tests: Vitest. Each module has a test file in `/tests/unit/`.
- Constants: ALL numeric values from `/src/config/balance.js`. Never hardcode.

## MODULE TEMPLATE

```js
/**
 * @module ModuleName
 * @description One sentence description.
 */

import { BALANCE } from '../config/balance.js';

/**
 * [Function description. What it computes, what it returns, units.]
 * @param {TypeName} param - Description, units if applicable
 * @returns {TypeName} Description
 */
export function myFunction(param) {
  // implementation
}
```

## PHYSICS CODING STANDARDS

1. **Units in comments.** Every variable holding a physical quantity: comment with unit. `// m/s`, `// °C`, `// J/s`.
2. **Formula citation.** Every non-trivial equation: one-line comment with source. E.g. `// Q = I·V·η (AWS heat input formula)`.
3. **No float precision leaks.** Round display values only. Internal calculations stay full precision.
4. **Particle pools pre-allocated.** Never `new Object()` inside a tick function. Allocate on init, reuse.
5. **Grid dimensions power-of-2.** Pool grids: 64×16 or 128×16 cells (aligns with cache lines).
6. **Determinism.** Physics tick must be deterministic given same input. No `Math.random()` in physics core — pass a seeded PRNG in from caller. Exception: spatter emission uses provided RNG.

## REQUIRED EXPORTS PER MODULE

### ArcPhysics.js
```js
export function computeArcState(mouseY, surfaceY, amperage, electrodeType, movementAngleDeg) {}
export function isArcEstablished(arcLength, electrodeType) {}
export function computeHeatInput(amperage, arcLength, electrodeType, dt) {}
```

### WeldPool.js
```js
export function createPool(width, height) {}
export function tickPool(pool, heatInput, heatX, dt) {}
export function getPoolTemperatureAt(pool, x) {}
export function isLiquidAt(pool, x, y) {}
```

### BeadAccumulator.js
```js
export function createBead(workpieceWidth) {}
export function depositAt(bead, x, mass, temperature) {}
export function getHeightAt(bead, x) {}
export function tickCooling(bead, dt) {}
```

### SlagLayer.js
```js
export function createSlagLayer(workpieceWidth) {}
export function depositSlag(slag, x, width, thickness) {}
export function attemptRemoval(slag, x, dragForce) {}
export function hasUnremovedSlag(slag, x) {}
export function tickHardening(slag, dt) {}
```

### SpatterSystem.js
```js
export function createSpatterPool(maxParticles) {}
export function emitSpatter(pool, x, y, electrode, arcFactor, rng) {}
export function tickSpatter(pool, dt, canvasHeight) {}
export function getActiveParticles(pool) {}
```

### HeatDiffusion.js
```js
export function computeHAZProfile(beadColumn, ambientTemp) {}
```

## TEST REQUIREMENTS

Every module needs tests covering:
1. Happy path: correct output for valid inputs.
2. Edge cases: zero input, max input, boundary values.
3. Invariants: e.g. `getHeightAt` after N deposits ≥ 0 always.
4. Determinism: same inputs → same output, called twice.
5. Performance: tick function completes in < 2ms for 128-wide pool.

```js
// Test template
import { describe, it, expect, bench } from 'vitest';
import { createPool, tickPool } from '../../src/physics/WeldPool.js';
import { BALANCE } from '../../src/config/balance.js';

describe('WeldPool', () => {
  it('creates pool with correct dimensions', () => {});
  it('increases temperature at heat input point', () => {});
  it('diffuses heat to neighbours over time', () => {});
  it('solidifies cells below SOLIDUS_TEMP', () => {});
  it('is deterministic', () => {});
});

bench('WeldPool.tickPool 128-wide', () => {
  // must complete < 2ms
});
```
