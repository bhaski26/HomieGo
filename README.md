# HomieGo

**Find your people. Find your place.** A polished, locally runnable demonstration of a roommate discovery and shared-living product for Bengaluru.

## Architecture

`Vite + vanilla JavaScript` provides the responsive client; `FastAPI + SQLAlchemy` provides the REST API; PostgreSQL is the production datastore. Local development defaults to SQLite only when `DATABASE_URL` is absent. The initial Alembic revision owns the schema and `backend/app/seed.py` creates fictional Bengaluru demo records.

## Run locally

```bash
npm install
npm run start
```

Open the address Vite prints (normally `http://localhost:5173`). Run `npm test` for browser-side smoke tests and `npm run build` for a production bundle.

In a second terminal:

```bash
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt
copy .env.example .env
.venv/Scripts/python -m app.seed
.venv/Scripts/uvicorn app.main:app --reload --port 8000
```

The interactive browser demo remains usable without the API. API documentation is served at `http://localhost:8000/docs` once the backend is running.

## Demo mode

Select **Explore demo** on the home screen. All profiles and homes are fictional demonstration data. Data created in the UI is persisted only in the browser's `localStorage`; use **Reset demo** in Settings to reset it.

## What is included

- Responsive public home, how-it-works, safety, pricing and contact views
- Demo sign-in, protected app views and onboarding progress
- Searchable roommate discovery with real in-browser filtering and saved profiles
- Transparent, weighted compatibility score and dealbreaker flag
- Demo listings, saved homes, connection requests and local message threads
- Household expense splitter, chores and lightweight notifications

## Authentication and demo credentials

The API stores Argon2 password hashes and issues signed, expiring bearer tokens. Seeded demo accounts use `aanya@demo.homiego.local` (or any seeded first-name email) with password `DemoPass123!`. These credentials are for local demonstration only; set a unique `SECRET_KEY` and use a managed PostgreSQL database before deploying.

## Testing

Run backend tests with `cd backend && .venv/Scripts/python -m pytest`. The compatibility unit tests cover a high-alignment result and dealbreaker handling. Extend this suite with database-backed endpoint, authorization, WebSocket and browser E2E tests before commercial release.

## Deployment

Deploy the static frontend to Vercel using `npm run build` and configure `VITE_API_URL`. Deploy the backend using `render.yaml`, set `DATABASE_URL`, `SECRET_KEY`, and `CORS_ORIGINS`, then run `alembic upgrade head` and `python -m app.seed`. Configure HTTPS at the hosting providers. No public deployment has been made from this workspace.

## Known limitations

The UI is deliberately self-contained to make the LinkedIn demo usable without credentials. Production should replace the `localStorage` repository in `src/app.js` with a FastAPI + PostgreSQL API, secure authentication (Supabase Auth or equivalent), object storage, server-side authorization, rate limiting, auditing and realtime delivery. See `.env.example` for the intended integration boundary.

The current browser UI has not yet been switched from its local demo repository to the new API client. It does not perform identity verification, email delivery, password reset delivery, live WebSockets, uploads, admin moderation UI, or legal/compliance functions. The API provides the foundation for profiles, discovery, properties, connections, conversations and expenses; production needs robust rate limiting, refresh token rotation, account recovery, object storage and formal moderation workflows. Any privacy/terms copy shown in the product is draft copy requiring legal review.
