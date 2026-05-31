/**
 * IdleFactory — DOM-based idle factory screen
 * @module ui/IdleFactory
 */
import { botTiers, factoryUpgrades, getBotTier } from '../config/factory.js';

/**
 * @typedef {Object} IdleFactoryOptions
 * @property {Object} eventBus
 * @property {Object} idleEngine - IdleEngine instance
 * @property {number} credits - Player's current credits
 */

/**
 * IdleFactory — renders the idle factory DOM screen.
 * Manages bot hiring, upgrade purchases, and bot assignment to contracts.
 */
export class IdleFactory {
  /**
   * @param {IdleFactoryOptions} options
   */
  constructor({ eventBus, idleEngine, credits = 0 }) {
    this._eventBus = eventBus;
    this._idleEngine = idleEngine;
    this._credits = credits;
    this._upgrades = [];
    this._botIdCounter = 0;

    this._eventBus.on('idle:creditsUpdated', ({ totalCredits }) => {
      this._credits = totalCredits;
    });
  }

  /**
   * Generate a unique bot id.
   * @returns {string}
   */
  _nextBotId() {
    return `bot_${++this._botIdCounter}`;
  }

  /**
   * Render a single bot tier card.
   * @param {Object} tier
   * @returns {HTMLElement}
   */
  _renderTierCard(tier) {
    const card = document.createElement('div');
    card.className = 'bot-tier-card';

    const canAfford = this._credits >= tier.hireCost;

    card.innerHTML = `
      <div class="bot-tier-name">${tier.name}</div>
      <div class="bot-tier-stats">
        <span>Quality: ${tier.baseQuality}%</span>
        <span>Speed: ${tier.speedMultiplier}×</span>
      </div>
      <div class="hire-cost">${tier.hireCost}Ȼ</div>
      <button class="hire-btn" data-tier="${tier.id}" ${canAfford ? '' : 'disabled'}>
        Hire
      </button>
    `;

    const btn = card.querySelector('.hire-btn');
    btn.addEventListener('click', () => this._onHireBot(tier.id));

    return card;
  }

  /**
   * Render the upgrade shop section.
   * @returns {HTMLElement}
   */
  _renderUpgradeShop() {
    const section = document.createElement('div');
    section.className = 'upgrade-shop';

    const title = document.createElement('h3');
    title.textContent = 'Factory Upgrades';
    section.appendChild(title);

    for (const upgrade of factoryUpgrades) {
      const alreadyOwned = this._upgrades.some(u => u.id === upgrade.id);
      const canAfford = this._credits >= upgrade.cost;

      const card = document.createElement('div');
      card.className = 'upgrade-card';
      card.innerHTML = `
        <div class="upgrade-name">${upgrade.name}</div>
        <div class="upgrade-desc">${upgrade.description}</div>
        <div class="upgrade-cost">${upgrade.cost}Ȼ</div>
        <button class="upgrade-btn" data-upgrade="${upgrade.id}"
          ${alreadyOwned || !canAfford ? 'disabled' : ''}
          ${alreadyOwned ? 'data-owned="true"' : ''}>
          ${alreadyOwned ? 'Owned' : 'Purchase'}
        </button>
      `;

      if (!alreadyOwned) {
        const btn = card.querySelector('.upgrade-btn');
        btn.addEventListener('click', () => this._onPurchaseUpgrade(upgrade.id));
      }

      section.appendChild(card);
    }

    return section;
  }

  /**
   * Render the active bots list.
   * @returns {HTMLElement}
   */
  _renderActiveBots() {
    const state = this._idleEngine.getState();
    const section = document.createElement('div');
    section.className = 'active-bots';

    const title = document.createElement('h3');
    title.textContent = 'Active Bots';
    section.appendChild(title);

    if (state.activeBots.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No bots hired yet. Hire a bot above!';
      section.appendChild(empty);
    } else {
      for (const bot of state.activeBots) {
        const tierData = getBotTier(bot.tier);
        const botEl = document.createElement('div');
        botEl.className = 'bot-item';
        botEl.innerHTML = `
          <span class="bot-name">${tierData?.name ?? 'Unknown'} (${bot.tier})</span>
          <span class="bot-quality">${bot.quality}%</span>
          <span class="bot-contract">${bot.assignedContractId ?? 'Unassigned'}</span>
          <button class="assign-btn" data-bot-id="${bot.id}">Assign</button>
        `;

        const assignBtn = botEl.querySelector('.assign-btn');
        assignBtn.addEventListener('click', () => this._onAssignBot(bot.id));

        section.appendChild(botEl);
      }
    }

    return section;
  }

