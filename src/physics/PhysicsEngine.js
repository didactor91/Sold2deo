/**
 * PhysicsEngine Facade
 * @module physics/PhysicsEngine
 */

import { BALANCE } from '../config/balance.js';
import { createArcPhysics } from './ArcPhysics.js';
import { createWeldPool } from './WeldPool.js';
import { createBeadAccumulator } from './BeadAccumulator.js';
import { createSlagLayer } from './SlagLayer.js';
import { createSpatterSystem } from './SpatterSystem.js';
import { createHeatDiffusion } from './HeatDiffusion.js';

/**
 * Initialises all 6 physics sub-modules.
 * @returns {Object}
 */
function initModules() {
  const arcPhysics = createArcPhysics();
  const cols = BALANCE.tick.MAX_POOL_COLS;
  const rows = BALANCE.tick.MAX_POOL_ROWS;
  const weldPool = createWeldPool(cols, rows);
  const beadAccumulator = createBeadAccumulator(cols);
  const slagLayer = createSlagLayer(beadAccumulator.getColumns());
  const spatterSystem = createSpatterSystem();
  const heatDiffusion = createHeatDiffusion(cols, rows);

  return { arcPhysics, weldPool, beadAccumulator, slagLayer, spatterSystem, heatDiffusion };
}

/**
 * Executes one physics tick through all 6 phases.
 * Tick order: heat → fluid → solidify → deposit → slag → spatter → HAZ
 * @param {Object} modules
 * @param {number} dt
 * @param {number} mouseY
 * @param {number} surfaceY
 * @param {number} amperage
 * @param {string} electrodeType
 * @returns {number[]} Last HAZ particles from compute()
 */
function executeTickPhases(modules, dt, mouseY, surfaceY, amperage, electrodeType) {
  const { arcPhysics, weldPool, beadAccumulator, slagLayer, spatterSystem, heatDiffusion } =
    modules;
  const clampedDt = Math.min(dt, BALANCE.tick.MAX_DT);

  // Phase 1: ArcPhysics → arc state
  const arcState = arcPhysics.updateArc(mouseY, surfaceY, amperage, electrodeType);

  // Phase 2: WeldPool → heat/diffuse/fluidStep/solidify
  weldPool.applyHeat(arcState.arcLength, 0, arcState.heatInput, clampedDt);
  weldPool.diffuse(clampedDt);
  weldPool.fluidStep();
  weldPool.solidify();

  // Phase 3: BeadAccumulator → deposit from pool
  beadAccumulator.deposit(weldPool.getGrid(), clampedDt);

  // Phase 4: SlagLayer → age segments
  slagLayer.age(clampedDt);

  // Phase 5: SpatterSystem → emit + tick
  spatterSystem.emit(arcState, 100);
  spatterSystem.tick(clampedDt, surfaceY);

  // Phase 6: HeatDiffusion → compute HAZ
  return heatDiffusion.compute(beadAccumulator.getColumns());
}

export function createPhysicsEngine() {
  const modules = initModules();
  let lastHAZParticles = [];

  /** @param {number} dt @param {number} mouseY @param {number} surfaceY @param {number} amperage @param {string} electrodeType */
  function tick(dt, mouseY, surfaceY, amperage, electrodeType) {
    lastHAZParticles = executeTickPhases(modules, dt, mouseY, surfaceY, amperage, electrodeType);
  }

  /** @returns {Object} */
  function getState() {
    return {
      pool: modules.weldPool.getGrid(),
      bead: modules.beadAccumulator.getColumns(),
      slag: modules.slagLayer,
      particles: modules.spatterSystem.getActive(),
      haz: lastHAZParticles,
    };
  }

  return { tick, getState, ...modules };
}
