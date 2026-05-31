# Delta for Security Audit

## ADDED Requirements

### Requirement: Input Validation with Zod

The system SHALL validate all user inputs to backend routes using Zod schemas before processing.

#### Scenario: POST /api/cosmetics/purchase validates body

- GIVEN a POST request to `/api/cosmetics/purchase`
- WHEN the body contains `playerId` and `cosmeticId`
- THEN the system SHALL validate these fields using a Zod schema
- AND reject with 400 if validation fails

#### Scenario: GET /api/cosmetics/inventory/:playerId validates param

- GIVEN a GET request to `/api/cosmetics/inventory/:playerId`
- WHEN the `playerId` param is received
- THEN the system SHALL validate it matches expected format via Zod

### Requirement: Parameterized Queries

The system SHALL use parameterized queries for all database operations to prevent SQL injection.

#### Scenario: All DB queries use parameters

- GIVEN any database query is executed
- WHEN user-provided values are used in the query
- THEN the system SHALL use parameterized queries (not string concatenation)

### Requirement: JWT Expiry Configuration

The system SHALL configure JWT tokens with appropriate expiry times.

#### Scenario: JWT tokens have expiry

- GIVEN JWT is used for authentication
- WHEN a token is issued
- THEN it SHALL include an `exp` claim
- AND the expiry SHALL be reasonable for the use case (≤ 24h for refresh tokens)

## REMOVED Requirements

None.

## Notes

- Current implementation: in-memory store only, no DB, no JWT
- M10 (Deploy) must add PostgreSQL with parameterized queries
- M10 must add JWT authentication with expiry