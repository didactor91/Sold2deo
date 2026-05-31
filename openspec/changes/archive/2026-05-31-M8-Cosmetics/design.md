# Design: M8 — Cosmetics + Monetization

## Technical Approach

Cosmetics are pure visual upgrades stored as item IDs in the player inventory (game save JSON). Backend manages catalog and purchases; frontend manages display and cosmetic application. No gameplay power — just visual variety.

## Architecture Decisions

### Decision: Client-side preview before server purchase

**Choice**: Player can preview cosmetic effects in-game before spending Ȼ.
**Alternatives considered**: Server-authoritative preview (too round-trip heavy).
**Rationale**: Immediate feedback improves purchase confidence.

### Decision: Inventory stored in game save JSON (client)

**Choice**: Cosmetic inventory lives in the game save structure, not a separate server table.
**Alternatives considered**: Server-side inventory with sync.
**Rationale**: Keeps cosmetics always available offline; avoids sync complexity for purely cosmetic data.

### Decision: Idempotent purchases

**Choice**: Purchasing an already-owned item returns success without double-charge.
**Alternatives considered**: Reject with error.
**Rationale**: Client may retry on network timeout; idempotency prevents duplicate charges.

## Data Flow

```
Player clicks Buy
  → ShopScreen sends POST /api/cosmetics/purchase {itemId}
  → CosmeticsService checks:
  │   ├── Item exists → continue
  │   ├── Already owned → return current inventory (200)
  │   └── Balance sufficient → deduct Ȼ, add to inventory
  → Response: { success, newBalance, inventory }
  → ShopScreen updates UI, game save updated
  → AudioEngine/Renderer read inventory, apply cosmetic effect
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `server/src/services/CosmeticsService.js` | Create | Purchase logic, catalog, inventory queries |
| `server/src/routes/cosmetics.js` | Create | REST endpoints: GET /catalog, POST /purchase, GET /inventory |
| `src/ui/ShopScreen.js` | Create | DOM shop UI, purchase flow, preview |
| `src/config/cosmetics.js` | Create | Cosmetic catalog constants |
| `src/audio/AudioEngine.js` | Modify | Apply arc colour from equipped cosmetic |
| `src/renderer/Renderer.js` | Modify | Apply spatter/machine skin from cosmetic |
| `src/game/GameSave.js` | Modify | Persist cosmetics inventory array |

## Cosmetic Catalog (Initial)

| ID | Name | Category | Price | Effect |
|----|------|----------|-------|--------|
| arc-blue-glow | Electric Blue | arc | 100Ȼ | Blue arc glow |
| arc-red-arc | Plasma Red | arc | 100Ȼ | Red arc glow |
| arc-green-arc | Toxic Green | arc | 150Ȼ | Green arc glow |
| arc-purple-arc | Ultraviolet | arc | 200Ȼ | Purple arc glow |
| spatter-fire | Fire Spatter | spatter | 120Ȼ | Orange particle bursts |
| spatter-snow | Snow Spatter | spatter | 120Ȼ | White/crystal particles |
| spatter-toxic | Toxic Spatter | spatter | 180Ȼ | Green toxic particles |
| machine-chrome | Chrome Machine | machine | 250Ȼ | Reflective metallic body |
| machine-rust | Rust Bucket | machine | 150Ȼ | Rusty orange texture |
| machine-gold | Golden Welder | machine | 500Ȼ | Gold metallic finish |

## Interfaces / Contracts

### CosmeticsService API

```javascript
// Catalog
CosmeticsService.getCatalog() → CosmeticItem[]

// Purchase
CosmeticsService.purchase(playerId, cosmeticId, currentBalance) →
  { success: true, newBalance, inventory } |
  { success: false, error: 'INSUFFICIENT_FUNDS' | 'ITEM_NOT_FOUND' }

// Inventory
CosmeticsService.getInventory(playerId) → string[]
```

### Cosmetic Item Shape

```javascript
{
  id: string,        // 'arc-blue-glow'
  name: string,      // 'Electric Blue'
  category: string,  // 'arc' | 'spatter' | 'machine'
  price: number,     // Ȼ cost
  effectId: string,  // visual effect identifier
  description: string
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | CosmeticsService catalog, purchase logic, balance validation | Direct function calls, mock DB |
| Unit | ShopScreen business logic (separate from DOM) | Mock eventBus, mock API |
| Integration | Purchase end-to-end via HTTP call | Supertest on Express routes |

## Migration / Rollout

No migration required. Cosmetics inventory starts as empty array `[]` in game save. Existing saves auto-initialize with empty cosmetics.

## Open Questions

- [ ] How to handle cosmetic asset loading (lazy-load on first use vs pre-load at game start)?
- [ ] Should equipped cosmetic be a single active item or a loadout of multiple categories?
  - Recommendation: single active per category (arc, spatter, machine) — separate equip决策.