# Delta for machine-panel

## ADDED Requirements

### Requirement: MachinePanel Mounting

The system SHALL provide a `MachinePanel` class that mounts a DOM panel into a given container element. The panel MUST be constructed with a reference to the `EventBus` instance.

### Scenario: MachinePanel mounts into container

- GIVEN an `EventBus` instance
- WHEN `new MachinePanel(container, eventBus)` is called
- THEN a DOM panel is appended to `container`
- AND the panel contains power, amperage, duty cycle, and electrode selector controls

### Requirement: Power Control

The system SHALL emit a `machine:power` event on the EventBus when the power toggle changes state. The event payload MUST contain `{ enabled: boolean }`.

- GIVEN MachinePanel is mounted
- WHEN the user toggles the power switch
- THEN `eventBus.emit('machine:power', { enabled: boolean })` is called

### Requirement: Amperage Control

The system SHALL emit a `machine:amperage` event on the EventBus when the amperage slider changes. The event payload MUST contain `{ value: number }` in the range 50–200 amps.

- GIVEN MachinePanel is mounted
- WHEN the user adjusts the amperage slider
- THEN `eventBus.emit('machine:amperage', { value: number })` is called
- AND the value is clamped to [50, 200]

### Requirement: Duty Cycle Display

The system SHALL display the duty cycle percentage computed from amperage. The panel SHOULD reflect the calculated duty cycle in real time.

- GIVEN MachinePanel is mounted
- WHEN amperage changes
- THEN the duty cycle display is updated as `dutyCycle = clamp((amperage - 50) / 150 * 100, 0, 100)%`

### Requirement: Electrode Selector

The system SHALL emit a `machine:electrode` event on the EventBus when the selected electrode type changes. The event payload MUST contain `{ type: string }`.

- GIVEN MachinePanel is mounted
- WHEN the user selects a different electrode type
- THEN `eventBus.emit('machine:electrode', { type: string })` is called

### Requirement: Overheat Indicator

The system SHALL subscribe to the `machine:overheat` EventBus event and display a visual warning indicator when received.

- GIVEN MachinePanel is mounted
- WHEN `eventBus.on('machine:overheat', handler)` is triggered
- THEN a warning indicator is shown in the panel

### Requirement: Cooldown Indicator

The system SHALL subscribe to the `machine:cooldown` EventBus event and hide the overheat warning when received.

- GIVEN MachinePanel is mounted
- WHEN `eventBus.on('machine:cooldown', handler)` is triggered
- THEN the overheat warning is cleared