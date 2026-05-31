# Delta for sound-fx

## ADDED Requirements

### Requirement: SoundFX Manager Initialization

The system SHALL provide a `SoundFX` class that wraps an `AudioEngine` instance. The constructor MUST accept an `AudioEngine` reference.

### Scenario: SoundFX initialized with AudioEngine

- GIVEN an `AudioEngine` instance
- WHEN `new SoundFX(audioEngine)` is called
- THEN `this.audioEngine` is set to the provided instance

### Requirement: Arc Sound Playback

The system SHALL provide an `playArc(volume)` method that calls `audioEngine.playSound('arc', { volume })`.

### Requirement: Crackle Sound Playback

The system SHALL provide a `playCrackle(volume)` method that calls `audioEngine.playSound('crackle', { volume })`.

### Requirement: Spatter Sound Playback

The system SHALL provide a `playSpatter(volume)` method that calls `audioEngine.playSound('spatter', { volume })`.

### Requirement: Slag Sound Playback

The system SHALL provide a `playSlag(volume)` method that calls `audioEngine.playSound('slag', { volume })`.

### Requirement: Machine Hum Playback

The system SHALL provide a `playMachineHum(volume)` method that calls `audioEngine.playSound('machine', { volume })`.

### Requirement: Volume Normalization

All sound playback methods SHOULD normalize volume to 0.0–1.0 range before passing to AudioEngine.

- GIVEN any `playXxx(volume)` method is called with volume > 1.0
- THEN the volume is clamped to 1.0 before passing to AudioEngine
- AND if volume < 0, it is clamped to 0

### Requirement: Arc Hum Control Integration

The system SHALL provide `startArcHum()` and `stopArcHum()` methods that delegate to `audioEngine.startArcHum()` and `audioEngine.stopArcHum()`.

### Requirement: Amperage and Duty Cycle Integration

The system SHALL provide `setArcHumAmperage(amps)` and `setArcHumDutyCycle(percent)` methods that delegate to the AudioEngine.

- GIVEN SoundFX is initialized
- WHEN `setArcHumAmperage(150)` is called
- THEN `audioEngine.setArcHumAmperage(150)` is called