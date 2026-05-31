# Delta for E2E Tests

## ADDED Requirements

### Requirement: Weld Session E2E

The system SHALL provide automated E2E tests that verify the complete weld workflow using Playwright against a running dev server.

#### Scenario: Complete weld session and receive score

- GIVEN the game is loaded at `http://localhost:3000`
- WHEN the user powers on the machine, sets amperage to 70A, and drags across the work zone
- THEN the system SHALL display a valid score result
- AND the score SHALL NOT be "Sin datos"

#### Scenario: Overheat alert fires when duty cycle exceeded

- GIVEN the machine is powered on with amperage at maximum
- WHEN the user performs a long weld exceeding duty cycle
- THEN the system SHALL display an overheat warning

### Requirement: Save/Load E2E

The system SHALL provide automated E2E tests that verify game state persistence.

#### Scenario: Save game and reload preserves state

- GIVEN the user has credits and an active weld session
- WHEN the user saves the game (localStorage)
- AND the page is reloaded
- THEN the system SHALL restore credits and session state

### Requirement: Idle Tick E2E

The system SHALL provide automated E2E tests that verify idle earnings calculation.

#### Scenario: Idle earnings accumulate over time

- GIVEN the user has purchased an idle upgrade (e.g., Auto Welder)
- WHEN the user is away for a known time period
- THEN the system SHALL calculate and display accumulated idle earnings

## REMOVED Requirements

None.