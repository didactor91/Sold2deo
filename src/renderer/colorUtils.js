/**
 * Color Utility Functions
 * @module renderer/colorUtils
 * @description Pure functions for temperature-to-colour mapping and electrode process colours.
 */

import { TEMP_COLOURS, ARC_GLOW_COLOURS } from '../config/renderer.js';

/**
 * Returns a hex colour string for a given temperature in Celsius.
 * Uses thresholds from SDD-001 §3.2 temperature colour map.
 * @param {number} tempCelsius - Temperature in degrees Celsius
 * @returns {string} hex colour string
 */
export function temperatureToColor(tempCelsius) {
  if (tempCelsius > 1500) {
    return TEMP_COLOURS.ABOVE_1500;
  }
  if (tempCelsius > 1200) {
    return TEMP_COLOURS.ABOVE_1200;
  }
  if (tempCelsius > 900) {
    return TEMP_COLOURS.ABOVE_900;
  }
  if (tempCelsius > 600) {
    return TEMP_COLOURS.ABOVE_600;
  }
  if (tempCelsius > 300) {
    return TEMP_COLOURS.ABOVE_300;
  }
  return TEMP_COLOURS.SOLIDIFIED;
}

/**
 * Returns the arc glow colour for a given electrode process type.
 * @param {string} type - Electrode type ('rutile' | 'basic' | 'cellulosic')
 * @returns {string|undefined} hex colour string or undefined if type is unknown
 */
export function processColor(type) {
  return ARC_GLOW_COLOURS[type];
}
