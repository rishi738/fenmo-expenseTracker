# Expense Tracker

A production-quality minimal expense tracker built with React, Vite, TailwindCSS, Express, Sequelize, and MySQL.

## Features

- Add expenses with amount, category, description, and date.
- Prevent duplicate entries from retry/double-submit behavior with `request_id` idempotency.
- View expenses in a responsive table.
- Filter by category and sort by date.
- Show visible total and per-category summary.
- Client-side loading, error, toast, disabled submit, and optimistic UI states.
- API tests for create, validation, idempotency, filtering, and sorting.

## Project Structure

```txt
expense-tracker/
  client/
    src/
      api/
      utils/
      App.jsx
      main.jsx
      styles.css
  server/
    src/
      config/
      controllers/
      middleware/
      models/
      repositories/
      routes/
      services/
      utils/
    test/
  database/
    schema.sql
```

## Prerequisites

- Node.js 20 or newer
- MySQL through XAMPP/phpMyAdmin or a hosted MySQL database
- npm

On Windows PowerShell, if `npm` is blocked by script policy, use `npm.cmd` in the same commands.

## Local Setup

1. Install dependencies:

```bash
cd expense-tracker
npm install
```

2. Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Configure `server/.env`:

```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_NAME=expense_tracker
DB_USER=root
DB_PASSWORD=
```

4. Configure `client/.env`:

```env
VITE_API_URL=http://localhost:5000
```

## Database Setup With phpMyAdmin

1. Start Apache and MySQL in XAMPP.
2. Open `http://localhost/phpmyadmin`.
3. Choose the SQL tab.
4. Paste the contents of `database/schema.sql`.
5. Run the script.

The schema creates the `expense_tracker` database and an `expenses` table using `DECIMAL(12,2)` for money values. It also creates a unique index on `request_id`, which is the final protection against duplicate retry inserts.

## Run The App

Backend:

```bash
cd expense-tracker
npm run dev --workspace server
```

Frontend:

```bash
cd expense-tracker
npm run dev --workspace client
```

Run both together:

```bash
cd expense-tracker
npm run dev
```

Default URLs:

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

## API

### Create Expense

```bash
curl -X POST http://localhost:5000/expenses \
  -H "Content-Type: application/json" \
  -d "{\"request_id\":\"demo-req-001\",\"amount\":249.50,\"category\":\"Food\",\"description\":\"Dinner\",\"date\":\"2026-04-29\"}"
```

Retry the exact same request:

```bash
curl -X POST http://localhost:5000/expenses \
  -H "Content-Type: application/json" \
  -d "{\"request_id\":\"demo-req-001\",\"amount\":249.50,\"category\":\"Food\",\"description\":\"Dinner\",\"date\":\"2026-04-29\"}"
```

Expected behavior: first request returns `201`; retry returns `200` with the same expense and `idempotent: true`.

### List Expenses

```bash
curl "http://localhost:5000/expenses"
```

### Filter By Category

```bash
curl "http://localhost:5000/expenses?category=Food"
```

### Sort Oldest First

```bash
curl "http://localhost:5000/expenses?sort=date_asc"
```

## Testing

```bash
cd expense-tracker
npm test --workspace server
npm test --workspace client
npm run build --workspace client
```

The backend uses Jest + Supertest with an in-memory repository through the same Express app factory, so request/response behavior is tested without requiring MySQL. The frontend uses Vitest + React Testing Library with API calls mocked.

Manual verification:

1. Start MySQL and import `database/schema.sql`.
2. Start the backend and frontend.
3. Add an expense from the form.
4. Click submit multiple times or retry the same curl request with the same `request_id`; only one row should exist.
5. Add expenses in multiple categories.
6. Filter by category and confirm the visible total changes.
7. Toggle sorting and confirm dates reorder correctly.

## Testing & Reliability

Reliability edge cases handled:

- Duplicate requests: `request_id` is stored with a unique DB index. The repository also recovers from concurrent unique-key races by returning the already-created row.
- Invalid inputs: backend rejects zero/negative amounts, values larger than `DECIMAL(12,2)` can store, more than 2 decimal places, missing category/date, unsupported currency, oversized category/description, impossible dates, and future dates.
- SQL injection: Sequelize parameterized queries are used; injection strings are stored as plain description text.
- Network failures: frontend API calls use `AbortController` timeouts, retry transient failures, show toast errors, and expose a retry panel when initial loading fails.
- Data consistency: totals and charts are derived from the visible filtered collection; currency totals use shared static conversion utilities.
- Date edge cases: frontend defaults to local today, blocks future dates, and backend validates exact calendar dates instead of trusting `Date.parse`.
- Search/filter bugs: combined category, search, preset date range, custom range, and reset filter flows are covered in UI logic and tests.
- Security basics: Helmet, constrained CORS origins, JSON body size limit, backend validation, and global error middleware are enabled.
- Performance check: backend regression test verifies `GET /expenses` can handle 1000 records while preserving sort order. The current UI remains responsive for this scale; pagination can be added later if the dataset grows substantially beyond that.

Known limitations:

- Currency conversion uses static mock rates for UI totals. It is deterministic for testing, but not live financial data.
- Authentication and per-user isolation are out of scope for this personal tracker.
- The frontend chart bundle is larger after adding Recharts; Vite warns about chunk size. A future production pass can lazy-load charts or split vendor chunks.

Useful commands:

```bash
npm test --workspace server
npm test --workspace client
npm run build --workspace client
```

## Deployment

This repository includes deploy-ready configuration, but live URLs must be created from your own Vercel/Netlify and Render/Railway accounts.

Frontend deployment with Vercel:

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Set the root directory to `expense-tracker/client`.
4. Build command: `npm run build`.
5. Output directory: `dist`.
6. Add `VITE_API_URL=https://your-backend-url`.

Backend deployment with Render:

1. Create a new Web Service from the same GitHub repository.
2. Set the root directory to `expense-tracker/server`.
3. Build command: `npm install`.
4. Start command: `npm start`.
5. Add environment variables from `server/.env.example`.
6. Set `CLIENT_ORIGIN` to the deployed frontend URL.

Database deployment with Railway MySQL:

1. Create a MySQL service in Railway.
2. Copy host, port, database, username, and password into Render environment variables.
3. Import `database/schema.sql` using Railway's SQL console or a MySQL client.

Live URL: not created in this local environment.

API URL: not created in this local environment.

## Design Decisions

- Sequelize is used for consistent MySQL access and clean model/repository boundaries.
- `amount` is stored as `DECIMAL(12,2)`, never a floating point column.
- The client generates a unique `request_id` for each form submission. The API also falls back to a hash of the payload if a client does not send one.
- The database unique index on `request_id` is the source of truth for duplicate prevention.
- The server is built with an app factory so tests can inject a fake repository.

## Trade-offs And Assumptions

- This is a personal tracker, so authentication is intentionally out of scope.
- The fallback hash treats identical payloads without a `request_id` as retries. Real clients should send unique `request_id` values for distinct same-looking expenses.
- Pagination is not implemented because the requirement marks it optional; the repository is structured so `limit` and `offset` can be added cleanly.
- Deployment instructions are included, but actual live deployment requires credentials and account access outside this workspace.
