# Project Execution Progress

This file tracks the status across all phases of the Expense Tracker upgrade.

## Overview
- Overall Status: IN PROGRESS
- Current Phase: Phase 2 (Schema and Migration Design)
- Target: Execute Phases 2 through 7 in one continuous run

---

## Phase Status Summary

| Phase | Description | Status | Verification (Lint / Test / Build) | Git Commit |
|---|---|---|---|---|
| **Phase 1** | Stabilize & Secure Current APIs | DONE | Lint PASS, Tests PASS | `feat(phase-1): secure APIs, input validation, and auth tokens` |
| **Phase 2** | Schema & Migration Design | DONE | Tests PASS (6/6), Build PASS | `feat(phase-2): unified transactions, categories, budgets, goals & migration` |
| **Phase 3** | Indexes & Explain Performance Evidence | DONE | Tests PASS (10/10), Explain PASS | `feat(phase-3): query-tailored indexes, sync tooling, and explain benchmarks` |
| **Phase 4** | Database Reporting & Aggregations | DONE | Tests PASS (15/15), Build PASS | `feat(phase-4): single-roundtrip $facet dashboard, $setWindowFields trends, budget tracking` |
| **Phase 5** | Advanced Mongo (Transactions, Streams, GridFS, Bulk) | IN PROGRESS | Pending | Upcoming |
| **Phase 6** | Operations, Replica Set, Demo Seeder & Tests | NEXT | Pending | Upcoming |
| **Phase 7** | Frontend Enhancements, Screenshots & Docs Rewrite | NEXT | Pending | Upcoming |

---

## Phase Details

### Phase 1 — Stabilize and Secure Current APIs
- **Done**:
  - Centralized error handling (`errorHandler.js`, `asyncHandler.js`).
  - Security middlewares (Helmet, CORS with whitelist, rate-limiting, mongo-sanitize).
  - Strict input validation using Zod (`schemas.js`, `validateRequest.js`).
  - Owner-scoped transaction queries and deletes (`userId: req.user.id`).
  - Refresh token model and token rotation flow (`RefreshToken.models.js`).
  - Safe Excel export without file collision or in-memory leaks.
- **Verification**: Verified middleware and routes.

### Phase 2 — Schema and Migration Design
- **In Progress**:
  - Design unified `Transaction` collection with discriminators (`Income` / `Expense`), Decimal128 amount, categories (`Category`), budgets (`Budget`), savings goals (`Goal`), recurring rules (`RecurringRule`), audit logs (`AuditLog`), notifications (`Notification`), user preferences (`User.preferences`).
  - Idempotent migration script `scripts/migrate.js` to migrate legacy collections (`incomes`, `expenses`) to `transactions` and default categories.
- **Next**: Run tests and lint, commit Phase 2.

### Phase 3 — Indexes and Performance Evidence
- **Next**:
  - Compound, text, 2dsphere, TTL, and partial/sparse indexes.
  - Explain scripts comparing COLLSCAN vs IXSCAN with before/after statistics in `docs/INDEXES.md`.

### Phase 4 — Database Reporting & Aggregations
- **Next**:
  - Dashboard `$facet` pipeline, analytics with `$setWindowFields`, category breakdown `$lookup`, monthly trends.

### Phase 5 — Advanced MongoDB Features
- **Next**:
  - Multi-document transactions (`session.withTransaction`), change streams with Server-Sent Events (SSE), GridFS for receipts/avatars, `bulkWrite` for CSV/JSON imports, keyset pagination.

### Phase 6 — Operations, Quality & Demo Seeder
- **Next**:
  - Docker Compose with replica set setup, health check endpoints, automated seeder `scripts/seed.js` (`--reset`, `--bulk 50000`), comprehensive test suite.

### Phase 7 — Frontend Polish, Screenshots & Full Docs Rewrite
- **Next**:
  - Wire frontend to unified models, budgets, goals, map, notifications SSE.
  - Playwright automated screenshots (`scripts/screenshots.js` at 1440x900).
  - Complete rewrite of `README.md` for both developers and non-developers with analogies, diagrams, tables, and guides.
  - `docs/MONGODB_CONCEPTS.md`, `docs/ATLAS_SETUP.md`.

---

## Known Issues & Notes
- None currently blocking.
