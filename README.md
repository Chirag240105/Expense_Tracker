<div align="center">

# 💸 ExpenseVerse

**A full-stack personal finance tracker built on React, Express, and MongoDB.**

Unified income & expense tracking · Budgets · Savings goals · Recurring rules · Analytics · Real-time updates · Optional AI insights

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Replica_Set-47A248?logo=mongodb&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-AI_Service-009688?logo=fastapi&logoColor=white)

</div>

---

## 📑 Table of Contents

1. [Overview](#-overview)
2. [Screenshots](#-screenshots)
3. [Features](#-features)
4. [Tech Stack & Architecture](#-tech-stack--architecture)
5. [Project Structure](#-project-structure)
6. [Getting Started](#-getting-started)
7. [Optional AI Service](#-optional-ai-service)
8. [Demo Account](#-demo-account)
9. [API Reference](#-api-reference)
10. [Database Design](#-database-design)
11. [Scripts & Testing](#-scripts--testing)
12. [Deployment](#-deployment)
13. [Documentation](#-documentation)
14. [Security Notes](#-security-notes)

---

## 🔎 Overview

ExpenseVerse helps you understand where your money goes. Income and expenses live in a single unified `transactions` collection, and everything else (budgets, goals, analytics, notifications) is built around it.

The project also doubles as a showcase of **practical MongoDB usage**: discriminators, Decimal128 money handling, compound/partial/TTL/geo indexes, `$facet` and `$setWindowFields` aggregations, ACID transactions, change streams, and GridFS.

---

## 📸 Screenshots

> Screenshots live in [`docs/screenshots`](./docs/screenshots). Update the file names below to match yours.

| Landing | Dashboard |
|---|---|
| ![Landing](./docs/screenshots/landing.png) | ![Dashboard](./docs/screenshots/dashboard.png) |

| Transactions | Budgets & Goals |
|---|---|
| ![Transactions](./docs/screenshots/transactions.png) | ![Budgets](./docs/screenshots/budgets.png) |

You can regenerate screenshots of the configured pages with `npm run screenshots`.

---

## ✨ Features

| Area | What you get |
|---|---|
| **Transactions** | Unified income/expense records, tags, notes, bulk CSV import, full-text search, keyset pagination |
| **Budgets** | Per-category budgets with live `spent` tracking and alert status (`normal` / `warning` / `exceeded`) |
| **Savings Goals** | Goals with contributions, updated atomically via ACID transactions |
| **Recurring Rules** | Scheduled income/expense generation |
| **Analytics** | Monthly trends, 3-month moving average, cumulative savings, category breakdown, materialized monthly summaries |
| **Real-time** | Server-Sent Events fed by MongoDB change streams (with resume tokens) |
| **Receipts** | File uploads stored in GridFS |
| **Geo** | "Nearby" transactions via a 2dsphere index |
| **Exports** | Excel downloads for income and expenses |
| **Notifications** | In-app alerts that auto-expire after 30 days |
| **Auth** | JWT access tokens + rotating HttpOnly refresh cookies |
| **AI (optional)** | Expense prediction, spending analysis, recommendations, and chat |

---

## 🏗 Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Recharts, Framer Motion |
| **API** | Express 5, JWT auth, rotating HttpOnly refresh cookies, Mongoose |
| **Database** | MongoDB replica set (transactions + change streams), Decimal128 for money |
| **AI service** *(optional)* | FastAPI + PyMongo, reads the same `transactions` collection |

```text
┌──────────────┐   HTTPS / SSE   ┌──────────────────┐        ┌─────────────────────┐
│  React (Vite)│ ──────────────► │  Express 5 API   │ ─────► │ MongoDB replica set │
│  Tailwind    │ ◄────────────── │  JWT · Mongoose  │ ◄───── │ (change streams)    │
└──────────────┘                 └────────┬─────────┘        └──────────▲──────────┘
                                          │ AI_SERVICE_URL              │
                                          ▼                             │
                                 ┌──────────────────┐                   │
                                 │ FastAPI AI svc   │ ──────────────────┘
                                 │ (optional)       │
                                 └──────────────────┘
```

> Transaction amounts are stored as `Decimal128` for exact arithmetic and serialized as plain JSON numbers for the frontend.

---

## 📁 Project Structure

```text
Expense_Tracker/
├── backend/            # Express API (routes, controllers, models, aggregations, services)
│   └── src/Routes/     # Route files = the API contract
├── frontend/           # React + Vite app
├── ai_services/        # Optional FastAPI AI service
├── docs/               # Deployment, indexes, Atlas guides, screenshots
├── docker-compose.yml      # Local MongoDB replica set
└── docker-compose.prod.yml # Production compose
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **MongoDB replica set** (the included Docker Compose sets one up locally)
- **Docker** (recommended, for MongoDB)
- **Python** 3.10+ *(only for the optional AI service)*

### 1. Clone the repository

```bash
git clone https://github.com/Chirag240105/Expense_Tracker.git
cd Expense_Tracker
git checkout developing
```

### 2. Configure environment

Copy `backend/.env.example` to `backend/.env` and set:

| Variable | Description |
|---|---|
| `JWT_SECRET` | A private random secret |
| `MONGO_URI` | Connection string for your MongoDB **replica set** |
| `CLIENT_URL` | Frontend origin for CORS (e.g. `http://localhost:5173`) |
| `SEED_ON_START` | `true` seeds demo data only if the users collection is empty |

The frontend reads `VITE_API_URL` (defaults to `http://localhost:9000`).

### 3. Install dependencies

```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 4. Start the services

Run each in its own terminal:

```bash
docker compose up -d mongodb      # MongoDB replica set
npm --prefix backend run dev      # API on :9000
npm --prefix frontend run dev     # Frontend on :5173
```

### 5. Seed demo data

```bash
npm run seed:reset
```

Then open **http://localhost:5173** and sign in with the [demo account](#-demo-account).

---

## 🤖 Optional AI Service

Without it, AI routes return a clear `503` and the UI shows an "unavailable" state, so the rest of the app works fine.

1. Copy `ai_services/.env.example` to `ai_services/.env`.
2. Set `MONGO_URI` and `DB_NAME` to the **same database** the API uses. Optionally add a provider key (`GEMINI_API_KEY` / `OPENAI_API_KEY`).
3. Install and run:

   ```bash
   python -m pip install -r ai_services/requirement.txt
   python -m uvicorn ai_services.main:app --reload --port 8000
   ```

4. In the backend environment, set:

   ```env
   AI_SERVICE_URL=http://localhost:8000
   ```

---

## 🔑 Demo Account

| Email | Password |
|---|---|
| `demo@expensetracker.dev` | `Demo@12345` |

The seed creates **12 categories**, **658 transactions** across ~12 months, plus budgets, goals, recurring rules, notifications, audit logs, and monthly summaries.

> ⚠️ For local/demo use only. Do not leave the demo account enabled on a public production deployment.

---

## 🌐 API Reference

All routes are prefixed with `/api`. Protected routes require a bearer access token. Full details are in `backend/src/Routes/`.

| Area | Routes |
|---|---|
| **Health** | `GET /health` |
| **Auth** | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` · `GET /auth/getInfo` · `PUT /auth/update-profile` |
| **Dashboard** | `GET /dashboard` |
| **Transactions** | `GET, POST /transactions` · `POST /transactions/bulk` · `GET /transactions/nearby` · `DELETE /transactions/:id` |
| **Income** | `GET /income/get` · `POST /income/add` · `DELETE /income/:id` · `GET /income/download-excel` |
| **Expenses** | `GET /expense/get` · `POST /expense/add` · `DELETE /expense/:id` · `GET /expense/download-excel` |
| **Categories** | `GET, POST /categories` · `DELETE /categories/:id` |
| **Budgets** | `GET, POST /budgets` · `DELETE /budgets/:id` |
| **Goals** | `GET, POST /goals` · `POST /goals/:id/contributions` · `DELETE /goals/:id` |
| **Analytics** | `GET /analytics/trends`, `/analytics/breakdown` · `POST /analytics/materialize` |
| **Notifications** | `GET /notifications` · `PUT /notifications/read-all`, `/notifications/:id/read` · `DELETE /notifications/:id` |
| **Recurring rules** | `GET, POST /recurring-rules` · `PATCH, DELETE /recurring-rules/:id` |
| **Files** | `POST /files/upload` (multipart field `file`) · `GET /files/:id` |
| **Events** | `GET /events/stream` (Server-Sent Events) |
| **AI** *(optional)* | `GET /ai/predict-expense`, `/ai/analyze-spending`, `/ai/recommendations` · `POST /ai/chat` |

---

## 🗄 Database Design

Highlights of the MongoDB concepts used (see the linked docs for file-level mapping and verification steps):

- **Schema design:** Mongoose discriminators (income/expense in one collection), Decimal128 money, embedded preferences & goal contributions, referenced categories, soft deletes
- **Indexes:** compound (ESR rule), partial, sparse, multikey, text, 2dsphere, TTL, case-insensitive unique email
- **Aggregations:** `$facet`, `$lookup`, `$setWindowFields`, `$geoNear`, `$merge`, `$bucket`, `$expr`, `$cond`
- **Advanced:** multi-document ACID transactions, change streams with resume tokens, SSE, GridFS, `bulkWrite`, keyset pagination

Explain-plan benchmarks (e.g. ~92% fewer documents examined with `userId_1_date_-1`) are documented in `docs/INDEXES.md`.

---

## 🧪 Scripts & Testing

| Command | Purpose |
|---|---|
| `npm run seed:reset` | Create collections/validators, sync indexes, insert demo data, materialize summaries |
| `npm run seed` | Seed only when appropriate (empty database) |
| `npm run smoke` | Log into the demo account, exercise major API routes, clean up, print collection counts |
| `npm run test:e2e` | Playwright flow: login → dashboard → expense → budget → logout |
| `npm test` | Backend unit tests |
| `npm run lint` | Frontend ESLint |
| `npm run build` | Frontend production build |
| `npm run screenshots` | Capture landing and dashboard screenshots |
| `npm run explain` | Run explain-plan benchmarks |
| `npm run inspect:indexes` | Inspect/sync database indexes |

---

## ☁️ Deployment

| Component | Recommended hosting |
|---|---|
| **Database** | MongoDB Atlas (M10+ for transactions and change streams) |
| **API** | Render or Railway (Docker runtime, port `9000`, health check `/api/health`) |
| **Frontend** | Vercel or Netlify (root `frontend`, build `npm run build`, output `dist`) |
| **AI service** | Private host / container using `ai_services/Dockerfile` |

**Key production variables:** `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET` (32+ chars), `CLIENT_URL`, `COOKIE_SAME_SITE=none` (split domains), `TRUST_PROXY=1`, `SEED_ON_START=false`.

Self-hosting with Docker:

```bash
docker compose --env-file .env -f docker-compose.prod.yml up --build -d
```

> `VITE_API_URL` is compiled into the static bundle, so rebuild the frontend whenever it changes. Do **not** include `/api` in it.

**Post-deploy check:** `GET /api/health` should return `200` with `database.status: "connected"` and `database.replicaSet: true`.

See the full guide in [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

> ℹ️ Atlas **M0 (free tier)** does not support transactions or change streams. Use M10+ or the local Docker replica set for those features.

---

## 📚 Documentation

| Document | Description |
|---|---|
| [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Atlas, API, frontend, AI service, env vars, post-deploy checklist |
| [docs/INDEXES.md](./docs/INDEXES.md) | Index catalog and `explain("executionStats")` evidence |
| [docs/MONGODB_CONCEPTS.md](./docs/MONGODB_CONCEPTS.md) | Every MongoDB concept mapped to its file, rationale, and verification |
| [docs/ATLAS_SETUP.md](./docs/ATLAS_SETUP.md) | Atlas cluster, least-privilege user, backups, profiler, Atlas Search |

---

## 🔒 Security Notes

- Never commit `.env` files or real API credentials. Use the `.env.example` templates.
- Use a unique `JWT_SECRET` of at least 32 characters.
- Restrict Atlas network access to your server IPs. Avoid `0.0.0.0/0` in production.
- Give the database user only the privileges it needs.
- The API uses Helmet, gzip compression, credentialed CORS, request throttling, and extra rate limits on login, registration, and refresh.

---

<div align="center">

Made by [Chirag Pandey](https://github.com/Chirag240105) · [Repository](https://github.com/Chirag240105/Expense_Tracker/tree/developing)

</div>
