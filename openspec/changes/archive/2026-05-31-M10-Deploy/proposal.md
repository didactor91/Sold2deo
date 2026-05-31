# Proposal: M10-Deploy — Production Deployment

## Intent

Complete the production deployment pipeline for Weld Master by fixing missing frontend module imports, wiring all modules together, implementing JWT authentication, migrating from in-memory store to PostgreSQL with parameterized queries, and setting up GitHub Actions CI/CD.

## Scope

### In Scope
- Implement missing frontend core modules: `GameLoop`, `EventBus`, `StateManager`, `SaveManager`
- Implement missing UI modules: `MachinePanel`, `HUD`, `Navigation`
- Wire all frontend modules together in `main.js`
- Create `server/package.json` with PostgreSQL dependencies
- Implement JWT auth middleware (`server/src/middleware/auth.js`)
- Create PostgreSQL migration (`server/src/db/migrations/001_initial.sql`)
- Create parameterized query layer (`server/src/db/queries/`)
- Create `.github/workflows/ci.yml` for CI/CD
- Create `Dockerfile` for production
- Update `public/index.html` if needed

### Out of Scope
- Full rewrite of existing game logic (M1–M9 already implemented)
- Cloud infrastructure (AWS/Render/Vercel config beyond Dockerfile)
- Performance optimization passes

## Capabilities

### New Capabilities
- `frontend-integration`: Wire all frontend modules (GameLoop, EventBus, StateManager, SaveManager, SceneRenderer, MachinePanel, HUD, Navigation) into main.js
- `jwt-auth`: JWT-based authentication for server API endpoints
- `postgresql-migration`: PostgreSQL database with parameterized queries replacing in-memory store
- `cicd`: GitHub Actions workflow for automated testing and deployment

### Modified Capabilities
- None (existing specs unaffected — this is pure infrastructure)

## Approach

1. **Frontend Modules**: Implement stub modules that match the import signatures in main.js, wiring them to actual game components (IdleEngine, Renderer, AudioEngine)
2. **JWT Auth**: Use `jose` library for JWT verification; middleware on protected routes; `/login` and `/register` endpoints
3. **PostgreSQL**: Use `pg` driver; migrations via SQL files; parameterized queries to prevent SQL injection
4. **CI/CD**: GitHub Actions with `npx vitest run` + `npx playwright test` on push; Docker build on release

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/main.js` | Modified | Add working implementations for all module imports |
| `src/core/GameLoop.js` | New | 60fps game loop driving all systems |
| `src/core/EventBus.js` | New | Pub/sub event system |
| `src/core/StateManager.js` | New | Centralized game state |
| `src/core/SaveManager.js` | New | Persistence layer |
| `src/ui/MachinePanel.js` | New | Machine control UI |
| `src/ui/HUD.js` | New | Heads-up display |
| `src/ui/Navigation.js` | New | Screen navigation |
| `src/renderer/SceneRenderer.js` | New | Canvas scene rendering |
| `server/package.json` | New | Server dependencies (pg, jose, express) |
| `server/src/middleware/auth.js` | New | JWT verification middleware |
| `server/src/db/migrations/001_initial.sql` | New | PostgreSQL schema |
| `server/src/db/queries/*.js` | New | Parameterized query functions |
| `.github/workflows/ci.yml` | New | CI/CD pipeline |
| `Dockerfile` | New | Production Docker image |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| PostgreSQL connection issues in CI | Medium | Use ` DATABASE_URL` secret; test connection in `setup` job |
| JWT token expiry during testing | Low | Use short-lived test tokens with extended expiry for CI |
| Frontend module circular dependencies | Medium | Design EventBus as pure hub; no circular import chains |
| Playwright CI environment issues | Medium | Use `reuseExistingServer` flag; proper timeout handling |

## Rollback Plan

- **Code**: Revert feature branch `feature/M10-deploy` to `main`
- **Database**: PostgreSQL migrations are additive only; no destructive changes
- **CI**: Disable workflow via GitHub UI or delete `.github/workflows/ci.yml`
- **Docker**: Remove Docker image tags from registry

## Dependencies

- Node.js 20+ (for esbuild and vitest)
- PostgreSQL 15+ (for server)
- GitHub Actions (for CI/CD)

## Success Criteria

- [ ] `npx vitest run` passes all tests
- [ ] `npx playwright test` passes all E2E tests
- [ ] `npx eslint src/ server/src/` passes with no errors
- [ ] Production build succeeds (`npm run build`)
- [ ] JWT auth middleware correctly rejects unauthenticated requests
- [ ] PostgreSQL queries use parameterized statements (no string interpolation)
- [ ] GitHub Actions workflow triggers on push and runs full test suite
