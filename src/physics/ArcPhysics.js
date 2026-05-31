/**
 * Arc Physics Module
 * @module physics/ArcPhysics
 */

import { BALANCE } from '../config/balance.js';

/**
 * Creates an ArcPhysics instance — arc state machine computing voltage,
 * heat input, and status from electrode position.
 * @returns {{ updateArc: function(number, number, number, string): ArcState }}
 */
export function createArcPhysics() {
  return {
    /**
     * Computes arc state from electrode position and amperage.
     * @param {number} mouseY - Electrode Y position (px)
     * @param {number} surfaceY - Workpiece surface Y position (px)
     * @param {number} amperage - Welding amperage
     * @param {string} electrodeType - Electrode type (mild, stainless, flux)
     * @returns {ArcState}
     */
    updateArc(mouseY, surfaceY, amperage, electrodeType) {
      const arcLength = Math.abs(mouseY - surfaceY);

      // Voltage: V = arcLength(px) * VOLTAGE_PER_MM
      // Convert px to mm: assume 1px = 0.1mm (scale factor)
      const voltage = arcLength * BALANCE.arc.VOLTAGE_PER_MM;

      // Heat input: Q = I × V × η × dt, clamped by MAX_DT
      const dt = Math.min(BALANCE.tick.FIXED_DT, BALANCE.tick.MAX_DT);
      const heatInput = amperage * voltage * BALANCE.physics.ARC_HEAT_INPUT * dt;

      // Status determination
      const idealArc = BALANCE.arc.IDEAL_ARC_LENGTH;
      const brokenThreshold = idealArc * BALANCE.arc.BROKEN_ARC_FACTOR;

      /** @type {'OK'|'broken'|'short'} */
      let status = 'OK';
      if (arcLength < BALANCE.arc.SHORT_CIRCUIT_THRESHOLD) {
        status = 'short';
      } else if (arcLength > brokenThreshold) {
        status = 'broken';
      }

      return { arcLength, voltage, heatInput, status };
    },
  };
}
