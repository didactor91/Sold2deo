# Proposal: M1-Physics — Physics Engine Bootstrap

## Intent

Build the M1 physics engine layer from scratch. The repo is freshly bootstrapped — no physics code exists. This proposal defines scope, modules, and a first implementation slice for the molten pool, bead, slag, spatter, arc, and heat diffusion subsystems defined in SDD-001 §1.

## Scope

### In Scope
- `src/physics/WeldPool.js` — 2D grid particle fluid sim with heat diffusion (FDM)
- `src/physics/BeadAccumulator.js` — pixel-column deposition and solidification tracking
- `src/physics/SlagLayer.js` — slag deposition, chip mechanic, inclusion defect detection
- `src/physics/SpatterSystem.js` — 512-particle pre-allocated pool with gravity/bounce
- `src/physics/ArcPhysics.js` — arc length validation, state machine, heat input calc
- `src/physics/HeatDiffusion.js` — HAZ Gaussian spread (off-screen canvas, composited)
- `src/config/balance.js` — all physics constants (no magic numbers, documented sources)
- `src/types/physics.d.ts` — JSDoc TypeScript definitions for all physics types
- Unit tests for each module (Vitest, 90% coverage target)

### Out of Scope
- Renderer integration (M2)
- Game loop integration (M3)
- Audio integration (M4)
- Scoring engine (M3)
- Any backend code (M6)

## Capabilities

### New Capabilities
- `weld-pool`: Molten pool fluid simulation with 2D grid, heat diffusion via explicit FDM, solidification detection, slag emission flag
- `bead-accumulator`: Pixel-column deposition array with temperature tracking and slag state per column
- `slag-layer`: Slag segment array with hardness, chip detection, and inclusion defect flagging
- `spatter-system`: Pre-allocated 512-particle pool, gravity, one-bounce stick behaviour, arc-length-driven emission
- `arc-physics`: Arc state validation (ok/short/long/broken), voltage derived from arc length, heat input calculation
- `heat-diffusion`: Off-screen HAZ canvas with Gaussian colour spread per solidified column

### Modified Capabilities
- None (fresh repo — no existing specs)

## Approach

Implement each module as a standalone ES2022 class with no dependencies on other physics modules. Cross-module communication via typed return values only (no shared mutable state).

Tick order within a physics step:
1. `ArcPhysics.update(electrodePos, surfaceY, amperage)` → `ArcState`
2. `WeldPool.applyHeat(arcState)` → pool cells updated
3. `WeldPool.diffuse()` → FDM heat spread
4. `WeldPool.fluidStep()` → mass shift downhill
5. `BeadAccumulator.deposit(poolCells)` → column heights updated
6. `SlagLayer.deposit(poolCells)` → slag segments added
7. `SpatterSystem.emit(arcState)` → particle pool refills
8. `SpatterSystem.tick(dt)` → positions, gravity, life decay
9. `HeatDiffusion.compute(beadColumns)` → HAZ canvas updated

All constants in `balance.js`. No magic numbers in physics modules.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/physics/` | New | All physics modules (6 files) |
| `src/config/balance.js` | New | Physics constants, documented sources |
| `src/types/physics.d.ts` | New | Type definitions |
| `tests/unit/` | New | One test file per physics module |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| 2D FDM explicit scheme unstable at large dt | Low | Fixed 60Hz tick, accumulator clamp (max 100ms) |
| Pool grid resolution trade-off (perf vs accuracy) | Medium | Start 64×32 cells, profile at 60fps, scale if headroom |
| Slag chip detection feel (player feedback) | Medium | Delay chip mechanic to M3, use placeholder flag for now |
| Spatter particle pool exhausts during heavy arc | Low | Arc factor caps emission rate; 512 capacity is generous |

## Rollback Plan

- Delete `src/physics/` and `src/config/balance.js`
- No DB migrations needed (no backend yet)
- No renderer to detach (not integrated yet)
- Revert: remove files, zero side-effects

## Dependencies

- None (fresh repo, no existing physics code)

## Success Criteria

- [ ] `src/physics/WeldPool.js` — heat application, diffusion, fluid step, solidification flag
- [ ] `src/physics/BeadAccumulator.js` — column deposition from pool state
- [ ] `src/physics/SlagLayer.js` — slag segments, chip detection, inclusion flag
- [ ] `src/physics/SpatterSystem.js` — 512 pool, emit, tick, bounce, stick
- [ ] `src/physics/ArcPhysics.js` — arc state, voltage, heat input
- [ ] `src/physics/HeatDiffusion.js` — off-screen HAZ canvas
- [ ] `src/config/balance.js` — all physics constants with source comments
- [ ] `src/types/physics.d.ts` — PoolCell, BeadColumn, SlagSegment, SpatterParticle, ArcState types
- [ ] All 6 unit test files pass (`npx vitest run`)
- [ ] ESLint passes with zero errors