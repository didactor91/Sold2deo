/**
 * Weld Master — Game Entry Point
 * @module main
 * @description Bootstrap GameLoop with all M1/M2/M3 modules. Wires EventBus subscriptions
 * between InputHandler, WeldSession, GameLoop, and StateManager.
 */

import { createEventBus } from './core/EventBus.js';
import { createStateManager } from './core/StateManager.js';
import { createPhysicsEngine } from './physics/PhysicsEngine.js';
import { createSceneRenderer } from './renderer/SceneRenderer.js';
import { createGameLoop } from './core/GameLoop.js';
import { createInputHandler } from './game/InputHandler.js';
import { createWeldSession } from './game/WeldSession.js';
import { score } from './game/ScoringEngine.js';

// Core event bus
const eventBus = createEventBus();

// State manager
const stateManager = createStateManager(eventBus);

// Physics engine (M1)
const physicsEngine = createPhysicsEngine();

// Weld session (M3)
const weldSession = createWeldSession({
  arcPhysics: physicsEngine.arcPhysics,
  scoringEngine: score,
  eventBus,
});

// Input handler (M3)
const inputHandler = createInputHandler({
  arcPhysics: physicsEngine.arcPhysics,
  weldSession,
  eventBus,
});

// Scene renderer (M2) — needs sub-renderers
const ctx = /** @type {CanvasRenderingContext2D} */ (document.createElement('canvas').getContext('2d'));
const renderer = createSceneRenderer([null, null, null, null, null, null, null, null, null]);

// Game loop (M3)
const gameLoop = createGameLoop({
  session: weldSession,
  physicsEngine,
  renderer,
});

// Wire EventBus: input events → weld session
eventBus.on('input:mousedown', () => weldSession.handleMousedown());
eventBus.on('input:mouseup', () => weldSession.handleMouseup());
eventBus.on('input:keydown', (key) => weldSession.handleKeydown({ key }));

// Wire EventBus: session events → state manager
eventBus.on('session:complete', (result) => {
  stateManager.getState(); // trigger state update
});

gameLoop.start();

export { eventBus, stateManager, physicsEngine, weldSession, inputHandler, gameLoop };
