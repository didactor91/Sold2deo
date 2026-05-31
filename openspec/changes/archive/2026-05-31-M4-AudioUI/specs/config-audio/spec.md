# Delta for config-audio

## ADDED Requirements

### Requirement: Audio Configuration Module

The system SHALL export a `audioConfig` object from `src/config/audio.js` containing all audio balance constants.

### Requirement: Arc Hum Constants

The audio configuration MUST define arc hum constants:

| Constant | Value | Description |
|----------|-------|-------------|
| `ARC_HUM_BASE_FREQ` | 60 | Base frequency in Hz |
| `ARC_HUM_FREQ_PER_AMP` | 0.3 | Frequency increase per amp above 50 |
| `ARC_HUM_MAX_GAIN` | 0.3 | Maximum gain for arc hum |
| `ARC_HUM_AMP_THRESHOLD` | 50 | Amperage below which arc is off |
| `ARC_HUM_AMP_MAX` | 200 | Maximum amperage |

### Requirement: Volume Constants

The audio configuration MUST define volume constants:

| Constant | Value | Description |
|----------|-------|-------------|
| `DEFAULT_VOLUME` | 0.7 | Default sound effect volume |
| `ARC_VOLUME` | 0.8 | Arc sound volume |
| `CRACKLE_VOLUME` | 0.6 | Crackle sound volume |
| `SPATTER_VOLUME` | 0.5 | Spatter sound volume |
| `SLAG_VOLUME` | 0.4 | Slag sound volume |
| `MACHINE_VOLUME` | 0.3 | Machine hum volume |

### Requirement: Synthesis Constants

The audio configuration MUST define synthesis constants for each sound type:

| Constant | Value | Description |
|----------|-------|-------------|
| `ARC_DURATION` | 200 | Arc sound duration in ms |
| `ARC_MOD_FREQ` | 120 | Arc amplitude modulation frequency |
| `CRACKLE_MIN_DURATION` | 50 | Crackle minimum duration in ms |
| `CRACKLE_MAX_DURATION` | 150 | Crackle maximum duration in ms |
| `SPATTER_MIN_DURATION` | 10 | Spatter minimum duration in ms |
| `SPATTER_MAX_DURATION` | 30 | Spatter maximum duration in ms |
| `SPATTER_COUNT_MIN` | 2 | Minimum spatter particles |
| `SPATTER_COUNT_MAX` | 5 | Maximum spatter particles |
| `SLAG_LOW_FREQ` | 30 | Slag thud frequency in Hz |
| `SLAG_HIGH_FREQ` | 2000 | Slag metallic overlay frequency |
| `SLAG_DURATION_MIN` | 100 | Slag minimum duration in ms |
| `SLAG_DURATION_MAX` | 200 | Slag maximum duration in ms |
| `MACHINE_HUM_FREQ` | 50 | Machine hum frequency in Hz |
| `MACHINE_HUM_DURATION` | 500 | Machine hum buffer duration in ms |

### Requirement: Duty Cycle Calculation

The system SHALL use the formula `dutyCycle = clamp((amperage - 50) / 150 * 100, 0, 100)` to compute duty cycle percentage from amperage.