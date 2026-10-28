# Phase 0 — Repository audit

Audit scope: the Express entry point and backend routes, controllers, middleware, database connection and models; the React source tree (routes, screens, shared components, state, API utilities); and the FastAPI service. This document records the implementation as found before the requested architecture changes.

## Current architecture and schemas

The React 19/Vite client calls a Node/Express 5 API using Axios. Express uses Mongoose to connect to MongoDB. An optional FastAPI service uses PyMongo directly. AI proxy routes exist in the backend but are not mounted.

| Collection/model | Current fields and behavior | Relationships and indexes |
| --- | --- | --- |
| `users` (`User.models.js`) | `username`, `email`, `password`, `profileImageUrl`, timestamps. A pre-save hook hashes `password` with bcryptjs; `comparePassword` checks it. | Email has a normal unique index (`unique: true`), with no case-insensitive collation. No preferences, roles, last login, or soft deletion. |
| `incomes` (`Income.models.js`) | `userId`, optional `icon`, required `source`, required numeric `amount`, date, timestamps. | `userId` references a User. No declared query indexes beyond MongoDB's `_id`. |
| `expenses` (`Expense.models.js`) | Same shape as Income. | `userId` references a User. No declared query indexes beyond MongoDB's `_id`. |

The application currently uses two transaction collections. There are no Category, Budget, RecurringRule, Goal, AuditLog, Notification, RefreshToken, or summary models. No native MongoDB JSON Schema validators, virtuals, soft-delete middleware, optimistic concurrency, or custom amount/date validators were found.

## Database query inventory

### Express/Mongoose

| Location | Query/write | Observations |
| --- | --- | --- |
| `AuthController.js` | `User.findOne({ email })` during signup and login; `User.create`; `User.findById(...).select("-password")` for profile info | Signup/login return the full user document, including the stored password hash. Email lookup uses case-sensitive matching. |
| `AuthMiddleware.js` | `User.findById(decoded.id).select("-password")` | Runs once per protected request. It does not reject a valid token whose user lookup returns null before calling `next()`. |
| `IncomeController.js` | `save`; `find({ userId }).sort({ date: -1 })` for list and export; `findByIdAndDelete(id)` | List/export need a compound owner/date index. Delete does not include the owner in its predicate. Export materializes all matching rows. |
| `ExpenseController.js` | `save`; `find({ userId }).sort({ date: -1 })` for list and export; `findByIdAndDelete(id)` | Same index and ownership concerns as Income. Expense export writes an in-memory XLSX buffer. |
| `getDashboardData.js` | Two `$match`/`$group` aggregate calls for lifetime totals; two date-filtered finds for rolling windows; two sorted finds for recent records | Six MongoDB operations per dashboard request. Rolling totals and combined recent-transaction sorting are computed in Node. |

### Python/PyMongo

`ai_services/main.py` runs unbounded `list(collection.find({"userId": ObjectId(user_id)}))` reads in the chatbot, prediction, analysis, and recommendations handlers. Pandas then performs grouping, totals, category percentages, and other calculations in application memory. The recommendation endpoint reads expenses and incomes separately. There are no projections, limits, cursors, or aggregation pipelines. An invalid ObjectId can become a 500 error. The service connects to database `test` regardless of the backend's configured database and contains a hard-coded MongoDB URI fallback.

### Index findings

No explicit indexes are declared for transaction owner/date list patterns, type/category/date access, tags, text search, location, recurring rules, or TTL cleanup. The User email uniqueness constraint creates an index, and MongoDB supplies `_id` indexes. No index inspection or `.explain("executionStats")` scripts/docs exist. Confirm deployed indexes from the actual database before designing migrations; this audit only inspected repository code.

## Query efficiency and data-layer observations

- No controller-level N+1 query loop was found. The dashboard does multiple independent queries and performs some combination/math in memory; the AI service loads full user histories before calculating results.
- Income/expense list and export queries have no pagination, projection, or `.lean()`, and exports load entire histories into memory.
- The dashboard fetches every matching transaction in its rolling windows, then the UI derives charts from those rows.
- No cursor pagination, bulk operations, transaction sessions, change streams, GridFS, views, materialized summaries, `$lookup`, or window functions exist yet.
- Currency is a frontend display preference; transaction documents do not record their currency. Amount is a JavaScript/Mongo numeric field, not Decimal128.

## Security and reliability gaps

- Income and expense deletion filters only by record ID. Because the routes are authenticated but not owner-scoped, one user who obtains another record ID can delete it.
- Signup/login responses include the entire Mongoose user document, which includes the bcrypt password hash.
- Backend CORS falls back to `*`; no Helmet, rate limiting, request/body validation, NoSQL sanitization, centralized error handler, or structured request logger is configured.
- Controllers expose some raw error messages and otherwise return inconsistent response formats/status handling. There is no shared async/error wrapper.
- JWT access tokens expire after one hour, are stored in `localStorage`, and there is no refresh-token/revocation flow. The frontend redirects 401s to `/login`, which is not a registered route.
- The Python source includes a credential-bearing Mongo URI fallback. `ai_services/.env` is also currently staged in Git (see Working tree note); its contents were not included in this audit. Treat both as secrets/configuration that must be removed from commits and rotate any exposed credentials.
- FastAPI allows all CORS origins and exposes user-scoped AI endpoints without its own authentication; currently they are not mounted through Express, but direct network exposure would make user IDs guessable/access control inadequate.
- Upload middleware uses disk storage, original filenames, MIME-type-only filtering, and a relative path; its route is commented out. Profile image API paths exist on the frontend, but backend profile update/upload endpoints are absent.
- Income export writes a fixed filename to the process working directory and downloads it, allowing collisions under concurrent requests and leaving generated files behind. Static uploads are mounted from `backend/uploads`, while the listed upload middleware targets a relative `uploads/` path.
- Mongo connection startup logs success without awaiting `mongoose.connect`; no pool/timeouts/retry/shutdown/health-ping handling is configured.
- No automated tests are defined for backend (`npm test` is a placeholder). No MongoDB replica-set development setup is present.

