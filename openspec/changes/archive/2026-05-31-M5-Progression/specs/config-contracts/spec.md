# Config: Contracts Specification

## Purpose

Defines contract templates that generate welding job contracts. Contracts specify required electrode, bead length, quality threshold, time limit (optional), and rewards.

## Data Structure

Each contract template MUST contain:
- `id`: Unique template identifier
- `electrodeCode`: Required electrode code for this contract
- `minLength`: Minimum bead length in mm required to pass
- `qualityThreshold`: Minimum quality score (0-100) required to pass
- `timeLimit`: Optional time limit in seconds. null means no time limit.
- `rewardXp`: XP awarded on successful completion
- `rewardCredits`: Credits awarded on successful completion
- `xpTier`: Minimum XP level required to receive this contract (used for gating)

## Contract Templates

| ID | Electrode | Min Length | Quality | Time | XP Reward | Credits | XP Tier |
|----|-----------|------------|---------|------|-----------|---------|---------|
| TUTORIAL_A | E6013-2.5 | 50 | 50 | null | 30 | 15 | 0 |
| TUTORIAL_B | E6013-2.5 | 80 | 60 | 120 | 50 | 25 | 0 |
| BEGINNER_A | E6013-3.2 | 100 | 65 | 150 | 80 | 40 | 200 |
| BEGINNER_B | E6013-3.2 | 120 | 70 | 180 | 100 | 50 | 200 |
| INTERMEDIATE_A | E7018-3.2 | 100 | 72 | 180 | 120 | 60 | 500 |
| INTERMEDIATE_B | E7018-4.0 | 80 | 75 | 200 | 150 | 75 | 900 |
| ADVANCED_A | E6010-3.2 | 100 | 78 | 200 | 200 | 100 | 1200 |
| ADVANCED_B | E7018-4.0 | 150 | 80 | 240 | 250 | 125 | 900 |
| EXPERT_A | E6010-3.2 | 120 | 82 | 180 | 300 | 150 | 1200 |
| EXPERT_B | E308L-2.5 | 100 | 85 | 240 | 400 | 200 | 2000 |

## Scenario: Contract generation from template

- GIVEN contract template BEGINNER_A
- WHEN `generateContract(BEGINNER_A)` is called
- THEN returned contract has unique instance id, electrode E6013-3.2, min length 100, quality 65, rewards 80 XP / 40 credits

## Scenario: Contract XP tier gating

- GIVEN player with XP level corresponding to 150 XP
- WHEN requesting available contracts
- THEN contracts with xpTier <= 150 are returned
- AND contracts with xpTier > 150 are NOT returned

## Scenario: Failed contract returns partial XP

- GIVEN a contract with rewardXp: 100, rewardCredits: 50
- WHEN the player fails the contract
- THEN 50 XP is awarded (50% of 100)
- AND 0 credits are awarded