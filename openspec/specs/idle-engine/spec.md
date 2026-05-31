# Delta for idle-engine

## ADDED Requirements

### Requirement: Worker Communication Protocol

The system MUST use `postMessage` to communicate between the main thread and the Web Worker. Messages are JSON with `type` and `payload` fields.

#### Scenario: Main thread sends START to worker

- GIVEN worker is initialized with initial state `{ bots: [], upgrades: [], lastTick: timestamp }`
- WHEN main thread sends `{ type: 'START', payload: initialState }`
- THEN worker begins 1Hz tick loop

#### Scenario: Worker sends TICK to main thread

- GIVEN worker tick interval is 1000ms
- WHEN 1 second elapses
- THEN worker posts `{ type: 'TICK', payload: { creditsEarned, totalCredits, timestamp } }` to main thread

#### Scenario: Main thread sends STOP to worker

- WHEN main thread sends `{ type: 'STOP' }`
- THEN worker terminates its tick loop

### Requirement: 1Hz Tick Rate

The system MUST tick the idle simulation at exactly 1Hz (once per second), not 60fps.

#### Scenario: Tick fires at 1Hz

- GIVEN worker is running with active bots earning 10Ȼ/s combined
- WHEN exactly 1 second passes
- THEN a TICK message is posted with creditsEarned ≈ 10

### Requirement: Offline Delta Calculation

The system MUST calculate offline earnings on worker startup using `offlineDelta = min(now - lastSaveTimestamp, maxOfflineHours * 3600)`.

#### Scenario: Offline delta capped at maxOfflineHours

- GIVEN now=10h after last save, maxOfflineHours=8
- WHEN worker starts
- THEN offlineDelta used = 8 × 3600 = 28800 seconds (not 36000)

### Requirement: Worker State Persistence

The system MUST post full state to main thread on each TICK so the main thread holds the canonical state.

#### Scenario: State posted on each tick

- GIVEN worker has active bots and upgrades
- WHEN tick fires
- THEN posted payload includes `{ creditsEarnedSinceStart, totalCredits, activeBots: [...], timestamp }`
