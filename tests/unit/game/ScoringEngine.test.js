/**
 * ScoringEngine Unit Tests
 * @module tests/unit/game/ScoringEngine.test
 */

import { describe, it, expect } from 'vitest';
import { score } from '../../../src/game/ScoringEngine.js';

/**
 * Creates a minimal session log for testing.
 * @param {number} idealAmp
 * @param {number} idealArc
 * @param {number} idealSpeed
 * @param {number} entries
 * @param {object} overrides - Override defaults
 */
function makeIdealLog(idealAmp, idealArc, idealSpeed, entries = 10, overrides = {}) {
  const beadY = overrides.beadY !== undefined ? overrides.beadY : 0;
  const startX = overrides.startX || 0;
  return Array.from({ length: entries }, (_, i) => ({
    timestamp: i * (1 / 60),
    amperage: idealAmp,
    arcLength: idealArc,
    travelSpeed: idealSpeed,
    travelAngle: Math.PI / 2,
    beadX: startX + i * 2,
    beadY: beadY,
    chipMode: false,
    arcEstablished: true,
  }));
}

describe('ScoringEngine', () => {
  describe('score (pure function)', () => {
    it('should be a function', () => {
      expect(typeof score).toBe('function');
    });
  });

  describe('perfect weld — score 100', () => {
    it('should return total = 100 for ideal weld with no defects', () => {
      // Perfect horizontal bead: constant beadY means zero lateral drift
      const session = {
        log: makeIdealLog(100, 3, 200, 10),
        defects: [],
        beadColumns: [],
        slagSegments: [],
        totalTime: 10,
        electrodeDiameter: 3,
        finalState: 'finished',
      };
      const electrode = {
        type: 'rutile',
        diameter: 3,
        idealAmperage: 100,
        idealSpeed: 200,
        idealArcLength: 3,
        difficultyMultiplier: 1.0,
      };
      const result = score(session, electrode);
      expect(result.total).toBe(100);
      expect(result.defectReport).toHaveLength(0);
    });

    it('should return correct component scores for perfect weld', () => {
      const session = {
        log: makeIdealLog(100, 3, 200, 10),
        defects: [],
        beadColumns: [],
        slagSegments: [],
        totalTime: 10,
        electrodeDiameter: 3,
        finalState: 'finished',
      };
      const electrode = {
        type: 'rutile',
        diameter: 3,
        idealAmperage: 100,
        idealSpeed: 200,
        idealArcLength: 3,
        difficultyMultiplier: 1.0,
      };
      const result = score(session, electrode);
      expect(result.amperageScore).toBe(1);
      expect(result.arcScore).toBe(1);
      expect(result.speedScore).toBe(1);
      // For straightness: constant beadY (0) means no lateral drift
      expect(result.straightnessScore).toBe(1);
      // Empty slag = vacuously all removed = 1.0
      expect(result.slagBonus).toBe(1);
    });
  });

  describe('amperage scoring', () => {
    it('should penalize amperage deviation from ideal', () => {
      // All entries at 80A instead of ideal 100A
      // accuracy = 1 - |80-100|/100 = 0.8
      const session = {
        log: makeIdealLog(80, 3, 200, 10),
        defects: [],
        beadColumns: [],
        slagSegments: [],
        totalTime: 10,
        electrodeDiameter: 3,
        finalState: 'finished',
      };
      const electrode = {
        type: 'rutile',
        diameter: 3,
        idealAmperage: 100,
        idealSpeed: 200,
        idealArcLength: 3,
        difficultyMultiplier: 1.0,
      };
      const result = score(session, electrode);
      expect(result.amperageScore).toBeCloseTo(0.8, 2);
    });

    it('should clamp amperage score to 0–1', () => {
      // Way off amperage — should clamp
      const session = {
        log: makeIdealLog(0, 3, 200, 5),
        defects: [],
        beadColumns: [],
        slagSegments: [],
        totalTime: 5,
        electrodeDiameter: 3,
        finalState: 'finished',
      };
      const electrode = {
        type: 'rutile',
        diameter: 3,
        idealAmperage: 100,
        idealSpeed: 200,
        idealArcLength: 3,
        difficultyMultiplier: 1.0,
      };
      const result = score(session, electrode);
      expect(result.amperageScore).toBeGreaterThanOrEqual(0);
      expect(result.amperageScore).toBeLessThanOrEqual(1);
    });
  });

  describe('arc length consistency scoring', () => {
    it('should score arc consistency based on std dev', () => {
      // Perfectly consistent arc = 1.0
      const session = {
        log: makeIdealLog(100, 3, 200, 10),
        defects: [],
        beadColumns: [],
        slagSegments: [],
        totalTime: 10,
        electrodeDiameter: 3,
        finalState: 'finished',
      };
      const electrode = {
        type: 'rutile',
        diameter: 3,
        idealAmperage: 100,
        idealSpeed: 200,
        idealArcLength: 3,
        difficultyMultiplier: 1.0,
      };
      const result = score(session, electrode);
      expect(result.arcScore).toBe(1);
    });
  });

  describe('porosity defect', () => {
    it('should apply porosity penalty multiplicatively', () => {
      const session = {
        log: makeIdealLog(100, 3, 200, 10),
        defects: [
          { type: 'POROSITY', x: 50, timestamp: 1, severity: 1 },
          { type: 'POROSITY', x: 100, timestamp: 2, severity: 1 },
        ],
        beadColumns: [],
        slagSegments: [],
        totalTime: 10,
        electrodeDiameter: 3,
        finalState: 'finished',
      };
      const electrode = {
        type: 'rutile',
        diameter: 3,
        idealAmperage: 100,
        idealSpeed: 200,
        idealArcLength: 3,
        difficultyMultiplier: 1.0,
      };
      const result = score(session, electrode);
      // 2 porosity × 0.15 = 0.30 penalty
      // finalScore = 100 × (1 - 0.30) = 70
      expect(result.total).toBe(70);
      expect(result.defectReport).toHaveLength(2);
    });
  });

  describe('inclusion defect', () => {
    it('should apply inclusion penalty at 40% per instance', () => {
      const session = {
        log: makeIdealLog(100, 3, 200, 10),
        defects: [
          { type: 'INCLUSION', x: 50, timestamp: 1, severity: 1 },
          { type: 'INCLUSION', x: 100, timestamp: 2, severity: 1 },
        ],
        beadColumns: [],
        slagSegments: [],
        totalTime: 10,
        electrodeDiameter: 3,
        finalState: 'finished',
      };
      const electrode = {
        type: 'rutile',
        diameter: 3,
        idealAmperage: 100,
        idealSpeed: 200,
        idealArcLength: 3,
        difficultyMultiplier: 1.0,
      };
      const result = score(session, electrode);
      // 2 inclusion × 0.40 = 0.80 penalty
      // finalScore = 100 × (1 - 0.80) = 20
      expect(result.total).toBe(20);
    });

    it('should cap defect penalty at 1.0 (floor 0 score)', () => {
      const session = {
        log: makeIdealLog(100, 3, 200, 10),
        defects: [
          { type: 'INCLUSION', x: 50, timestamp: 1, severity: 1 },
          { type: 'INCLUSION', x: 100, timestamp: 2, severity: 1 },
          { type: 'POROSITY', x: 150, timestamp: 3, severity: 1 },
          { type: 'UNDERCUT', x: 200, timestamp: 4, severity: 1 },
        ],
        beadColumns: [],
        slagSegments: [],
        totalTime: 10,
        electrodeDiameter: 3,
        finalState: 'finished',
      };
      const electrode = {
        type: 'rutile',
        diameter: 3,
        idealAmperage: 100,
        idealSpeed: 200,
        idealArcLength: 3,
        difficultyMultiplier: 1.0,
      };
      const result = score(session, electrode);
      // 2×0.40 + 1×0.15 + 1×0.20 = 0.80 + 0.15 + 0.20 = 1.15 → capped at 1.0
      // finalScore = 100 × (1 - 1.0) = 0
      expect(result.total).toBe(0);
    });
  });

  describe('arc break defect', () => {
    it('should apply arc break penalty at 10% per instance', () => {
      const session = {
        log: makeIdealLog(100, 3, 200, 10),
        defects: [
          { type: 'ARC_BREAK', x: 50, timestamp: 1, severity: 1 },
        ],
        beadColumns: [],
        slagSegments: [],
        totalTime: 10,
        electrodeDiameter: 3,
        finalState: 'arc_break',
      };
      const electrode = {
        type: 'rutile',
        diameter: 3,
        idealAmperage: 100,
        idealSpeed: 200,
        idealArcLength: 3,
        difficultyMultiplier: 1.0,
      };
      const result = score(session, electrode);
      expect(result.total).toBe(90);
    });
  });

  describe('XP calculation', () => {
    it('should calculate XP as floor(baseXP × score/100 × difficulty)', () => {
      const session = {
        log: makeIdealLog(100, 3, 200, 10),
        defects: [],
        beadColumns: [],
        slagSegments: [],
        totalTime: 10,
        electrodeDiameter: 3,
        finalState: 'finished',
      };
      const electrode = {
        type: 'rutile',
        diameter: 3,
        idealAmperage: 100,
        idealSpeed: 200,
        idealArcLength: 3,
        difficultyMultiplier: 1.5,
      };
      const result = score(session, electrode);
      // baseXP=100, score=100, difficulty=1.5 → 100 × 1.0 × 1.5 = 150
      expect(result.xpEarned).toBe(150);
    });

    it('should scale XP proportionally with score', () => {
      const session = {
        log: makeIdealLog(80, 3, 200, 10),
        defects: [],
        beadColumns: [],
        slagSegments: [],
        totalTime: 10,
        electrodeDiameter: 3,
        finalState: 'finished',
      };
      const electrode = {
        type: 'rutile',
        diameter: 3,
        idealAmperage: 100,
        idealSpeed: 200,
        idealArcLength: 3,
        difficultyMultiplier: 1.0,
      };
      const result = score(session, electrode);
      // score < 100, xp should be proportionally lower
      expect(result.xpEarned).toBeLessThan(100);
    });
  });

  describe('credits calculation', () => {
    it('should calculate credits as floor(baseCredits × score/100)', () => {
      const session = {
        log: makeIdealLog(100, 3, 200, 10),
        defects: [],
        beadColumns: [],
        slagSegments: [],
        totalTime: 10,
        electrodeDiameter: 3,
        finalState: 'finished',
      };
      const electrode = {
        type: 'rutile',
        diameter: 3,
        idealAmperage: 100,
        idealSpeed: 200,
        idealArcLength: 3,
        difficultyMultiplier: 1.0,
      };
      const result = score(session, electrode);
      // baseCredits=50, score=100 → 50 × 1.0 = 50
      expect(result.creditsEarned).toBe(50);
    });
  });

  describe('determinism', () => {
    it('should return byte-identical results for same input', () => {
      const session = {
        log: makeIdealLog(100, 3, 200, 10),
        defects: [
          { type: 'POROSITY', x: 50, timestamp: 1, severity: 1 },
          { type: 'ARC_BREAK', x: 100, timestamp: 2, severity: 1 },
        ],
        beadColumns: [],
        slagSegments: [],
        totalTime: 10,
        electrodeDiameter: 3,
        finalState: 'finished',
      };
      const electrode = {
        type: 'rutile',
        diameter: 3,
        idealAmperage: 100,
        idealSpeed: 200,
        idealArcLength: 3,
        difficultyMultiplier: 1.0,
      };
      const result1 = score(session, electrode);
      const result2 = score(session, electrode);
      expect(result1.total).toBe(result2.total);
      expect(result1.xpEarned).toBe(result2.xpEarned);
      expect(result1.creditsEarned).toBe(result2.creditsEarned);
      expect(result1.defectReport).toHaveLength(result2.defectReport.length);
    });
  });

  describe('empty or minimal session', () => {
    it('should handle session with empty log', () => {
      const session = {
        log: [],
        defects: [],
        beadColumns: [],
        slagSegments: [],
        totalTime: 0,
        electrodeDiameter: 3,
        finalState: 'finished',
      };
      const electrode = {
        type: 'rutile',
        diameter: 3,
        idealAmperage: 100,
        idealSpeed: 200,
        idealArcLength: 3,
        difficultyMultiplier: 1.0,
      };
      const result = score(session, electrode);
      expect(typeof result.total).toBe('number');
      expect(typeof result.xpEarned).toBe('number');
      expect(typeof result.creditsEarned).toBe('number');
    });
  });

  describe('slag removal bonus', () => {
    it('should calculate slag bonus as proportion removed', () => {
      const session = {
        log: makeIdealLog(100, 3, 200, 10),
        defects: [],
        beadColumns: [],
        slagSegments: [
          { col: 0, hardness: 0.5, thickness: 2, removed: true },
          { col: 1, hardness: 0.5, thickness: 2, removed: true },
          { col: 2, hardness: 0.5, thickness: 2, removed: false },
          { col: 3, hardness: 0.5, thickness: 2, removed: false },
        ],
        totalTime: 10,
        electrodeDiameter: 3,
        finalState: 'finished',
      };
      const electrode = {
        type: 'rutile',
        diameter: 3,
        idealAmperage: 100,
        idealSpeed: 200,
        idealArcLength: 3,
        difficultyMultiplier: 1.0,
      };
      const result = score(session, electrode);
      // 2/4 removed = 0.5 slag bonus
      expect(result.slagBonus).toBe(0.5);
    });

    it('should return 1.0 slag bonus when no slag present (vacuously all removed)', () => {
      const session = {
        log: makeIdealLog(100, 3, 200, 10),
        defects: [],
        beadColumns: [],
        slagSegments: [],
        totalTime: 10,
        electrodeDiameter: 3,
        finalState: 'finished',
      };
      const electrode = {
        type: 'rutile',
        diameter: 3,
        idealAmperage: 100,
        idealSpeed: 200,
        idealArcLength: 3,
        difficultyMultiplier: 1.0,
      };
      const result = score(session, electrode);
      // Empty slag = vacuously all removed = 1.0
      expect(result.slagBonus).toBe(1);
    });
  });
});
