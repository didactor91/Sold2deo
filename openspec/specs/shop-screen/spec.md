# Delta for shop-screen

## ADDED Requirements

### Requirement: Shop Screen Display

The system MUST display the cosmetics shop as a modal overlay listing all available cosmetic items.

#### Scenario: Open shop screen

- GIVEN the player clicks the shop button
- WHEN the shop modal opens
- THEN all cosmetic items are displayed in a grid with name, category badge, price, and preview swatch

#### Scenario: Shop shows owned state

- GIVEN a cosmetic item is already owned by the player
- WHEN the shop renders
- THEN that item is marked with a "OWNED" badge and purchase is disabled

#### Scenario: Shop shows affordable/unaffordable state

- GIVEN a cosmetic item's price exceeds player's balance
- WHEN the shop renders
- THEN that item's price is displayed in red and purchase button is disabled

### Requirement: Purchase Flow

The system MUST allow the player to purchase a cosmetic from the shop.

#### Scenario: Purchase with sufficient credits

- GIVEN player has 500Ȼ and views an item costing 200Ȼ
- WHEN player clicks "Buy"
- THEN a confirmation appears; after confirm, the item is purchased, Ȼ deducted, and "OWNED" badge appears

#### Scenario: Purchase with insufficient credits

- GIVEN player has 50Ȼ and views an item costing 200Ȼ
- WHEN player clicks "Buy"
- THEN a warning is shown: "Insufficient credits"

### Requirement: Cosmetic Preview

The system MUST apply a visual preview of a cosmetic when the player hovers over or selects it.

#### Scenario: Hover preview for arc cosmetic

- GIVEN an arc cosmetic is selected
- WHEN player hovers over it
- THEN the in-game arc colour temporarily reflects that cosmetic's effect (without purchasing)

#### Scenario: Return to current cosmetic on deselect

- GIVEN player hovers away from a cosmetic item
- WHEN deselection occurs
- THEN the in-game visual returns to the currently equipped cosmetic