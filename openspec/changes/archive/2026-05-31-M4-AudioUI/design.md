# Design: M4 — Machine Panel + Audio (Automatic Mode)

## Technical Approach

MachinePanel is a pure DOM component mounted by the existing UIRenderer. AudioEngine is a Web Audio API singleton that manages the AudioContext lifecycle, oscillator-based arc hum, and synthesized buffer playback. SoundFX wraps AudioEngine for convenient sound bank access. All inter-module communication flows through the existing EventBus — no circular dependencies.

## Architecture Decisions

### Decision: AudioContext Lazy Initialization

**Choice**: AudioContext is created on the first user gesture (click/keypress), not at module load.
**Alternatives considered**: Create on `new AudioEngine()` construction; create on first `playSound()` call.
**Rationale**: Browser autoplay policy blocks AudioContext until user interaction. Creating on first gesture ensures compliance while keeping the API simple. Creating on first `playSound()` would mix playback trigger with context creation — separating concerns is cleaner.

### Decision: Oscillator-Based Arc Hum

**Choice**: Arc hum uses a persistent OscillatorNode rather than a pre-generated buffer.
**Alternatives considered**: Generate a looping buffer and use BufferSourceNode.
**Rationale**: Oscillator frequency and gain can be modulated in real-time (for amperage/duty cycle response) without regenerating buffers. BufferSourceNode is immutable once started.

### Decision: Synthesized Sounds (Not Sampled)

**Choice**: All sound effects (arc, crackle, spatter, slag, machine) are synthesized via Web Audio API algorithms, not loaded from audio files.
**Alternatives considered**: Load .wav/.mp3 files from disk.
**Rationale**: No asset pipeline required; sounds can be parametrically modulated (volume, pitch of arc hum); eliminates external asset dependencies; works offline.

### Decision: SoundFX Delegates to AudioEngine

**Choice**: SoundFX is a thin facade over AudioEngine, not a separate audio system.
**Alternatives considered**: SoundFX owns its own AudioContext.
**Rationale**: Single AudioContext per page is Web Audio API best practice. A facade provides ergonomic per-sound methods while keeping the context singleton managed by AudioEngine.

## Data Flow

```
User interaction (click)
       │
       ▼
AudioEngine.activate() ──→ new AudioContext()
       │
       ▼
MachinePanel ──emit──→ EventBus
       │                    │
       │              machine:power
       │              machine:amperage
       │              machine:electrode
       │
       ▼
SoundFX ──playSound──→ AudioEngine ──→ OscillatorNode / BufferSourceNode
                                           │
                                           ▼
                                   audioContext.destination
```

```
machine:overheat ──subscribe──→ MachinePanel (overheat indicator ON)
machine:cooldown ──subscribe──→ MachinePanel (overheat indicator OFF)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/ui/MachinePanel.js` | Create | DOM panel — power/amperage/duty cycle/electrode |
| `src/audio/AudioEngine.js` | Create | Web Audio API singleton — context, oscillator, synthesis |
| `src/audio/SoundFX.js` | Create | Sound bank facade |
| `src/config/audio.js` | Create | Audio constants |
| `tests/unit/ui/MachinePanel.test.js` | Create | Panel unit tests |
| `tests/unit/audio/AudioEngine.test.js` | Create | AudioEngine unit tests |
| `tests/unit/audio/SoundFX.test.js` | Create | SoundFX unit tests |

## Interfaces / Contracts

### MachinePanel

```javascript
/**
 * @param {HTMLElement} container
 * @param {EventBus} eventBus
 */
export function createMachinePanel(container, eventBus) { ... }
```

### AudioEngine

```javascript
export const audioEngine = {
  /** Activates AudioContext on first call */
  activate(),

  /** Starts persistent arc hum oscillator */
  startArcHum(),

  /** Stops arc hum oscillator */
  stopArcHum(),

  /** Modulate arc hum pitch by amperage (50–200) */
  setArcHumAmperage(amps),

  /** Modulate arc hum volume by duty cycle (0–100) */
  setArcHumDutyCycle(percent),

  /** Play a synthesized sound by name */
  playSound(name, { volume }),

  /** Release all resources */
  dispose(),
};
```

### SoundFX

```javascript
/**
 * @param {AudioEngine} audioEngine
 */
export function createSoundFX(audioEngine) { ... }
```

### audioConfig

```javascript
export const audioConfig = {
  ARC_HUM_BASE_FREQ: 60,
  ARC_HUM_FREQ_PER_AMP: 0.3,
  ARC_HUM_MAX_GAIN: 0.3,
  // ... all constants from config-audio spec
};
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | MachinePanel DOM structure + event emission | jsdom + EventBus mock |
| Unit | AudioEngine interface + AudioContext state machine | Mock AudioContext |
| Unit | SoundFX delegation + volume clamping | Mock AudioEngine |
| Integration | MachinePanel ↔ EventBus ↔ AudioEngine wiring | Manual verification |

## Migration / Rollout

No migration required. This is a net-new feature with no existing state to migrate.

## Open Questions

- [ ] None — all decisions are resolved in this design.