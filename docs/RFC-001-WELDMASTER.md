# RFC-001 — WELD MASTER: Side-View Welding Simulator + Idle Factory

**Status:** APPROVED  
**Version:** 1.0.0  
**Date:** 2026-05-31  
**Owner:** Didac  
**Stack:** Vanilla JS + Canvas 2D | Node.js backend | SQL (PostgreSQL) | F2P Web  

---

## 1. PROBLEM STATEMENT

No existing browser game simulates arc welding with physical accuracy at the level of:
- Side-profile bead formation with molten pool dynamics
- Slag accumulation and mandatory removal
- Process-specific electrode behaviour (rutile, basic, cellulosic, stainless)
- Machine parameter management (amperage, duty cycle, overheat)
- Progression from entry-level inverter to industrial equipment

The game must be technically credible enough that a real welder recognises the physics, and addictive enough that a non-welder plays it as a pure idle/skill game.

---

## 2. SCOPE

### 2.1 In Scope — v1.0

| Module | Description |
|--------|-------------|
| `WeldSimulator` | Side-view 2D canvas. Electrode, arc, molten pool, bead formation, slag layer, spatter particles |
| `PhysicsEngine` | Fluid accumulation, heat diffusion, slag physics, gravity on droplets |
| `MachinePanel` | Power toggle, amperage control, duty cycle bar, overheat alerts |
| `ProgressionSystem` | XP, levels, unlocks, credits, contracts/jobs |
| `IdleFactory` | Dedicated screen: hire bot-welders, upgrade stations, offline earnings |
| `Backend API` | Node.js + PostgreSQL: save/load, leaderboard, cosmetics store, auth |
| `AudioFX` | Arc buzz, spatter crack, slag chipping, machine hum — Web Audio API |

### 2.2 Out of Scope — v1.0

- TIG/MIG processes (v2 roadmap)
- Multiplayer
- Mobile native app
- 3D rendering

---

## 3. GAME DESIGN SPECIFICATION

### 3.1 Core Simulation Loop (Side View)

The camera is locked to a **cross-section profile view**. The workpiece is a horizontal metal plate. The welder (electrode) moves left to right. The player controls:

| Control | Mechanism | Effect |
|---------|-----------|--------|
| **Arc length** | Mouse Y distance from plate surface | Too close: short circuit. Too far: arc break, porosity |
| **Travel speed** | Mouse X velocity | Too fast: undercut, thin bead. Too slow: burn-through, excess buildup |
| **Amperage** | Slider on machine panel | Out-of-range: bad fusion or spatter. Correct: optimal pool |
| **Electrode angle** | Mouse angle of movement vector | Forehand vs backhand affects penetration and slag coverage |

### 3.2 Physics Model (Semi-Realistic)

#### Molten Pool
- Represented as a particle cluster with viscosity coefficient per process.
- Pool size proportional to `amperage × dwell_time / travel_speed`.
- Pool cools as electrode passes; solidification time varies by electrode type.
- Pool temperature mapped to colour: `#ffff00` (peak) → `#ff4400` → `#cc2200` → `#333333` (solid).

#### Bead Formation
- Each simulation tick deposits a pixel-column of material.
- Column height: function of `wire_feed_equivalent × (1 - travel_speed_penalty)`.
- Column width: function of `amperage × arc_length_factor`.
- Accumulated columns form the visible bead profile.

#### Slag
- Deposited on top of bead pixels immediately after solidification.
- Colour: dark brown `#3a1f00` with lighter crust `#5a3010`.
- Must be removed before second pass. If welded over: **inclusion defect** (score penalty −40%).
- Chipping mechanic: player clicks/drags over slag zone with hammer tool.

#### Spatter
- Particle system: `N = base_spatter[electrode] × (arc_too_long ? 3 : 1)`.
- Each particle: random velocity vector, gravity, bounces once, sticks to workpiece as cosmetic debris.

#### Heat Affected Zone (HAZ)
- Rendered as colour gradient on base metal: `#1a0a00` bloom around bead.
- Purely visual in v1; used in v2 for distortion mechanics.

### 3.3 Electrode Roster

| Code | Type | Ø (mm) | Amp Range | Penetration | Spatter | Slag | Difficulty | XP Unlock |
|------|------|--------|-----------|-------------|---------|------|------------|-----------|
| E6013 | Rutile | 2.5 | 60–90 | Low | Low | Thin, easy | ★☆☆☆ | 0 |
| E6013 | Rutile | 3.2 | 80–130 | Low-Med | Low | Thin, easy | ★☆☆☆ | 200 |
| E7018 | Basic (LH) | 3.2 | 100–160 | Med-High | Very Low | Thick, rigid | ★★☆☆ | 500 |
| E7018 | Basic (LH) | 4.0 | 140–200 | High | Very Low | Thick, rigid | ★★★☆ | 900 |
| E6010 | Cellulosic | 3.2 | 70–140 | Very High | High | Thin, fluid | ★★★★ | 1200 |
| E308L | Stainless | 2.5 | 60–100 | Low | Low | Light | ★★★☆ | 2000 |

