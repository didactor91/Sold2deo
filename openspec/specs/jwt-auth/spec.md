# Delta for jwt-auth

## ADDED Requirements

### Requirement: JWT Token Generation

The system MUST provide a `/api/auth/login` endpoint that accepts username/password and returns a JWT token.

#### Scenario: Valid login returns token

- GIVEN user exists with username 'player1' and password 'secret123'
- WHEN POST `/api/auth/login` is called with `{ username: 'player1', password: 'secret123' }`
- THEN returns `{ token: 'eyJ...' }` with 200 status

#### Scenario: Invalid password returns 401

- GIVEN user exists with username 'player1' and password 'secret123'
- WHEN POST `/api/auth/login` is called with `{ username: 'player1', password: 'wrong' }`
- THEN returns 401 with `{ error: 'Invalid credentials' }`

#### Scenario: Unknown user returns 401

- GIVEN no user with username 'unknown' exists
- WHEN POST `/api/auth/login` is called with `{ username: 'unknown', password: 'test' }`
- THEN returns 401 with `{ error: 'Invalid credentials' }`

### Requirement: JWT Token Verification Middleware

The system MUST provide auth middleware that verifies JWT tokens on protected routes.

#### Scenario: Request with valid token passes

- GIVEN a valid JWT token for user 'player1'
- WHEN request to `/api/protected` includes `Authorization: Bearer <token>`
- THEN middleware calls `next()` and request proceeds

#### Scenario: Request without token returns 401

- GIVEN no token provided
- WHEN request to `/api/protected` is made without Authorization header
- THEN middleware returns 401 with `{ error: 'Authentication required' }`

#### Scenario: Request with invalid token returns 401

- GIVEN an invalid or expired JWT token
- WHEN request to `/api/protected` includes `Authorization: Bearer <invalid>`
- THEN middleware returns 401 with `{ error: 'Invalid or expired token' }`

### Requirement: User Registration

The system MUST provide a `/api/auth/register` endpoint that creates new users.

#### Scenario: Valid registration creates user

- GIVEN username 'newplayer' does not exist
- WHEN POST `/api/auth/register` is called with `{ username: 'newplayer', password: 'password123' }`
- THEN user is created in database and returns `{ message: 'User created' }` with 201 status

#### Scenario: Duplicate username returns 409

- GIVEN username 'existing' already exists
- WHEN POST `/api/auth/register` is called with `{ username: 'existing', password: 'test' }`
- THEN returns 409 with `{ error: 'Username already exists' }`
