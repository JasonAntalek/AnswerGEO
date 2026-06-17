# AnswerGEO — Free AI Visibility Audit

AnswerGEO shows local business owners what AI assistants recommend when customers search for their service category in a city.

## Features

- Free audit form (business name, city, state, category)
- Queries ChatGPT (OpenAI) and Google Gemini in parallel
- Visibility score, competitor leaderboard, and prioritized fixes
- **Supabase Auth** — sign up / sign in
- **Dashboard** — tracked businesses with audit history
- **Week-over-week comparison** — manual re-run + diff view (score, platforms, competitors)

## Setup

### 1. Install

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase project

1. Create a project at [supabase.com](https://supabase.com)
2. Enable **Email** auth provider
3. Copy project URL + anon key into `.env.local`
4. Copy Postgres connection string (pooler) as `DATABASE_URL`
5. Run base Drizzle migration: `npm run db:generate && npm run db:migrate`
6. Run [`supabase/migrations/001_auth_and_tracking.sql`](supabase/migrations/001_auth_and_tracking.sql) in the Supabase SQL editor

### 3. AI keys

Add at least one:

- `OPENAI_API_KEY`
- `GEMINI_API_KEY`

Without valid keys, the app falls back to demo data.

## Run

```bash
npm run dev
```

- Landing: [http://localhost:3000](http://localhost:3000)
- Dashboard: [http://localhost:3000/dashboard](http://localhost:3000/dashboard) (requires sign-in)

## API

| Endpoint | Auth | Description |
|----------|------|-------------|
| `POST /api/audit` | Optional | Run audit; auto-saves when signed in |
| `GET /api/audit/:id` | Public | Fetch report |
| `GET /api/businesses` | Required | List tracked businesses |
| `POST /api/businesses` | Required | Create tracked business |
| `POST /api/businesses/:id/audit` | Required | Manual re-run |
| `GET /api/businesses/:id/history` | Required | Audit timeline |
| `GET /api/businesses/:id/diff` | Required | Latest vs previous diff |

## Demo mode

```bash
ANSWERSPOT_DEMO_MODE=true
```

Forces mock AI responses with no API calls.

## Notes

- Anonymous audits work without auth (file or Postgres storage)
- Auth + history require `DATABASE_URL` and Supabase env vars
- Rate limit: 3 anonymous audits per IP per hour