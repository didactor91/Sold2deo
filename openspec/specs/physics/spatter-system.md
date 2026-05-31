# SpatterSystem Specification

## Purpose
Pre-allocated 512-particle pool with gravity, one-bounce stick behaviour, arc-length-driven emission.

## Types
```js
/**
 * @typedef {Object} SpatterParticle
 * @property {number} x
 * @property {number} y
 * @property {number} vx
 * @property {number} vy
 * @property {number} life - 0–1, decreasing
 * @property {boolean} active
 * @property {string} color
 */
```

## Constants (balance.js)
| Constant | Value | Source |
|----------|-------|--------|
| POOL_SIZE | 512 | pre-allocated |
| GRAVITY | 980 px/s² | Earth gravity |
| BOUNCE_VELOCITY_FACTOR | -0.3 | one bounce |
| STICK_LIFE_THRESHOLD | 0.1 | stick when life < 0.1 |
| ARC_FACTOR_MIN | 0.5 | clamp lower bound |
| ARC_FACTOR_MAX | 4.0 | clamp upper bound |

## Public API
```js
/**
 * @returns {SpatterSystem}
 */
function createSpatterSystem() {}

/**
 * @param {ArcState} arcState
 * @param {number} baseRate - particles per second
 */
SpatterSystem.prototype.emit(arcState, baseRate) {}

/**
 * @param {number} dt - seconds
 * @param {number} surfaceY - workpiece surface Y
 */
SpatterSystem.prototype.tick(dt, surfaceY) {}

/** @returns {SpatterParticle[]} */
SpatterSystem.prototype.getActive() {}
```

## Requirements

### Requirement: Pre-allocated Pool
The system MUST pre-allocate exactly 512 SpatterParticles on creation. No allocations during game loop.

#### Scenario: Pool initialization
- GIVEN createSpatterSystem()
- WHEN called
- THEN 512 particles created
- AND all active=false

### Requirement: Emission Rate
The system MUST emit at rate = baseRate × arc_factor where arc_factor = clamp(arc_length / ideal_arc, 0.5, 4.0).

#### Scenario: Arc too long increases spatter
- GIVEN arcState.arcLength = 8px, ideal_arc = 2px
- WHEN emit(arcState, 100)
- THEN arc_factor = 4.0 (clamped)
- AND emission rate = 400/s

### Requirement: Gravity
The system MUST apply gravity (0, 980 px/s²) to all active particles each tick.

#### Scenario: Particle falls
- GIVEN active particle at y=100, vy=0
- WHEN tick(0.016, surfaceY=500)
- THEN vy += 980 × 0.016
- AND y += vy × dt

### Requirement: One Bounce
The system MUST reverse vy on surface hit: vy *= -0.3. Only one bounce per particle.

#### Scenario: Particle bounces once
- GIVEN particle with vy=100, hitting surface
- WHEN tick(dt, surfaceY)
- THEN vy = -30 (bounced)
- AND bounced flag set, no further bounces

### Requirement: Stick
The system MUST mark particle stuck when life < STICK_LIFE_THRESHOLD. Stuck particles remain active but immobile.

#### Scenario: Particle sticks
- GIVEN particle with life=0.1
- WHEN tick(dt, surfaceY)
- THEN particle sticks
- AND position frozen

### Requirement: Life Decay
The system MUST reduce life each tick: life -= decay_rate × dt.

#### Scenario: Life decreases
- GIVEN particle with life=0.5
- WHEN tick(0.016, surfaceY)
- THEN life decreases
- AND particle deactivated when life ≤ 0

## Edge Cases
| Case | Handling |
|------|----------|
| Pool exhausted | No emission, continue with active |
| Negative vy on bounce | Set vy=0, no reverse |
| Particle off-screen | Deactivate immediately |
| dt > 100ms | Clamp to 100ms |
