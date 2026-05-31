/**
 * Renderer Barrel Export
 * @module renderer/index
 * @description Single import point for all renderer factory functions and utilities.
 */

export { createBackgroundRenderer } from './BackgroundRenderer.js';
export { createWorkpieceRenderer } from './WorkpieceRenderer.js';
export { createParticleRenderer } from './ParticleRenderer.js';
export { createElectrodeRenderer } from './ElectrodeRenderer.js';
export { createUIRenderer } from './UIRenderer.js';
export { createSceneRenderer } from './SceneRenderer.js';
export { temperatureToColor, processColor } from './colorUtils.js';
