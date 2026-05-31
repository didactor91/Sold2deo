/**
 * StateManager — Game State Management
 * @module core/StateManager
 * @description Manages immutable game state, subscribes to EventBus events.
 */

export function createStateManager(eventBus) {
  /** @type {Object} */
  let state = {
    phase: 'IDLE',
    score: 0,
    chipMode: false,
    sessionState: 'IDLE',
  };

  eventBus.on('session:complete', (result) => {
    state = { ...state, score: result.total };
  });

  eventBus.on('session:chipMode', (mode) => {
    state = { ...state, chipMode: mode === 'chipping' };
  });

  return {
    getState: () => ({ ...state }),
  };
}
