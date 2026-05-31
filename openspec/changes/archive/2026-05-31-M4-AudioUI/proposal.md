# Proposal: M4 — Machine Panel + Audio (Automatic Mode)

## Intent

Add the machine control panel (DOM-based) and Web Audio synthesis engine for arc sounds, completing the player-facing UI and audio layer for the welder simulation. M1–M3 delivered physics, rendering, and simulation core; M4 exposes control and audio feedback to the player.

## Scope

### In Scope
- MachinePanel.js: DOM panel with power/amperage/duty cycle controls and electrode selector
- AudioEngine.js: Web Audio API — oscillator arc hum, synthesized crackle/spatter/slag/machine sounds
- SoundFX.js: sound bank manager with arc, crackle, spatter, slag chip, machine hum
- Events: `machine:power`, `machine:amperage`, `machine:electrode`, `machine:overheat`, `machine:cooldown`
- Audio config: `src/config/audio.js`

### Out of Scope
- M5 (Foot Pedal / Travel Speed) — separate change
- Backend API integration — M6
- E2E audio tests — manual verification only

## Capabilities

### New Capabilities
- `machine-panel`: DOM control panel exposing power/amperage/duty cycle/electrode selector; publishes machine events to EventBus
- `audio-engine`: Web Audio API singleton managing AudioContext, oscillator arc hum, and synthesized sound playback
- `sound-fx`: sound bank loading and playback manager for arc/c rackle/spatter/slag/machine sounds
- `config-audio`: balance constants for audio (volumes, frequencies, envelope times)

### Modified Capabilities
- None

## Approach

MachinePanel is pure DOM, mounted by the existing UIRenderer. AudioEngine owns a single AudioContext, pre-loads synthesized buffers, and drives arc hum via a persistent oscillator node. SoundFX wraps the AudioEngine buffer-playback API. All components communicate via the existing EventBus — no direct coupling.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/ui/MachinePanel.js` | New | DOM panel — power/amperage/duty cycle/electrode |
| `src/audio/AudioEngine.js` | New | Web Audio API singleton — oscillator + buffers |
| `src/audio/SoundFX.js` | New | Sound bank manager |
| `src/config/audio.js` | New | Audio constants |
| `tests/unit/ui/MachinePanel.test.js` | New | Panel unit tests |
| `tests/unit/audio/AudioEngine.test.js` | New | AudioEngine unit tests |
| `tests/unit/audio/SoundFX.test.js` | New | SoundFX unit tests |
| `src/core/EventBus.js` | Modified | Consumed by MachinePanel for events |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Web Audio API blocked until user gesture | Med | AudioContext created on first click; show "click to enable audio" hint |
| AudioContext state loss on tab backgrounding | Low | Handle `statechange` event; recreate on resume |
| Strict TDD + Web Audio = mock complexity | Med | Mock AudioContext in tests; test only interface contract, not internals |

## Rollback Plan

Delete `src/ui/MachinePanel.js`, `src/audio/AudioEngine.js`, `src/audio/SoundFX.js`, `src/config/audio.js`. Revert EventBus if modified. Run tests to confirm clean removal.

## Dependencies

- `src/core/EventBus.js` — must exist (M2 or M3 delivery)
- Vitest 1.4.0 — test runner confirmed present

## Success Criteria

- [ ] MachinePanel renders power/amperage/duty cycle/electrode controls in DOM
- [ ] MachinePanel publishes `machine:power`, `machine:amperage`, `machine:electrode` events
- [ ] AudioEngine initializes single AudioContext on first user interaction
- [ ] Arc hum oscillator plays at correct frequency when machine is powered
- [ ] SoundFX plays arc/c rackle/spatter/slag/machine sounds on demand
- [ ] All 3 unit test files pass: `npx vitest run`
- [ ] ESLint passes: `npx eslint src/ui/ src/audio/ --ext .js`