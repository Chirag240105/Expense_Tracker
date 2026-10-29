# Deployment guide

## 1. Prepare MongoDB Atlas

1. Create an Atlas project and an M10+ cluster if you need change streams and multi-document transactions. Atlas clusters use replica sets.
2. Create a database user with a strong generated password. Grant only the database read/write role on the application database.
3. Add the backend host's outbound IP addresses to the Atlas network access list. Avoid `0.0.0.0/0` for production.
4. Copy the application connection string and replace the username, password, and database name. URL-encode special characters in credentials:

   ```text
   mongodb+srv://<user>:<password>@<cluster-host>/expense_tracker?retryWrites=true&w=majority
   ```

5. Keep `MONGO_URI` private. The optional AI service uses the same URI and `DB_NAME=expense_tracker`.

## 2. Deploy the API to Render or Railway

1. Create a Web Service from the repository and select the Docker runtime.
2. Use the repository root as the build context and `backend/Dockerfile` as the Dockerfile path. The root context is needed for the shared seed script and root lockfile.
3. Configure the environment variables below in the platform's secret/environment settings.
4. Expose port `9000`, configure the platform's health check as `/api/health`, and enable the platform's trusted proxy setting by setting `TRUST_PROXY=1`.
5. Use the platform's stable public HTTPS URL for the frontend's `VITE_API_URL`. Do not include `/api`; the frontend adds that prefix.
6. Deploy with `SEED_ON_START=false`. To create the demo account in an empty database, set it to `true` for the first boot, then turn it off. For controlled resets, run `npm run seed:reset` from a trusted environment.

| Variable | Required | Notes |
|---|---:|---|
| `NODE_ENV` | Yes | Set to `production`. |
| `PORT` | Yes | Set to `9000` or the port required by the host. |
| `MONGO_URI` | Yes | Atlas replica-set connection string. |
| `JWT_SECRET` | Yes | Generate a unique random value of at least 32 characters. |
| `CLIENT_URL` | Yes | Exact public frontend origin, including `https://`, no trailing slash. |
| `COOKIE_SAME_SITE` | Yes for split domains | Use `none` when frontend and API are on different domains; HTTPS is required. |
| `TRUST_PROXY` | Yes behind proxy | Usually `1` for one managed reverse proxy. |
| `SEED_ON_START` | No | Default `false`; seeds only if the users collection is empty. |
| `AI_SERVICE_URL` | No | Private URL of the optional FastAPI service. |

The API enables Helmet headers, gzip compression, credentialed CORS, and request throttling. Login, registration, and refresh routes have an additional rate limit.

## 3. Deploy the frontend to Vercel or Netlify

### Vercel

1. Import the repository and set the project root to `frontend`.
2. Use `npm run build` as the build command and `dist` as the output directory.
3. Set `VITE_API_URL` to the public API origin, for example `https://api.example.com`.
4. The checked-in `frontend/vercel.json` rewrites client-side routes to `index.html`.

### Netlify

1. Import the repository and set the base directory to `frontend`.
2. Use `npm run build` and `dist` as the publish directory.
3. Set `VITE_API_URL` to the public API origin.
4. The checked-in `frontend/public/_redirects` provides the SPA fallback.

For either host, set the API's `CLIENT_URL` to the exact deployed frontend origin. Rebuild the frontend after changing `VITE_API_URL`; it is compiled into the static bundle.

## 4. Optional AI service

Build `ai_services/Dockerfile` or run the FastAPI application on a private host. Set:

| Variable | Required | Notes |
|---|---:|---|
| `MONGO_URI` | Yes | Same Atlas database used by the API. |
| `DB_NAME` | Yes | Usually `expense_tracker`. |
| `GEMINI_API_KEY` | No | Optional provider key. |
| `OPENAI_API_KEY` | No | Optional fallback provider key. |

Set `AI_SERVICE_URL` on the API to the private service URL. The AI service queries the unified `transactions` collection and converts Decimal128 amounts through MongoDB aggregation. If the service is not configured, the API returns `503` for AI routes and the frontend displays an unavailable state.

## 5. Production Compose

For a self-hosted deployment with a managed external MongoDB, copy `.env.example` to `.env`, replace every placeholder, and set the public origins:

```text
MONGO_URI=mongodb+srv://...
JWT_SECRET=<unique-random-secret>
CLIENT_URL=https://app.example.com
VITE_API_URL=https://api.example.com
```

Then build and start the services:

```powershell
docker compose --env-file .env -f docker-compose.prod.yml up --build -d
```

The optional AI container can be built and started with the `ai` profile and `AI_SERVICE_URL=http://ai:8000`. Configure provider keys through the same private environment file or the deployment platform's secret manager.

## 6. Post-deploy checklist

- `GET https://<api-host>/api/health` returns `200`, `database.status` is `connected`, and `database.replicaSet` is `true`.
- Sign in with a non-demo account or the seeded demo account and verify refresh survives a reload.
- Confirm CORS permits only the deployed frontend origin and browser cookies are `Secure`, `HttpOnly`, and `SameSite=None` for split domains.
- Verify dashboard, transaction creation, budget progress, profile update, CSV import/export, and notifications.
- Check API logs for database connectivity, rate-limit responses, and change-stream initialization.
- Keep secrets in the host's secret manager; never commit `.env` files.
