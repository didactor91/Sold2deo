# Design: M1-Physics — Physics Engine

## Technical Approach

A modular physics engine driving a 2D molten pool simulation, decoupled from rendering via fixed 1/60s timestep. Each subsystem (WeldPool, BeadAccumulator, SlagLayer, ArcPhysics, SpatterSystem, HeatDiffusion) is self-contained with no cross-dependencies — only data flow via explicit call order. Constants sourced exclusively from `src/config/balance.js`.

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **2D grid for WeldPool** vs particle-only | Grid of PoolCells | Enables spatial heat diffusion (FDM), slag emission per column, and column-based deposition — particle-only cannot express solidification boundaries or HAZ per-column |
| **Pre-allocated 512-particle pool** for SpatterSystem | Pool with `active` flag + O(n) scan | Eliminates GC during game loop (hard <2ms budget). Particle count is fixed game-balance knob, not dynamic. |
| **Tick order: heat → fluid → solidify → deposit → slag → spatter → HAZ** | Fixed phase ordering | Heat drives all state; solidification must precede deposition; slag must be emitted before spatter impact; HAZ renders after solidification |
| **Fixed timestep (1/60s) decoupled from render** | Accumulator pattern (SDD-001 §3.1) | Physics determinism independent of frame rate; interpolation smooths rendering |
| **No inter-module dependencies** | Each module reads input, writes output | Allows parallel task execution, isolates failures, simplifies unit testing |
| **FDM explicit scheme** for heat diffusion | Explicit (not implicit) FDM | Simpler implementation; stability constrained by `dt < dx²/(4α)` — validated against grid resolution |

## Module Dependency Graph

```
ArcPhysics ──→ WeldPool (heat input Q = I×V×η×dt)
WeldPool ────→ BeadAccumulator (liquid cells → column deposition)
WeldPool ────→ SlagLayer (solidification → slag emit per column)
WeldPool ────→ HeatDiffusion (solidified columns → HAZ particle array)
ArcPhysics ──→ SpatterSystem (arc_length → emission factor)
```

Dependency direction = data flow. No circular references.

## Data Flow Per Tick

```
1. ArcPhysics.updateArc(mouseY, surfaceY, amperage, electrodeType)
   → ArcState { arcLength, voltage, heatInput, status }

2. WeldPool.applyHeat(electrodeCol, electrodeRow, arcState.heatInput, dt)
   → PoolCell temperature increases

3. WeldPool.diffuse(dt)
   → Heat spreads to 4-connected neighbours (explicit FDM)
   → Temperature field updated

4. WeldPool.fluidStep()
   → Liquid mass shifts downhill, viscosity-limited

5. WeldPool.solidify()
   → Cells where temp < SOLIDUS_TEMP → solid=true
   → Top cell of solidifying column → slag=true flag

6. BeadAccumulator.deposit(poolCells, dt)
   → Liquid pool cells → column height increment
   → Sets column.hasSlag when top cell solidifies

7. SlagLayer.createSlagLayer(beadColumns)
   → Reads column.hasSlag, creates SlagSegment[]
   → Checks for INCLUSION defect (hasSlag && !slagRemoved)

8. SpatterSystem.emit(arcState, baseRate)
   → Emits particles at rate = baseRate × arc_factor
   → arc_factor = clamp(arc_length / IDEAL_ARC, 0.5, 4.0)

9. SpatterSystem.tick(dt, surfaceY)
   → Apply gravity (0, 980 px/s²), update position
   → One bounce: vy *= BOUNCE_VELOCITY_FACTOR
   → Stick when life < STICK_LIFE_THRESHOLD

10. HeatDiffusion.compute(beadColumns)
    → Gaussian spread on first solidification per column
    → Writes off-screen canvas, composited by renderer at Layer 2
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/types/physics.d.ts` | Create | Type definitions: PoolCell, BeadColumn, SlagSegment, SpatterParticle, ArcState, HAZParticle, WeldPool I/F, SpatterSystem I/F, BeadAccumulator I/F, SlagLayer I/F, ArcPhysics I/F, HeatDiffusion I/F |
| `src/config/balance.js` | Create | All constants organized by module (physics, spatter, arc, slag, heatDiffusion, bead, tick) per spec config-constants.md |
| `src/physics/ArcPhysics.js` | Create | Arc state, voltage derivation, heat input, travel angle |
| `src/physics/WeldPool.js` | Create | 2D grid, heat apply, FDM diffuse, fluidStep, solidify |
| `src/physics/BeadAccumulator.js` | Create | Column array, deposition from liquid pool cells |
| `src/physics/SlagLayer.js` | Create | Slag segments, chip mechanic, inclusion defect flag |
| `src/physics/SpatterSystem.js` | Create | 512-particle pre-allocated pool, emit/tick/getActive |
| `src/physics/HeatDiffusion.js` | Create | Off-screen canvas, Gaussian spread on solidification |
| `src/physics/index.js` | Create | Factory function `createPhysics()` composing all modules, `tick(dt)` orchestrating phase order |

## Constants Strategy

All values from `src/config/balance.js` only. No magic numbers in physics modules.

```js
import { BALANCE } from '../config/balance.js';

// In WeldPool.js — use BALANCE.physics.SOLIDUS_TEMP, not 1450
if (cell.temperature < BALANCE.physics.SOLIDUS_TEMP) {
  cell.solid = true;
}
```

Modules import BALANCE once at construction, cache needed values in instance fields for fast access during tick.

## Type Definitions Location

`src/types/physics.d.ts` — single file for all physics types. Renderer and game loop import from here. No inline JSDoc types in implementation files.

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Physics tick duration | < 2ms @ 60fps | `performance.now()` around `physicsUpdate(FIXED_DT)` |
| Particle pool allocation | Zero during game loop | Pre-allocated on `createSpatterSystem()`, never `new` in `tick()` |
| Grid default size | 64×32 cells | Configurable via `BALANCE.tick.MAX_POOL_COLS/ROWS` |
| Heat diffusion stability | `dt <= dx²/(4α)` | Validated analytically; dx derived from canvas width / cols |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Pure functions: `diffuseCalc()`, `arcValidation()`, `beadHeightCalc()` | Vitest, deterministic inputs/outputs |
| Unit | WeldPool.fluidStep (no external deps) | Vitest with seeded PoolCell grid |
| Unit | SlagLayer.chip() threshold logic | Vitest, varied hardness/dragForce |
| Integration | Full tick sequence with mock ArcState | Vitest, compare output grid against golden file (seeded) |
| Integration | SpatterSystem pool exhaustion | Test emit at >POOL_SIZE, verify no allocations |
| Benchmark | tick() duration | Vitest bench, `ping 1000` mode, assert < 2ms |

Stateful modules (WeldPool, SlagLayer) use deterministic seed for regression: `Math.seedrandom(n)` before construction in tests.

## Open Design Choices

- **Grid resolution tuning**: 64×32 is default; smaller grid = faster diffusive, larger = more detail. Can expose as `balance.physics.POOL_COLS/ROWS` for level-specific tuning.
- **FDM explicit stability vs accuracy**: Current explicit scheme requires small dt. Alternative implicit (Crank-Nicolson) allows larger dt but doubles memory and complexity. Explicit is chosen for simplicity; if tick budget is exceeded at 64×32, revisit implicit.
- **Spatter one-bounce vs tumble**: Spec says one bounce then stick. Real droplets may tumble. Currently spec-compliant; tunable via `BOUNCE_VELOCITY_FACTOR` if gameplay needs adjustment.