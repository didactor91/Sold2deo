# SKILL-ui.md — UI / DOM Subagent

## YOUR ROLE
You build the DOM panels, screens, and navigation for Weld Master. You never touch canvas rendering or physics. UI communicates with the game exclusively via EventBus. No direct state mutation.

## ENVIRONMENT
- Vanilla JS ES2022. No framework. No virtual DOM.
- DOM manipulation only (no innerHTML with user data — XSS risk).
- CSS: one stylesheet `/public/styles.css`. No inline styles except dynamic values (e.g. width%).
- Fonts: system monospace only. `font-family: 'Courier New', Courier, monospace`.
- EventBus: all communication via `/src/core/EventBus.js`.

## UI ARCHITECTURE

Each screen is a JS module that:
1. Owns its DOM subtree (created once, shown/hidden via CSS class).
2. Subscribes to EventBus events on `init()`.
3. Emits EventBus events on user interaction.
4. Never reads or writes GameState directly.

```js
// Component template
/**
 * @module MachinePanel
 */

import { EventBus } from '../core/EventBus.js';

let _elements = {};

/**
 * Initialises the machine panel DOM and event bindings.
 * Must be called once after DOMContentLoaded.
 * @param {HTMLElement} container
 */
export function init(container) {
  _elements = {
    powerBtn:  container.querySelector('#power-btn'),
    ampSlider: container.querySelector('#amp-slider'),
    ampDisplay: container.querySelector('#amp-display'),
    heatBar:   container.querySelector('#heat-bar'),
    powerLed:  container.querySelector('#power-led'),
    heatLed:   container.querySelector('#heat-led'),
  };

  _elements.powerBtn.addEventListener('click', () => {
    EventBus.emit('ui:machine:power_toggle');
  });

  _elements.ampSlider.addEventListener('input', (e) => {
    EventBus.emit('ui:machine:amperage_change', { value: parseInt(e.target.value, 10) });
  });

  EventBus.on('machine:state_update', _onMachineUpdate);
  EventBus.on('machine:overheat', _onOverheat);
}

function _onMachineUpdate(state) {
  _elements.ampDisplay.textContent = `${state.amperage}A`;
  _elements.heatBar.style.width = `${state.heatPercent}%`;
  _elements.heatBar.dataset.level = state.heatPercent > 80 ? 'danger' : state.heatPercent > 60 ? 'warn' : 'ok';
}

function _onOverheat() {
  _elements.ampSlider.disabled = true;
  _elements.powerLed.dataset.state = 'overheat';
}
```

## DOM CREATION RULES

- Use `document.createElement` + `textContent`. Never `innerHTML` with dynamic data.
- Use `dataset` attributes for state-driven CSS (not inline styles for states).
- Update at most 4Hz for non-critical displays (heat bar, score %). Use `requestAnimationFrame` for smooth ones.
- Accessibility: interactive elements have `aria-label`. Status LEDs have `role="status"` and `aria-live="polite"`.

## SCREEN ROUTER

```js
// Navigation.js
const SCREENS = ['simulator', 'idle-factory', 'shop', 'contracts', 'leaderboard'];

export function showScreen(name) {
  SCREENS.forEach(s => {
    document.getElementById(`screen-${s}`).classList.toggle('screen--active', s === name);
  });
  EventBus.emit('navigation:screen_changed', { screen: name });
}
```

## IDLE FACTORY SCREEN

Components:
- Bot roster: list of hired bots with tier, assigned contract, earnings/sec.
- Hire panel: available bot tiers with cost.
- Upgrade grid: factory upgrades, locked/unlocked state.
- Offline earnings modal: shown on load if offline time > 60s.
- Research tree: visual tree with unlock dependencies.

All data driven by events from `IdleEngine`. No direct state reads.

---

# SKILL-audio.md — Audio FX Subagent

## YOUR ROLE
You implement the Web Audio API sound engine for Weld Master. Procedurally synthesised sounds where possible (no audio files needed for core FX). Clean, self-contained module.

## ENVIRONMENT
- Web Audio API (`AudioContext`). No external audio libraries.
- Procedural synthesis: oscillators, noise buffers, filters.
- One `AudioContext` per page load. Resumed on first user gesture.
- All sounds pre-generated as `AudioBuffer` on `init()` — no runtime allocation.

## SOUND ARCHITECTURE

```js
// AudioEngine.js

let _ctx = null;
const _buffers = {};
const _nodes = {};

/**
 * Initialise audio context and pre-generate all buffers.
 * Call on first user gesture (click/keydown).
 */
export function init() {
  if (_ctx) return;
  _ctx = new AudioContext();
  _buffers.spatter = _generateSpatter();
  _buffers.slagChip = _generateSlagChip();
  _buffers.powerOn = _generatePowerOn();
  _buffers.levelUp = _generateLevelUp();
  _nodes.arcHum = _createArcHum();
  _nodes.machineHum = _createMachineHum();
}
```

## SYNTHESIS SPECS

### Arc Hum (procedural, continuous)
- Base: `OscillatorNode`, type `sawtooth`, 220Hz.
- Harmonic 2: `OscillatorNode`, 440Hz, gain 0.3.
- Harmonic 3: `OscillatorNode`, 660Hz, gain 0.15.
- All through `BiquadFilterNode` (lowpass, 2000Hz) then `GainNode`.
- Gain controlled by `setArcActive(bool)` and `setAmperage(amp)`.
- Pitch: `frequency.setValueAtTime(180 + (amp/maxAmp) * 100, ctx.currentTime)`.

### Machine Idle Hum (procedural, looping)
- Transformer hum: 50Hz + 100Hz + 150Hz oscillators, very low gain (0.05).
- Plays while machine is powered on.

### Spatter (buffer, triggered per particle)
- 8ms broadband noise burst.
- Random pitch offset ±20% via `playbackRate`.
- ```js
  function _generateSpatter() {
    const buf = _ctx.createBuffer(1, _ctx.sampleRate * 0.008, _ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    return buf;
  }
  ```

### Slag Chip (buffer, triggered on removal)
- 20ms metallic tap: sine at 800Hz decaying exponentially.

### Power On (buffer, triggered on machine power)
- 300ms rising pitch sweep: 80Hz → 180Hz.

### Level Up (buffer, triggered on level)
- 8-bit style: C-E-G-C arpeggio, square wave, 80ms per note.

## PUBLIC API

```js
export function init() {}
export function setArcActive(active) {}
export function setAmperage(amperage, maxAmperage) {}
export function playSpatter() {}
export function playSlagChip() {}
export function playPowerOn() {}
export function playLevelUp() {}
export function setMachinePowered(powered) {}
export function setMasterVolume(0..1) {}
```

All calls are no-ops if `_ctx === null` (audio not yet initialised). Safe to call before user gesture.
