/**
 * Navigation — screen navigation manager
 * @module src/ui/Navigation
 */

/**
 * Navigation manages switching between game screens.
 */
export class Navigation {
  /**
   * @param {Object} options
   * @param {EventBus} options.eventBus
   * @param {string} options.initialScreen - Initial screen to show
   */
  constructor({ eventBus, initialScreen = 'IdleFactory' } = {}) {
    this._eventBus = eventBus;
    this._currentScreen = initialScreen;
    this._screens = new Map();
    this._container = null;
  }

  /**
   * Register a screen
   * @param {string} name - Screen name
   * @param {HTMLElement} element - Screen DOM element
   */
  registerScreen(name, element) {
    this._screens.set(name, element);
    if (name !== this._currentScreen) {
      element.style.display = 'none';
    }
  }

  /**
   * Navigate to a different screen
   * @param {string} screenName - Name of screen to navigate to
   * @returns {boolean} true if navigation succeeded
   */
  navigate(screenName) {
    if (!this._screens.has(screenName)) {
      console.warn(`Screen '${screenName}' not registered`);
      return false;
    }

    // Hide current screen
    const current = this._screens.get(this._currentScreen);
    if (current) {
      current.style.display = 'none';
    }

    // Show new screen
    const next = this._screens.get(screenName);
    next.style.display = 'block';

    this._currentScreen = screenName;
    this._eventBus.emit('screenChanged', { screen: screenName });

    return true;
  }

  /**
   * Get current screen name
   * @returns {string}
   */
  getCurrentScreen() {
    return this._currentScreen;
  }

  /**
   * Render the navigation container
   * @returns {HTMLElement}
   */
  render() {
    const container = document.createElement('div');
    container.className = 'navigation';
    container.innerHTML = `
      <nav class="nav-tabs">
        <button data-screen="IdleFactory">Idle Factory</button>
        <button data-screen="ShopScreen">Shop</button>
        <button data-screen="WeldSession">Weld</button>
      </nav>
      <div class="screen-container"></div>
    `;

    container.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        this.navigate(btn.dataset.screen);
      });
    });

    this._container = container;
    return container;
  }
}
