# SKILL-renderer.md — Canvas Renderer Subagent

## YOUR ROLE
You implement the 2D Canvas rendering pipeline for Weld Master. Side-profile view. 8-bit arcade aesthetic with semi-realistic physics visuals. You never touch physics logic — you only read state and draw.

## ENVIRONMENT
- Vanilla JS ES2022. Single `<canvas>` element. No WebGL.
- Canvas 2D API only. No external drawing libraries.
- Target: 60fps stable. Budget per frame: < 4ms render time (physics gets the other ~12ms).
- Resolution: 800×400 canvas, CSS-scaled to container. `devicePixelRatio` handled in init.

## LAYERING CONTRACT

Renderers draw in this fixed order. Do not reorder:

```
0. Background (once, static)       fillRect #0a0a0a + pixel grid
1. Workpiece base                  flat rect #2a2a2a
2. HAZ layer                       off-screen canvas, globalAlpha 0.6
3. Bead columns                    temp-mapped colour per column
4. Slag                            brown rects on top of bead
5. Spatter debris                  stuck particles (static after landing)
6. Active spatter particles        moving particles
7. Arc glow                        radial gradient at electrode tip
8. Electrode                       rect + holder
9. Droplet                         small circle at arc tip
10. Smoke                          rising alpha-fade particles
11. HUD overlay                    score, alerts, arc length indicator
```

Each layer is a function. SceneRenderer calls them in order. Never combine layers.

## RENDERING STANDARDS

1. **No allocations in hot path.** Pre-allocate all arrays, reuse objects. No `new Array()` or object literals inside render functions called every frame.
2. **Batch draw calls.** Group same-colour fills into single `beginPath()` → `fill()` call.
3. **Dirty regions.** Static layers (background, workpiece base) drawn once to off-screen canvas, composited every frame. Only dynamic layers re-drawn per frame.
4. **No gradient on arc during < 55fps.** Fallback to concentric solid-colour rings.
5. **Pixel grid:** 1px lines, `#1a1a1a`, every 10px, drawn once to static layer.
6. **All colours from constants.** `/src/config/rendering.js` — not hardcoded in renderer.
7. **`ctx.save()` / `ctx.restore()`** around every layer function.

## REQUIRED EXPORTS

### SceneRenderer.js
```js
export function initRenderer(canvas) {}  // sets up layers, DPR, off-screen canvases
export function render(state, interpolation) {}  // main entry, called every frame
export function resizeRenderer(width, height) {}
```

### ElectrodeRenderer.js
```js
export function drawElectrode(ctx, electrode, position, angle, arcState) {}
export function drawArcGlow(ctx, arcState, position, fps) {}
export function drawDroplet(ctx, droplet) {}
export function drawSmoke(ctx, smokeParticles) {}
```

### WorkpieceRenderer.js
```js
export function drawBaseMetalLayer(ctx, workpiece) {}  // to off-screen
export function drawBeadColumns(ctx, beadColumns) {}
export function drawHAZLayer(ctx, hazCanvas, beadColumns) {}
```

### ParticleRenderer.js
```js
export function drawSpatterParticles(ctx, particles) {}
export function drawSlagLayer(ctx, slagSegments, beadColumns) {}
```

### UIRenderer.js
```js
export function drawHUD(ctx, hudState) {}  // score, quality %, alerts
export function drawArcLengthIndicator(ctx, arcState, position) {}
export function drawDefectMarkers(ctx, defects) {}
```

## COLOUR PALETTE — /src/config/rendering.js

```js
export const COLORS = {
  background:      '#0a0a0a',
  grid:            '#1a1a1a',
  workpiece:       '#2a2a2a',
  workpieceEdge:   '#3a3a3a',
  bead: {
    molten_peak:   '#ffff00',  // > 1500°C
    molten_hot:    '#ff8800',  // > 1200°C
    molten_mid:    '#ff3300',  // > 900°C
    cooling:       '#cc1100',  // > 600°C
    warm:          '#661100',  // > 300°C
    solid:         '#3a2010',  // ≤ 300°C
  },
  slag: {
    fresh:         '#3a1f00',
    crust:         '#5a3010',
    removed:       '#1a0a00',
  },
  arc: {
    rutile:        '#4488ff',
    basic:         '#6644ff',
    cellulosic:    '#ff8800',
    stainless:     '#88aaff',
  },
  spatter:         '#ff6600',
  smoke:           '#444444',
  haz:             '#1a0500',
  hud: {
    ok:            '#00ff00',
    warn:          '#ffaa00',
    error:         '#ff0000',
    text:          '#cccccc',
  },
};
```

## PERFORMANCE TEST

Renderer must maintain 60fps on a 2019 MacBook Pro (Chrome). Benchmark:
```js
// Render 512 spatter particles + 800 bead columns + arc glow
// Expected: < 4ms per frame
```

Test with `performance.now()` around render call in integration test.
