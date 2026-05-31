# Tasks: M1-Physics — Physics Engine

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 850–1050 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | 3 PRs: PR 1 (Foundation) → PR 2 (Core Modules) → PR 3 (Facade + Integration) |
| Delivery strategy | auto-forecast |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Config + Types + ArcPhysics | PR 1 | Base = main; self-contained |
| 2 | WeldPool + BeadAccumulator + SlagLayer + SpatterSystem + HeatDiffusion | PR 2 | Base = PR 1 |
| 3 | PhysicsEngine facade + all tests | PR 3 | Base = PR 2 |

---

## Phase 1: Foundation (Config + Types)

- [x] M1-001 **Create `src/types/physics.d.ts`**
  - FILES: `src/types/physics.d.ts` (create)
  - DEPENDS ON: none
  - DESCRIPTION: JSDoc TypeScript definitions for all physics types: PoolCell, BeadColumn, SlagSegment, SpatterParticle, ArcState, HAZParticle, and interfaces for WeldPool, SpatterSystem, BeadAccumulator, SlagLayer, ArcPhysics, HeatDiffusion, PhysicsEngine.
  - ACCEPTANCE CRITERIA:
    - [ ] `PoolCell { x, y, temperature, solid, liquid, slag }` typed
    - [ ] `BeadColumn { cells[], hasSlag, slagRemoved, height }` typed
    - [ ] `SlagSegment { hardness, thickness, col }` typed
    - [ ] `SpatterParticle { x, y, vx, vy, life, stuck }` typed
    - [ ] `ArcState { arcLength, voltage, heatInput, status }` typed
    - `HAZParticle { col, intensity, sigma }` typed
    - All module interfaces: `IWeldPool`, `ISpatterSystem`, `IBeadAccumulator`, `ISlagLayer`, `IArcPhysics`, `IHeatDiffusion`, `IPhysicsEngine`
    - JSDoc on every type and interface
  - DO NOT TOUCH: any implementation file

- [x] M1-002 **Create `src/config/balance.js`**
  - FILES: `src/config/balance.js` (create)
  - DEPENDS ON: none
  - DESCRIPTION: All numeric constants organized by module (physics, spatter, arc, slag, heatDiffusion, bead, tick) from config-constants.md. Exported as a single `BALANCE` object. No magic numbers anywhere.
  - ACCEPTANCE CRITERIA:
    - [ ] `BALANCE.physics` with SOLIDUS_TEMP, LIQUIDUS_TEMP, ARC_HEAT_INPUT, POOL_VISCOSITY, THERMAL_DIFFUSIVITY, POOL_SURFACE_TENSION
    - [ ] `BALANCE.spatter` with POOL_SIZE=512, GRAVITY=980, BOUNCE_VELOCITY_FACTOR=-0.3, STICK_LIFE_THRESHOLD=0.1, ARC_FACTOR_MIN/MAX, DECAY_RATE
    - [ ] `BALANCE.arc` with IDEAL_ARC_FACTOR, BROKEN_ARC_FACTOR, SHORT_CIRCUIT_THRESHOLD, VOLTAGE_PER_MM, MIN_ARC_LENGTH
    - [ ] `BALANCE.slag` with HARDNESS_INITIAL/MAX, HARDNESS_GROWTH_RATE, CHIP_RESISTANCE, THICKNESS_FACTOR
    - [ ] `BALANCE.heatDiffusion` with GAUSSIAN_SIGMA, INTENSITY_INITIAL, DECAY_RATE, COLOR_HOT, COLOR_COLD
    - [ ] `BALANCE.bead` with WIRE_FEED_FACTOR, HEIGHT_PER_AMP, COOLING_RATE, BASE_WIDTH, WIDTH_PER_AMP
    - [ ] `BALANCE.tick` with FIXED_DT=1/60, MAX_DT=0.1, MAX_POOL_COLS=64, MAX_POOL_ROWS=32
    - [ ] All values match config-constants.md exactly
    - [ ] No magic numbers in physics modules
  - DO NOT TOUCH: any physics module file

---

## Phase 2: Core Modules