  /**
   * Render the offline earnings display.
   * @returns {HTMLElement}
   */
  _renderOfflineEarnings() {
    const state = this._idleEngine.getState();
    const section = document.createElement('div');
    section.className = 'offline-earnings';

    section.innerHTML = `
      <h3>Offline Earnings</h3>
      <div class="offline-amount">${state.offlineEarnings}Ȼ</div>
      <div class="offline-rate">${state.creditsPerSecond.toFixed(4)} Ȼ/s</div>
    `;

    return section;
  }

  /**
   * Handle hire bot button click.
   * @param {number} tier
   */
  _onHireBot(tier) {
    const tierData = getBotTier(tier);
    if (!tierData) return;

    if (this._credits < tierData.hireCost) {
      this._showError(`Not enough credits! Need ${tierData.hireCost}Ȼ`);
      return;
    }

    const botId = this._nextBotId();
    const result = this._idleEngine.hireBot(tier, botId);

    if (result.success) {
      this._credits -= tierData.hireCost;
      this._clearError();
      this._rerender();
    } else {
      this._showError(result.error);
    }
  }

  /**
   * Handle purchase upgrade button click.
   * @param {string} upgradeId
   */
  _onPurchaseUpgrade(upgradeId) {
    const upgradeData = factoryUpgrades.find(u => u.id === upgradeId);
    if (!upgradeData) return;

    if (this._upgrades.some(u => u.id === upgradeId)) {
      this._showError('Upgrade already owned!');
      return;
    }

    if (this._credits < upgradeData.cost) {
      this._showError(`Not enough credits! Need ${upgradeData.cost}Ȼ`);
      return;
    }

    const result = this._idleEngine.purchaseUpgrade(upgradeId);

    if (result.success) {
      this._credits -= upgradeData.cost;
      this._upgrades.push({ id: upgradeId });
      this._clearError();
      this._rerender();
    } else {
      this._showError(result.error);
    }
  }

  /**
   * Handle assign bot button click.
   * @param {string} botId
   */
  _onAssignBot(botId) {
    // For now, assign to a placeholder contract
    // In full implementation, this would open a contract selection modal
    const result = this._idleEngine.assignBot(botId, 'contract-auto');
    if (result.success) {
      this._rerender();
    } else {
      this._showError(result.error);
    }
  }

  /**
   * Show error message.
   * @param {string} message
   */
  _showError(message) {
    this._lastError = message;
  }

  /**
   * Clear error message.
   */
  _clearError() {
    this._lastError = null;
  }

  /**
   * Re-render the entire screen.
   */
  _rerender() {
    if (this._container) {
      const newEl = this.render();
      this._container.replaceWith(newEl);
      this._container = newEl;
    }
  }

  /**
   * Render the complete idle factory screen.
   * @returns {HTMLElement}
   */
  render() {
    const container = document.createElement('div');
    container.className = 'idle-factory';

    const header = document.createElement('div');
    header.className = 'idle-factory-header';
    header.innerHTML = `<h2>Idle Factory</h2>`;
    container.appendChild(header);

    const creditsDisplay = document.createElement('div');
    creditsDisplay.className = 'credits-display';
    creditsDisplay.textContent = `Credits: ${this._credits}Ȼ`;
    container.appendChild(creditsDisplay);

    const botRoster = document.createElement('div');
    botRoster.className = 'bot-roster';
    const rosterTitle = document.createElement('h3');
    rosterTitle.textContent = 'Hire Bots';
    botRoster.appendChild(rosterTitle);

    for (let i = 0; i < botTiers.length; i++) {
      botRoster.appendChild(this._renderTierCard(botTiers[i]));
    }
    container.appendChild(botRoster);

    container.appendChild(this._renderUpgradeShop());
    container.appendChild(this._renderActiveBots());
    container.appendChild(this._renderOfflineEarnings());

    this._container = container;
    return container;
  }
}
