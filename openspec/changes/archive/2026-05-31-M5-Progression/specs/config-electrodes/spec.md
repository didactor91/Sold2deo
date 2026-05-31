# Config: Electrodes Specification

## Purpose

Defines all 6 electrode types available in the game, sourced from RFC-001 §3.3. Electrodes are the consumable tool that determines welding characteristics.

## Data Structure

Each electrode entry MUST contain:
- `code`: Unique identifier format `{type}-{diameter}` e.g. `E6013-2.5`
- `type`: Electrode classification (Rutile, Basic, Cellulosic, Stainless)
- `diameter`: Wire diameter in mm (2.5, 3.2, 4.0)
- `ampRange`: Object with `min` and `max` amperage values
- `penetration`: 'Low' | 'Low-Med' | 'Med-High' | 'High' | 'Very High'
- `spatter`: 'Low' | 'Very Low' | 'High'
- `slag`: Object with `thickness` ('thin' | 'thick') and `difficulty` ('easy' | 'rigid')
- `difficulty`: Star rating 1-4 (★ scale)
- `xpUnlock`: XP level required to unlock this electrode

## Required Electrodes

| Code | Type | Diameter | Amp Range | Penetration | Spatter | Slag | Difficulty | XP Unlock |
|------|------|----------|-----------|-------------|---------|------|------------|-----------|
| E6013-2.5 | Rutile | 2.5 | 60–90 | Low | Low | thin, easy | ★☆☆☆ | 0 |
| E6013-3.2 | Rutile | 3.2 | 80–130 | Low-Med | Low | thin, easy | ★☆☆☆ | 200 |
| E7018-3.2 | Basic (LH) | 3.2 | 100–160 | Med-High | Very Low | thick, rigid | ★★☆☆ | 500 |
| E7018-4.0 | Basic (LH) | 4.0 | 140–200 | High | Very Low | thick, rigid | ★★★☆ | 900 |
| E6010-3.2 | Cellulosic | 3.2 | 70–140 | Very High | High | thin, fluid | ★★★★ | 1200 |
| E308L-2.5 | Stainless | 2.5 | 60–100 | Low | Low | light | ★★★☆ | 2000 |

## Scenario: Config completeness

- GIVEN the electrodes configuration
- WHEN the system requests all electrode codes
- THEN exactly 6 electrodes are returned with valid amp ranges and unique codes

## Scenario: Unlock boundary check

- GIVEN player XP of 199
- WHEN the system checks unlock status for E6013-3.2 (XP 200)
- THEN the electrode is NOT yet unlocked

- GIVEN player XP of 200
- WHEN the system checks unlock status for E6013-3.2 (XP 200)
- THEN the electrode IS unlocked