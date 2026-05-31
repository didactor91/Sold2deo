/**
 * Renderer Configuration Constants
 * @module config/renderer
 * @description All colour constants, FPS guard threshold, and particle limits for the renderer system.
 * Sourced from SDD-001 §3.2 and config-colors.md.
 */

export const TEMP_COLOURS = {
  ABOVE_1500: '#ffff00',   // Yellow — peak heat
  ABOVE_1200: '#ff8800',   // Orange — molten
  ABOVE_900: '#ff3300',    // Red-orange — hot
  ABOVE_600: '#cc1100',    // Deep red — cooling
  ABOVE_300: '#661100',    // Dark red — warm
  SOLIDIFIED: '#3a2010',   // Dark brown — solidified bead
};

export const ARC_GLOW_COLOURS = {
  rutile: '#4488ff',
  basic: '#6644ff',
  cellulosic: '#ff8800',
};

export const BASE_METAL = '#2a2a2a';

export const SLAG_FILL = '#3a1f00';
export const SLAG_CRUST = '#5a3010';

export const HAZ_BLOOM = '#1a0a00';

export const UI_SCORE_COLOUR = '#ffffff';
export const UI_ARC_OK = '#44ff44';
export const UI_ARC_SHORT = '#ff4444';
export const UI_ARC_LONG = '#ffaa00';
export const UI_ARC_BROKEN = '#ff0000';

export const FPS_FALLBACK = 55;

export const PARTICLE_RADIUS = 1;
export const MAX_PARTICLES = 512;
export const SMOKE_MIN = 3;
export const SMOKE_MAX = 5;
export const SMOKE_ALPHA_MAX = 0.6;

export const COLUMN_WIDTH = 10;
export const DROPLET_DETACHMENT_THRESHOLD = 0.5;
export const DROPLET_COLOUR = '#ffcc00';