### 3.4 Machine Roster

| Machine | Max Amp | Duty Cycle | Price | XP Req |
|---------|---------|-----------|-------|--------|
| Basic Inverter 100A | 100 | 40% | Free | 0 |
| Inverter 160A | 160 | 60% | 250Ȼ | 300 |
| Pro Inverter 200A | 200 | 80% | 600Ȼ | 800 |
| Industrial 250A | 250 | 100% | 1200Ȼ | 1800 |
| Professional 315A | 315 | 100% | 2500Ȼ | 3500 |

### 3.5 Scoring System

```
SCORE = (amperage_accuracy × 0.30)
      + (arc_length_consistency × 0.25)
      + (travel_speed_consistency × 0.20)
      + (straightness × 0.15)
      + (slag_removal_bonus × 0.10)

Defect penalties:
  - Porosity:   -15% per instance
  - Undercut:   -20% per instance  
  - Inclusion:  -40% per instance (welded over slag)
  - Arc break:  -10% per instance
```

### 3.6 Contract System

Contracts define: required electrode, min bead length, min quality score, time limit (optional), reward in Ȼ and XP.

Contracts unlock by XP tier. Failed contracts return 0 reward but still give 50% XP.

### 3.7 Idle Factory — Dedicated Screen

Separate screen, accessible from main nav. Does NOT interrupt simulation state.

**Core loop:**
1. Hire bot-welders (Tier 1–5, each with quality multiplier and speed).
2. Assign bots to active contracts from the contract pool.
3. Bots generate Ȼ per second based on: `bot_quality × contract_reward / contract_duration`.
4. Offline earnings: calculated on login delta, capped at `max_offline_hours × rate`.
5. Upgrade stations: better equipment = higher bot quality ceiling.
6. Research tree: unlocks new processes, electrodes, contract types.

**Bot tiers:**

| Tier | Name | Base Quality | Speed | Hire Cost | Salary/hr |
|------|------|-------------|-------|-----------|-----------|
| 1 | Apprentice | 35% | 0.5× | 50Ȼ | 2Ȼ |
| 2 | Welder B | 55% | 0.8× | 150Ȼ | 5Ȼ |
| 3 | Welder A | 70% | 1.0× | 400Ȼ | 12Ȼ |
| 4 | Specialist | 82% | 1.2× | 900Ȼ | 28Ȼ |
| 5 | Master | 93% | 1.5× | 2000Ȼ | 60Ȼ |

**Factory upgrades (examples):**
- Ventilation system: +10% duty cycle all machines
- Electrode storage: unlock bulk electrode orders (−20% cost)
- QC station: bots get +5% quality
- Second shift: offline earnings cap ×2

---

## 4. TECHNICAL ARCHITECTURE

### 4.1 Frontend — Vanilla JS + Canvas

```
/src
  /core
    GameLoop.js          # requestAnimationFrame master loop, fixed timestep 60fps
    EventBus.js          # pub/sub, zero dependencies
    StateManager.js      # immutable state updates, serialisable to JSON
    SaveManager.js       # IndexedDB + API sync adapter
  /physics
    WeldPool.js          # molten pool fluid sim (particle grid)
    BeadAccumulator.js   # pixel-column deposition and solidification
    SlagLayer.js         # slag deposition, removal detection
    SpatterSystem.js     # particle emitter for spatter
    HeatDiffusion.js     # HAZ colour spread
    ArcPhysics.js        # arc length validation, arc break detection
  /renderer
    SceneRenderer.js     # master canvas compositor
    WorkpieceRenderer.js # base metal, bead, slag, HAZ layers
    ElectrodeRenderer.js # electrode stick, arc glow, droplet animation
    ParticleRenderer.js  # spatter, smoke particles
    UIRenderer.js        # HUD overlays on canvas
  /ui
    MachinePanel.js      # DOM panel: power, amp, duty cycle
    HUD.js               # score, alerts, tooltip
    IdleFactory.js       # idle screen DOM
    ShopScreen.js        # equipment store DOM
    ContractsScreen.js   # contracts list DOM
    Navigation.js        # screen router
  /audio
    AudioEngine.js       # Web Audio API context manager
    SoundFX.js           # arc, spatter, slag, machine sounds
  /game
    WeldSession.js       # one welding pass: state, scoring
    ScoringEngine.js     # score calculation, defect detection
    ProgressionEngine.js # XP, level, unlock gating
    IdleEngine.js        # bot simulation, offline calc
    ContractEngine.js    # contract generation, validation
  /api
    ApiClient.js         # fetch wrapper, auth headers, retry logic
    SyncQueue.js         # offline queue, sync on reconnect
  /config
    electrodes.js        # electrode data constants
    machines.js          # machine data constants
    contracts.js         # contract templates
    balance.js           # all numeric tuning constants
  /types
    game.d.ts            # JSDoc TypeScript definitions
    physics.d.ts
    api.d.ts
```

