# Tasks: M4 — Machine Panel + Audio (Automatic Mode)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 400–500 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | auto-forecast |
| Chain strategy | feature-branch-chain |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: feature-branch-chain
400-line budget risk: Medium

## Phase 1: Config & Types

- [ ] 1.1 Create `src/config/audio.js` — export `audioConfig` object with all constants from `config-audio` spec (ARC_HUM_*, VOLUME_*, SYNTHESIS_* constants)

## Phase 2: AudioEngine

- [ ] 2.1 Create `tests/unit/audio/AudioEngine.test.js` — test `audioEngine.activate()`, `startArcHum()`, `stopArcHum()`, `setArcHumAmperage()`, `setArcHumDutyCycle()`, `playSound()`, `dispose()` interface contracts with mock AudioContext
- [ ] 2.2 Create `src/audio/AudioEngine.js` — implement `audioEngine` singleton with lazy AudioContext, arc hum oscillator (start/stop/frequency/gain), synthesized sound playback (arc/crackle/spatter/slag/machine), and dispose cleanup

## Phase 3: SoundFX

- [ ] 3.1 Create `tests/unit/audio/SoundFX.test.js` — test `createSoundFX()`, `playArc()`, `playCrackle()`, `playSpatter()`, `playSlag()`, `playMachineHum()`, `startArcHum()`, `stopArcHum()`, volume normalization, delegation to AudioEngine
- [ ] 3.2 Create `src/audio/SoundFX.js` — implement `createSoundFX(audioEngine)` factory with all playback methods, volume clamping 0–1, and arc hum control delegation

## Phase 4: MachinePanel

- [ ] 4.1 Create `tests/unit/ui/MachinePanel.test.js` — test `createMachinePanel()` DOM structure, power/amperage/electrode event emission, duty cycle display update, overheat/cooldown indicator visibility
- [ ] 4.2 Create `src/ui/MachinePanel.js` — implement `createMachinePanel(container, eventBus)` with power toggle, amperage slider (50–200), duty cycle display, electrode selector, overheat/cooldown indicator, EventBus subscription

## Phase 5: Integration

- [ ] 5.1 Run `npx vitest run` — verify all 3 unit test files pass
- [ ] 5.2 Run `npx eslint src/ui/ src/audio/ --ext .js` — fix any lint errors
- [ ] 5.3 Verify all task checkboxes above are marked complete