/**
 * Weld Master — Game Entry Point
 * @module main
 */

import { GameLoop } from './core/GameLoop.js';
import { EventBus } from './core/EventBus.js';
import { StateManager } from './core/StateManager.js';
import { SaveManager } from './core/SaveManager.js';
import { SceneRenderer } from './renderer/SceneRenderer.js';
import { MachinePanel } from './ui/MachinePanel.js';
import { HUD } from './ui/HUD.js';
import { Navigation } from './ui/Navigation.js';
import { AudioEngine } from './audio/AudioEngine.js';

/** @type {EventBus} */
const eventBus = new EventBus();

/** @type {StateManager} */
const stateManager = new StateManager(eventBus);

/** @type {SaveManager} */
const saveManager = new SaveManager(stateManager, eventBus);

/** @type {AudioEngine} */
const audioEngine = new AudioEngine(eventBus);

/** @type {HTMLCanvasElement} */
const canvas = document.createElement('canvas');
canvas.id = 'game-canvas';
document.getElementById('game-container').appendChild(canvas);

/** @type {SceneRenderer} */
const renderer = new SceneRenderer(canvas.getContext('2d'), eventBus);

/** @type {GameLoop} */
const gameLoop = new GameLoop(eventBus, stateManager, renderer);

/** @type {MachinePanel} */
const machinePanel = new MachinePanel({ eventBus });

/** @type {HUD} */
const hud = new HUD({ eventBus, stateManager });

/** @type {Navigation} */
const navigation = new Navigation({ eventBus });

// Append UI components to game container
const gameContainer = document.getElementById('game-container');
if (gameContainer) {
  const hudEl = hud.render();
  const machineEl = machinePanel.render();
  gameContainer.appendChild(hudEl);
  gameContainer.appendChild(machineEl);
}

// Load saved game if exists
saveManager.load();

// Start the game loop
gameLoop.start();

export { eventBus, stateManager, saveManager, audioEngine, gameLoop, machinePanel, hud, navigation };