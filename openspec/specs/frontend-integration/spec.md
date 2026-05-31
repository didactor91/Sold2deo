# Delta for frontend-integration

## ADDED Requirements

### Requirement: EventBus Pub/Sub

The system MUST provide an EventBus module that allows loose coupling between game systems via publish/subscribe pattern.

#### Scenario: Subscribe to an event

- GIVEN EventBus is instantiated
- WHEN `eventBus.on('eventName', handler)` is called with a handler function
- THEN the handler is stored and invoked when `eventBus.emit('eventName', data)` is called

#### Scenario: Unsubscribe from an event

- GIVEN a handler is subscribed to 'eventName'
- WHEN `eventBus.off('eventName', handler)` is called
- THEN the handler is removed and not invoked on emit

#### Scenario: Emit an event with data

- GIVEN handlers are subscribed to 'creditsUpdated'
- WHEN `eventBus.emit('creditsUpdated', { totalCredits: 100 })` is called
- THEN all handlers receive the data payload

### Requirement: StateManager Centralized State

The system MUST provide a StateManager that holds canonical game state and notifies subscribers on changes.

#### Scenario: Get current state

- GIVEN StateManager is instantiated with initial state `{ credits: 0, bots: [] }`
- WHEN `stateManager.getState()` is called
- THEN returns `{ credits: 0, bots: [] }`

#### Scenario: Update state triggers notification

- GIVEN StateManager is instantiated
- WHEN `stateManager.setState({ credits: 100 })` is called
- THEN state is merged and 'stateChanged' event is emitted with new state

### Requirement: SaveManager Persistence

The system MUST provide a SaveManager that serializes game state to localStorage and deserializes on load.

#### Scenario: Save game state

- GIVEN StateManager holds `{ credits: 500, bots: [...] }`
- WHEN `saveManager.save()` is called
- THEN state is serialized to localStorage key 'weldmaster_save'

#### Scenario: Load game state

- GIVEN localStorage contains a valid save with `{ credits: 500 }`
- WHEN `saveManager.load()` is called
- THEN StateManager is updated with loaded state and 'stateLoaded' event is emitted

#### Scenario: No save exists

- GIVEN localStorage has no 'weldmaster_save' key
- WHEN `saveManager.load()` is called
- THEN returns false and does not modify StateManager

### Requirement: GameLoop 60fps Rendering

The system MUST provide a GameLoop that runs at 60fps and orchestrates all game systems.

#### Scenario: GameLoop starts

- GIVEN GameLoop is instantiated with eventBus, stateManager, and renderer
- WHEN `gameLoop.start()` is called
- THEN `requestAnimationFrame` loop begins and tick events fire at ~60fps

#### Scenario: GameLoop stops

- GIVEN GameLoop is running
- WHEN `gameLoop.stop()` is called
- THEN animation frame loop terminates and no further ticks fire

### Requirement: MachinePanel Machine Controls

The system MUST provide a MachinePanel UI component for controlling welding machine parameters.

#### Scenario: MachinePanel renders controls

- GIVEN eventBus is available
- WHEN MachinePanel is instantiated and `render()` is called
- THEN returns a DOM element with machine control inputs (heat, speed, wireFeed)

### Requirement: HUD Heads-Up Display

The system MUST provide a HUD that displays current game stats (credits, active bots, contracts).

#### Scenario: HUD displays stats

- GIVEN StateManager holds `{ credits: 1000, activeBots: 3 }`
- WHEN HUD is instantiated and `render()` is called
- THEN returns a DOM element showing credits and bot count

### Requirement: Navigation Screen Transitions

The system MUST provide a Navigation component that switches between game screens (WeldSession, IdleFactory, Shop).

#### Scenario: Navigate to a screen

- GIVEN Navigation is instantiated with 'IdleFactory' active
- WHEN `navigation.navigate('ShopScreen')` is called
- THEN current screen is hidden and ShopScreen is displayed

### Requirement: SceneRenderer Canvas Rendering

The system MUST provide a SceneRenderer that draws the weld scene to canvas.

#### Scenario: SceneRenderer initializes

- GIVEN a canvas element and eventBus
- WHEN SceneRenderer is instantiated
- THEN canvas context is obtained and render loop is ready

#### Scenario: SceneRenderer draws frame

- GIVEN SceneRenderer is initialized with canvas
- WHEN `sceneRenderer.render(state)` is called
- THEN current frame is drawn to canvas based on state
