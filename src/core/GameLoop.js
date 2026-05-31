/**
 * GameLoop — 60fps game loop orchestrating all game systems
 * @module src/core/GameLoop
 */

/**
 * GameLoop runs at 60fps using requestAnimationFrame and orchestrates
 * the game update and render cycle.
 */
export class GameLoop {
  /**
   * @param {EventBus} eventBus
   * @param {StateManager} stateManager
   * @param {SceneRenderer} renderer
   */
  constructor(eventBus, stateManager, renderer) {
    this._eventBus = eventBus;
    this._stateManager = stateManager;
    this._renderer = renderer;
    this._running = false;
    this._lastTime = 0;
    this._rafId = null;
    this._tickCount = 0;
  }

  /**
   * Start the game loop
   * @returns {void}
   */
  start() {
    if (this._running) return;
    this._running = true;
    this._lastTime = performance.now();
    this._loop();
    this._eventBus.emit('gameLoopStarted', {});
  }

  /**
   * Stop the game loop
   * @returns {void}
   */
  stop() {
    if (!this._running) return;
    this._running = false;
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this._eventBus.emit('gameLoopStopped', { totalTicks: this._tickCount });
  }

  /**
   * Main loop function (private)
   * @returns {void}
   * @private
   */
  _loop() {
    if (!this._running) return;

    const now = performance.now();
    const deltaTime = now - this._lastTime;
    this._lastTime = now;

    this._tick(deltaTime);

    this._rafId = requestAnimationFrame(() => this._loop());
  }

  /**
   * Single tick of the game loop
   * @param {number} deltaTime - Time since last tick in ms
   * @returns {void}
   * @private
   */
  _tick(deltaTime) {
    this._tickCount++;
    const state = this._stateManager.getState();

    // Emit tick event for systems to subscribe
    this._eventBus.emit('gameTick', {
      deltaTime,
      tickCount: this._tickCount,
      state,
    });

    // Render current state
    if (this._renderer) {
      this._renderer.render(state);
    }
  }

  /**
   * Check if loop is running
   * @returns {boolean}
   */
  isRunning() {
    return this._running;
  }

  /**
   * Get total tick count
   * @returns {number}
   */
  getTickCount() {
    return this._tickCount;
  }
}
