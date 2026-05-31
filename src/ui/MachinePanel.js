/**
 * MachinePanel — UI for controlling welding machine parameters
 * @module src/ui/MachinePanel
 */

/**
 * MachinePanel provides controls for adjusting welding parameters.
 */
export class MachinePanel {
  /**
   * @param {Object} options
   * @param {EventBus} options.eventBus
   * @param {Object} options.machineState - Initial machine state
   */
  constructor({ eventBus, machineState = {} } = {}) {
    this._eventBus = eventBus;
    this._heat = machineState.heat ?? 50;
    this._speed = machineState.speed ?? 50;
    this._wireFeed = machineState.wireFeed ?? 50;
    this._container = null;
  }

  /**
   * Get current machine parameters
   * @returns {{ heat: number, speed: number, wireFeed: number }}
   */
  getParameters() {
    return {
      heat: this._heat,
      speed: this._speed,
      wireFeed: this._wireFeed,
    };
  }

  /**
   * Set a machine parameter
   * @param {string} param - Parameter name
   * @param {number} value - Parameter value (0-100)
   */
  setParameter(param, value) {
    if (param === 'heat') this._heat = value;
    if (param === 'speed') this._speed = value;
    if (param === 'wireFeed') this._wireFeed = value;

    this._eventBus.emit('machineParameterChanged', {
      param,
      value,
      state: this.getParameters(),
    });
  }

  /**
   * Render the machine panel DOM element
   * @returns {HTMLElement}
   */
  render() {
    const container = document.createElement('div');
    container.className = 'machine-panel';
    container.innerHTML = `
      <h3>Machine Controls</h3>
      <div class="control-group">
        <label for="heat">Heat</label>
        <input type="range" id="heat" min="0" max="100" value="${this._heat}" />
        <span class="value">${this._heat}%</span>
      </div>
      <div class="control-group">
        <label for="speed">Speed</label>
        <input type="range" id="speed" min="0" max="100" value="${this._speed}" />
        <span class="value">${this._speed}%</span>
      </div>
      <div class="control-group">
        <label for="wireFeed">Wire Feed</label>
        <input type="range" id="wireFeed" min="0" max="100" value="${this._wireFeed}" />
        <span class="value">${this._wireFeed}%</span>
      </div>
    `;

    // Attach event listeners
    container.querySelectorAll('input[type="range"]').forEach(input => {
      input.addEventListener('input', (e) => {
        const param = e.target.id;
        const value = parseInt(e.target.value, 10);
        this.setParameter(param, value);
        e.target.nextElementSibling.textContent = `${value}%`;
      });
    });

    this._container = container;
    return container;
  }
}