### 4.2 Backend — Node.js + PostgreSQL

```
/server
  /src
    /routes
      auth.js            # JWT login/register/refresh
      saves.js           # GET/POST game save
      leaderboard.js     # weekly bead scores
      cosmetics.js       # store, purchase, inventory
      contracts.js       # server-validated contract submission
    /middleware
      auth.js            # JWT verify
      rateLimit.js       # per-route limits
      validate.js        # Zod schema validation
    /services
      SaveService.js     # save compression, conflict resolution
      IdleService.js     # server-side offline earnings validation
      LeaderboardService.js
      CosmeticsService.js
    /db
      pool.js            # pg pool singleton
      migrations/        # numbered SQL migration files
      queries/           # parameterised query functions (no ORM)
    /config
      index.js           # env validation (zod)
    app.js               # express setup
    server.js            # entry point
```

### 4.3 Database Schema (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(32) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Game saves (one row per user, JSONB blob + indexed fields)
CREATE TABLE game_saves (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  save_data JSONB NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  total_beads INTEGER NOT NULL DEFAULT 0,
  last_saved TIMESTAMPTZ DEFAULT NOW(),
  client_version VARCHAR(16) NOT NULL
);

-- Leaderboard entries
CREATE TABLE bead_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  electrode VARCHAR(16) NOT NULL,
  bead_length_mm INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_bead_scores_week ON bead_scores(year, week_number, score DESC);

-- Cosmetics
CREATE TABLE cosmetics (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  type VARCHAR(32) NOT NULL, -- 'arc_color' | 'spatter_skin' | 'machine_skin'
  price_credits INTEGER NOT NULL,
  rarity VARCHAR(16) NOT NULL -- 'common' | 'rare' | 'epic'
);

CREATE TABLE user_cosmetics (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cosmetic_id VARCHAR(64) REFERENCES cosmetics(id),
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, cosmetic_id)
);
```

---

## 5. QUALITY STANDARDS

### 5.1 Code

- Vanilla JS ES2022 modules. No framework, no bundler in dev (native ESM). Esbuild for production bundle only.
- JSDoc on every exported function/class. `.d.ts` files maintained in `/src/types`.
- ESLint `eslint:recommended` + custom rules enforced via pre-commit hook.
- Prettier with project `.prettierrc` — no exceptions.
- Max function length: 40 lines. Max file length: 300 lines. Enforced via ESLint.
- No magic numbers. All tuning constants in `/src/config/balance.js`.
- Zero `console.log` in production. Logger service only.

### 5.2 Testing

| Layer | Tool | Coverage Target |
|-------|------|----------------|
| Unit | Vitest | 90% on physics, scoring, idle engine |
| Integration | Vitest | Game loop tick sequences, state transitions |
| E2E | Playwright | Critical paths: weld session, save/load, idle tick |
| Performance | Vitest bench | Physics tick < 2ms at 60fps |

### 5.3 Performance

- Canvas render: 60fps stable on mid-range hardware (2019 MacBook).
- Physics tick: decoupled from render. Fixed 60Hz update, render interpolated.
- Particle cap: 512 active spatter particles max.
- Save operations: debounced 5s, never block game loop.
- First paint: < 1.5s. Game loop start: < 3s.

### 5.4 Security (Backend)

- All inputs validated with Zod before touching DB.
- Parameterised queries only — no string concatenation.
- Rate limiting: 100 req/min authenticated, 20 req/min anonymous.
- Idle earnings validated server-side: `max(client_claim, server_calc × 1.1)` — never trust client.
- JWT expiry: 15min access, 7d refresh.
- Cosmetics purchases: idempotent transaction with DB lock.

---

## 6. MONETISATION

- **Free to play.** Core game 100% free.
- **Cosmetics only:** arc colour skins, spatter effects, machine skins, workbench themes.
- **No pay-to-win.** Credits, XP, equipment: earned in-game only.
- **Ad option:** optional rewarded ad for ×2 idle earnings for 30min (via Google AdSense / AdMob web).
- **Cosmetics store:** in-game Ȼ + real-money option (Stripe, < €5 packs).

---

## 7. MILESTONES

| Milestone | Deliverable | 
|-----------|-------------|
| M1 | Physics engine: pool, bead, slag, spatter — unit tested |
| M2 | Side-view renderer complete with all visual layers |
| M3 | Full simulation loop: electrode control, scoring, defects |
| M4 | Machine panel + audio FX |
| M5 | Progression system + contracts |
| M6 | Backend API + auth + save/load |
| M7 | Idle factory screen |
| M8 | Cosmetics store + monetisation |
| M9 | E2E tests, performance pass, security audit |
| M10 | Production deploy |

---

## 8. OPEN QUESTIONS (Deferred)

- TIG/MIG processes: v2, separate RFC.
- Multiplayer bead comparison: v2.
- Mobile PWA: post-M10 if metrics warrant.
- Sound asset sourcing: real recordings vs synthesised (decide at M4).