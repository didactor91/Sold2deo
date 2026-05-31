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
  /**
   * Mount MachinePanel to existing #machine-panel DOM.
   * @returns {HTMLElement|null}
   */
  mount() {
    const container = document.getElementById('machine-panel');
    if (!container) return null;

    // Wire up power button
    const powerBtn = document.getElementById('power-btn');
    if (powerBtn) {
      powerBtn.addEventListener('click', () => {
        const isOn = powerBtn.classList.toggle('on');
        this._eventBus?.emit('machine:power', { on: isOn });
      });
    }

    // Wire up amp slider
    const ampSlider = document.getElementById('amp-slider');
    const ampValue = document.getElementById('amp-value');
    if (ampSlider) {
      ampSlider.addEventListener('input', () => {
        const amp = parseInt(ampSlider.value, 10);
        if (ampValue) ampValue.textContent = `${amp} A`;
        this._heat = amp;
        this._eventBus?.emit('machine:amperage', { value: amp });
      });
    }

    // Wire up electrode buttons
    container.querySelectorAll('.electrode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.electrode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._eventBus?.emit('machine:electrode', { type: btn.dataset.electrode });
      });
    });

    this._container = container;
    return container;
  }

  /**
   * Update duty cycle display.
   * @param {number} percent - 0-100
   */
  updateDutyCycle(percent) {
    const fill = document.getElementById('duty-fill');
    const value = document.getElementById('duty-value');
    if (fill) {
      fill.style.width = `${percent}%`;
      fill.classList.toggle('hot', percent > 70);
    }
    if (value) value.textContent = `${Math.round(percent)}%`;
  }
}
