# Proposal: M2-Renderer — Side-View Compositor

## Intent

Implement the M2 side-view renderer as defined in SDD-001 §2. The renderer consumes M1 physics output (pool, bead, slag, particles, arc state) and produces the8-layer composited canvas view. This is the visual backbone of the game — no renderer means no visible game.

## Scope

### In Scope
- `src/renderer/SceneRenderer.js` — master compositor, calls sub-renderers in layer order
- `src/renderer/WorkpieceRenderer.js` — base metal, bead columns (temp-mapped), slag, HAZ compositing
- `src/renderer/ElectrodeRenderer.js` — stick, holder, arc glow (per-process colour), droplet, smoke wisps
- `src/renderer/ParticleRenderer.js` — batched spatter/debris draw (512 max)
- `src/renderer/UIRenderer.js` — HUD overlays on canvas (score, arc status, mode indicator)
- `src/config/renderer.js` — colour maps, arc glow radii, layer constants (no magic numbers)
- `src/types/renderer.d.ts` — type definitions for all renderer types
- Unit tests per module (Vitest, 90% coverage target)

### Out of Scope
- Audio integration (M4)
- Machine panel DOM (M4) — UIRenderer only handles canvas HUD, not DOM controls
- Scoring overlay (M3) — UIRenderer draws static HUD only
- Particle systems other than spatter/debris (slag chip particles deferred to M3)

## Capabilities

### New Capabilities
- `scene-renderer`: 8-layer master compositor (background → workpiece → HAZ → bead → slag → particles → arc → electrode → UI)
- `workpiece-renderer`: Base metal, temperature-mapped bead columns, slag layer, HAZ off-screen compositing
- `electrode-renderer`: Electrode stick, arc glow (rutile=#4488ff, basic=#6644ff, cellulosic=#ff8800), droplet with gravity, smoke wisps
- `particle-renderer`: Batched draw for512-particle pool, colour-grouped fill batching
- `ui-renderer`: Canvas HUD overlay (score, arc status, chip mode indicator)

### Modified Capabilities
- None (M1 physics already complete on `feature/M1-physics-s2`; renderer is new capability)

## Approach

Each renderer module is a pure draw function/class with no side effects. Inputs come entirely from the `GameState` object (or sub-objects). No magic numbers — all colour thresholds, radii, and constants live in `src/config/renderer.js`.

**Layer draw order (per SDD-001 §2):**
```
Layer 0: Background (static, drawn once, cached)
Layer 1: Workpiece base metal (#2a2a2a flat rect)
Layer 2: HAZ (off-screen hazCanvas, composited)
Layer 3: Bead columns (temperature colour map)
Layer 4: Slag layer
Layer 5: Spatter particles + stuck debris
Layer 6: Arc glow (radial gradient, radius ∝ amperage)
Layer 7: Electrode + droplet
Layer 8: UI overlay (HUD)
```

**Colour map (from SDD-001 §2.3):**
| Temperature | Colour |
|-------------|--------|
| > 1500°C | #ffff00 |
| > 1200°C | #ff8800 |
| > 900°C | #ff3300 |
| > 600°C | #cc1100 |
| > 300°C | #661100 |
| ≤ 300°C | #3a2010 |

**Performance rule:** If fps< 55, fall back from radial gradient arc glow to solid colour rings.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/renderer/` | New | 5 renderer modules |
| `src/config/renderer.js` | New | Colour maps, arc glow config, layer constants |
| `src/types/renderer.d.ts` | New | Renderer type definitions |
| `tests/unit/` | New | One test file per renderer module |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Arc glow radial gradient expensive at60fps | Medium | Profile first tick; implement solid-ring fallback behind a fps guard |
| HAZ off-screen canvas sync with main canvas | Low | HAZ canvas is pure draw-only; recompute only on new bead column solidification |
| Colour map mismatch with physics temperature scale | Low | Derive thresholds from `balance.js` constants (SOLIDUS_TEMP, etc.), not hardcoded |
| 512 particle batch draw performance | Low | ctx.beginPath() once per colour group, single fill() per group |

## Rollback Plan

- Delete `src/renderer/`, `src/config/renderer.js`, `src/types/renderer.d.ts`
- No other milestones affected (M2 is self-contained)
- No DB migrations or backend impact
- Revert: remove files, zero side-effects

## Dependencies

- **M1 PhysicsEngine** must be complete (on `feature/M1-physics-s2` per orchestrator). Renderer reads from `GameState.simulation.pool`, `.beadColumns`, `.slagSegments`, `.particles`, `.arc`. If M1 is not ready, this proposal cannot be implemented.
- `src/config/balance.js` from M1 (already exists)

## Success Criteria

- [ ] `SceneRenderer` calls all 5 sub-renderers in correct layer order
- [ ] `WorkpieceRenderer` draws bead columns with correct temperature colour map
- [ ] `ElectrodeRenderer` draws arc glow with correct process colour
- [ ] `ParticleRenderer` batches draws by colour group
- [ ] `UIRenderer` draws HUD overlay (score, arc status, chip mode)
- [ ] All constants in `src/config/renderer.js` (no magic numbers in modules)
- [ ] All 5 unit test files pass (`npx vitest run`)
- [ ] ESLint passes with zero errors
