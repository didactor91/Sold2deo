/**
 * Cosmetics Catalog — all cosmetic items available in the shop
 * @module src/config/cosmetics
 */

/**
 * @typedef {Object} CosmeticItem
 * @property {string} id - Unique identifier e.g. 'arc-blue-glow'
 * @property {string} name - Display name e.g. 'Electric Blue'
 * @property {string} category - 'arc' | 'spatter' | 'machine'
 * @property {number} price - Cost in credits (Ȼ)
 * @property {string} effectId - Visual effect identifier
 * @property {string} description - Item description
 */

/** @type {CosmeticItem[]} */
export const COSMETICS_CATALOG = Object.freeze([
  {
    id: 'arc-blue-glow',
    name: 'Electric Blue',
    category: 'arc',
    price: 100,
    effectId: 'blue-glow',
    description: 'Blue arc glow',
  },
  {
    id: 'arc-red-arc',
    name: 'Plasma Red',
    category: 'arc',
    price: 100,
    effectId: 'red-arc',
    description: 'Red arc glow',
  },
  {
    id: 'arc-green-arc',
    name: 'Toxic Green',
    category: 'arc',
    price: 150,
    effectId: 'green-arc',
    description: 'Green arc glow',
  },
  {
    id: 'arc-purple-arc',
    name: 'Ultraviolet',
    category: 'arc',
    price: 200,
    effectId: 'purple-arc',
    description: 'Purple arc glow',
  },
  {
    id: 'spatter-fire',
    name: 'Fire Spatter',
    category: 'spatter',
    price: 120,
    effectId: 'fire-spatter',
    description: 'Orange particle bursts',
  },
  {
    id: 'spatter-snow',
    name: 'Snow Spatter',
    category: 'spatter',
    price: 120,
    effectId: 'snow-spatter',
    description: 'White/crystal particles',
  },
  {
    id: 'spatter-toxic',
    name: 'Toxic Spatter',
    category: 'spatter',
    price: 180,
    effectId: 'toxic-spatter',
    description: 'Green toxic particles',
  },
  {
    id: 'machine-chrome',
    name: 'Chrome Machine',
    category: 'machine',
    price: 250,
    effectId: 'chrome',
    description: 'Reflective metallic body',
  },
  {
    id: 'machine-rust',
    name: 'Rust Bucket',
    category: 'machine',
    price: 150,
    effectId: 'rust',
    description: 'Rusty orange texture',
  },
  {
    id: 'machine-gold',
    name: 'Golden Welder',
    category: 'machine',
    price: 500,
    effectId: 'gold',
    description: 'Gold metallic finish',
  },
]);

/**
 * Get cosmetic item by id.
 * @param {string} id
 * @returns {CosmeticItem|undefined}
 */
export function getCosmetic(id) {
  return COSMETICS_CATALOG.find(c => c.id === id);
}

/**
 * Get all cosmetics in a given category.
 * @param {string} category - 'arc' | 'spatter' | 'machine'
 * @returns {CosmeticItem[]}
 */
export function getCosmeticsByCategory(category) {
  return COSMETICS_CATALOG.filter(c => c.category === category);
}

/**
 * Get all cosmetic ids.
 * @returns {string[]}
 */
export function getAllCosmeticIds() {
  return COSMETICS_CATALOG.map(c => c.id);
}