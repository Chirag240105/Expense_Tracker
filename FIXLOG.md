# Runtime and integration findings

## Step 1 — Auth and dashboard loading

| Symptom | Evidence / root cause | Fix |
|---|---|---|
| Login redirected to the dashboard, but protected dashboard and page requests returned repeated `401 Unauthorized` responses. | Browser console showed repeated `401` responses immediately after successful sign-in. `AuthController.js` captured `JWT_SECRET` at module evaluation time, while `index.js` called `dotenv.config()` only after its static imports had already loaded the controller. Tokens were signed with the fallback secret and verified with the configured secret. | Load dotenv as the first module dependency, remove the fallback signing secret, and fail startup if `JWT_SECRET` is absent. |
| A failed refresh could leave the browser on a protected route instead of returning to sign-in. | The interceptor tested `!window.location.pathname === "/"`; operator precedence makes this comparison false for every pathname. | Compare `window.location.pathname !== "/"` directly. |
| A standalone MongoDB deployment could make stream setup fail without a clear fallback. | `initChangeStreams` issued an unused, un-awaited topology command and attempted to open streams unconditionally. | Check `hello` before opening streams, log a clear replica-set instruction, and continue without real-time updates if streams are unavailable. |
| Dashboard load failures were only logged and left no actionable recovery state. | `Home.jsx` caught request failures but rendered the dashboard with default zero values; no route-level error boundary existed. | Add a route error boundary and loading, retry, and empty states on the dashboard. |
| Docker-based replica-set startup could not be reproduced in this environment. | `docker compose ps` reported that the Docker Desktop Linux engine pipe was unavailable. The installed MongoDB service was reachable, and the backend connected to the configured MongoDB deployment; `/api/health` returned `200` with `ping: pong` and `replicaSet: true`. | Keep Docker diagnostics recorded as an environment limitation; verify against the configured replica-set MongoDB and retain the Compose setup for local Docker users. |

### Captured status summary

- `GET /api/health`: `200` (database connected; replica set reported).
- `POST /api/auth/login`: successful login (redirected to `/dashboard`).
- Protected page API calls before the fix: repeated `401 Unauthorized` responses; dashboard, budget, and goal data did not load.
- After the fix, the dashboard rendered seeded totals and charts in the browser with no new console errors. `npm run smoke` returned `200` for all 14 checks and printed the seeded collection counts.
- Initial browser-console resource `404` was caused by the first Vite test invocation receiving an invalid positional argument. Starting Vite from `frontend/` without extra arguments returned `200`; this was a diagnostic-command error, not an application route defect.

The repeatable HTTP smoke script is `scripts/smoke.js`; run it after seeding to check health, auth, dashboard, transaction, category, budget, goal, analytics, notification, and recurring-rule endpoints.
