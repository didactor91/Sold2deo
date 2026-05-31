# Colour Constants — M2 Renderer

All colour constants for the renderer system. No magic numbers in renderer modules.

## Temperature Colour Map (WorkpieceRenderer)

Applied to bead columns based on `column.temperature` in °C.

| Threshold | Colour   | Description            |
|-----------|----------|------------------------|
| > 1500°C  | `#ffff00` | Yellow — peak heat    |
| > 1200°C  | `#ff8800` | Orange — molten       |
| > 900°C   | `#ff3300` | Red-orange — hot      |
| > 600°C   | `#cc1100` | Deep red — cooling    |
| > 300°C   | `#661100` | Dark red — warm      |
| ≤ 300°C   | `#3a2010` | Dark brown — solid    |

## Arc Glow Colours (ElectrodeRenderer)

Per welding process type, used for radial gradient or solid rings.

| Process    | Arc Glow Colour |
|------------|-----------------|
| Rutile     | `#4488ff`       |
| Basic      | `#6644ff`       |
| Cellulosic | `#ff8800`       |

## Base Metal Colour

| Element    | Colour   |
|------------|----------|
| Workpiece  | `#2a2a2a` |

## Slag Colours

| Element    | Colour   |
|------------|----------|
| Slag fill  | `#3a1f00` |
| Slag crust | `#5a3010` |

## HAZ Colour

| Element    | Colour   |
|------------|----------|
| HAZ bloom  | `#1a0a00` |

## UI Colours (UIRenderer)

| Element         | Colour   |
|-----------------|----------|
| Score text      | `#ffffff` |
| Arc OK badge    | `#44ff44` |
| Arc short badge | `#ff4444` |
| Arc long badge  | `#ffaa00` |
| Arc broken badge| `#ff0000` |
| Chip mode text  | `#ffaa00` |
| Holder clamp    | `#555555` |

## FPS Guard Threshold

| Constant         | Value |
|------------------|-------|
| `FPS_FALLBACK`   | 55    |

## Particle Constants

| Constant         | Value |
|------------------|-------|
| `PARTICLE_RADIUS`| 1 (2px diameter circle) |
| `MAX_PARTICLES`  | 512   |
| `SMOKE_MIN`      | 3     |
| `SMOKE_MAX`      | 5     |
| `SMOKE_ALPHA_MAX`| 0.6   |

## File Location

All constants MUST be defined in `src/config/renderer.js`. Renderer modules MUST import from this file — no inline colour values.
