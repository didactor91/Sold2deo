# Delta for Coverage Analysis

## ADDED Requirements

### Requirement: Core Modules Coverage ≥ 90%

The system SHALL maintain ≥ 90% line coverage for core physics and game modules.

#### Scenario: physics/ module coverage

- GIVEN `src/physics/**` modules
- WHEN coverage is measured with `npx vitest run --coverage`
- THEN line coverage SHALL be ≥ 90%

#### Scenario: game/ module coverage

- GIVEN `src/game/**` modules
- WHEN coverage is measured with `npx vitest run --coverage`
- THEN line coverage SHALL be ≥ 90%

### Requirement: Server Routes Coverage ≥ 85%

The system SHALL maintain ≥ 85% line coverage for server routes.

#### Scenario: server/src/routes coverage

- GIVEN `server/src/routes/**` modules
- WHEN coverage is measured
- THEN line coverage SHALL be ≥ 85%

## REMOVED Requirements

None.