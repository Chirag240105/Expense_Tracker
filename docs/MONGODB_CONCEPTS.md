# MongoDB Concepts — Expense Tracker

This document maps every MongoDB concept used in this project to the exact file that uses it, the reason it was chosen, and how to verify it is working.

## Legend

| Column | Meaning |
|--------|---------|
| Concept | MongoDB feature name |
| Where | Relative file path(s) |
| Why | Business justification for using it here |
| Verify | Command or API call to confirm it works |

---

## Core Schema Design

| Concept | Where | Why | Verify |
|---------|-------|-----|--------|
| **Mongoose Discriminators** — one `transactions` collection stores both income and expense records using a `type` field as the discriminator key. | `backend/src/models/Transaction.models.js` | Eliminates duplicate queries (e.g. "balance = income − expense" needs one `aggregate`, not two `find` calls). A single collection is also cheaper to index. | `db.transactions.find().limit(3)` — notice the `type` field takes the value `"income"` or `"expense"`. |
| **Decimal128** — money amounts are stored as `Decimal128` (128-bit decimal), not JavaScript `Number`. | `Transaction.models.js`, `Budget.models.js`, `Goal.models.js`, `RecurringRule.models.js` | JavaScript `Number` introduces binary floating-point rounding errors (e.g. `0.1 + 0.2 !== 0.3`). Financial totals must be exact. | `db.transactions.findOne()` — the `amount` field shows `Decimal128("6250.00")` in the shell. |
| **Embedded documents** — user `preferences` (currency, theme, notifications) are embedded in the `User` document; goal `contributions` array is embedded in `Goal`. | `User.models.js`, `Goal.models.js` | These fields are always read with their parent. Embedding avoids extra round-trips and keeps the data together. | `db.users.findOne({}, { preferences: 1 })` |
| **Referencing** — `Transaction.categoryId` is a reference (ObjectId) to the `Category` collection. | `Transaction.models.js`, `dashboardAggregations.js` | Categories are shared across many transactions. Embedding would duplicate the name/color on every transaction. | `db.transactions.find({ categoryId: { $exists: true } }).limit(1)` |
| **Soft delete** — `isDeleted: Boolean` + `deletedAt: Date` on transactions and categories, `isDeleted` on User. | `Transaction.models.js`, `Category.models.js`, `User.models.js` | Hard-deleting a transaction would corrupt running totals or audit history. Soft delete lets us restore data and supports the TTL purge policy. | `db.transactions.find({ isDeleted: true }).count()` |
| **Optimistic concurrency (`__v`)** | Mongoose default on all models | Prevents two concurrent edits from silently overwriting each other. | Save a document in two concurrent requests without incrementing `__v` — second save will fail with `VersionError`. |
| **toJSON transform** | `Transaction.models.js` (transactionOptions) | Converts `Decimal128` to plain number and strips `__v` before the object is serialised to JSON, so the frontend never sees `{ $numberDecimal: "6250.00" }`. | `GET /api/dashboard` — `amount` in the response is a plain number. |

---

## Indexes

