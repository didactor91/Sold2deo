# Tasks: M2 — Side-View Renderer

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~850–950 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 → PR 2 → PR 3 → PR 4 |
| Delivery strategy | auto-forecast |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Config + Types + colorUtils + BackgroundRenderer | PR1 | Base dependency for all renderers |
| 2 | 4 sub-renderers (Workpiece, Electrode, Particle, UI) | PR 2 | Independent — can parallelize |
| 3 | SceneRenderer + index barrel | PR 3 | Depends on PR 1 + PR 2 |
| 4 | All 6 test files | PR 4 | Depends on PR 3 |

## Phase 1: Foundation / Config / Types

- [x] M2-001 **Create `src/config/renderer.js`** — All colour constants from config-colors.md. Exports: TEMP_COLOURS map, ARC_GLOW_COLOURS, BASE_METAL, SLAG_FILL, SLAG_CRUST, HAZ_BLOOM, UI_SCORE_COLOUR, UI_ARC_OK/SHORT/LONG/BROKEN, FPS_FALLBACK=55, PARTICLE_RADIUS=1, MAX_PARTICLES=512, SMOKE_MIN/MAX/ALPHA_MAX. No magic numbers.
  - DEPENDS ON: []
  - FILES: `src/config/renderer.js`
  - DO NOT TOUCH: All other files

- [x] M2-002 **Create `src/types/renderer.d.ts`** — TypeScript typedefs. Export: `ElectrodeType`, `GameState`, `ElectrodeConfig`, `BeadColumn`, `SlagSegment`, `SpatterParticle`, `ArcState`, `Droplet`, `SubRenderer` interface (`{ render(ctx, state, interpolation): void }`).
  - DEPENDS ON: []
  - FILES: `src/types/renderer.d.ts`
  - DO NOT TOUCH: All other files

- [x] M2-003 **Create `src/renderer/colorUtils.js`** — Temperature-to-colour mapping (6 thresholds from config) + `processColor(type)` lookup. Pure functions, fully unit-testable.
  - DEPENDS ON: [M2-001]
  - FILES: `src/renderer/colorUtils.js`
  - DO NOT TOUCH: All other files

- [x] M2-004 **Create `src/renderer/BackgroundRenderer.js`** — Layer 0. Creates off-screen `bgCanvas`, draws base metal rect once at init. Exposes `redraw()` called on resize. Composites via `ctx.drawImage()` each frame.
  - DEPENDS ON: [M2-001, M2-002]
  - FILES: `src/renderer/BackgroundRenderer.js`
  - DO NOT TOUCH: All other files

## Phase 2: Sub-Renderers

- [x] M2-005 **Create `src/renderer/ParticleRenderer.js`** — Layer 5. Iterates `state.particles` (active only). Batches by `color` group: one `beginPath()` + N×`arc()` + one `fill()` per unique colour. Radius from config. Alpha from `particle.life`.
  - DEPENDS ON: [M2-001, M2-002]
  - FILES: `src/renderer/ParticleRenderer.js`
  - DO NOT TOUCH: All other files

- [x] M2-006 **Create `src/renderer/WorkpieceRenderer.js`** — Layers 1–4. Base metal rect, bead columns with temperature-mapped colour + rounded caps, slag fill+crust, HAZ composite from `hazCanvas`. Reads `state.workpiece`, `state.beadColumns`, `state.slagSegments`.
  - DEPENDS ON: [M2-001, M2-002, M2-004]
  - FILES: `src/renderer/WorkpieceRenderer.js`
  - DO NOT TOUCH: All other files

- [x] M2-007 **Create `src/renderer/ElectrodeRenderer.js`** — Layers 6–7. Electrode stick (shrinks with consumption), grey holder clamp, arc glow (radial gradient, scales with amperage), FPS guard (<55fps →3 solid concentric rings), droplet animation (oscillate then fall), smoke wisps (3–5/tick, upward drift, alpha fade).
  - DEPENDS ON: [M2-001, M2-002]
  - FILES: `src/renderer/ElectrodeRenderer.js`
  - DO NOT TOUCH: All other files

