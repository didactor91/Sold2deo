# MASTER.md — WELD MASTER: AI Agent Development Orchestration

**This file is the single source of truth for the AI development system.**  
Every agent reads this file before acting. No exceptions.

---

## PROJECT IDENTITY

- **Name:** Weld Master
- **Type:** Browser game (Vanilla JS + Canvas 2D) + Node.js backend
- **RFC:** `docs/RFC-001-WELDMASTER.md` — read before any task
- **SDD:** `docs/SDD-001-WELDMASTER.md` — read before any module task
- **Repo root:** `/` (this file lives here)

---

## AGENT SYSTEM OVERVIEW

**Orchestrator:** Minimax 2.7 via gentle-ai  
**Subagents:** Dynamically spawned by orchestrator. Each subagent receives:
1. This MASTER.md
2. The relevant SDD section
3. Its SKILL.md
4. A scoped task description with explicit acceptance criteria

**Orchestrator decides:** which subagent to spawn, in what order, with what context slice. It does NOT hardcode a fixed pipeline.

---

## ABSOLUTE RULES — EVERY AGENT, EVERY TASK

These rules are non-negotiable. Any agent violating them must halt and report.

```
RULE-001  Read RFC-001 and SDD-001 before writing any code.
RULE-002  No framework imports. No npm packages in /src. Esbuild for build only.
RULE-003  Every exported function/class has JSDoc. No exceptions.
RULE-004  No magic numbers. Constants go in /src/config/balance.js.
RULE-005  Max 40 lines per function. Max 300 lines per file.
RULE-006  Zero console.log in /src. Use Logger service.
RULE-007  Every new module has a corresponding test file.
RULE-008  No string SQL concatenation. Parameterised queries only.
RULE-009  All inputs to backend routes validated with Zod before DB touch.
RULE-010  After every task: run lint, run relevant tests, report results.
RULE-011  If a task requires changing a constant in balance.js, flag it explicitly.
RULE-012  Never modify files outside the declared scope of the task.
RULE-013  If ambiguous, STOP and ask. Never assume.
RULE-014  Commit messages: conventional commits format. feat/fix/test/refactor/docs.
RULE-015  No code duplication. If logic exists elsewhere, import it.
```

---

## REPOSITORY STRUCTURE

```
/
├── MASTER.md                    ← YOU ARE HERE
├── docs/
│   ├── RFC-001-WELDMASTER.md
│   ├── SDD-001-WELDMASTER.md
│   └── CHANGELOG.md
├── agents/
│   ├── ORCHESTRATOR-PROMPT.md
│   ├── skills/
│   │   ├── SKILL-physics.md
│   │   ├── SKILL-renderer.md
│   │   ├── SKILL-ui.md
│   │   ├── SKILL-backend.md
│   │   ├── SKILL-testing.md
│   │   └── SKILL-audio.md
├── src/                         ← Frontend (Vanilla JS ES modules)
│   ├── core/
│   ├── physics/
│   ├── renderer/
│   ├── ui/
│   ├── audio/
│   ├── game/
│   ├── api/
│   ├── config/
│   └── types/
├── server/                      ← Backend (Node.js)
│   └── src/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
│   └── index.html
├── .eslintrc.json
├── .prettierrc
├── vitest.config.js
├── playwright.config.js
├── package.json                 ← devDependencies only (vitest, playwright, eslint, prettier, esbuild)
└── server/package.json          ← backend dependencies
```

---

## MILESTONE QUEUE

The orchestrator works through milestones in order. A milestone is DONE only when:
1. All code written and in correct location.
2. Lint passes with zero errors.
3. All tests for that milestone pass.
4. Orchestrator has verified output against acceptance criteria in SDD.

| ID | Milestone | Skills Needed | Status |
|----|-----------|--------------|--------|
| M1 | Physics engine | SKILL-physics, SKILL-testing | TODO |
| M2 | Side-view renderer | SKILL-renderer, SKILL-testing | TODO |
| M3 | Full simulation loop | SKILL-physics, SKILL-renderer, SKILL-testing | TODO |
| M4 | Machine panel + audio | SKILL-ui, SKILL-audio, SKILL-testing | TODO |
| M5 | Progression + contracts | SKILL-ui, SKILL-testing | TODO |
| M6 | Backend API | SKILL-backend, SKILL-testing | TODO |
| M7 | Idle factory | SKILL-ui, SKILL-testing | TODO |
| M8 | Cosmetics + monetisation | SKILL-backend, SKILL-ui | TODO |
| M9 | QA pass | SKILL-testing | TODO |
| M10 | Deploy | SKILL-backend | TODO |

---

## HOW TO RUN (DEV)

```bash
# Frontend dev server (no bundler needed)
npx serve public/ -l 3000

# Backend
cd server && node src/server.js

# Tests
npx vitest run
npx playwright test

# Lint
npx eslint src/ server/src/
npx prettier --check src/ server/src/

# Production build (frontend only)
npx esbuild src/main.js --bundle --outfile=public/bundle.js --minify
```

---

## TASK FORMAT FOR SUBAGENTS

Every task issued by the orchestrator must follow this format:

```
TASK-ID: [M1-001]
MILESTONE: [M1]
SKILL: [SKILL-physics.md]
FILES TO CREATE/MODIFY: [src/physics/WeldPool.js, tests/unit/WeldPool.test.js]
DEPENDS ON: []
DESCRIPTION:
  [Precise description, one paragraph max]
ACCEPTANCE CRITERIA:
  - [ ] Criterion 1
  - [ ] Criterion 2
  - [ ] Tests pass
  - [ ] Lint passes
DO NOT TOUCH: [everything else]
```

---

## ESCALATION PROTOCOL

If an agent encounters any of:
- Ambiguity in RFC or SDD
- A requirement that conflicts with another
- A performance constraint that cannot be met
- A security concern

→ STOP. Write `ESCALATION: [reason]` and return to orchestrator. Do not proceed.

---

## DEFINITION OF "MILITARY GRADE" FOR THIS PROJECT

1. **Correctness:** physics model matches documented equations in SDD. No approximation without explicit comment.
2. **Testability:** every pure function is unit-testable. Side effects are isolated.
3. **Determinism:** given the same input seed, simulation produces identical output. Required for replay and scoring validation.
4. **Resilience:** game loop never crashes on bad input. All edge cases handled and logged.
5. **Auditability:** all balance constants documented with source/rationale in balance.js.
6. **Zero trust on client:** backend validates all critical game outcomes independently.

(End of file - total 188 lines)