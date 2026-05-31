/**
 * ScoringEngine — Pure Function Scoring
 * @module game/ScoringEngine
 * @description Deterministic scoring from session log and electrode config.
 * No side effects, no randomness, fully replayable.
 */

import { BALANCE } from '../config/balance.js';

/**
 * @typedef {Object} ScoreResult
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
 * @property {string} type
 * @property {number} x
 * @property {number} penalty
 */

/**
 * Clamp a value between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate mean of an array.
 * @param {number[]} arr
 * @returns {number}
 */
function mean(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, v) => sum + v, 0) / arr.length;
}

/**
 * Calculate sample standard deviation of an array.
 * @param {number[]} arr
 * @returns {number}
 */
function stdDev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const squaredDiffs = arr.map((v) => (v - m) ** 2);
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / (arr.length - 1));
}

/**
 * Score amperage accuracy: 1 - |sample - ideal| / ideal, clamped 0–1.
 * Averaged over all log entries.
 * @param {number[]} amperages
 * @param {number} idealAmp
 * @returns {number}
 */
function scoreAmperage(amperages, idealAmp) {
  if (amperages.length === 0) return 0;
  const accuracies = amperages.map((amp) => 1 - Math.abs(amp - idealAmp) / idealAmp);
  return clamp(mean(accuracies), 0, 1);
}

/**
 * Score arc length consistency: 1 - stdDev / idealArcLength, clamped 0–1.
 * @param {number[]} arcLengths
 * @param {number} idealArc
 * @returns {number}
 */
function scoreArcConsistency(arcLengths, idealArc) {
  if (arcLengths.length === 0) return 0;
  const sd = stdDev(arcLengths);
  return clamp(1 - sd / idealArc, 0, 1);
}

/**
 * Score travel speed consistency: 1 - |avgSpeed - idealSpeed| / idealSpeed, clamped 0–1.
 * @param {number[]} speeds
 * @param {number} idealSpeed
 * @returns {number}
 */
function scoreSpeedConsistency(speeds, idealSpeed) {
  if (speeds.length === 0) return 0;
  const avgSpeed = mean(speeds);
  return clamp(1 - Math.abs(avgSpeed - idealSpeed) / idealSpeed, 0, 1);
}

/**
 * Score straightness: 1 - totalLateralDrift / beadLength, clamped 0–1.
 * Lateral drift is cumulative perpendicular deviation from the bead's centerline.
 * For horizontal travel (constant beadY), lateral drift is deviation in beadY.
 * @param {number[]} beadXPositions
 * @param {number[]} beadYPositions
 * @returns {number}
 */
function scoreStraightness(beadXPositions, beadYPositions) {
  if (beadXPositions.length < 2) return 1;

  // Calculate bead length (total path length)
  let beadLength = 0;
  for (let i = 1; i < beadXPositions.length; i++) {
    const dx = beadXPositions[i] - beadXPositions[i - 1];
    const dy = beadYPositions[i] - beadYPositions[i - 1];
    beadLength += Math.sqrt(dx * dx + dy * dy);
  }
  if (beadLength === 0) return 1;

  // Calculate mean y for lateral drift (perpendicular to horizontal travel)
  const meanY = mean(beadYPositions);
  const totalLateralDrift = beadYPositions.reduce((sum, y) => sum + Math.abs(y - meanY), 0);

  return clamp(1 - totalLateralDrift / beadLength, 0, 1);
}

/**
 * Calculate slag removal bonus: proportion of slag segments where removed === true.
 * Empty slag segments = 1.0 (vacuously all removed, no slag to chip).
 * @param {Array<{removed: boolean}>} slagSegments
 * @returns {number}
 */
function scoreSlagBonus(slagSegments) {
  if (slagSegments.length === 0) return 1.0;
  const removed = slagSegments.filter((s) => s.removed).length;
  return removed / slagSegments.length;
}

/**
 * Apply multiplicative defect penalties to a raw score.
 * Penalties are cumulative and capped at 1.0 (minimum score 0).
 * @param {number} rawScore
 * @param {Array<{type: string, x: number}>} defects
 * @returns {{finalScore: number, defectReport: DefectReport[]}}
 */
