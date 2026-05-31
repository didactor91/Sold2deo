/**
 * Renderer Types Unit Tests
 * @module tests/unit/renderer/types.test
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('renderer types', () => {
  const typesPath = resolve('./src/types/renderer.d.ts');

  it('should have renderer.d.ts file that exists', () => {
    expect(() => readFileSync(typesPath, 'utf8')).not.toThrow();
  });

  it('should define ElectrodeType as a union of three process types', () => {
    const content = readFileSync(typesPath, 'utf8');
    expect(content).toMatch(/ElectrodeType/);
    expect(content).toMatch(/rutile.*basic.*cellulosic|['"]rutile['"][\s\S]*['"]basic['"][\s\S]*['"]cellulosic['"]/);
  });

  it('should define GameState interface with required properties', () => {
    const content = readFileSync(typesPath, 'utf8');
    expect(content).toMatch(/GameState/);
    expect(content).toMatch(/beadColumns/);
    expect(content).toMatch(/slagSegments/);
    expect(content).toMatch(/particles/);
    expect(content).toMatch(/arc/);
    expect(content).toMatch(/score/);
    expect(content).toMatch(/chipMode/);
    expect(content).toMatch(/electrode/);
  });

  it('should define SubRenderer interface with render method', () => {
    const content = readFileSync(typesPath, 'utf8');
    expect(content).toMatch(/SubRenderer/);
    // render appears as a property in the interface
    expect(content).toMatch(/render/);
  });

  it('should define temperatureToColor function signature', () => {
    const content = readFileSync(typesPath, 'utf8');
    expect(content).toMatch(/temperatureToColor/);
    expect(content).toMatch(/processColor/);
  });

  it('should define ElectrodeConfig with type and consumed properties', () => {
    const content = readFileSync(typesPath, 'utf8');
    expect(content).toMatch(/ElectrodeConfig/);
    expect(content).toMatch(/ElectrodeType/);
    expect(content).toMatch(/consumed/);
  });
});
