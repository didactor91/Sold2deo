# SDD-001 — WELD MASTER: System Design Document

**Version:** 1.0.0  
**Date:** 2026-05-31  
**Depends on:** RFC-001-WELDMASTER.md

---

## 1. PHYSICS ENGINE — M1

### 1.1 WeldPool.js

Models the molten pool as a 2D grid of cells. Each cell has:

```js
/**
 * @typedef {Object} PoolCell
 * @property {number} temperature   - Kelvin, range 293–2800
 * @property {number} mass          - kg equivalent (normalised 0–1)
 * @property {boolean} solid        - true once below solidus temperature
 * @property {boolean} slag         - true if this cell is slag layer
 */
```

**Constants (all in balance.js):**
```
SOLIDUS_TEMP         = 1450   // °C, steel solidification
LIQUIDUS_TEMP        = 1530   // °C
ARC_HEAT_INPUT       = 0.85   // efficiency factor
POOL_VISCOSITY       = 0.006  // Pa·s, mild steel at liquidus
POOL_SURFACE_TENSION = 1.2    // N/m
THERMAL_DIFFUSIVITY  = 8e-6   // m²/s, mild steel
```

**Tick behaviour:**
1. Apply heat at electrode contact point: `Q = I × V × η × dt` where V=arc voltage (derived from arc length), η=ARC_HEAT_INPUT.
2. Diffuse heat to neighbours: simplified 2D FDM explicit scheme.
3. Any cell above SOLIDUS_TEMP: `solid = false`, participates in fluid step.
4. Fluid step: shift liquid mass downhill (gravity), limited by viscosity.
5. Any cell below SOLIDUS_TEMP: `solid = true`, emits slag flag on top cell.

### 1.2 BeadAccumulator.js

Maintains the bead profile as an array of column heights:

```js
/**
 * @typedef {Object} BeadColumn
 * @property {number} x          - canvas x position
 * @property {number} baseY      - top of workpiece surface
 * @property {number} height     - accumulated bead height in pixels
 * @property {number} temperature
 * @property {boolean} hasSlag
 * @property {boolean} slagRemoved
 */
```

Each tick: if pool cell at column x is liquid → increment height by `deposition_rate = wire_feed_equivalent(amperage) × dt`.

### 1.3 SlagLayer.js

```js
/**
 * @typedef {Object} SlagSegment
 * @property {number} x
 * @property {number} width
 * @property {number} thickness  - pixels
 * @property {boolean} removed
 * @property {number} hardness   // 0–1, increases with age
 */
```

**Removal mechanic:** Player enters "chip mode" (keyboard shortcut `C`). Cursor becomes chisel. Click+drag over slag: if `drag_force > hardness × resistance_constant` → `removed = true`. Removed slag: particle burst visual.

**Penalty:** If `BeadAccumulator.deposit()` is called on a column where `hasSlag && !slagRemoved` → flag as INCLUSION defect for that column.

### 1.4 SpatterSystem.js

Particle pool, pre-allocated. Never allocate during game loop.

```js
/**
 * @typedef {Object} SpatterParticle
 * @property {number} x
 * @property {number} y
 * @property {number} vx
 * @property {number} vy
 * @property {number} life       - 0–1, decreasing
 * @property {boolean} active
 * @property {string} color
 */
```

Pool size: 512. On emission: find first inactive particle, reset. On tick: update position, apply gravity `(0, 980px/s²)`, reduce life. On canvas hit: `vy *= -0.3` (one bounce). Stick when `life < 0.1`.

Emission rate: `base_rate[electrode] × arc_factor` where arc_factor = `clamp(arc_length / ideal_arc, 0.5, 4)`.

### 1.5 ArcPhysics.js

```js
/**
 * Validates arc state given mouse position and workpiece surface Y.
 * @param {number} mouseY
 * @param {number} surfaceY        - current top of bead at mouseX
 * @param {number} amperage
 * @param {string} electrodeType
 * @returns {ArcState}
 */

/**
 * @typedef {Object} ArcState
 * @property {number}  arcLength     - px
 * @property {boolean} arcEstablished
 * @property {boolean} shortCircuit
 * @property {number}  voltage       - derived
 * @property {number}  heatInput     - J/s
 * @property {string}  status        - 'ok'|'short'|'long'|'broken'
 */
```

Arc length ideal: `electrode_diameter × 1.0` (rule of thumb: arc = diameter).  
Arc broken: `arcLength > electrode_diameter × 3`.  
Short circuit: `arcLength < 0.5`.

Travel angle: derived from `atan2(dy, dx)` of mouse movement vector over last 10 ticks. Ideal: 70–80° from horizontal (forehand). Penalty applied outside 60–90° range.

### 1.6 HeatDiffusion.js

Gaussian spread of HAZ colour. Pure visual, computed once per bead column on solidification. Writes to a separate off-screen canvas layer (hazCanvas), composited by renderer.

---

## 2. RENDERER — M2

All rendering layered onto a single visible canvas via compositing. Layers drawn in order:

