# Config: Machines Specification

## Purpose

Defines all 5 machine tiers available in the game, sourced from RFC-001 §3.4. Machines determine maximum amperage and duty cycle capability.

## Data Structure

Each machine entry MUST contain:
- `id`: Unique identifier e.g. `BASIC_INVERTER_100A`
- `name`: Display name e.g. 'Basic Inverter 100A'
- `maxAmp`: Maximum amperage output
- `dutyCycle`: Duty cycle percentage (40–100%)
- `price`: Cost in credits (0 for starter machine)
- `xpUnlock`: XP level required to unlock purchase

## Required Machines

| ID | Name | Max Amp | Duty Cycle | Price | XP Unlock |
|----|------|---------|-----------|-------|-----------|
| BASIC_INVERTER_100A | Basic Inverter 100A | 100 | 40% | 0 (free) | 0 |
| INVERTER_160A | Inverter 160A | 160 | 60% | 250Ȼ | 300 |
| PRO_INVERTER_200A | Pro Inverter 200A | 200 | 80% | 600Ȼ | 800 |
| INDUSTRIAL_250A | Industrial 250A | 250 | 100% | 1200Ȼ | 1800 |
| PROFESSIONAL_315A | Professional 315A | 315 | 100% | 2500Ȼ | 3500 |

## Scenario: Machine unlock boundary check

- GIVEN player XP of 299
- WHEN the system checks unlock status for INVERTER_160A (XP 300)
- THEN the machine is NOT yet unlocked

- GIVEN player XP of 300
- WHEN the system checks unlock status for INVERTER_160A (XP 300)
- THEN the machine IS unlocked

## Scenario: Default machine availability

- GIVEN a new player with XP 0
- WHEN the system requests all available machines
- THEN BASIC_INVERTER_100A is included in the list
- AND no other machines are available yet