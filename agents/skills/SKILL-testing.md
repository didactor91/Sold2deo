# SKILL-testing.md — QA / Testing Subagent

## YOUR ROLE
You write and maintain the test suite for Weld Master. Unit, integration, E2E, and performance benchmarks. You do not write feature code. You find bugs, you do not hide them.

## ENVIRONMENT
- Unit + Integration: Vitest (no bundler, native ESM)
- E2E: Playwright
- Performance: Vitest bench
- Coverage: V8 provider via Vitest

## VITEST CONFIG

```js
// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js', 'tests/integration/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
      },
      include: ['src/physics/**', 'src/game/**'],
    },
    benchmark: {
      include: ['tests/benchmarks/**/*.bench.js'],
    },
  },
});
```

## UNIT TEST STANDARDS

```js
// tests/unit/physics/ArcPhysics.test.js
import { describe, it, expect } from 'vitest';
import { computeArcState, isArcEstablished } from '../../../src/physics/ArcPhysics.js';
import { BALANCE } from '../../../src/config/balance.js';

describe('ArcPhysics.computeArcState', () => {
  // Naming: 'given [condition], [function] returns [expected]'

  it('given arc length = ideal, status is ok', () => {
    const state = computeArcState(210, 200, 70, 'e6013', 75);
    expect(state.status).toBe('ok');
    expect(state.arcEstablished).toBe(true);
  });

  it('given arc length > 3× diameter, status is broken', () => {
    const state = computeArcState(240, 200, 70, 'e6013', 75);
    expect(state.status).toBe('broken');
    expect(state.arcEstablished).toBe(false);
  });

  it('given arc length < 0.5, status is short', () => {
    const state = computeArcState(200.2, 200, 70, 'e6013', 75);
    expect(state.status).toBe('short');
  });

  it('heat input scales with amperage', () => {
    const low = computeArcState(210, 200, 60, 'e6013', 75);
    const high = computeArcState(210, 200, 90, 'e6013', 75);
    expect(high.heatInput).toBeGreaterThan(low.heatInput);
  });

  it('is deterministic — same inputs produce identical output', () => {
    const a = computeArcState(212, 200, 75, 'e6013', 72);
    const b = computeArcState(212, 200, 75, 'e6013', 72);
    expect(a).toEqual(b);
  });
});
```

## INTEGRATION TEST STANDARDS

Test sequences of ticks, not isolated calls.

```js
// tests/integration/weldSession.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { createPool, tickPool } from '../../src/physics/WeldPool.js';
import { createBead, depositAt } from '../../src/physics/BeadAccumulator.js';
import { BALANCE } from '../../src/config/balance.js';

describe('Full weld tick sequence', () => {
  it('bead height increases over 10 ticks with valid arc', () => {
    const pool = createPool(128, 16);
    const bead = createBead(128);
    const dt = 1/60;
    const heatInput = 500; // J/s, valid for E6013 at 70A

    for (let i = 0; i < 10; i++) {
      tickPool(pool, heatInput, 64, dt);
      // pool cells at x=64 should be above solidus after some ticks
    }

    // After enough heat, cells should be liquid
    const temp = getPoolTemperatureAt(pool, 64);
    expect(temp).toBeGreaterThan(BALANCE.physics.SOLIDUS_TEMP);
  });

  it('slag deposits after bead solidifies', () => {
    // ... sequence test
  });
});
```

## PERFORMANCE BENCHMARKS

```js
// tests/benchmarks/physics.bench.js
import { bench, describe } from 'vitest';
import { createPool, tickPool } from '../../src/physics/WeldPool.js';

describe('Physics performance', () => {
  const pool = createPool(128, 16);

  bench('WeldPool.tickPool 128-wide', () => {
    tickPool(pool, 500, 64, 1/60);
  }, {
    time: 1000,  // run for 1 second
    // Must achieve mean < 2ms
  });
});
```

Fail the benchmark task if mean tick time > 2ms.

## PLAYWRIGHT E2E

```js
// tests/e2e/weld-session.spec.js
import { test, expect } from '@playwright/test';

test('complete a weld session and see score', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Power on machine
  await page.click('#power-btn');
  await expect(page.locator('#power-led')).toHaveClass(/led-green/);
  
  // Set amperage to 70
  await page.fill('#amp-slider', '70');
  
  // Perform weld drag across work zone
  const canvas = page.locator('#weld-canvas');
  const box = await canvas.boundingBox();
  
  await page.mouse.move(box.x + 50, box.y + 200);
  await page.mouse.down();
  await page.mouse.move(box.x + 350, box.y + 200, { steps: 60 });
  await page.mouse.up();
  
  // Score should appear
  await expect(page.locator('#last-score-info')).not.toHaveText('Sin datos');
});

test('overheat alert fires when duty cycle exceeded', async ({ page }) => {
  // ...
});

test('save and reload preserves credits', async ({ page }) => {
  // ...
});
```

## COVERAGE REQUIREMENTS

| Module | Min Line Coverage | Min Branch Coverage |
|--------|------------------|---------------------|
| physics/ | 90% | 85% |
| game/ | 90% | 85% |
| renderer/ | 70% | 60% |
| server/services/ | 90% | 85% |
| server/routes/ | 85% | 80% |

## BUG REPORT FORMAT

When a test fails and reveals a bug:
```
BUG-[timestamp]:
  File: src/physics/WeldPool.js
  Function: tickPool
  Condition: when heatInput = 0 and pool already hot
  Expected: temperature stays stable
  Actual: NaN produced (division by zero in diffusion step)
  Test: tests/unit/physics/WeldPool.test.js line 47
  Severity: HIGH — NaN propagates to renderer, causes blank canvas
```

Report bugs to orchestrator before fixing. Orchestrator assigns fix task.
