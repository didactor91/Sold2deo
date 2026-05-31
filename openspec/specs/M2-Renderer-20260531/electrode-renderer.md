# ElectrodeRenderer Specification

## Purpose

Renders the electrode stick, holder, arc glow with process-specific colour, droplet animation, and smoke wisps.

## Requirements

### Requirement: Electrode Stick Rendering

The system SHALL draw the electrode stick as a coloured rectangle that shrinks as it is consumed.

#### Scenario: Rutile electrode renders blue stick

- GIVEN `electrode.type = 'rutile'`
- WHEN the electrode is rendered
- THEN the stick rectangle fill is the rutile colour from config

#### Scenario: Stick length decreases over time

- GIVEN `electrode.consumed` percentage
- WHEN the electrode is rendered
- THEN the stick rectangle height reflects remaining length

### Requirement: Electrode Holder

The system SHALL draw a grey clamp/holder above the stick.

#### Scenario: Holder rendered above stick

- GIVEN holder dimensions from config
- WHEN the electrode is rendered
- THEN a grey (`#555555`) clamp is drawn above the stick

### Requirement: Arc Glow with Process Colour

The system SHALL draw a radial gradient arc glow at the electrode tip with process-specific colour.

| Process   | Arc Glow Colour |
|-----------|-----------------|
| Rutile    | `#4488ff`       |
| Basic     | `#6644ff`       |
| Cellulosic| `#ff8800`       |

#### Scenario: Rutile arc glow is blue

- GIVEN `electrode.type = 'rutile'` and `arc.established = true`
- WHEN arc glow is rendered
- THEN radial gradient centre colour is `#4488ff`

#### Scenario: Arc glow radius proportional to amperage

- GIVEN amperage value from `state.arc`
- WHEN arc glow is rendered
- THEN gradient radius = `baseRadius * (amperage / referenceAmperage)`

### Requirement: FPS Guard — Solid Ring Fallback

The system SHALL fall back to solid concentric colour rings when fps < 55.

#### Scenario: Low FPS triggers solid rings

- GIVEN fps < 55 over last 10 frames
- WHEN arc glow is rendered
- THEN 3 concentric solid rings are drawn (no radial gradient)
- AND rings use the same process colour

### Requirement: Droplet Animation

The system SHALL draw a sphere droplet at the arc tip that detaches and falls with gravity.

#### Scenario: Droplet oscillates before detachment

- GIVEN droplet `life > detachmentThreshold`
- WHEN droplet is rendered
- THEN a filled circle is drawn at arc tip
- AND position oscillates ±2px horizontally

#### Scenario: Droplet detaches and falls

- GIVEN droplet `life <= detachmentThreshold`
- WHEN droplet is rendered
- THEN the sphere falls with gravity applied
- AND position updates each frame until reaching pool

### Requirement: Smoke Wisps

The system SHALL emit 3–5 smoke particles per tick with upward drift and alpha fade.

#### Scenario: Smoke rises and fades

- GIVEN 3–5 new smoke particles spawned per tick
- WHEN smoke is rendered
- THEN each particle drifts upward (`vy < 0`)
- AND alpha decreases from `0.6` to `0` over particle lifetime

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
 * @typedef {Object} ArcState
 * @property {number} arcLength
 * @property {boolean} arcEstablished
 * @property {number} voltage
 * @property {number} heatInput
 */

/**
 * @typedef {Object} Droplet
 * @property {number} x
 * @property {number} y
 * @property {number} vy
 * @property {number} life
 * @property {boolean} detached
 */
```

## Acceptance Criteria

- [ ] Electrode stick colour matches process type
- [ ] Stick length reflects consumption
- [ ] Holder rendered as grey clamp
- [ ] Arc glow uses correct colour per process
- [ ] Arc glow radius scales with amperage
- [ ] Solid ring fallback at fps < 55
- [ ] Droplet oscillates then falls with gravity
- [ ] Smoke: 3–5 particles/tick, upward drift, alpha fade
- [ ] All constants from `src/config/renderer.js`