- [x] M1-003 **Create `src/physics/ArcPhysics.js`**
  - FILES: `src/physics/ArcPhysics.js`, `tests/unit/physics/ArcPhysics.test.js`
  - DEPENDS ON: M1-001, M1-002
  - DESCRIPTION: Arc state machine — computes arc length from electrode position, derives voltage (V = arcLength × VOLTAGE_PER_MM), heat input (Q = I × V × η × dt), travel angle. Status: OK | broken | short. Exports `createArcPhysics() → IArcPhysics`.
  - ACCEPTANCE CRITERIA:
    - [ ] `updateArc(mouseY, surfaceY, amperage, electrodeType) → ArcState` implemented
    - [ ] Heat input clamped by MAX_DT
    - [ ] Status transitions: OK → broken if arc > IDEAL_ARC × 3; OK → short if arc < 0.5px
    - [ ] All constants from BALANCE.arc
    - [ ] JSDoc on every exported function
    - [ ] Test: arc length calc, heat input calc, status transitions
    - [ ] RULE-007: test file created
  - DO NOT TOUCH: other physics modules

- [x] M1-004 **Create `src/physics/WeldPool.js`**
  - FILES: `src/physics/WeldPool.js`, `tests/unit/physics/WeldPool.test.js`
  - DEPENDS ON: M1-001, M1-002
  - DESCRIPTION: 2D grid of PoolCells. Methods: `applyHeat(col, row, heat, dt)`, `diffuse(dt)`, `fluidStep()`, `solidify()`. Grid size from BALANCE.tick MAX_POOL_COLS/ROWS. Explicit FDM diffusion — stability validated as `dt <= dx²/(4α)`.
  - ACCEPTANCE CRITERIA:
    - [x] Grid initialized with temperature=20 (ambient)
    - [x] `applyHeat`: temperature increase at electrode position
    - [x] `diffuse`: 4-connected neighbours explicit FDM using THERMAL_DIFFUSIVITY
    - [x] `fluidStep`: liquid mass shifts downhill, viscosity-limited via POOL_VISCOSITY
    - [x] `solidify`: cells where temp < SOLIDUS_TEMP → solid=true; top cell of column → slag=true flag
    - [x] All constants from BALANCE.physics
    - [x] JSDoc on every exported function
    - [x] Test: diffuse calc, solidify threshold, grid dimensions
    - [x] RULE-007: test file created
  - DO NOT TOUCH: other physics modules