```
Layer 0: Background (static, drawn once)
Layer 1: Workpiece base metal
Layer 2: HAZ (off-screen hazCanvas, composited)
Layer 3: Bead columns (temperature-mapped colour)
Layer 4: Slag layer
Layer 5: Spatter particles + stuck debris
Layer 6: Arc glow
Layer 7: Electrode + droplet
Layer 8: UI overlay (HUD)
```

### 2.1 SceneRenderer.js

Master compositor. Called once per animation frame. Calls sub-renderers in layer order. Uses `ctx.save()/ctx.restore()` around each layer.

```js
/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {GameState} state
 * @param {number} interpolation  - 0–1, for render interpolation between physics ticks
 */
function render(ctx, state, interpolation) {}
```

### 2.2 ElectrodeRenderer.js

Draws:
- Electrode stick (rect with colour per type, shrinking length as consumed)
- Electrode holder (grey clamp)
- Arc glow (radial gradient from arc base, radius proportional to amperage, colour per process):
  - Rutile: `#4488ff`
  - Basic: `#6644ff`
  - Cellulosic: `#ff8800`
- Droplet: sphere at arc tip, oscillates, detaches at interval = `1/(wire_feed_rate)`, falls to pool with gravity.
- Smoke wisps: 3–5 particles per tick, upward drift, alpha fade.

**No gradients on arc glow during streaming — use solid colour rings if performance < 55fps.**

### 2.3 WorkpieceRenderer.js

- Base metal: flat `#2a2a2a` rect.
- Bead columns: each column is a filled rect. Fill colour mapped from temperature:
  ```
  > 1500°C : #ffff00
  > 1200°C : #ff8800
  > 900°C  : #ff3300
  > 600°C  : #cc1100
  > 300°C  : #661100
  ≤ 300°C  : #3a2010  (solidified bead colour)
  ```
- Bead surface: rounded cap on each column using `ctx.arc`.

### 2.4 ParticleRenderer.js

Iterate active particles only (check `particle.active`). Draw each as 2px filled circle, colour from particle.color. Alpha from `particle.life`. Batched: `ctx.beginPath()` once, all circles, `ctx.fill()` once per colour group.

---

## 3. SIMULATION LOOP — M3

### 3.1 GameLoop.js

Fixed timestep physics, variable render.

```js
const FIXED_DT = 1 / 60; // seconds
let accumulator = 0;
let lastTime = 0;

function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.1); // cap at 100ms
  lastTime = timestamp;
  accumulator += dt;
  while (accumulator >= FIXED_DT) {
    physicsUpdate(FIXED_DT);
    accumulator -= FIXED_DT;
  }
  const interpolation = accumulator / FIXED_DT;
  render(interpolation);
  requestAnimationFrame(loop);
}
```

### 3.2 WeldSession.js

Owns one welding pass. Created on mousedown, committed on mouseup.

State machine:
```
IDLE → STRIKING → WELDING → FINISHED
              ↓
           ARC_BREAK → WELDING (re-strike)
```

On FINISHED: hand off to ScoringEngine, emit `session:complete` event.

### 3.3 ScoringEngine.js

Pure function. No side effects. Deterministic.

```js
/**
 * @param {WeldSessionData} session
 * @param {ElectrodeConfig} electrode
 * @returns {ScoreResult}
 */
function score(session, electrode) {}

/**
 * @typedef {Object} ScoreResult
 * @property {number} total          - 0–100
 * @property {number} amperageScore
 * @property {number} arcScore
 * @property {number} speedScore
 * @property {number} straightnessScore
 * @property {number} slagBonus
 * @property {DefectReport[]} defects
 * @property {number} xpEarned
 * @property {number} creditsEarned
 */
```

---

## 4. MACHINE PANEL + AUDIO — M4

### 4.1 MachinePanel.js

Pure DOM component. No canvas. Communicates via EventBus only.

Events emitted:
- `machine:power` `{ on: boolean }`
- `machine:amperage` `{ value: number }`
- `machine:electrode` `{ type: string }`

Events consumed:
- `machine:overheat` → disable controls, show alert
- `machine:cooldown` → re-enable controls

Duty cycle bar: updated by GameLoop at 4Hz (not every frame — DOM writes are expensive).

### 4.2 AudioEngine.js

Single AudioContext. All sounds pre-loaded as AudioBuffer on init. No runtime fetch.

Sounds:
- `arc_hum`: looping oscillator (220Hz + harmonics, modulated by amperage), NOT a file
- `arc_crackle`: low-rate noise burst
- `spatter`: short broadband click, pitch randomised ±20%
- `slag_chip`: metallic tap
- `machine_idle_hum`: 50Hz + harmonics (transformer hum), looping
- `machine_power_on`: rising pitch sweep
- `level_up`: 8-bit chord

Arc hum volume: `lerp(0, 1, arcEstablished)`. Pitch: `lerp(180, 280, amperage/maxAmp)`.

---

## 5. PROGRESSION + CONTRACTS — M5

### 5.1 ProgressionEngine.js

