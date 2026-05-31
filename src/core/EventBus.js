/**
 * EventBus — Pub/Sub Communication Layer
 * @module core/EventBus
 * @description Singleton event bus for decoupled communication between game modules.
 * No direct method calls between game-loop modules — all communication via events.
 */

/**
 * @typedef {Object} EventBus
 * @property {(eventName: string, handler: Function) => () => void} on - Subscribe, returns unsubscribe
 * @property {(eventName: string, handler: Function) => void} off - Unsubscribe
 * @property {(eventName: string, ...args: any[]) => void} emit - Emit event
 */

/**
 * Adds handler to event listeners map.
 * @param {Map<string, Set<Function>>} listeners
 * @param {string} eventName
 * @param {Function} handler
 */
function subscribe(listeners, eventName, handler) {
  if (!listeners.has(eventName)) {
    listeners.set(eventName, new Set());
  }
  listeners.get(eventName).add(handler);
}

/**
 * Removes handler from event listeners map.
 * @param {Map<string, Set<Function>>} listeners
 * @param {string} eventName
 * @param {Function} handler
 */
function unsubscribe(listeners, eventName, handler) {
  const handlers = listeners.get(eventName);
  if (handlers) {
    handlers.delete(handler);
    if (handlers.size === 0) {
      listeners.delete(eventName);
    }
  }
}

/**
 * Notifies all handlers for an event.
 * @param {Map<string, Set<Function>>} listeners
 * @param {string} eventName
 * @param {...any} args
 */
function notify(listeners, eventName, ...args) {
  const handlers = listeners.get(eventName);
  if (handlers) {
    for (const handler of handlers) {
      handler(...args);
    }
  }
}

/**
 * Creates a new event bus instance.
 * @returns {EventBus}
 */
export function createEventBus() {
  /** @type {Map<string, Set<Function>>} */
  const listeners = new Map();

  /**
   * Subscribe to an event.
   * @param {string} eventName
   * @param {Function} handler
   * @returns {() => void} unsubscribe function
   */
  function on(eventName, handler) {
    subscribe(listeners, eventName, handler);
    return () => unsubscribe(listeners, eventName, handler);
  }

  /** @type {EventBus['off']} */
  function off(eventName, handler) {
    unsubscribe(listeners, eventName, handler);
  }

  /** @type {EventBus['emit']} */
  function emit(eventName, ...args) {
    notify(listeners, eventName, ...args);
  }

  return Object.freeze({ on, off, emit });
}
