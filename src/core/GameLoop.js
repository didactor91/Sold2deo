/**
 * GameLoop — Fixed Timestep Simulation Orchestrator
 * @module core/GameLoop
 * @description Owns the rAF loop, fixed 60Hz accumulator, tick/render separation,
 * and interpolation parameter. Calls PhysicsEngine.tick and SceneRenderer.render.
 */

import { BALANCE } from '../config/balance.js';

/**
 * @param {Object} deps
 * @param {Object} deps.session - WeldSession instance
 * @param {Object} deps.physicsEngine - PhysicsEngine instance
 * @param {Object} deps.renderer - SceneRenderer instance
 * @returns {{ start: function(): void, stop: function(): void, isRunning: function(): boolean }}
 */
export function createGameLoop({ session, physicsEngine, renderer }) {
  let accumulator = 0,
    lastTime = 0,
    rafId = null,
    running = false;

  function tick(dt) {
    session.update(dt);
    physicsEngine.tick(dt, 0, 0, 100, 'mild');
  }

  function tickLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, BALANCE.tick.MAX_DT);
    lastTime = timestamp;
    accumulator += dt;
    while (accumulator >= BALANCE.tick.FIXED_DT) {
      tick(BALANCE.tick.FIXED_DT);
      accumulator -= BALANCE.tick.FIXED_DT;
    }
    renderer.render(accumulator / BALANCE.tick.FIXED_DT);
  }

  function loop(timestamp) {
    if (!running) return;
    tickLoop(timestamp);
    rafId = requestAnimationFrame(loop);
  }

  const api = {
    start: () => {
      running = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(loop);
    },
    stop: () => {
      running = false;
      accumulator = 0;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    },
    isRunning: () => running,
    _loop: tickLoop,
  };

  return Object.freeze(api);
}
