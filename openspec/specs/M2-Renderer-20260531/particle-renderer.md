# ParticleRenderer Specification

## Purpose

Renders spatter particles and stuck debris using batched canvas draw calls for performance.

## Requirements

### Requirement: Active Particle Iteration

The system SHALL iterate only `particle.active === true` particles.

#### Scenario: Inactive particles skipped

- GIVEN a `Particle` pool where only 50 of 512 are active
- WHEN `ParticleRenderer.render()` is called
- THEN only the 50 active particles are processed
- AND inactive particles are not drawn

### Requirement: 2px Circle Rendering

The system SHALL draw each active particle as a 2px filled circle.

#### Scenario: Active particle drawn as 2px circle

- GIVEN an active `SpatterParticle` at `(x, y)`
- WHEN particles are rendered
- THEN `ctx.arc(x, y, 1, 0, Math.PI * 2)` is called
- AND `ctx.fill()` renders a 2px diameter circle

### Requirement: Life-Based Alpha

The system SHALL set particle alpha based on `particle.life` (0–1).

#### Scenario: Full-life particle is opaque

- GIVEN `particle.life = 1.0`
- WHEN particle is rendered
- THEN `ctx.globalAlpha = 1.0`

#### Scenario: Dying particle fades

- GIVEN `particle.life = 0.3`
- WHEN particle is rendered
- THEN `ctx.globalAlpha = 0.3`

### Requirement: Colour from Particle

The system SHALL use `particle.color` for the fill colour.

#### Scenario: Particle uses its stored colour

- GIVEN `particle.color = '#ff8800'`
- WHEN particle is rendered
- THEN `ctx.fillStyle = '#ff8800'`

### Requirement: Batch Fill Per Colour Group

The system SHALL batch draw calls by colour group — one `beginPath()` + `fill()` per unique colour.

#### Scenario: Same-colour particles batched

- GIVEN 10 active particles with `color = '#ff8800'`
- WHEN particles are rendered
- THEN a single `ctx.beginPath()` is called
- AND all 10 circles are added before `ctx.fill()`
- AND `ctx.fill()` is called once for the group

#### Scenario: Different colours use separate batches

- GIVEN 5 particles with `#ff8800` and 3 with `#ffff00`
- WHEN particles are rendered
- THEN `#ff8800` batch: one `beginPath`, 5 circles, one `fill`
- AND `#ffff00` batch: one `beginPath`, 3 circles, one `fill`

## Public API

```js
/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} state
 * @param {number} interpolation
 */
function render(ctx, state, interpolation) {}
```

## Types

```js
/**
 * @typedef {Object} SpatterParticle
 * @property {number} x
 * @property {number} y
 * @property {number} vx
 * @property {number} vy
 * @property {number} life       - 0–1, decreasing
 * @property {boolean} active
 * @property {string} color
 */
```

## Acceptance Criteria

- [ ] Only `active === true` particles rendered
- [ ] Each particle: 2px diameter filled circle
- [ ] Alpha from `particle.life`
- [ ] Fill colour from `particle.color`
- [ ] Batched: one `beginPath()`/`fill()` per colour group
- [ ] Max 512 particles in pool
- [ ] All constants from `src/config/renderer.js`
