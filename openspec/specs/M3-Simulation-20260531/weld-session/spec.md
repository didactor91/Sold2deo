# WeldSession Specification

## Purpose

Owns one welding pass (electrode strike → weld → finish). Tracks state machine transitions, session data logging, and mouse tracking. Emits events for scoring and UI.

## State Machine

```
IDLE → STRIKING → WELDING → FINISHED
               ↓
            ARC_BREAK → WELDING (re-strike)
```

## Requirements

### Requirement: Session Lifecycle

The system SHALL create a WeldSession on mousedown (any mouse button). The session MUST transition to STRIKING immediately.

### Requirement: Strike Transition

On mousedown, the system SHALL enter STRIKING state. Strike succeeds when ArcPhysics reports `arcEstablished === true` for 3 consecutive frames. On success: transition to WELDING. On failure after 60 frames: transition to FINISHED with zero deposit.

### Requirement: Arc Break Re-strike

When ArcPhysics reports `arcEstablished === false` during WELDING, the system SHALL transition to ARC_BREAK, log the defect, then automatically return to WELDING when arc is re-established for 3 frames.

### Requirement: Session Logging

During WELDING, the system SHALL log every tick: `{ amperage, arcLength, travelSpeed, travelAngle, x, timestamp }`. Travel speed is computed from mouse X delta over last 10 ticks. Travel angle from `atan2(dy, dx)` of movement vector.

### Requirement: Finish on Mouseup

On mouseup, the system SHALL transition to FINISHED, call ScoringEngine with session log and electrode config, emit `session:complete` event with the ScoreResult, and mark session immutable.

### Requirement: Abort on Escape

Pressing Escape during STRIKING or WELDING SHALL immediately transition to FINISHED without scoring. No `session:complete` emitted.

### Requirement: Chip Mode Toggle

Pressing `C` during WELDING SHALL toggle `mode` between `'welding'` and `'chipping'`. In chipping mode, bead deposition is paused, slag removal is processed.

---

## Scenarios

#### Scenario: Successful strike and weld

- GIVEN session is IDLE
- WHEN mousedown occurs
- THEN session enters STRIKING, ArcPhysics validates arc over 3 frames
- AND when arcEstablished === true for 3 frames, transition to WELDING
- WHEN mouseup occurs
- THEN transition to FINISHED, ScoringEngine called, `session:complete` emitted

#### Scenario: Arc break and re-strike

- GIVEN session is WELDING with arc established
- WHEN ArcPhysics reports arcEstablished === false
- THEN transition to ARC_BREAK, log POROSITY defect with position
- WHEN arc re-established for 3 frames
- THEN transition back to WELDING

#### Scenario: Strike failure (no contact)

- GIVEN session is STRIKING
- WHEN 60 frames pass without arc establishment
- THEN transition to FINISHED with empty session log
- AND scoring returns 0, no XP awarded

#### Scenario: Escape abort

- GIVEN session is WELDING
- WHEN Escape key is pressed
- THEN transition to FINISHED immediately
- AND ScoringEngine is NOT called
- AND no `session:complete` event is emitted

#### Scenario: Chip mode during weld

- GIVEN session is WELDING
- WHEN `C` key is pressed
- THEN mode becomes `'chipping'`, bead deposition pauses
- WHEN `C` is pressed again
- THEN mode returns to `'welding'`, deposition resumes

---

## Public API

```js
/**
 * @typedef {'IDLE'|'STRIKING'|'WELDING'|'ARC_BREAK'|'FINISHED'} WeldSessionState

 * @typedef {Object} WeldSessionData
 * @property {WeldSessionState} state
 * @property {SessionLogEntry[]} log
 * @property {DefectRecord[]} defects
 * @property {number} startTime
 * @property {number} endTime
 * @property {'welding'|'chipping'} mode
 */

/**
 * @typedef {Object} SessionLogEntry
 * @property {number} amperage
 * @property {number} arcLength
 * @property {number} travelSpeed
 * @property {number} travelAngle
 * @property {number} x
 * @property {number} timestamp
 */

/**
 * @typedef {Object} DefectRecord
 * @property {string} type       - 'POROSITY'|'UNDERCUT'|'INCLUSION'|'ARC_BREAK'
 * @property {number} x
 * @property {number} frame
 */

/**
 * @param {Object} deps
 * @returns {WeldSession}
 */
function createWeldSession({ arcPhysics, scoringEngine, eventBus }) {}
```