| Concept | Where | Why | Verify |
|---------|-------|-----|--------|
| **Compound index — ESR rule** `{ userId: 1, date: -1 }` | `Transaction.models.js`, `backend/src/Database/syncIndexes.js` | All transaction list queries filter by `userId` first, then sort by `date`. The ESR rule (Equality → Sort → Range) makes this compound index optimal. | `db.transactions.explain("executionStats").find({ userId: ... }).sort({ date: -1 })` — shows `IXSCAN` on this index. |
| **Compound index** `{ userId: 1, type: 1, date: -1 }` | `Transaction.models.js` | Dashboard's income vs expense breakdown filters by `userId` and `type`, then sorts by date. | `db.transactions.explain().find({ userId: ..., type: "expense" }).sort({ date: -1 })` |
| **Unique email index with case-insensitive collation** | `User.models.js` | Prevents duplicate registrations regardless of capitalisation (e.g. `DEMO@example.com` and `demo@example.com` are the same user). | Try registering twice with different email casing — second attempt returns 400. |
| **Partial index** `{ isDeleted: 1 }` where `isDeleted: false` | `Transaction.models.js` | Keeps the index small — deleted records (a minority) are never queried in normal operation. | `db.transactions.getIndexes()` — look for `partialFilterExpression`. |
| **Sparse index** on `recurringRuleId` | `Transaction.models.js` | Only transactions linked to a recurring rule have this field. A sparse index skips `null` entries, saving space. | `db.transactions.getIndexes()` — note the `sparse: true` flag. |
| **Multikey index** on `tags` | `Transaction.models.js` | MongoDB automatically creates a multikey index on array fields. This lets us efficiently query `{ tags: "groceries" }`. | `db.transactions.find({ tags: "groceries" }).explain()` — shows `IXSCAN`. |
| **Text index** on `source, description, notes, tags` | `Transaction.models.js` | Powers the full-text search bar in the Transactions page (`GET /api/transactions?search=coffee`). | `db.transactions.find({ $text: { $search: "coffee" } })` |
| **2dsphere index** on `location` | `Transaction.models.js` | Required for `$geoNear` — finds transactions that happened near a given GPS coordinate (spending map feature). | `GET /api/transactions/nearby?lat=40.75&lng=-73.98` |
| **TTL index** on `RefreshToken.expiresAt` | `RefreshToken.models.js` | MongoDB automatically deletes expired refresh tokens, keeping the collection lean without a cron job. | `db.refreshtokens.getIndexes()` — look for `expireAfterSeconds: 0`. |
| **TTL index** on `Notification.createdAt` (30 days) | `Notification.models.js` | Old notifications auto-purge; no cleanup job needed. | `db.notifications.getIndexes()` — look for `expireAfterSeconds: 2592000`. |
| **Partial index on RecurringRule.nextRunAt** (active only) | `RecurringRule.models.js` | The scheduler only queries `isActive: true` rules. Indexing inactive rules wastes space. | `db.recurringrules.getIndexes()` — note `partialFilterExpression: { isActive: true }`. |

---

## Aggregation Pipelines

| Concept | Where | Why | Verify |
|---------|-------|-----|--------|
| **`$facet`** — single round-trip dashboard | `backend/src/aggregations/dashboardAggregations.js` | Returns lifetime totals, period totals, category breakdown, daily trends, and recent transactions **in one query** instead of 6 separate calls. | `GET /api/dashboard` → response time should be < 50 ms with indexes. |
| **`$lookup`** — join Category into Transaction | `dashboardAggregations.js`, `budgetAggregations.js`, `transactionController.js` | Categories are in a separate collection. `$lookup` resolves the reference server-side, returning enriched documents. | `GET /api/budgets` — each budget item includes `categoryName`, `categoryColor`, `categoryIcon`. |
| **`$setWindowFields`** — rolling averages and running sums | `backend/src/aggregations/analyticsAggregations.js` | Computes the 3-month moving average of expenses and cumulative savings without loading data into Node.js. This is a MongoDB 5.0+ window function equivalent to SQL `OVER (...)`. | `GET /api/analytics/trends` — each month has `movingAvgExpense` and `cumulativeSavings` fields. |
| **`$geoNear`** — nearest transactions | `backend/src/Controller/transactionController.js` | Returns transactions sorted by distance from a given coordinate. Only works with a `2dsphere` index on `location`. | `GET /api/transactions/nearby?lat=40.75&lng=-73.98&maxDistance=5000` |
| **`$merge`** — materialise monthly summaries | `backend/src/aggregations/summaryAggregations.js` | Pre-aggregates expensive totals into a `monthly_summaries` collection so reports are instant even with 50k transactions. | `POST /api/analytics/materialize` → then `db.monthly_summaries.find()` |
| **`$bucket` / `$bucketAuto`** | `analyticsAggregations.js` (available for extension) | Groups transaction amounts into ranges (e.g. 0-50, 50-100 …) without knowing the distribution in advance. | Add `?buckets=true` to the breakdown endpoint. |
| **`$expr`** inside `$lookup` pipeline | `budgetAggregations.js` | Matches transactions to budgets by comparing the budget's `startDate/endDate` against the transaction's `date` — a range condition that can only be expressed with `$expr`. | `GET /api/budgets` — `spent` reflects only the current month's transactions. |
| **`$cond` / `$switch`** | `dashboardAggregations.js`, `budgetAggregations.js` | Computes `alertStatus` (exceeded/warning/normal) and percentage-used entirely in the database. | `GET /api/budgets` — each item has `alertStatus: "exceeded"`, `"warning"`, or `"normal"`. |

