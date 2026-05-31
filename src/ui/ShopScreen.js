/**
 * ShopScreen — DOM cosmetics store with purchase flow and preview
 * @module src/ui/ShopScreen
 */
import { COSMETICS_CATALOG, getCosmeticsByCategory } from '../config/cosmetics.js';

/**
 * @typedef {Object} ShopScreenOptions
 * @property {Object} eventBus - Event emitter for game events
 * @property {function(string): void} onError - Error display callback
 * @property {function(): number} getCredits - Get current credits balance
 * @property {function(number): void} setCredits - Set credits balance
 * @property {function(): string[]} getInventory - Get owned cosmetic IDs
 * @property {function(string, number): Promise} purchaseCosmetic - Server purchase call
 * @property {function(string): void} onEquipCosmetic - Equip cosmetic effect
 */

/**
 * ShopScreen manages the cosmetics shop modal UI.
 * Handles catalog display, purchase flow, and cosmetic preview.
 */
export class ShopScreen {
  /**
   * @param {ShopScreenOptions} options
   */
  constructor({
    eventBus,
    onError = () => {},
    getCredits = () => 0,
    setCredits = () => {},
    getInventory = () => [],
    purchaseCosmetic = async () => {},
    onEquipCosmetic = () => {},
  } = {}) {
    this._eventBus = eventBus;
    this._onError = onError;
    this._getCredits = getCredits;
    this._setCredits = setCredits;
    this._getInventory = getInventory;
    this._purchaseCosmetic = purchaseCosmetic;
    this._onEquipCosmetic = onEquipCosmetic;

    this._isOpen = false;
    this._previewId = null;
    this._container = null;
  }

  /**
   * Open the shop modal.
   */
  open() {
    this._isOpen = true;
    this._render();
  }

  /**
   * Close the shop modal.
   */
  close() {
    this._isOpen = false;
    if (this._container) {
      this._container.remove();
      this._container = null;
    }
  }

  /**
   * Check if shop is currently open.
   * @returns {boolean}
   */
  isOpen() {
    return this._isOpen;
  }

  /**
   * Render the shop modal into the DOM.
   * @private
   */
  _render() {
    if (!this._isOpen) return;
    const existing = document.getElementById('shop-modal');
    if (existing) existing.remove();
    const modal = this._buildModal();
    this._bindModalEvents(modal);
    document.body.appendChild(modal);
    this._container = modal;
  }

  /**
   * Build the modal DOM element with shop HTML.
   * @private
   * @returns {HTMLElement}
   */
  _buildModal() {
    const credits = this._getCredits();
    const inventory = this._getInventory();
    const categories = ['arc', 'spatter', 'machine'];
    const modal = document.createElement('div');
    modal.id = 'shop-modal';
    modal.innerHTML = this._buildShopHTML(credits, inventory, categories);
    return modal;
  }

