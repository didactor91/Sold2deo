# Delta for Performance Benchmarks

## ADDED Requirements

### Requirement: Physics Tick Performance

The system SHALL meet a maximum physics tick time of 2ms at 60fps (16.67ms frame budget).

#### Scenario: Single weld pool tick completes within 2ms

- GIVEN a WeldPool of standard size (128×16 cells)
- WHEN tickPool is called with typical heat input (500 J/s)
- THEN the operation SHALL complete with mean time < 2ms over 1000 iterations

#### Scenario: Idle engine tick completes within 1ms

- GIVEN an IdleEngine with up to 10 machines
- WHEN tickIdle is called
- THEN the operation SHALL complete with mean time < 1ms over 1000 iterations

### Requirement: No Regression in Tick Performance

The system SHALL NOT exhibit worse tick performance after M9 changes.

## REMOVED Requirements

None.