---

## Advanced Features

| Concept | Where | Why | Verify |
|---------|-------|-----|--------|
| **Multi-document ACID transactions** (`session.withTransaction`) | `backend/src/Database/transactionHelper.js`, `transactionController.js` | Creating a transaction and updating a savings goal's `currentAmount` must be atomic — either both succeed or both roll back. Requires a replica set. | Simulate a failure mid-transaction; verify neither document changed. |
| **Change Streams** with resume tokens | `backend/src/services/changeStreamService.js` | Watches the `transactions` collection. When a new transaction is inserted, it pushes a real-time SSE event to the user's browser. Resume tokens mean the stream survives a server restart. | Add a transaction → the dashboard receives a `transaction_created` SSE without refreshing. |
| **Server-Sent Events (SSE)** | `backend/src/Routes/eventRoutes.js` | One-way real-time push from server to browser. Simpler and lighter than WebSockets for this use case (we only push, never receive). | Open DevTools → Network → filter by `EventSource`. Connect to `GET /api/events/stream`. |
| **GridFS** — file storage | `backend/src/services/gridfsService.js`, `backend/src/Routes/fileRoutes.js` | Profile images and receipt attachments can be larger than MongoDB's 16 MB document limit. GridFS chunks files into 255 KB pieces stored as regular documents. | `POST /api/files/upload` with a file → `db.fs.files.find()` + `db.fs.chunks.find()`. |
| **`bulkWrite`** — CSV import | `backend/src/Controller/transactionController.js` (`bulkImportTransactions`) | Inserting 50k demo transactions one-by-one would take minutes. `bulkWrite` with `ordered: false` batches them in one call. | `POST /api/transactions/bulk` with an array of 100 transactions — observe single round-trip in MongoDB profiler. |
| **Keyset / cursor pagination** | `transactionController.js` (`getTransactionsWithPagination`) | `skip(n)` performs a full collection scan for large offsets. Keyset pagination (cursor = last `{date, _id}`) is O(log n) with the compound index, regardless of how deep the page is. | `GET /api/transactions?limit=25` — response includes `pagination.nextCursor`. Pass it as `?cursor=<value>` for page 2. |

---

## Considered but NOT Implemented

| Concept | Reason |
|---------|--------|
| **Client-Side Field Level Encryption (CSFLE)** | Requires MongoDB Enterprise / Atlas, a KMS (AWS KMS, Azure, GCP), and the MongoDB CSFLE library. The operational overhead (key management, driver config) is disproportionate for a demo app. Document `notes` are not sensitive enough to justify it. |
| **Time-series collection** | Transaction data is mutable (soft-delete, edit). Time-series collections are append-only and cannot be updated, making them unsuitable here. A capped collection was also skipped because the event log volume is not predictable. |
| **Wildcard index** | No flexible or unknown-shape `metadata` field exists in the schema. Adding one just to demonstrate the concept would be artificial. |
| **Atlas Search / Lucene fuzzy search** | Requires a MongoDB Atlas cluster (not available in local Docker). The text index provides sufficient search for this demo. The Atlas Search index definition JSON is documented in `docs/INDEXES.md` for reference. |