## Frontend/backend mismatches and dead or unreachable behavior

- `frontend/src/App.jsx` registers `/auth`, `/dashboard`, `/income`, `/expense`, and `/profile`, but the root sends unauthenticated users to `/login`; that route is commented out. `useUserAuth` and the Axios 401 handler also navigate to `/login`.
- The dashboard has a link to `/ai-insights`, the sidebar includes AI Insights and Settings, and standalone AI page components exist, but `/ai-insights` and `/settings` are not registered in `App.jsx`. `/login` and `/signup` standalone screens are likewise imported but not routed; the `/auth` screen handles auth instead.
- `frontend/src/utils/apiPath.js` requests `/api/income/download-excel` and `/api/expense/download-excel`; backend route files register `/downloadexcel`. Both income and expense UI download actions therefore target unregistered endpoints.
- The dashboard requests AI prediction, and `AIInsights.jsx` requests all three AI endpoints, but `backend/index.js` comments out the `/api/ai` mount.
- Frontend profile code requests `PUT /api/auth/update-profile` and posts images to `/api/auth/upload-image`; neither route is implemented. Upload middleware and the route handler are effectively unused.
- Auth API responses have a `{ id, user, token }` shape; most successful transaction/dashboard responses return raw documents/data, while errors use varying `{ message }`, `{ success, message }`, and other structures.
- Frontend `CurrencyContext` pulls exchange rates directly from a third-party API and caches them in localStorage with hard-coded fallback rates. Transaction storage does not preserve a currency, so display conversion assumes a base currency rather than the transaction's recorded currency.
- The repo includes components, pages, and helpers that are not reachable from registered routes or are superseded by `/auth`; these should be confirmed before removal rather than deleted automatically.

## Sensible MongoDB design choices to evaluate

The requested concepts should be tied to actual application needs. A unified discriminator-based transaction collection, per-user categories, owner/date/type/category indexes, aggregation-backed reports, Decimal128, and keyset pagination fit the existing finance data. TTL indexes fit expiring refresh/reset tokens. Goals with embedded contributions and budget thresholds are reasonable if those features are in scope. GridFS is justified for receipts/images only if file storage is implemented; otherwise external object storage may be simpler. Change streams require a replica set and a persistent event delivery design. A wildcard index, capped log collection, and CSFLE should remain optional unless a concrete query, retention, or threat model justifies their operational cost. Geo search needs stored location data and a user-facing nearby-spending feature.

## Working tree and commit constraint

The Git index was already heavily populated before this audit, including `backend/node_modules`, `ai_services/.env`, app source/configuration, and README changes. This audit did not stage, unstage, commit, or modify those entries. Do not create the requested phase commits until the pre-existing staged changes are reviewed and separated; otherwise unrelated files and possible credentials could enter a commit. The specific contents of `.env` were not read or reproduced.

## Proposed phased plan

1. **Phase 1 — Stabilize and secure current APIs:** fix owner-scoped deletes and export URLs, route redirects, opt-in AI mounting, profile endpoint decision, validation, CORS/security middleware, error handling/logging, environment configuration, and token lifecycle. Keep the current client features working while changing auth contracts.
2. **Phase 2 — Schema and migration design:** define the target schemas and compatibility strategy; add discriminated transactions, categories, preferences, and only feature-backed models. Add schema validation/transforms/hooks and database validators. Build an idempotent dry-run migration before any production data change; destructive migration requires explicit approval.
3. **Phase 3 — Indexes and evidence:** add index sync/inspection scripts, query-specific indexes and explain checks, and document results. Apply only after considering existing data and uniqueness conflicts.
4. **Phase 4 — Database reporting:** move dashboard and reporting calculations into testable aggregation builders; add only reports the UI will use, with explain evidence and tests.
5. **Phase 5 — Advanced Mongo features:** implement replica-set transactions, recurring entries, budget/goal notifications, change-stream delivery, file storage, import/bulk writes, and pagination where their features are accepted. Provide local replica-set setup. Defer optional CSFLE/geo/wildcard/capped features unless justified.
6. **Phase 6 — Operations and quality:** connection lifecycle/health, seeded performance data, migration tooling, MongoDB setup/backup docs, replica-set test suite, and Python service alignment.
7. **Phase 7 — Frontend and documentation:** add React Query/form validation and user-facing feature screens incrementally, guard routes, improve accessibility/loading/error states, then update README and Mongo concepts/index documentation to match implemented behavior.

At the end of each approved phase, run its lint/tests/build checks, report the results, and commit only that phase's reviewed files. First resolve the pre-existing index contents so phase commits cannot include unrelated staged files or credentials.
