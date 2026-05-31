/**
 * Renderer Type Definitions
 * @module types/renderer
 */

/**
 * @typedef {'rutile'|'basic'|'cellulosic'} ElectrodeType
 * @description Welding electrode process type.
 */

/**
 * @typedef {Object} ElectrodeConfig
 * @property {ElectrodeType} type - Electrode process type
 * @property {number} consumed - Consumption ratio 0–1
 */

/**
 * @typedef {Object} GameState
 * @property {BeadColumn[]} beadColumns - Accumulated bead columns
 * @property {SlagSegment[]} slagSegments - Active slag segments
 * @property {SpatterParticle[]} particles - Active spatter particles
 * @property {ArcState} arc - Current arc state
 * @property {number} score - Player score
 * @property {boolean} chipMode - Whether chip mode is active
 * @property {ElectrodeConfig} electrode - Electrode configuration
 */

/**
 * @typedef {Object} SubRenderer
 * @description Interface contract for all sub-renderers.
 * @property {(ctx: CanvasRenderingContext2D, state: GameState, interpolation: number) => void} render
 */

/**
 * @typedef {Object} Droplet
 * @property {number} x - X position
 * @property {number} y - Y position
 * @property {number} oscillationPhase - Current oscillation phase 0–1
 */

/**
 * @typedef {'ok'|'short'|'long'|'broken'} ArcStatus
 */

/**
 * @typedef {Object} ArcState
 * @property {number} arcLength - Arc length in pixels
 * @property {number} voltage - Computed voltage
 * @property {number} heatInput - Heat input in joules
 * @property {ArcStatus} status - Current arc status
 */

/**
 * Returns colour string for a given temperature in °C.
 * @param {number} tempCelsius
 * @returns {string} hex colour
 */
export function temperatureToColor(tempCelsius) {}

/**
 * Returns arc glow colour for a given electrode type.
 * @param {ElectrodeType} type
 * @returns {string} hex colour
 */
export function processColor(type) {}
