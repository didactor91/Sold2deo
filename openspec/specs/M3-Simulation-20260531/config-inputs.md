# Input Configuration — M3 Simulation

## Keyboard Mappings

| Key | Action | Context |
|-----|--------|---------|
| `C` | Toggle chip mode | Any session state |
| `Space` | Initiate strike / confirm | IDLE only |
| `Escape` | Abort session | STRIKING or WELDING |
| `1–5` | Quick amperage presets | Machine panel |

## Mouse Configuration

### Mouse Y → Arc Length

```
arc_length = |mouseY - workpiece_surface_Y|
```

- Minimum viable: `electrode_diameter × 0.5`
- Ideal: `electrode_diameter × 1.0`
- Maximum: `electrode_diameter × 3.0`
- Beyond maximum: arc break, porosity defect flagged

### Mouse X Velocity → Travel Speed

```
travel_speed = |ΔmouseX| / elapsed_time (px/s)
```

- Buffer: last 10 mouse positions with timestamps
- Update: every physics tick
- Direction: derived from sign of ΔmouseX (left/right)

### Mouse Movement → Travel Angle

```
travel_angle = atan2(ΔmouseY, ΔmouseX)  // radians
```

- Ideal range: 60°–90° (forehand, recommended)
- Penalty zone: < 45° or > 105°
- Backhand range: 110°–180° (higher spatter, less penetration)

## Sensitivity Settings

| Parameter | Default | Range | Note |
|-----------|---------|-------|------|
| `MOUSE_SENSITIVITY_X` | 1.0 | 0.5–2.0 | Travel speed multiplier |
| `MOUSE_SENSITIVITY_Y` | 1.0 | 0.5–2.0 | Arc length sensitivity |
| `STRIKE_FRAMES` | 3 | 2–5 | Consecutive frames to confirm arc |
| `STRIKE_TIMEOUT_FRAMES` | 60 | 30–120 | Max frames without arc before fail |
| `POSITION_BUFFER_SIZE` | 10 | 5–20 | Mouse position history length |
| `ANGLE_LOOKBACK_TICKS` | 10 | 5–20 | Ticks for travel angle calc |

## Chip Mode (C Key)

When chip mode is active:
- Cursor changes to crosshair
- Bead deposition paused (WeldPool receives `deposit: false`)
- Slag removal mechanic armed: click+drag on slag segments
- Escape exits chip mode and aborts session

## Visual Feedback

| Input State | Visual Indicator |
|-------------|-----------------|
| Short arc | Red arc glow, "SHORT" badge |
| Long arc | Blue flickering arc, "LONG" badge |
| Ideal arc | Green arc glow, "OK" badge |
| Chip mode | Crosshair cursor, chisel icon |
| Strike pending | Pulsing electrode tip |
