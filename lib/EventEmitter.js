/**
 * EventEmitter.js
 * Simple event emitter for inter-module communication.
 * Allows modules to subscribe to and publish events.
 */

class EventEmitter {
  constructor() {
    this.events = {};
  }

  /**
   * Register an event listener
   * @param {string} event - Event name
   * @param {Function} listener - Listener function
   */
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(listener);
    return this;
  }

  /**
   * Register a one-time event listener
   * @param {string} event - Event name
   * @param {Function} listener - Listener function
   */
  once(event, listener) {
    const onceWrapper = (...args) => {
      listener.apply(this, args);
      this.off(event, onceWrapper);
    };

    onceWrapper.originalListener = listener;
    return this.on(event, onceWrapper);
  }

  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} listener - Listener function
   */
  off(event, listener) {
    if (!this.events[event]) return this;

    const eventListeners = this.events[event];
    const filteredListeners = eventListeners.filter((l) => {
      // Handle the case where listener is a 'once' wrapper
      return l !== listener && l.originalListener !== listener;
    });

    if (filteredListeners.length > 0) {
      this.events[event] = filteredListeners;
    } else {
      delete this.events[event];
    }

    return this;
  }

  /**
   * Remove all listeners for an event
   * @param {string} event - Event name (optional)
   */
  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }

    return this;
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {...any} args - Arguments to pass to listeners
   */
  emit(event, ...args) {
    if (!this.events[event]) return false;

    const listeners = [...this.events[event]];

    for (const listener of listeners) {
      try {
        listener.apply(this, args);
      } catch (error) {
        console.error(`Error in event listener for '${event}':`, error);
      }
    }

    return true;
  }

  /**
   * Get array of listeners for an event
   * @param {string} event - Event name
   */
  listeners(event) {
    return this.events[event] || [];
  }

  /**
   * Get number of listeners for an event
   * @param {string} event - Event name
   */
  listenerCount(event) {
    return this.listeners(event).length;
  }
}

module.exports = EventEmitter;
