# Expense Tracker

A full-stack personal finance application for recording income and expenses, monitoring balances, and visualizing recent spending. It includes a React dashboard, a protected Express API backed by MongoDB, and an optional Python service for data-driven financial insights.

## Features

- Account registration and sign-in with JWT authentication
- Private income and expense records, each with a source, amount, date, and optional icon
- Dashboard totals for balance, total income, total expenses, recent transactions, and rolling summaries
- Charts, currency selection, transaction deletion, and Excel exports
- Optional AI analytics: expense estimates, category analysis, savings-rate recommendations, and a finance chatbot

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS, React Router, Axios, Recharts, Framer Motion |
| API | Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Multer, SheetJS (`xlsx`) |
| AI service | Python, FastAPI, Pandas, NumPy, scikit-learn, PyMongo |

## Project Structure

```text
Expense_tracker/
+-- frontend/                 # React + Vite client application
|   `-- src/
|       |-- components/       # Layout, form, chart, dashboard, income, and expense UI
|       |-- context/          # User and currency providers
|       |-- pages/            # Authentication and dashboard screens
|       `-- utils/            # Axios setup, API paths, and helpers
+-- backend/                  # Express REST API
|   |-- index.js              # Server entry point
|   `-- src/
|       |-- Controller/       # Auth, transaction, export, and dashboard logic
|       |-- Database/         # MongoDB connection
|       |-- middlewares/      # JWT authentication and upload handling
|       |-- models/           # User, Income, and Expense schemas
|       `-- Routes/           # API route definitions
`-- ai_services/              # Optional FastAPI analytics service
    |-- main.py
    `-- requirement.txt
```

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local instance or MongoDB Atlas connection string)
- Python 3.10+ only if you want to run AI analytics

## Getting Started

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/expense-tracker
JWT_SECRET=replace-with-a-long-random-secret
PORT=9000
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
```

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:9000`.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local URL, normally `http://localhost:5173`. Open it in a browser, create an account, and start adding transactions.

The frontend currently targets `http://localhost:9000`. Change `frontend/src/utils/apiPath.js` if the API uses another host or port.

### 3. Optional AI service

The AI service reads the same MongoDB data to calculate predictions and spending insights.

```bash
cd ai_services
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
pip install -r requirement.txt
pip install openai
```

Create `ai_services/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/expense-tracker
OPENAI_API_KEY=your_openai_api_key
```

Start the service:

```bash
uvicorn main:app --reload --port 8000
```

To expose AI endpoints through Express, uncomment the following in `backend/index.js`:

```js
app.use("/api/ai", aiRoutes)
```

## API Reference

All endpoints except sign-up and login require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Sign in and receive a JWT |
| GET | `/api/auth/getInfo` | Retrieve the authenticated user |
| POST | `/api/income/add` | Add an income transaction |
| GET | `/api/income/get` | List the current user's income transactions |
| DELETE | `/api/income/:id` | Delete an income transaction |
| GET | `/api/income/downloadexcel` | Export income data as an Excel file |
| POST | `/api/expense/add` | Add an expense transaction |
| GET | `/api/expense/get` | List the current user's expense transactions |
| DELETE | `/api/expense/:id` | Delete an expense transaction |
| GET | `/api/expense/downloadexcel` | Export expense data as an Excel file |
| GET | `/api/dashboard` | Get balance totals, recent items, and rolling summaries |
| GET | `/api/ai/predict-expense` | Estimate the next month's expense* |
| GET | `/api/ai/analyze-spending` | Analyze categories and transaction patterns* |
| GET | `/api/ai/recommendations` | Generate savings and category recommendations* |

\*Requires the AI service and enabled AI proxy route.

## Data Model

- **User**: `username`, `email`, hashed `password`, optional `profileImageUrl`, timestamps.
- **Income**: `userId`, `source`, `amount`, `date`, optional `icon`, timestamps.
- **Expense**: `userId`, `source`, `amount`, `date`, optional `icon`, timestamps.

Every income and expense record is associated with its owner. Protected routes use JWT identity to scope reads, exports, and deletes.

## AI Analytics

- With fewer than 10 expense records, the prediction endpoint uses a weighted recent/overall moving average.
- With 10 or more records, it aggregates expenses by month and applies linear regression.
- Spending analysis groups expenses by source and can cluster transaction sizes when enough data exists.
- Recommendations compare income, expenses, savings rate, and category concentration.

These insights are informational only and are not financial advice.

## Available Scripts

| Directory | Command | Purpose |
| --- | --- | --- |
| `backend` | `npm run dev` | Start Express with Nodemon |
| `frontend` | `npm run dev` | Start the Vite development server |
| `frontend` | `npm run build` | Create a production frontend build |
| `frontend` | `npm run lint` | Run ESLint |
| `ai_services` | `uvicorn main:app --reload --port 8000` | Start the AI service |

## Configuration and Security Notes

- Keep `.env` files out of version control; never commit database URIs, JWT secrets, or API keys.
- Use a strong, unique `JWT_SECRET` outside local development.
- Set `CLIENT_URL` to the deployed frontend origin in production to restrict CORS.
- The chatbot requires an OpenAI API key and a compatible OpenAI Python SDK.

## Current Integration Notes

- AI proxy routing is disabled by default in `backend/index.js`; enable it only after the Python service is running.
- The frontend contains profile-image upload and profile-update paths, but their backend routes are currently commented out or absent.
- Frontend export constants use `download-excel`, while the registered backend routes use `downloadexcel`. Align those paths before exposing Excel export in the UI.

## License

No license has been specified. Add one before redistributing or publishing the project.