- [x] M1-005 **Create `src/physics/BeadAccumulator.js`**
  - FILES: `src/physics/BeadAccumulator.js`, `tests/unit/physics/BeadAccumulator.test.js`
  - DEPENDS ON: M1-004 (needs WeldPool's column data)
  - DESCRIPTION: Column array tracking bead height and slag state. Reads liquid pool cells per column, increments height. Sets `column.hasSlag` when top cell solidifies. Exports `createBeadAccumulator() → IBeadAccumulator`.
  - ACCEPTANCE CRITERIA:
    - [x] `deposit(poolCells, dt)`: liquid cells → column height increment
    - [x] Height per amp from BALANCE.bead HEIGHT_PER_AMP
    - [x] `column.hasSlag` set when top cell of column solidifies (from WeldPool.solidify)
    - [x] All constants from BALANCE.bead
    - [x] JSDoc on every exported function
    - [x] Test: height calculation, hasSlag flag propagation
    - [x] RULE-007: test file created
  - DO NOT TOUCH: other physics modules

- [x] M1-006 **Create `src/physics/SlagLayer.js`**
  - FILES: `src/physics/SlagLayer.js`, `tests/unit/physics/SlagLayer.test.js`
  - DEPENDS ON: M1-004 (needs WeldPool solidification)
  - DESCRIPTION: Slag segment management. Reads `column.hasSlag`, creates SlagSegment[]. Chip mechanic: hardness grows from HARDNESS_INITIAL → HARDNESS_MAX at HARDNESS_GROWTH_RATE/s. Drag force vs CHIP_RESISTANCE triggers chip break. Detects INCLUSION defect (hasSlag && !slagRemoved). Exports `createSlagLayer() → ISlagLayer`.
  - ACCEPTANCE CRITERIA:
    - [x] `createSlagLayer(beadColumns)`: reads hasSlag, creates SlagSegment[]
    - [x] `chip(hardness, dragForce)`: returns true if dragForce > CHIP_RESISTANCE × hardness
    - [x] INCLUSION defect flag: hasSlag && !slagRemoved
    - [x] Slag thickness = bead height × THICKNESS_FACTOR
    - [x] All constants from BALANCE.slag
    - [x] JSDoc on every exported function
    - [x] Test: chip threshold logic, inclusion defect detection
    - [x] RULE-007: test file created
  - DO NOT TOUCH: other physics modules

- [x] M1-007 **Create `src/physics/SpatterSystem.js`**
  - FILES: `src/physics/SpatterSystem.js`, `tests/unit/physics/SpatterSystem.test.js`
  - DEPENDS ON: M1-001, M1-002
  - DESCRIPTION: Pre-allocated 512-particle pool (POOL_SIZE). `emit(arcState, baseRate)`: rate = baseRate × arc_factor (clamped 0.5–4.0). `tick(dt, surfaceY)`: gravity (980 px/s²), one bounce (vy *= -0.3), stick when life < 0.1. `getActive() → SpatterParticle[]`. Zero allocations in tick(). Exports `createSpatterSystem() → ISpatterSystem`.
  - ACCEPTANCE CRITERIA:
    - [x] POOL_SIZE=512 pre-allocated on construction, no allocations in tick()
    - [x] `emit`: arc_factor = clamp(arc_length / IDEAL_ARC, 0.5, 4.0)
    - [x] `tick`: gravity applied, one bounce, stick logic
    - [x] `getActive`: returns all particles with life > 0
    - [x] All constants from BALANCE.spatter
    - [x] JSDoc on every exported function
    - [x] Test: pool exhaustion (emit > 512), bounce/stick logic
    - [x] RULE-007: test file created
  - DO NOT TOUCH: other physics modules

- [x] M1-008 **Create `src/physics/HeatDiffusion.js`**
  - FILES: `src/physics/HeatDiffusion.js`, `tests/unit/physics/HeatDiffusion.test.js`
  - DEPENDS ON: M1-001, M1-002
  - DESCRIPTION: Off-screen canvas for HAZ. On first solidification per column: Gaussian spread (σ=GAUSSIAN_SIGMA) centered on column. Intensity decays at DECAY_RATE/s. Exports `createHeatDiffusion() → IHeatDiffusion`. `compute(beadColumns)` writes to canvas. Canvas composited by renderer.
  - ACCEPTANCE CRITERIA:
    - [x] Off-screen canvas created at init
    - [x] `compute(beadColumns)`: Gaussian spread on first solidification per column
    - [x] HAZ particle array output for renderer
    - [x] Intensity: INTENSITY_INITIAL decaying at DECAY_RATE/s
    - [x] Colors: COLOR_HOT → COLOR_COLD gradient
    - [x] All constants from BALANCE.heatDiffusion
    - [x] JSDoc on every exported function
    - [x] Test: Gaussian spread, decay over time, color gradient
    - [x] RULE-007: test file created
  - DO NOT TOUCH: other physics modules

---

## Phase 3: Facade + Integration

- [ ] M1-009 **Create `src/physics/PhysicsEngine.js`**
  - FILES: `src/physics/PhysicsEngine.js`, `tests/unit/physics/PhysicsEngine.test.js`
  - DEPENDS ON: M1-003 through M1-008
  - DESCRIPTION: Facade composing all 6 modules. `createPhysics() → IPhysicsEngine`. `tick(dt)`: fixed phase order — ArcPhysics → WeldPool (applyHeat → diffuse → fluidStep → solidify) → BeadAccumulator → SlagLayer → SpatterSystem → HeatDiffusion. Logger for tick timing (RULE-006).
  - ACCEPTANCE CRITERIA:
    - [ ] `createPhysics()` instantiates all 6 modules
    - [ ] `tick(dt)`: correct phase order per design.md §Tick order
    - [ ] Fixed dt clamped by MAX_DT
    - [ ] Each phase delegated to correct module
    - [ ] Logger service for tick timing (no console.log — RULE-006)
    - [ ] JSDoc on every exported function
    - [ ] Test: full tick sequence, phase order, dt clamping
    - [ ] RULE-007: test file created
  - DO NOT TOUCH: other physics modules

---

## Phase 4: Verification

- [ ] M1-010 **Run lint + tests for all modules**
  - FILES: all `src/physics/*.js`, all `tests/unit/physics/*.test.js`
  - DEPENDS ON: M1-001 through M1-009
  - DESCRIPTION: After all modules are implemented, run full test suite and lint across all physics files.
  - ACCEPTANCE CRITERIA:
    - [ ] All tests pass
    - [ ] All files pass lint
    - [ ] No console.log violations (RULE-006)
    - [ ] No magic numbers (RULE-004)
    - [ ] Every exported function has JSDoc (RULE-003)