function applyDefectPenalties(rawScore, defects) {
  /** @type {DefectReport[]} */
  const defectReport = [];
  let totalPenalty = 0;

  for (const defect of defects) {
    let penalty = 0;
    switch (defect.type) {
      case 'POROSITY':
        penalty = BALANCE.scoring.PENALTY_POROSITY;
        break;
      case 'UNDERCUT':
        penalty = BALANCE.scoring.PENALTY_UNDERCUT;
        break;
      case 'INCLUSION':
        penalty = BALANCE.scoring.PENALTY_INCLUSION;
        break;
      case 'ARC_BREAK':
        penalty = BALANCE.scoring.PENALTY_ARC_BREAK;
        break;
      default:
        continue;
    }
    defectReport.push({ type: defect.type, x: defect.x, penalty });
    totalPenalty += penalty;
  }

  // Cap penalty at 1.0
  totalPenalty = Math.min(totalPenalty, 1.0);
  const finalScore = Math.max(0, rawScore * (1 - totalPenalty));

  return { finalScore, defectReport };
}

/**
 * Calculate XP earned for a session.
 * @param {number} scorePercent - Score as 0–100
 * @param {number} difficultyMultiplier
 * @returns {number}
 */
function calculateXP(scorePercent, difficultyMultiplier) {
  return Math.floor(BALANCE.scoring.BASE_XP * (scorePercent / 100) * difficultyMultiplier);
}

/**
 * Calculate credits earned for a session.
 * @param {number} scorePercent - Score as 0–100
 * @returns {number}
 */
function calculateCredits(scorePercent) {
  return Math.floor(BALANCE.scoring.BASE_CREDITS * (scorePercent / 100));
}

/**
 * Extract data arrays from session log.
 * @param {Object[]} log
 * @returns {{amperages: number[], arcLengths: number[], speeds: number[], beadXPositions: number[], beadYPositions: number[]}}
 */
function extractLogData(log) {
  return {
    amperages: log.map((e) => e.amperage),
    arcLengths: log.map((e) => e.arcLength),
    speeds: log.map((e) => e.travelSpeed),
    beadXPositions: log.map((e) => e.beadX),
    beadYPositions: log.map((e) => e.beadY),
  };
}

/**
 * Round score component to 3 decimal places.
 * @param {number} value
 * @returns {number}
 */
function round3(value) {
  return Math.round(value * 1000) / 1000;
}

/**
 * Score a weld session against electrode config.
 * Pure function — deterministic, no side effects, no randomness.
 *
 * @param {Object} session - WeldSessionData
 * @param {Object} electrode - ElectrodeConfig
 * @returns {ScoreResult}
 */
export function score(session, electrode) {
  const { log, defects, slagSegments } = session;
  const { amperages, arcLengths, speeds, beadXPositions, beadYPositions } = extractLogData(log);

  // Calculate component scores
  const amperageScore = scoreAmperage(amperages, electrode.idealAmperage);
  const arcScore = scoreArcConsistency(arcLengths, electrode.idealArcLength);
  const speedScore = scoreSpeedConsistency(speeds, electrode.idealSpeed);
  const straightnessScore = scoreStraightness(beadXPositions, beadYPositions);
  const slagBonus = scoreSlagBonus(slagSegments);

  // Weighted raw score (slagBonus is 0-1, others 0-1)
  const rawScore =
    amperageScore * BALANCE.scoring.WEIGHT_AMPERAGE +
    arcScore * BALANCE.scoring.WEIGHT_ARC +
    speedScore * BALANCE.scoring.WEIGHT_SPEED +
    straightnessScore * BALANCE.scoring.WEIGHT_STRAIGHTNESS +
    slagBonus * BALANCE.scoring.WEIGHT_SLAG;

  // Apply defect penalties
  const { finalScore, defectReport } = applyDefectPenalties(rawScore * 100, defects);

  // Calculate rewards
  return {
    total: Math.round(finalScore * 100) / 100,
    amperageScore: round3(amperageScore),
    arcScore: round3(arcScore),
    speedScore: round3(speedScore),
    straightnessScore: round3(straightnessScore),
    slagBonus: round3(slagBonus),
    defectReport,
    xpEarned: calculateXP(finalScore, electrode.difficultyMultiplier),
    creditsEarned: calculateCredits(finalScore),
  };
}
