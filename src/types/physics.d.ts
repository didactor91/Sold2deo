/**
 * Physics Type Definitions
 * @module types/physics
 */

/**
 * @typedef {Object} PoolCell
 * @description Single cell in the 2D weld pool grid.
 * @property {number} x - Column index
 * @property {number} y - Row index
 * @property {number} temperature - Cell temperature in °C
 * @property {boolean} solid - True if temperature below SOLIDUS_TEMP
 * @property {boolean} liquid - True if temperature above LIQUIDUS_TEMP
 * @property {boolean} slag - True if cell is forming slag layer
 */

/**
 * @typedef {Object} BeadColumn
 * @description Column-wise bead state used by BeadAccumulator and SlagLayer.
 * @property {PoolCell[]} cells - Array of pool cells in this column
 * @property {boolean} hasSlag - True if top cell of column is solidifying/slag
 * @property {boolean} slagRemoved - True if slag has been chipped off
 * @property {number} height - Accumulated bead height in pixels
 */

/**
 * @typedef {Object} SlagSegment
 * @description Slag segment attached to a bead column.
 * @property {number} hardness - Hardness from 0.0 to 1.0
 * @property {number} thickness - Thickness in pixels
 * @property {number} col - Column index this slag belongs to
 */

/**
 * @typedef {Object} SpatterParticle
 * @description Single spatter droplet from the arc.
 * @property {number} x - X position in pixels
 * @property {number} y - Y position in pixels
 * @property {number} vx - X velocity in px/s
 * @property {number} vy - Y velocity in px/s
 * @property {number} life - Remaining life 0..1
 * @property {boolean} stuck - True if particle has landed on surface
 */

/**
 * @typedef {'OK'|'broken'|'short'} ArcStatus
 */

/**
 * @typedef {Object} ArcState
 * @description Arc state computed each tick.
 * @property {number} arcLength - Arc length in pixels
 * @property {number} voltage - Computed voltage in V
 * @property {number} heatInput - Heat input Q in J
 * @property {ArcStatus} status - Current arc status
 */

/**
 * @typedef {Object} HAZParticle
 * @description Heat-Affected Zone particle for renderer compositing.
 * @property {number} col - Column index
 * @property {number} intensity - Heat intensity 0..1
 * @property {number} sigma - Gaussian spread sigma in pixels
 */

/**
 * @typedef {Object} IWeldPool
 * @description Interface for WeldPool module.
 * @property {(col: number, row: number, heat: number, dt: number) => void} applyHeat
 * @property {(dt: number) => void} diffuse
 * @property {() => void} fluidStep
 * @property {() => void} solidify
 * @property {() => PoolCell[][]} getGrid
 */

/**
 * @typedef {Object} ISpatterSystem
 * @description Interface for SpatterSystem module.
 * @property {(arcState: ArcState, baseRate: number) => void} emit
 * @property {(dt: number, surfaceY: number) => void} tick
 * @property {() => SpatterParticle[]} getActive
 */

/**
 * @typedef {Object} IBeadAccumulator
 * @description Interface for BeadAccumulator module.
 * @property {(poolCells: PoolCell[][], dt: number) => void} deposit
 * @property {() => BeadColumn[]} getColumns
 */

/**
 * @typedef {Object} ISlagLayer
 * @description Interface for SlagLayer module.
 * @property {(beadColumns: BeadColumn[]) => SlagSegment[]} createSlagLayer
 * @property {(hardness: number, dragForce: number) => boolean} chip
 */

/**
 * @typedef {Object} IArcPhysics
 * @description Interface for ArcPhysics module.
 * @property {(mouseY: number, surfaceY: number, amperage: number, electrodeType: string) => ArcState} updateArc
 */

/**
 * @typedef {Object} IHeatDiffusion
 * @description Interface for HeatDiffusion module.
 * @property {(beadColumns: BeadColumn[]) => HAZParticle[]} compute
 */

/**
 * @typedef {Object} IPhysicsEngine
 * @description Facade interface composing all physics modules.
 * @property {() => void} tick
 * @property {IArcPhysics} arcPhysics
 * @property {IWeldPool} weldPool
 * @property {IBeadAccumulator} beadAccumulator
 * @property {ISlagLayer} slagLayer
 * @property {ISpatterSystem} spatterSystem
 * @property {IHeatDiffusion} heatDiffusion
 */

export {};