# ScoringEngine Specification

## Purpose

Pure function scoring. Takes session log + electrode config, returns deterministic score, defect report, XP, and credits. No side effects, no randomness.

## Requirements

### Requirement: Pure Function

The system SHALL compute all outputs from `session.log` and `electrode` config only. No Date.now(), no Math.random(), no external state access.

### Requirement: Score Composition

The total score MUST be computed as a weighted sum:
- `amperageScore × 0.30`
- `arcScore × 0.25`
- `speedScore × 0.20`
- `straightnessScore × 0.15`
- `slagBonus × 0.10`

### Requirement: Amperage Accuracy

The system SHALL score amperage as `1 - |sampleAmp - idealAmp| / idealAmp`, clamped 0–1, averaged over all log entries. Ideal amperage comes from electrode config.

### Requirement: Arc Length Consistency

The system SHALL score arc consistency as `1 - stdDev(arcLengths) / idealArcLength`, clamped 0–1. Penalise values outside `electrode.diameter × [0.8, 1.5]`.

### Requirement: Travel Speed Consistency

The system SHALL score speed as `1 - |avgSpeed - idealSpeed| / idealSpeed`, clamped 0–1. Ideal speed derived from bead geometry and amperage.

### Requirement: Straightness Score

The system SHALL compute straightness as `1 - totalLateralDrift / beadLength`, clamped 0–1. Lateral drift is cumulative absolute deviation from mean x-position.

### Requirement: Slag Removal Bonus

The system SHALL grant slagBonus = proportion of slag segments where `removed === true`, scaled 0–1. No slag present = 0 bonus.

### Requirement: Defect Detection

The system SHALL flag defects from WeldSession defect log:
- POROSITY: arcBroken count × PENALTY_POROSITY (0.15)
- UNDERCUT: detected from lateral drift spikes > threshold
- INCLUSION: columns where `hasSlag && !slagRemoved` × PENALTY_INCLUSION (0.40)
- ARC_BREAK: transitions to ARC_BREAK state × PENALTY_ARC_BREAK (0.10)

### Requirement: Multiplicative Defect Penalty

Defects MUST be applied multiplicatively to total score: `finalScore = total × (1 - sumOfDefectPenalties)`. Total score floor is 0.

### Requirement: XP Calculation

XP earned = `Math.floor(baseXP × score/100 × electrode.difficultyMultiplier)`. baseXP from config.

### Requirement: Credits Calculation

Credits earned = `Math.floor(baseCredits × score/100)`. baseCredits from contract config.

---

## Scenarios

#### Scenario: Perfect weld

- GIVEN a session log with ideal amperage, consistent arc, ideal speed, zero drift, all slag removed, no defects
- WHEN ScoringEngine.score(session, electrode) is called
- THEN total = 100, defects = [], xpEarned = baseXP × 1.0 × difficultyMultiplier

#### Scenario: Porosity penalty

- GIVEN session has 2 arc breaks logged as POROSITY defects
- WHEN score is computed
- THEN defectPenalty = 2 × 0.15 = 0.30
- AND finalScore = total × 0.70

#### Scenario: Inclusion defect

- GIVEN bead has 3 columns with slag not removed before second pass
- WHEN score is computed
- THEN inclusionPenalty = 3 × 0.40 = 1.20 (capped at 1.0)
- AND finalScore = total × 0 (minimum 0)

#### Scenario: Determinism

- GIVEN the same session.log array and electrode config
- WHEN score() is called twice with identical inputs
- THEN both results MUST be byte-identical
- AND no Math.random() or Date.now() is called inside the function

---

## Public API

```js
/**
 * @typedef {Object} ScoreResult
 * @property {number} total
 * @property {number} amperageScore
 * @property {number} arcScore
 * @property {number} speedScore
 * @property {number} straightnessScore
 * @property {number} slagBonus
 * @property {DefectReport[]} defects
 * @property {number} xpEarned
 * @property {number} creditsEarned
 */

/**
 * @typedef {Object} DefectReport
 * @property {string} type
 * @property {number} x
 * @property {number} penalty
 */

/**
 * @param {WeldSessionData} session
 * @param {ElectrodeConfig} electrode
 * @returns {ScoreResult}
 */
function score(session, electrode) {}
```
