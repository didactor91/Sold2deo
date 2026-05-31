# ArcPhysics Specification

## Purpose
Arc state validation (ok/short/long/broken), voltage derived from arc length, heat input calculation.

## Types
```js
/**
 * @typedef {Object} ArcState
 * @property {number} arcLength - px
 * @property {boolean} arcEstablished
 * @property {boolean} shortCircuit
 * @property {number} voltage - derived
 * @property {number} heatInput - J/s
 * @property {string} status - 'ok'|'short'|'long'|'broken'
 */
```

## Constants (balance.js)
| Constant | Value | Source |
|----------|-------|--------|
| IDEAL_ARC_FACTOR | 1.0 | arc = electrode_diameter |
| BROKEN_ARC_FACTOR | 3.0 | arc > diameter × 3 |
| SHORT_CIRCUIT_THRESHOLD | 0.5 | px |
| VOLTAGE_PER_MM | 1.5 | V/mm AWS standard |
| MIN_ARC_LENGTH | 0.5 | px minimum |

## Public API
```js
/**
 * @param {number} mouseY - electrode tip Y
 * @param {number} surfaceY - workpiece surface Y
 * @param {number} amperage
 * @param {string} electrodeType
 * @returns {ArcState}
 */
function updateArc(mouseY, surfaceY, amperage, electrodeType) {}

/**
 * @param {number} dx - delta x
 * @param {number} dy - delta y
 * @param {number} dt - seconds
 * @returns {number} - travel angle in degrees
 */
function calculateTravelAngle(dx, dy, dt) {}
```

## Requirements

### Requirement: Arc Length Calculation
The system MUST calculate arc length as |mouseY - surfaceY|.

#### Scenario: Arc length computed
- GIVEN mouseY=300, surfaceY=200
- WHEN updateArc(300, 200, amperage, type)
- THEN arcLength = 100px

### Requirement: Arc State Validation
The system MUST set status based on arc length thresholds.

#### Scenario: Arc states
- GIVEN arcLength
- WHEN calculated
- THEN status='short' if arcLength < 0.5
- AND status='broken' if arcLength > electrode_diameter × 3
- AND status='ok' otherwise

### Requirement: Voltage Derivation
The system MUST derive voltage from arc length: V = arc_length_mm × VOLTAGE_PER_MM.

#### Scenario: Voltage calculated
- GIVEN arcLength=100px (≈1mm at scale), VOLTAGE_PER_MM=1.5
- WHEN updateArc()
- THEN voltage = 1.5V

### Requirement: Heat Input
The system MUST calculate heat input: Q = I × V × η × dt where η = ARC_HEAT_INPUT.

#### Scenario: Heat input
- GIVEN amperage=100, voltage=20V, efficiency=0.85
- WHEN heatInput calculated
- THEN heatInput = 100 × 20 × 0.85 = 1700 J/s

### Requirement: Travel Angle
The system MUST calculate travel angle from atan2(dy, dx) of mouse movement vector. Ideal range: 70–80° from horizontal.

#### Scenario: Travel angle computed
- GIVEN dx=10, dy=50 over dt
- WHEN calculateTravelAngle(10, 50, dt)
- THEN angle = atan2(50, 10) × 180/π ≈ 78.7°

### Requirement: Short Circuit Detection
The system MUST set shortCircuit=true when arcLength < SHORT_CIRCUIT_THRESHOLD.

#### Scenario: Short circuit
- GIVEN arcLength = 0.3px
- WHEN updateArc()
- THEN shortCircuit = true
- AND voltage = 0 (no arc)

## Edge Cases
| Case | Handling |
|------|----------|
| surfaceY > mouseY | Use absolute difference |
| amperage = 0 | Return zero heatInput |
| arcLength = 0 | Treat as short circuit |
| NaN movement | Return last valid angle |
