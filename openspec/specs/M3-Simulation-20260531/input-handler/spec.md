# InputHandler Specification

## Purpose

Maps mouse and keyboard input to game semantics. Mouse Y → arc length validation. Mouse X velocity → travel speed. Keyboard shortcuts for chip mode, strike, abort.

## Requirements

### Requirement: Mouse Y to Arc Length

The system SHALL compute arc length as `|mouseY - workpieceSurfaceY|`. Surface Y is the top of the bead column at mouseX. Values outside `electrode.diameter × [0.5, 3.0]` are clamped and flagged.

### Requirement: Short Arc Detection

Arc length < `electrode.diameter × 0.5` SHALL set ArcPhysics `shortCircuit = true`. Heat input reduced by 50%.

### Requirement: Long Arc Detection

Arc length > `electrode.diameter × 3.0` SHALL set ArcPhysics `status = 'long'`. Increased porosity risk, spatter factor × 3.

### Requirement: Travel Speed from X Velocity

The system SHALL compute travel speed as the magnitude of mouse X displacement over the last 10 ticks. Speed is positive scalar (px/s), direction encoded separately.

### Requirement: Travel Angle from Movement Vector

The system SHALL compute travel angle as `atan2(dy, dx)` from the mouse movement vector over last 10 ticks. Ideal range: 60°–90° from horizontal (forehand).

### Requirement: Mouse Position Buffer

The system SHALL maintain a circular buffer of the last 10 mouse positions with timestamps. Buffer is used for speed and angle computation.

### Requirement: Chip Mode (C Key)

Pressing `C` SHALL toggle chip mode on the active WeldSession. In chip mode, cursor style changes to crosshair and slag removal mechanic is active.

### Requirement: Strike Trigger (Space)

Pressing Space during IDLE SHALL initiate strike attempt. Same as mousedown.

### Requirement: Abort (Escape)

Pressing Escape SHALL abort the current session immediately. Same as WeldSession abort.

### Requirement: No Action on Wrong State

Space SHALL have no effect if session is not IDLE. Escape SHALL have no effect if session is FINISHED or IDLE.

---

## Scenarios

#### Scenario: Short arc penalty

- GIVEN mouseY is very close to workpiece surface (arc < 0.5 × diameter)
- WHEN ArcPhysics.validate() is called
- THEN shortCircuit = true, heatInput reduced 50%

#### Scenario: Long arc spatter increase

- GIVEN mouseY is far from workpiece (arc > 3.0 × diameter)
- WHEN SpatterSystem.tick() is called
- THEN spatter emission rate × 3

#### Scenario: Travel speed calculation

- GIVEN mouse moved 100px in X over 10 ticks at 60fps (~0.167s)
- WHEN travel speed is queried
- THEN speed = 100 / 0.167 ≈ 600 px/s

#### Scenario: Travel angle calculation

- GIVEN mouse moved (dx=50, dy=10) over 10 ticks
- WHEN travel angle is computed
- THEN angle = atan2(10, 50) ≈ 11.3° (too flat, penalty likely)

#### Scenario: C key toggles chip mode

- GIVEN session is WELDING
- WHEN C is pressed
- THEN session mode becomes 'chipping', cursor changes
- WHEN C is pressed again
- THEN session mode returns to 'welding'

#### Scenario: Space in wrong state

- GIVEN session is WELDING (not IDLE)
- WHEN Space is pressed
- THEN no strike initiation occurs
- AND no state change

---

## Public API

```js
/**
 * @typedef {Object} InputState
 * @property {number} mouseX
 * @property {number} mouseY
 * @property {number} arcLength
 * @property {number} travelSpeed
 * @property {number} travelAngle
 * @property {boolean} chipMode
 * @property {boolean} mouseDown
 */

/**
 * @param {Object} deps
 * @returns {InputHandler}
 */
function createInputHandler({ arcPhysics, weldSession, eventBus }) {}
```
