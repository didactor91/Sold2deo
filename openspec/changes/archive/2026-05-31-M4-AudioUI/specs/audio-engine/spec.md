# Delta for audio-engine

## ADDED Requirements

### Requirement: AudioContext Singleton

The system SHALL maintain a single `AudioContext` instance. The instance MUST be created lazily on first user interaction (click or keypress) to comply with browser autoplay policy.

### Scenario: AudioContext created on first interaction

- GIVEN AudioEngine has not been activated
- WHEN the user clicks anywhere on the page
- THEN `new AudioContext()` is created and stored
- AND `state` is set to `running`

### Scenario: AudioContext resumed after suspension

- GIVEN AudioContext was suspended (tab backgrounded)
- WHEN a sound is requested
- THEN `audioContext.resume()` is called
- AND the sound plays after resume completes

### Requirement: Arc Hum Oscillator

The system SHALL provide an `startArcHum()` method that creates a persistent oscillator node at approximately 60 Hz fundamental with harmonic overtones, routed through a gain node. The arc hum MUST continue playing until `stopArcHum()` is called.

- GIVEN AudioEngine has an active AudioContext
- WHEN `startArcHum()` is called
- THEN an OscillatorNode at 60 Hz is created and connected to a GainNode
- AND the gain node is connected to `audioContext.destination`
- AND the oscillator runs until `stopArcHum()` is called

### Requirement: Arc Hum Frequency Modulation

The system SHALL modulate the arc hum frequency based on the amperage value. Higher amperage produces a higher-pitched hum.

- GIVEN arc hum is playing
- WHEN `setArcHumAmperage(amps)` is called with value 50–200
- THEN the oscillator frequency is set to `60 + (amps - 50) * 0.3` Hz

### Requirement: Arc Hum Volume Control

The system SHALL modulate the arc hum volume based on duty cycle.

- GIVEN arc hum is playing
- WHEN `setArcHumDutyCycle(percent)` is called with value 0–100
- THEN the gain node gain is set to `percent / 100 * 0.3`

### Requirement: Synthesized Sound Buffer Playback

The system SHALL provide a `playSound(name, options)` method that generates and plays a synthesized sound buffer. Supported sounds: `arc`, `crackle`, `spatter`, `slag`, `machine`.

- GIVEN AudioEngine has an active AudioContext
- WHEN `playSound('arc', { volume: 0.8 })` is called
- THEN a synthesized arc sound buffer is generated and played
- AND the playback volume respects the provided options

### Requirement: Sound Synthesis: Arc

The arc sound SHALL be synthesized using a 60 Hz sawtooth wave with amplitude modulation at 120 Hz, duration 200 ms, and exponential decay.

### Requirement: Sound Synthesis: Crackle

The crackle sound SHALL be synthesized using white noise bursts with random amplitude, duration 50–150 ms.

### Requirement: Sound Synthesis: Spatter

The spatter sound SHALL be synthesized using short noise bursts (10–30 ms) with fast attack and decay, triggered randomly 2–5 times.

### Requirement: Sound Synthesis: Slag

The slag chip sound SHALL be synthesized using a low-frequency thud (20–40 Hz) with metallic high-frequency overlay, duration 100–200 ms.

### Requirement: Sound Synthesis: Machine Hum

The machine hum sound SHALL be synthesized using a 50 Hz sine wave with slight amplitude variation, looping, duration 500 ms.

### Requirement: AudioContext Cleanup

The system SHALL provide a `dispose()` method that closes the AudioContext and releases all resources.

- GIVEN AudioEngine has an active AudioContext
- WHEN `dispose()` is called
- THEN `audioContext.close()` is called
- AND all oscillator and buffer source nodes are disconnected