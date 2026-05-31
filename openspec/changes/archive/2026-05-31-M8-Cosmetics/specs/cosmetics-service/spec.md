# Delta for cosmetics-service

## ADDED Requirements

### Requirement: Cosmetics Catalog

The system MUST provide a catalog of all available cosmetic items with their names, descriptions, categories, prices, and visual effect identifiers.

#### Scenario: Fetch cosmetics catalog

- GIVEN the game client requests the cosmetics catalog
- WHEN the request is received
- THEN the system returns an array of cosmetic items, each with: `id`, `name`, `category` (arc | spatter | machine), `price` (in Ȼ), `effectId`, `description`

#### Scenario: Categories are correctly typed

- GIVEN a cosmetic with category "arc"
- WHEN it is returned in the catalog
- THEN it has an `effectId` referencing an arc colour value (e.g., "blue-glow", "red-arc")

### Requirement: Purchase Cosmetic

The system MUST validate and process a cosmetic purchase: deduct Ȼ from player balance, add item to player inventory, and return the updated inventory.

#### Scenario: Purchase with sufficient balance

- GIVEN player has 500Ȼ and the cosmetic costs 200Ȼ
- WHEN player purchases the cosmetic
- THEN 200Ȼ is deducted from balance, item is added to inventory, and updated balance is returned

#### Scenario: Purchase with insufficient balance

- GIVEN player has 100Ȼ and the cosmetic costs 200Ȼ
- WHEN player purchases the cosmetic
- THEN the purchase fails with error code "INSUFFICIENT_FUNDS" and balance is unchanged

#### Scenario: Purchase already-owned item

- GIVEN player already owns the cosmetic
- WHEN player attempts to purchase it again
- THEN the purchase succeeds (idempotent) and the current inventory is returned (no double-charge)

#### Scenario: Purchase non-existent item

- GIVEN an invalid cosmetic ID is submitted
- WHEN player attempts to purchase
- THEN the purchase fails with error code "ITEM_NOT_FOUND"

### Requirement: Player Inventory

The system MUST return the player's current cosmetic inventory on request.

#### Scenario: Fetch inventory

- GIVEN a player with owned cosmetics [arc-blue-glow, spatter-fire]
- WHEN inventory is requested
- THEN the system returns the array of owned cosmetic IDs

#### Scenario: Empty inventory

- GIVEN a player with no cosmetics purchased
- WHEN inventory is requested
- THEN an empty array is returned

### Requirement: Balance Check

The system MUST expose the player's current Ȼ balance for UI pre-validation.

#### Scenario: Get balance

- GIVEN a player with 750Ȼ
- WHEN balance is requested
- THEN 750 is returned