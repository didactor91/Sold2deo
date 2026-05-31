# Delta for idle-factory

## ADDED Requirements

### Requirement: Bot Tier Display

The system MUST display all 5 bot tiers with their name, base quality percentage, speed multiplier, hire cost, and hourly salary.

#### Scenario: Display all bot tiers

- GIVEN the idle factory screen is open
- WHEN the bot roster section renders
- THEN all 5 tiers are shown: Apprentice (35%, 0.5×, 50Ȼ, 2Ȼ/hr), Welder B (55%, 0.8×, 150Ȼ, 5Ȼ/hr), Welder A (70%, 1.0×, 400Ȼ, 12Ȼ/hr), Specialist (82%, 1.2×, 900Ȼ, 28Ȼ/hr), Master (93%, 1.5×, 2000Ȼ, 60Ȼ/hr)

### Requirement: Bot Hiring

The system MUST allow hiring a bot when the player has sufficient credits. The hired bot is added to the active bot roster.

#### Scenario: Hire bot with sufficient credits

- GIVEN player has 500Ȼ and an Apprentice bot costs 50Ȼ
- WHEN player clicks "Hire" on Tier 1
- THEN 50Ȼ is deducted and the bot appears in the active roster

#### Scenario: Hire bot with insufficient credits

- GIVEN player has 30Ȼ and an Apprentice bot costs 50Ȼ
- WHEN player clicks "Hire" on Tier 1
- THEN hire fails and an error message is displayed

### Requirement: Bot Assignment to Contract

The system MUST assign a bot to an active contract. The bot's credits-per-second contribution is calculated as: `botQuality × botSpeed × (contractReward / contractDuration)`.

#### Scenario: Assign bot to contract

- GIVEN a Tier 3 Welder A (70% quality, 1.0× speed) assigned to a contract paying 100Ȼ over 3600s
- WHEN assignment is made
- THEN credits per second = 0.70 × 1.0 × (100/3600) ≈ 0.0194 Ȼ/s

### Requirement: Factory Upgrades

The system MUST display and apply factory upgrades that modify bot efficiency.

#### Scenario: Purchase ventilation upgrade (+10% duty cycle)

- GIVEN ventilation upgrade costs 200Ȼ and provides +10% efficiency multiplier
- WHEN player purchases ventilation
- THEN all bot outputs are multiplied by 1.10

#### Scenario: Purchase second shift upgrade (×2 offline cap)

- GIVEN second shift upgrade doubles the offline earnings cap
- WHEN player purchases second shift
- THEN maxOfflineHours is doubled for offline calculations

### Requirement: Offline Earnings Display

The system MUST display offline earnings earned since last login, calculated as `min(now - lastTickTimestamp, maxOfflineHours) × creditsPerSecond × efficiencyFactor`.

#### Scenario: Display offline earnings on login

- GIVEN lastTickTimestamp is 2 hours ago, maxOfflineHours is 8, creditsPerSecond is 0.5, efficiencyFactor is 1.0
- WHEN idle factory screen opens
- THEN displayed offline earnings = 2 × 3600 × 0.5 × 1.0 = 3600Ȼ
