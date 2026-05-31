/**
 * Game Type Definitions
 * @module types/game
 */

/**
 * @typedef {'idle'|'striking'|'welding'|'arc_break'|'finished'} WeldSessionState
 */

/**
 * @typedef {'rutile'|'basic'|'cellulosic'|'stainless'} ElectrodeType
 */

/**
 * @typedef {Object} ElectrodeConfig
 * @description Full electrode configuration including type and parameters.
 * @property {ElectrodeType} type - Electrode process type
 * @property {number} diameter - Electrode diameter in mm
 * @property {number} idealAmperage - Ideal amperage for this electrode (A)
 * @property {number} difficultyMultiplier - XP multiplier (1.0–2.0)
 * @property {number} idealSpeed - Ideal travel speed in px/s
 * @property {number} idealArcLength - Ideal arc length in px
 */

/**
 * @typedef {Object} SessionLogEntry
 * @description Single tick's weld session data for scoring.
 * @property {number} timestamp - Game time in seconds
 * @property {number} amperage - Actual amperage at this tick
 * @property {number} arcLength - Arc length in px
 * @property {number} travelSpeed - Travel speed in px/s
 * @property {number} travelAngle - Travel angle in radians
 * @property {number} beadX - Current bead x position
 * @property {number} beadY - Current bead y position
 * @property {boolean} chipMode - Whether chip mode was active
 * @property {boolean} arcEstablished - Whether arc was established
 */

/**
 * @typedef {Object} DefectRecord
 * @description A defect detected during welding.
 * @property {'POROSITY'|'UNDERCUT'|'INCLUSION'|'ARC_BREAK'} type - Defect type
 * @property {number} x - X position where defect occurred
 * @property {number} timestamp - Game time when defect occurred
 * @property {number} severity - Severity 0–1 (for undercut)
 */

/**
 * @typedef {Object} WeldSessionData
 * @description Complete weld session data for scoring.
 * @property {SessionLogEntry[]} log - Array of all tick entries
 * @property {DefectRecord[]} defects - Array of detected defects
 * @property {Object[]} beadColumns - Final bead columns
 * @property {Object[]} slagSegments - Slag segments after chipping
 * @property {number} totalTime - Total session duration in seconds
 * @property {number} electrodeDiameter - Electrode diameter in mm
 * @property {WeldSessionState} finalState - Final session state
 */

/**
 * @typedef {Object} ScoreResult
 * @description Scoring result from ScoringEngine.
 * @property {number} total - Final weighted score 0–100
 * @property {number} amperageScore - Amperage accuracy component 0–1
 * @property {number} arcScore - Arc length consistency component 0–1
 * @property {number} speedScore - Travel speed consistency component 0–1
 * @property {number} straightnessScore - Bead straightness component 0–1
 * @property {number} slagBonus - Slag removal bonus 0–1
 * @property {DefectReport[]} defectReport - List of defects with penalties
 * @property {number} xpEarned - XP awarded for this session
 * @property {number} creditsEarned - Credits awarded for this session
 */

/**
 * @typedef {Object} DefectReport
 * @description A defect with its penalty applied to score.
 * @property {string} type - Defect type name
 * @property {number} x - X position
 * @property {number} penalty - Penalty multiplier (e.g., 0.15 for porosity)
 */

/**
 * @typedef {Object} InputState
 * @description Current input state from InputHandler.
 * @property {number} mouseX - Mouse X position
 * @property {number} mouseY - Mouse Y position
 * @property {boolean} mouseDown - Mouse button state
 * @property {boolean} chipMode - Chip mode active
 * @property {boolean} strikePending - Strike pending confirmation
 * @property {number[]} keyBindings - Map of action to key code
 */

/**
 * @typedef {'POROSITY'|'UNDERCUT'|'INCLUSION'|'ARC_BREAK'} DefectType
 */

/**
 * @typedef {Object} GameState
 * @description Full game state for renderer.
 * @property {Object[]} beadColumns - Accumulated bead columns
 * @property {Object[]} slagSegments - Active slag segments
 * @property {Object[]} particles - Active spatter particles
 * @property {Object} arc - Current arc state
 * @property {number} score - Current score
 * @property {boolean} chipMode - Whether chip mode is active
 * @property {ElectrodeConfig} electrode - Electrode configuration
 * @property {WeldSessionState} sessionState - Current weld session state
 */

export {};
