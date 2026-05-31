/**
 * EventBus — pub/sub event system for loose coupling between game systems
 * @module src/core/EventBus
 */

/**
 * @typedef {Object} EventHandler
 * @property {Function} callback - The handler function
 * @property {boolean} once - If true, handler is called only once
 */

/**
 * EventBus provides a publish/subscribe mechanism for inter-module communication.
 * Modules can emit events without knowing who is listening.
 */
export class EventBus {
  constructor() {
    /** @type {Map<string, EventHandler[]>} */
    this._handlers = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Handler function called when event is emitted
   * @returns {void}
   */
  on(eventName, callback) {
    if (!this._handlers.has(eventName)) {
      this._handlers.set(eventName, []);
    }
    this._handlers.get(eventName).push({ callback, once: false });
  }

  /**
   * Subscribe to an event only once
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Handler function called once
   * @returns {void}
   */
  once(eventName, callback) {
    if (!this._handlers.has(eventName)) {
      this._handlers.set(eventName, []);
    }
    this._handlers.get(eventName).push({ callback, once: true });
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Handler to remove
   * @returns {void}
   */
  off(eventName, callback) {
    const handlers = this._handlers.get(eventName);
    if (!handlers) return;

    const index = handlers.findIndex(h => h.callback === callback);
    if (index !== -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Emit an event with optional data
   * @param {string} eventName - Name of the event
   * @param {*} [data] - Data to pass to handlers
   * @returns {void}
   */
  emit(eventName, data) {
    const handlers = this._handlers.get(eventName);
    if (!handlers) return;

    // Create a copy to avoid issues if handlers modify the array during iteration
    const handlersCopy = [...handlers];

    for (const handler of handlersCopy) {
      handler.callback(data);

      if (handler.once) {
        const index = handlers.indexOf(handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      }
    }
  }
}