- [x] M2-008 **Create `src/renderer/UIRenderer.js`** — Layer 8. Score text top-left (`12px monospace`, white), arc status badge (coloured by status ok/short/long/broken), chip mode indicator (`[C] CHIP MODE` in orange when active, hidden when false). Canvas-only, no DOM.
  - DEPENDS ON: [M2-001, M2-002]
  - FILES: `src/renderer/UIRenderer.js`
  - DO NOT TOUCH: All other files

## Phase 3: Orchestration / Integration

- [x] M2-009 **Create `src/renderer/SceneRenderer.js`** — Master compositor. `render(ctx, state, interpolation)` calls sub-renderers in layer order 0–8. Each layer wrapped in `ctx.save()`/`ctx.restore()`. Tracks rolling average of last 10 frame deltas for FPS guard. Passes `interpolation` to all sub-renderers.
  - DEPENDS ON: [M2-004, M2-005, M2-006, M2-007, M2-008]
  - FILES: `src/renderer/SceneRenderer.js`
  - DO NOT TOUCH: All other files

- [x] M2-010 **Create `src/renderer/index.js`** — Barrel export. Re-exports all renderer modules and `colorUtils`. Default export: `SceneRenderer`.
  - DEPENDS ON: [M2-003, M2-004, M2-005, M2-006, M2-007, M2-008, M2-009]
  - FILES: `src/renderer/index.js`
  - DO NOT TOUCH: All other files

## Phase 4: Testing

- [x] M2-011 **Create `tests/unit/renderer/renderer.test.js`** — Test colour constants exported from `src/config/renderer.js`. Verify all keys exist and are non-empty strings.
  - DEPENDS ON: [M2-001]
  - FILES: `tests/unit/renderer/renderer.test.js`
  - DO NOT TOUCH: All other files

- [x] M2-012 **Create `tests/unit/renderer/colorUtils.test.js`** — Table-driven tests for `temperatureToColor()`: verify all 6 thresholds return correct hex. Parametrised tests for `processColor()`: rutile → `#4488ff`, basic → `#6644ff`, cellulosic → `#ff8800`.
  - DEPENDS ON: [M2-003]
  - FILES: `tests/unit/renderer/colorUtils.test.js`
  - DO NOT TOUCH: All other files

- [x] M2-013 **Create `tests/unit/renderer/ParticleRenderer.test.js`** — Mock canvas ctx. Spy on `beginPath`/`fill`. Assert inactive particles are skipped. Assert same-colour particles share one fill call. Assert max particle limit respected.
  - DEPENDS ON: [M2-005]
  - FILES: `tests/unit/renderer/ParticleRenderer.test.js`
  - DO NOT TOUCH: All other files

- [x] M2-014 **Create `tests/unit/renderer/WorkpieceRenderer.test.js`** — Mock canvas ctx. Assert base metal rect drawn with correct colour. Assert bead column uses temperature colour. Assert rounded cap uses `ctx.arc()`. Assert slag fill + crust colours. Assert HAZ composited via `drawImage`.
  - DEPENDS ON: [M2-006]
  - FILES: `tests/unit/renderer/WorkpieceRenderer.test.js`
  - DO NOT TOUCH: All other files

- [x] M2-015 **Create `tests/unit/renderer/ElectrodeRenderer.test.js`** — Mock canvas ctx. Assert stick colour matches process type. Assert FPS guard triggers solid rings at<55fps (mock `performance.now()`). Assert droplet oscillation before detachment threshold. Assert smoke count3–5.
  - DEPENDS ON: [M2-007]
  - FILES: `tests/unit/renderer/ElectrodeRenderer.test.js`
  - DO NOT TOUCH: All other files

- [x] M2-016 **Create `tests/unit/renderer/UIRenderer.test.js`** — Mock canvas ctx. Assert score text drawn with correct font/colour. Assert arc status badge uses correct colour per status. Assert chip mode text shown/hidden by `chipMode` flag.
  - DEPENDS ON: [M2-008]
  - FILES: `tests/unit/renderer/UIRenderer.test.js`
  - DO NOT TOUCH: All other files

- [x] M2-017 **Create `tests/unit/renderer/SceneRenderer.test.js`** — Integration test. Mock canvas ctx. Assert sub-renderers called in layer order 0–8. Assert each layer wrapped in `save()`/`restore()`. Assert interpolation passed to sub-renderers.
  - DEPENDS ON: [M2-009]
  - FILES: `tests/unit/renderer/SceneRenderer.test.js`
  - DO NOT TOUCH: All other files
