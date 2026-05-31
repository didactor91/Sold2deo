# Proposal: M8 — Cosmetics + Monetization

## Intent

Add a cosmetics store and monetization layer to sold2deo. Players spend Ȼ (credits) on visual skins for arc glow colours, spatter particle effects, and machine textures. Inventory persists in the game save.

## Scope

### In Scope
- **CosmeticsService**: backend store, purchase validation, inventory management
- **ShopScreen.js**: DOM-based cosmetics store UI with purchase flow
- **Integration**: cosmetic effects applied to AudioEngine (arc colour) and renderer (spatter/machine skins)
- **Inventory**: stored in game save, persists across sessions

### Out of Scope
- Real-money purchases, gacha mechanics, subscription tiers
- Trading or transferring cosmetics between players
- Cosmetics for UI panels (kept to gameplay visuals only)

## Capabilities

### New Capabilities
- `cosmetics-service`: Backend service for managing cosmetic items, prices, and player inventory
- `shop-screen`: DOM store UI for browsing and purchasing cosmetics with Ȼ

### Modified Capabilities
- None

## Approach

Cosmetics are pure visual upgrades — no gameplay power. Backend validates purchases (Ȼ balance check, item exists, not already owned). Client-side preview before purchase. Inventory stored as array in game save JSON.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `server/src/services/CosmeticsService.js` | New | Purchase logic, inventory queries |
| `server/src/routes/cosmetics.js` | New | REST endpoints for shop and inventory |
| `src/ui/ShopScreen.js` | New | DOM store UI |
| `src/audio/AudioEngine.js` | Modified | Arc colour skin application |
| `src/renderer/Renderer.js` | Modified | Spatter/machine skin application |
| `src/config/balance.js` | Modified | Cosmetic price constants |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Duplicate purchase if client repeats request | Low | Idempotent server check — item already owned returns 200 |
| Skin assets bloat bundle | Medium | Lazy-load skin assets only when purchased |
| Ȼ exploit via client manipulation | Low | Server validates balance before deducting |

## Rollback Plan

1. Delete `CosmeticsService.js`, `routes/cosmetics.js`, `ShopScreen.js`
2. Remove cosmetic constants from `balance.js`
3. Revert AudioEngine/Renderer to use default visuals
4. Players keep cosmetics in save — safe since cosmetic code paths guard with `if (owned)` checks

## Dependencies

- M5 progression engine (Ȼ currency must exist first)

## Success Criteria

- [ ] ShopScreen displays at least 5 cosmetic items with name, price, preview
- [ ] Purchasing a cosmetic deducts correct Ȼ amount server-side
- [ ] Purchased cosmetic visibly changes arc colour or spatter effect in-game
- [ ] Cosmetics persist across page reload via game save
- [ ] Cannot purchase already-owned cosmetic
- [ ] Cannot purchase if insufficient Ȼ balance