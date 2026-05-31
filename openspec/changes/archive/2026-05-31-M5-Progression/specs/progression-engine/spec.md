# Delta for progression-engine

## ADDED Requirements

### Requirement: XP Curve Formula

The system MUST calculate XP required to reach the next level using the formula: `xpToNext(level) = Math.floor(100 * Math.pow(1.45, level - 1))` for level >= 1.

#### Scenario: XP curve returns correct values

- GIVEN level 1
- WHEN `xpToNext(1)` is called
- THEN the result equals 100

#### Scenario: XP curve grows exponentially

- GIVEN level 5
- WHEN `xpToNext(5)` is called
- THEN the result equals `Math.floor(100 * Math.pow(1.45, 4))` ≈ 720

### Requirement: XP Granting

The system MUST add XP to the player's total and recalculate level when XP threshold is crossed.

#### Scenario: XP grant below level threshold

- GIVEN a player with `xp=50`, `level=1`, `xpToNext(1)=100`
- WHEN `grantXP(30)` is called
- THEN player's xp equals 80 and level remains 1

#### Scenario: XP grant crosses level threshold

- GIVEN a player with `xp=90`, `level=1`, `xpToNext(1)=100`
- WHEN `grantXP(20)` is called
- THEN player's xp equals 110, level equals 2, and remaining XP carries forward

#### Scenario: Multiple level ups in single grant

- GIVEN a player with `xp=950`, `level=5`, `xpToNext(5)=720`
- WHEN `grantXP(1000)` is called
- THEN the player levels up to at least level 8 with correct remaining XP

### Requirement: Unlock Events

The system MUST emit `unlock:electrode` events when XP threshold for a new electrode is crossed, and `unlock:machine` events when XP threshold for a new machine is crossed.

#### Scenario: Electrode unlock event emitted

- GIVEN a player at XP 195 with no E6013 3.2mm unlocked
- WHEN `grantXP(10)` brings XP to 205 (crossing 200 threshold)
- THEN `unlock:electrode` event is emitted with electrode code `E6013-3.2`

#### Scenario: Machine unlock event emitted

- GIVEN a player at XP 295 with Inverter 160A locked
- WHEN `grantXP(10)` brings XP to 305 (crossing 300 threshold)
- THEN `unlock:machine` event is emitted with machine id `INVERTER_160A`

### Requirement: State Access

The system MUST provide read-only access to current progression state including xp, level, unlocked electrodes, and unlocked machines.

#### Scenario: Get current state

- GIVEN a progression engine with `xp=500`, `level=4`
- WHEN `getState()` is called
- THEN returned object contains `{ xp: 500, level: 4, unlockedElectrodes: [...], unlockedMachines: [...] }`