/**
 * Renderer Barrel Export Tests
 * @module tests/unit/renderer/renderer.index.test
 */

import { describe, it, expect } from 'vitest';

describe('renderer barrel export', () => {
  it('should export createBackgroundRenderer', async () => {
    const mod = await import('../../../src/renderer/index.js');
    expect(mod.createBackgroundRenderer).toBeDefined();
    expect(typeof mod.createBackgroundRenderer).toBe('function');
  });

  it('should export createWorkpieceRenderer', async () => {
    const mod = await import('../../../src/renderer/index.js');
    expect(mod.createWorkpieceRenderer).toBeDefined();
    expect(typeof mod.createWorkpieceRenderer).toBe('function');
  });

  it('should export createParticleRenderer', async () => {
    const mod = await import('../../../src/renderer/index.js');
    expect(mod.createParticleRenderer).toBeDefined();
    expect(typeof mod.createParticleRenderer).toBe('function');
  });

  it('should export createElectrodeRenderer', async () => {
    const mod = await import('../../../src/renderer/index.js');
    expect(mod.createElectrodeRenderer).toBeDefined();
    expect(typeof mod.createElectrodeRenderer).toBe('function');
  });

  it('should export createUIRenderer', async () => {
    const mod = await import('../../../src/renderer/index.js');
    expect(mod.createUIRenderer).toBeDefined();
    expect(typeof mod.createUIRenderer).toBe('function');
  });

  it('should export createSceneRenderer', async () => {
    const mod = await import('../../../src/renderer/index.js');
    expect(mod.createSceneRenderer).toBeDefined();
    expect(typeof mod.createSceneRenderer).toBe('function');
  });

  it('should export temperatureToColor from colorUtils', async () => {
    const mod = await import('../../../src/renderer/index.js');
    expect(mod.temperatureToColor).toBeDefined();
    expect(typeof mod.temperatureToColor).toBe('function');
  });

  it('should export processColor from colorUtils', async () => {
    const mod = await import('../../../src/renderer/index.js');
    expect(mod.processColor).toBeDefined();
    expect(typeof mod.processColor).toBe('function');
  });

  it('should export all 6 factory functions plus 2 utilities (8 total named exports)', async () => {
    const mod = await import('../../../src/renderer/index.js');
    const keys = Object.keys(mod);
    // 6 factories: Background, Workpiece, Particle, Electrode, UI, Scene
    // 2 utilities: temperatureToColor, processColor
    expect(keys).toHaveLength(8);
  });
});