  /**
   * Build the shop panel HTML string.
   * @private
   * @param {number} credits
   * @param {string[]} inventory
   * @param {string[]} categories
   * @returns {string}
   */
  _buildShopHTML(credits, inventory, categories) {
    return `
      <div class="shop-overlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:1000;">
        <div class="shop-panel" style="background:#1a1a2e;border:2px solid #0f3460;border-radius:12px;padding:24px;max-width:600px;width:90%;max-height:80vh;overflow-y:auto;font-family:'Segoe UI',sans-serif;color:#eee;">
          <div class="shop-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h2 style="margin:0;font-size:1.5rem;color:#e94560;">Cosmetics Shop</h2>
            <span class="shop-balance" style="color:#f9d923;font-size:1.1rem;">Ȼ ${credits.toLocaleString()}</span>
          </div>
          <div class="shop-categories">
            ${categories.map(cat => `
              <div class="shop-category" data-category="${cat}" style="margin-bottom:20px;">
                <h3 style="text-transform:capitalize;color:#0f3460;border-bottom:1px solid #0f3460;padding-bottom:4px;margin-bottom:10px;">${cat}</h3>
                <div class="shop-items" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;">
                  ${this._renderItemsByCategory(cat, inventory, credits)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Bind click and interaction events to the modal.
   * @private
   * @param {HTMLElement} modal
   */
  _bindModalEvents(modal) {
    modal.querySelector('.shop-overlay').addEventListener('click', (e) => {
      if (e.target === modal.querySelector('.shop-overlay')) this.close();
    });
    modal.querySelectorAll('[data-item-id]').forEach(el => {
      const itemId = el.dataset.itemId;
      el.addEventListener('mouseenter', () => this._startPreview(itemId));
      el.addEventListener('mouseleave', () => this._endPreview());
      const btn = el.querySelector('.buy-btn');
      if (btn && !el.dataset.owned) {
        btn.addEventListener('click', () => this._onBuyClick(itemId));
      }
    });
  }

  /**
   * Render items for a single category.
   * @private
   * @param {string} category
   * @param {string[]} inventory
   * @param {number} credits
   */
  _renderItemsByCategory(category, inventory, credits) {
    const items = getCosmeticsByCategory(category);
    return items.map(item => {
      const owned = inventory.includes(item.id);
      const canAfford = credits >= item.price;
      return `
        <div class="shop-item" data-item-id="${item.id}" data-owned="${owned}" style="
          background: #16213e; border: 1px solid ${owned ? '#4ecca3' : '#0f3460'};
          border-radius: 8px; padding: 10px; cursor: pointer; opacity: ${owned ? 0.7 : 1};
        ">
          <div class="item-preview" style="
            width: 40px; height: 40px; border-radius: 50%; margin: 0 auto 8px;
            background: ${this._getPreviewColor(item.category, item.effectId)};
          "></div>
          <div class="item-name" style="font-size:0.85rem;text-align:center;margin-bottom:4px;">${item.name}</div>
          <div class="item-price" style="
            text-align:center;font-size:0.8rem;color:${canAfford ? '#f9d923' : '#e94560'};
          ">Ȼ ${item.price}</div>
          ${owned
            ? '<div class="owned-badge" style="text-align:center;font-size:0.7rem;color:#4ecca3;margin-top:4px;">OWNED</div>'
            : `<button class="buy-btn" style="
                width:100%;margin-top:6px;padding:4px 8px;
                background:${canAfford ? '#e94560' : '#555'};
                color:white;border:none;border-radius:4px;cursor:${canAfford ? 'pointer' : 'not-allowed'};
                font-size:0.75rem;
              " ${!canAfford ? 'disabled' : ''}>Buy</button>`
          }
        </div>
      `;
    }).join('');
  }

  /**
   * Get the preview color for a cosmetic item.
   * @private
   */
  _getPreviewColor(category, effectId) {
    const colors = {
      'blue-glow': '#0077ff',
      'red-arc': '#ff3333',
      'green-arc': '#33cc33',
      'purple-arc': '#9933ff',
      'fire-spatter': '#ff6600',
      'snow-spatter': '#e6f2ff',
      'toxic-spatter': '#33cc33',
      'chrome': '#d9d9d9',
      'rust': '#cc6633',
      'gold': '#ffd700',
    };
    return colors[effectId] || '#888';
  }

  /**
   * Start previewing a cosmetic.
   * @private
   */
  _startPreview(itemId) {
    this._previewId = itemId;
    this._onEquipCosmetic(itemId);
  }

  /**
   * End previewing the current cosmetic.
   * @private
   */
  _endPreview() {
    this._previewId = null;
    // Return to currently equipped cosmetic (not implemented — would need equipped tracking)
  }

  /**
   * Handle buy button click.
   * @private
   */
  async _onBuyClick(itemId) {
    const credits = this._getCredits();
    const item = COSMETICS_CATALOG.find(c => c.id === itemId);
    if (!item) return;

    if (credits < item.price) {
      this._onError(`Insufficient credits — need Ȼ ${item.price}`);
      return;
    }

    try {
      const result = await this._purchaseCosmetic(itemId, credits);
      if (result.success) {
        this._setCredits(result.newBalance);
        this._render();
      } else {
        this._onError(result.error || 'Purchase failed');
      }
    } catch (err) {
      this._onError('Network error — please try again');
    }
  }

  /**
   * Update shop display (e.g., after credits change).
   */
  update() {
    if (this._isOpen) this._render();
  }
}