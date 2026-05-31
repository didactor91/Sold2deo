# Delta for cicd

## ADDED Requirements

### Requirement: GitHub Actions CI Workflow

The system MUST provide a `.github/workflows/ci.yml` that runs tests on every push.

#### Scenario: CI triggers on push

- GIVEN `.github/workflows/ci.yml` exists with proper configuration
- WHEN code is pushed to any branch
- THEN GitHub Actions runs the CI workflow

#### Scenario: CI runs lint

- GIVEN workflow is triggered
- THEN `npx eslint src/ server/src/` is executed

#### Scenario: CI runs unit tests

- GIVEN workflow is triggered
- THEN `npx vitest run` is executed with coverage

#### Scenario: CI runs E2E tests

- GIVEN workflow is triggered
- THEN `npx playwright test` is executed

### Requirement: CI Matrix Strategy

The system MUST use a matrix strategy to run tests across Node.js versions.

#### Scenario: Matrix includes Node 20

- GIVEN workflow uses matrix strategy
- THEN Node.js 20 is included in the test matrix

### Requirement: Docker Build on Release

The system MUST provide a Dockerfile for building production Docker images.

#### Scenario: Dockerfile builds successfully

- GIVEN Dockerfile exists in project root
- WHEN `docker build -t weldmaster .` is executed
- THEN image builds without errors

#### Scenario: Docker image includes production build

- GIVEN Dockerfile is properly configured
- THEN built image contains `public/bundle.js` (production build output)
