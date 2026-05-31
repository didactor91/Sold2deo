# Delta for postgresql-migration

## ADDED Requirements

### Requirement: PostgreSQL Schema Migration

The system MUST provide SQL migration files that create the required database schema.

#### Scenario: Initial migration creates tables

- GIVEN PostgreSQL database is empty
- WHEN migration `001_initial.sql` is executed
- THEN tables are created: `users`, `game_saves`

### Requirement: Users Table Schema

The system MUST have a `users` table with id, username, password_hash, created_at.

#### Scenario: Users table structure

- GIVEN migration is executed
- THEN `users` table has columns:
  - `id` SERIAL PRIMARY KEY
  - `username` VARCHAR(255) UNIQUE NOT NULL
  - `password_hash` VARCHAR(255) NOT NULL
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### Requirement: Game Saves Table Schema

The system MUST have a `game_saves` table linked to users.

#### Scenario: Game saves table structure

- GIVEN migration is executed
- THEN `game_saves` table has columns:
  - `id` SERIAL PRIMARY KEY
  - `user_id` INTEGER REFERENCES users(id)
  - `save_data` JSONB NOT NULL
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP

### Requirement: Parameterized Queries

All database queries MUST use parameterized statements to prevent SQL injection.

#### Scenario: Login query is parameterized

- GIVEN login query is executed
- THEN no string interpolation is used; `$1`, `$2` placeholders are used for all user inputs

#### Scenario: Save game query is parameterized

- GIVEN save game query is executed
- THEN save_data JSONB is passed as parameterized value, not interpolated

### Requirement: Query Layer Functions

The system MUST provide JavaScript functions in `server/src/db/queries/` that wrap all database operations.

#### Scenario: findUserByUsername

- GIVEN user 'player1' exists in database
- WHEN `queries.findUserByUsername('player1')` is called
- THEN returns `{ id: 1, username: 'player1', password_hash: '...' }`

#### Scenario: createUser

- GIVEN username 'newplayer' does not exist
- WHEN `queries.createUser('newplayer', 'hashedpassword')` is called
- THEN returns `{ id: 2, username: 'newplayer' }`

#### Scenario: findGameSaveByUserId

- GIVEN user 1 has a saved game
- WHEN `queries.findGameSaveByUserId(1)` is called
- THEN returns `{ id: 1, user_id: 1, save_data: {...} }` or null if none exists

#### Scenario: upsertGameSave

- GIVEN user 1 exists with no save
- WHEN `queries.upsertGameSave(1, { credits: 500, bots: [] })` is called
- THEN save is created and returns the save record

- GIVEN user 1 exists with existing save
- WHEN `queries.upsertGameSave(1, { credits: 1000, bots: [...] })` is called
- THEN save is updated and returns the updated record
