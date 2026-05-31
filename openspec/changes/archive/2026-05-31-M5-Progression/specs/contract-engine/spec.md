# Delta for contract-engine

## ADDED Requirements

### Requirement: Contract Generation

The system MUST generate contracts from templates with specific electrode, bead length, quality threshold, and time requirements.

#### Scenario: Generate contract from template

- GIVEN contract template with `electrodeCode: 'E6013-2.5'`, `minLength: 100`, `qualityThreshold: 70`, `rewardXp: 50`, `rewardCredits: 25`
- WHEN `generateContract(template)` is called
- THEN returned contract has unique id, required electrode, min length, quality threshold, and rewards

### Requirement: Contract Validation (Client-Side)

The system MUST validate contract completion client-side for immediate UX feedback, returning pass/fail with specific defect reasons.

#### Scenario: Contract passed with sufficient quality

- GIVEN a contract requiring `qualityThreshold: 70` and `minLength: 100`
- WHEN `validateContract(contract, sessionResult)` is called with quality score 85 and bead length 120
- THEN result is `{ passed: true, score: 85, defects: [] }`

#### Scenario: Contract failed due to low quality

- GIVEN a contract requiring `qualityThreshold: 70` and `minLength: 100`
- WHEN `validateContract(contract, sessionResult)` is called with quality score 55 and bead length 120
- THEN result is `{ passed: false, score: 55, defects: ['quality_below_threshold'] }`

#### Scenario: Contract failed due to insufficient length

- GIVEN a contract requiring `qualityThreshold: 70` and `minLength: 100`
- WHEN `validateContract(contract, sessionResult)` is called with quality score 80 and bead length 80
- THEN result is `{ passed: false, score: 80, defects: ['length_insufficient'] }`

### Requirement: Contract Reward Distribution

The system MUST distribute XP and credits on contract completion. Failed contracts award 50% of the XP reward but 0 credits.

#### Scenario: Reward on contract pass

- GIVEN a contract with `rewardXp: 50` and `rewardCredits: 25`
- WHEN `distributeRewards(contract, sessionResult)` is called with `passed: true`
- THEN XP awarded equals 50 and credits awarded equals 25

#### Scenario: Partial reward on contract fail

- GIVEN a contract with `rewardXp: 50` and `rewardCredits: 25`
- WHEN `distributeRewards(contract, sessionResult)` is called with `passed: false`
- THEN XP awarded equals 25 (50%) and credits awarded equals 0