```js
/**
 * @typedef {Object} ProgressionState
 * @property {number} xp
 * @property {number} level
 * @property {number} xpToNext
 * @property {string[]} unlockedElectrodes
 * @property {string[]} unlockedMachines
 * @property {number[]} completedContractIds
 */
```

XP curve: `xpToNext(level) = Math.floor(100 * Math.pow(1.45, level - 1))`

Unlock check: run after every XP grant. Emit `unlock:electrode` or `unlock:machine` events if threshold crossed.

### 5.2 ContractEngine.js

Contract validation is dual: client-side for UX, server-side for reward. Client result is informational only. Server is authoritative.

---

## 6. BACKEND API — M6

Base URL: `/api/v1`

### Endpoints

```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
DELETE /auth/logout

GET    /saves/me
POST   /saves/me

GET    /leaderboard/weekly
POST   /leaderboard/submit     ← server recalculates score, ignores client value

GET    /cosmetics
POST   /cosmetics/purchase
GET    /cosmetics/inventory
```

### Save format

Client sends compressed JSON (LZ-string or native CompressionStream). Server stores as JSONB. On load: server returns compressed blob, client decompresses.

Max save size: 512KB. Reject with 413 if exceeded.

### Idle earnings validation

On save POST, server computes:
```
server_earnings = bot_count × bot_rate × elapsed_seconds × efficiency_factor
client_earnings = save.idleEarnedSinceLastSave
accepted = min(client_earnings, server_earnings × 1.1)
```

Discard client claim if it exceeds server calc by > 10%. Log anomaly.

---

## 7. IDLE FACTORY — M7

### 7.1 IdleEngine.js

Runs in a Web Worker (offload from main thread). Communicates via `postMessage`.

Tick rate: 1Hz (not 60fps — idle is not real-time).

```js
/**
 * @typedef {Object} IdleState
 * @property {BotSlot[]} bots
 * @property {FactoryUpgrade[]} upgrades
 * @property {number} creditsPerSecond
 * @property {number} lastTickTimestamp
 * @property {number} offlineEarningsCap   // seconds
 */
```

On worker message `tick`: compute earnings for elapsed time, emit `idle:earnings` with delta.

On page load: compute offline delta = `now - lastTickTimestamp`, cap at `offlineEarningsCap`, apply as single lump sum (server-validated on next save).

---

## 8. STATE MANAGEMENT

### 8.1 StateManager.js

Immutable updates only. State is a plain object tree. Updates via reducer functions.

```js
/**
 * @param {GameState} state
 * @param {Action} action
 * @returns {GameState}  // new object, never mutates input
 */
function reduce(state, action) {}
```

State is serialisable to JSON at all times. No functions, no class instances in state.

EventBus carries actions. StateManager subscribes to EventBus, updates state, emits `state:changed`.

### 8.2 SaveManager.js

- Auto-save: debounced 5s after last state change.
- Manual save: on contract completion, level up, cosmetic purchase.
- Sync strategy: write to IndexedDB first (fast, local), then POST to API (async, non-blocking).
- On load: API response takes precedence over IndexedDB if `last_saved` is newer.
- Conflict resolution: server wins. Client UI shows "Save loaded from server."

---

## 9. TYPE DEFINITIONS — /src/types/

### game.d.ts (excerpt)
```ts
interface GameState {
  simulation: SimulationState;
  machine: MachineState;
  progression: ProgressionState;
  idle: IdleState;
  session: WeldSession | null;
  ui: UIState;
}

interface SimulationState {
  pool: PoolCell[][];
  beadColumns: BeadColumn[];
  slagSegments: SlagSegment[];
  particles: SpatterParticle[];
  arc: ArcState;
  mode: 'idle' | 'striking' | 'welding' | 'chipping';
}
```

---

## 10. CONFIGURATION — /src/config/balance.js

Every numeric constant lives here. Format:

```js
/**
 * Welding physics balance constants.
 * All values are calibrated against real SMAW parameters.
 * Sources: AWS D1.1, Lincoln Electric Procedure Handbook.
 */
export const BALANCE = {
  physics: {
    SOLIDUS_TEMP:           1450,   // °C — mild steel
    LIQUIDUS_TEMP:          1530,   // °C — mild steel
    ARC_HEAT_INPUT:         0.85,   // efficiency η, AWS standard
    POOL_VISCOSITY:         0.006,  // Pa·s at liquidus
    THERMAL_DIFFUSIVITY:    8e-6,   // m²/s mild steel
    // ...
  },
  scoring: {
    WEIGHT_AMPERAGE:        0.30,
    WEIGHT_ARC_LENGTH:      0.25,
    WEIGHT_SPEED:           0.20,
    WEIGHT_STRAIGHTNESS:    0.15,
    WEIGHT_SLAG:            0.10,
    PENALTY_POROSITY:       0.15,
    PENALTY_UNDERCUT:       0.20,
    PENALTY_INCLUSION:      0.40,
    PENALTY_ARC_BREAK:      0.10,
  },
  // ...
};
```