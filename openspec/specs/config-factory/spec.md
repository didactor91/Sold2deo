# Delta for config-factory

## ADDED Requirements

### Requirement: Bot Tier Constants

The system MUST define 5 bot tiers with quality, speed, cost, and salary values from RFC-001 §3.7 table.

#### Scenario: Bot tier 1 (Apprentice) values

- GIVEN tier 1 definition
- THEN baseQuality = 35, speedMultiplier = 0.5, hireCost = 50, salaryPerHour = 2

#### Scenario: Bot tier 5 (Master) values

- GIVEN tier 5 definition
- THEN baseQuality = 93, speedMultiplier = 1.5, hireCost = 2000, salaryPerHour = 60

### Requirement: Factory Upgrade Definitions

The system MUST define factory upgrades with id, name, description, cost, and effect.

#### Scenario: Ventilation upgrade definition

- GIVEN ventilation upgrade
- THEN id = 'ventilation', cost = 200, effect = { type: 'efficiency_multiplier', value: 1.10 }

#### Scenario: Second shift upgrade definition

- GIVEN second shift upgrade
- THEN id = 'second_shift', cost = 500, effect = { type: 'offline_cap_multiplier', value: 2.0 }

#### Scenario: QC station upgrade definition

- GIVEN QC station upgrade
- THEN id = 'qc_station', cost = 300, effect = { type: 'quality_bonus', value: 0.05 }

### Requirement: Offline Constants

The system MUST define `MAX_OFFLINE_HOURS = 8` as the default cap on offline earnings.

#### Scenario: Default offline cap

- GIVEN MAX_OFFLINE_HOURS constant
- THEN value equals 8
