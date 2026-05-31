# Proposal: M9 — QA Pass

## Intent

Ensure product quality before M10 deployment through automated E2E tests, performance benchmarks, security audit, and coverage gap-filling. Critical paths (weld session, save/load, idle tick) must be proven working at 60fps with <2ms physics tick.

## Scope

### In Scope
- E2E tests: Playwright tests for weld session flow, save/load, idle earnings
- Performance: Vitest bench for physics tick < 2ms at 60fps
- Security: Audit Zod validation, parameterized queries, JWT expiry
- Coverage: Core physics/scoring modules ≥ 90% line coverage

### Out of Scope
- New feature development
- Architecture changes
- Database migrations
- Deployment automation

## Capabilities

### New Capabilities
- `e2e-weld-session`: Playwright test covering full weld workflow
- `e2e-save-load`: Playwright test for game state persistence
- `e2e-idle-tick`: Playwright test for idle earnings calculation
- `bench-physics`: Vitest benchmark for physics tick performance
- `security-audit`: Security review of validation, queries, auth

### Modified Capabilities
- None — this is a pure QA pass

## Approach

1. Write Playwright E2E tests against running dev server
2. Write Vitest bench for physics tick hot path
3. Audit all backend routes for Zod validation presence
4. Check parameterized query usage (currently in-memory, no DB)
5. Verify JWT expiry configuration (none present — flag for M10)
6. Run coverage, identify gaps, add unit tests to fill

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `tests/e2e/` | New | Playwright E2E test suite |
| `tests/benchmarks/` | New | Vitest performance benchmarks |
| `server/src/routes/` | Audit | Missing Zod validation |
| `coverage/` | Updated | Coverage reports |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| E2E tests flaky on CI | Medium | Use retry=1, stable selectors |
| Physics bench fails <2ms | Low | Profile and optimize if needed |
| Coverage gaps too large | Low | Add unit tests for uncovered modules |

## Rollback Plan

Delete `tests/e2e/`, `tests/benchmarks/` directories. No production code changed.

## Dependencies

- Playwright installed (`npx playwright install chromium`)
- Dev server running on port 3000
- All M1-M8 unit tests passing

## Success Criteria

- [ ] 3 E2E tests pass (weld-session, save-load, idle-tick)
- [ ] Physics bench: mean tick < 2ms
- [ ] Security audit: Zod present on all route inputs
- [ ] Coverage: physics/game modules ≥ 90%
- [ ] All 154 existing unit tests still pass
- [ ] ESLint passes with zero errors