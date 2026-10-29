# ExpenseVerse

ExpenseVerse is a full-stack personal finance tracker built with React, Express, and MongoDB. It supports unified income and expense transactions, budgets, savings goals, recurring rules, analytics, notifications, receipt uploads, and optional AI insights.

## Demo account

| Email | Password |
|---|---|
| `demo@expensetracker.dev` | `Demo@12345` |

The seed creates 12 categories, 658 transactions across about 12 months, budgets, goals, recurring rules, notifications, audit logs, and monthly summaries.

## Architecture

- **Frontend:** React 19, Vite, Tailwind CSS, Recharts, and Framer Motion.
- **API:** Express 5 with JWT authentication, rotating HttpOnly refresh cookies, and MongoDB/Mongoose.
- **Database:** MongoDB replica set for transactions and change streams. Transaction amounts use Decimal128 and are serialized as JSON numbers for the frontend.
- **Optional AI service:** FastAPI and PyMongo read the same `transactions` collection and convert Decimal128 amounts in MongoDB aggregation pipelines.

## Local development

Requirements: Node.js 20+, Python 3.10+ for the optional AI service, and a MongoDB replica set. The included Compose setup initializes a local replica set.

1. Copy `backend/.env.example` to `backend/.env`. Set a private `JWT_SECRET` and a `MONGO_URI` pointing to your MongoDB replica set.
2. Install dependencies:

   ```powershell
   npm install
   npm --prefix backend install
   npm --prefix frontend install
   ```

3. Start MongoDB, the API, and the frontend in separate terminals:

   ```powershell
   docker compose up -d mongodb
   npm --prefix backend run dev
   npm --prefix frontend run dev
   ```

4. Seed or reset the demo database:

   ```powershell
   npm run seed:reset
   ```

   Open `http://localhost:5173`. Set `SEED_ON_START=true` in the backend environment to seed only when the users collection is empty.

The frontend API origin is configured with `VITE_API_URL` (defaults to `http://localhost:9000`). The backend CORS origin is configured with `CLIENT_URL`.

### Optional AI service

Copy `ai_services/.env.example` to `ai_services/.env`, set `MONGO_URI` and `DB_NAME` to the same database used by the API, and optionally configure a provider key. Then install and run:

```powershell
python -m pip install -r ai_services/requirement.txt
python -m uvicorn ai_services.main:app --reload --port 8000
```

Set `AI_SERVICE_URL=http://localhost:8000` in the backend environment to enable the API proxy. Without the AI service, AI routes return a clear `503` response and the frontend shows an unavailable state.

## API routes

All routes are prefixed with `/api`. Routes marked **auth** require a bearer access token.

| Area | Routes |
|---|---|
| Health | `GET /health` |
| Authentication | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`; `GET /auth/getInfo`; `PUT /auth/update-profile` |
| Dashboard | `GET /dashboard` |
| Transactions | `GET, POST /transactions`; `POST /transactions/bulk`; `GET /transactions/nearby`; `DELETE /transactions/:id` |
| Income | `GET /income/get`, `POST /income/add`, `DELETE /income/:id`, `GET /income/download-excel` |
| Expenses | `GET /expense/get`, `POST /expense/add`, `DELETE /expense/:id`, `GET /expense/download-excel` |
| Categories | `GET, POST /categories`; `DELETE /categories/:id` |
| Budgets | `GET, POST /budgets`; `DELETE /budgets/:id` |
| Goals | `GET, POST /goals`; `POST /goals/:id/contributions`; `DELETE /goals/:id` |
| Analytics | `GET /analytics/trends`, `/analytics/breakdown`; `POST /analytics/materialize` |
| Notifications | `GET /notifications`; `PUT /notifications/read-all`, `/notifications/:id/read`; `DELETE /notifications/:id` |
| Recurring rules | `GET, POST /recurring-rules`; `PATCH, DELETE /recurring-rules/:id` |
| Files | `POST /files/upload` (multipart field `file`); `GET /files/:id` |
| Events | `GET /events/stream` (server-sent events) |
| Optional AI | `GET /ai/predict-expense`, `/ai/analyze-spending`, `/ai/recommendations`; `POST /ai/chat` |

The interactive API contract is also visible in the route files under `backend/src/Routes/`.

## Data and scripts

`npm run seed:reset` creates required collections and validators, synchronizes indexes, inserts demo data, materializes monthly summaries, and prints collection counts. `npm run seed` seeds only when appropriate; `SEED_ON_START=true` enables the same empty-database behavior during API startup.

| Command | Purpose |
|---|---|
| `npm run smoke` | Log into the demo account, check major API routes and mutation flows, clean up its test transaction, and print collection counts |
| `npm run test:e2e` | Run the Playwright login → dashboard → expense → budget → logout flow |
| `npm test` | Run backend unit tests |
| `npm run lint` | Run frontend ESLint |
| `npm run build` | Create the frontend production build |
| `npm run screenshots` | Capture the configured landing and dashboard pages |

## Deployment and configuration

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for MongoDB Atlas, API hosting, frontend hosting, optional AI deployment, environment variables, and post-deploy verification.

Never commit `.env` files or real API credentials. Use the checked-in `.env.example` files as templates.
