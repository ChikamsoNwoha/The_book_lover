# The Book Lover

Last verified: February 17, 2026.

The Book Lover is a blog-style platform with:
- A public reader experience (articles, likes, comments, search).
- A protected admin area (article publishing, comment moderation, newsletter operations).

The frontend is a React + Vite app, and the backend is an Express API backed by MySQL.

## Stack

- Frontend: React 19, Vite 7, Tailwind CSS 4, React Router 7
- Backend: Node.js, Express 4, MySQL 8
- Email/newsletter delivery: Resend

## Prerequisites

- Node.js `20.19+` (or `22.12+`)
- MySQL `8+`
- pnpm (enable with `corepack enable`)

Notes:
- Backend runtime itself can run on older Node versions, but the frontend toolchain (`vite@7` and `@vitejs/plugin-react@5`) requires Node 20.19+.
- Run commands from the repository root unless stated otherwise.

## Project Structure

```text
.
|- backend/      # Express API, DB access, newsletter processing
|- frontend/     # React + Vite SPA
|- README.md
```

## Quick Start

Open two terminals from the repo root.

### 1. Install dependencies

```bash
cd backend
pnpm install
```

```bash
cd frontend
pnpm install
```

### 2. Create the database and import schema

```bash
mysql -u your_db_user -p
CREATE DATABASE small_wins;
EXIT;
```

```bash
mysql -u your_db_user -p small_wins < backend/small_wins.sql
```

Schema notes:
- `backend/small_wins.sql` already includes newsletter tracking tables.
- `backend/migrations/2026-02-17-newsletter-tracking.sql` is only for upgrading older databases that predate that schema change.
- Legacy safety: missing `comment_replies` / newsletter tables are also auto-created by backend utilities at runtime.

### 3. Configure backend environment

Create `backend/.env` from `backend/.env.example`, then set real values:

```bash
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=small_wins
DB_PORT=3306
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
BASE_URL=http://localhost:5000
SITE_URL=http://localhost:5173
RESEND_API_KEY=your_resend_api_key
RESEND_WEBHOOK_SECRET=your_resend_webhook_secret
NEWSLETTER_FROM_EMAIL=updates@your-domain.com
EMAIL_USER=optional_sender_fallback@example.com
EMAIL_PASS=optional_sender_password
```

Variable notes:
- `DB_PORT` exists in the template for compatibility, but `backend/db.js` currently does not read it.
- `EMAIL_USER` can be used as a fallback sender when `NEWSLETTER_FROM_EMAIL` is unset.
- `EMAIL_PASS` is currently unused by backend code.
- `RESEND_API_KEY` is required for newsletter sends.
- `RESEND_WEBHOOK_SECRET` is required if webhook verification is enabled for delivery tracking.

### 4. Start backend

```bash
cd backend
pnpm run dev
```

Optional watch mode:

```bash
cd backend
pnpm run dev:watch
```

Backend defaults:
- API base: `http://localhost:5000`
- Health endpoint: `GET http://localhost:5000/api/health`
- Static uploads: `http://localhost:5000/uploads/*`

### 5. Start frontend

Optional override in `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

Run:

```bash
cd frontend
pnpm run dev
```

Frontend default: `http://localhost:5173`

## Script Reference

Backend (`backend/package.json`):
- `pnpm run dev` -> start backend with `node server.js`
- `pnpm run dev:watch` -> start backend with auto-reload (`nodemon`)
- `pnpm run smoke:admin` -> smoke checks for health/admin/newsletter legacy status

Frontend (`frontend/package.json`):
- `pnpm run dev` -> start Vite dev server
- `pnpm run build` -> production build
- `pnpm run preview` -> preview production build
- `pnpm run lint` -> run ESLint

## Admin Setup

### 1. Create password hash

Cross-platform:

```bash
node backend/hash.js "YourPassword"
```

PowerShell alternative:

```powershell
$env:ADMIN_PASSWORD="YourPassword"
node backend/hash.js
```

### 2. Insert admin record

```sql
INSERT INTO admins (name, email, password_hash, is_active)
VALUES ('Admin', 'admin@example.com', '<HASH_FROM_STEP_1>', 1);
```

### 3. Sign in

- URL: `http://localhost:5173/admin`

Canonical admin URLs:
- `http://localhost:5173/admin`
- `http://localhost:5173/admin/dashboard`
- `http://localhost:5173/admin/dashboard/articles`
- `http://localhost:5173/admin/dashboard/comments`
- `http://localhost:5173/admin/dashboard/newsletter`

Compatibility redirects:
- `/admin/dashboard/overview` -> `/admin/dashboard`
- `/admin/articles` -> `/admin/dashboard/articles`
- `/admin/comments` -> `/admin/dashboard/comments`
- `/admin/newsletter` -> `/admin/dashboard/newsletter`
- Unknown `/admin/*` -> `/admin/dashboard`

## API Overview

### Public APIs

- `GET /api/health`
- `GET /api/articles`
- `GET /api/articles/category/:category`
- `GET /api/articles/stats`
- `GET /api/articles/:id`
- `POST /api/interactions/view/:id`
- `POST /api/interactions/like/:id`
- `GET /api/interactions/likes/:id`
- `POST /api/interactions/comment/:id`
- `GET /api/interactions/comments/:id`
- `GET /api/search?q=...`
- `POST /api/newsletter/subscribe`
- `GET /api/newsletter/verify/:token`
- `GET /api/newsletter/unsubscribe/:token`
- `POST /api/newsletter/webhooks/resend`
- `POST /api/newsletter/send` (legacy, returns `410 Gone`)

### Admin APIs (JWT required except login)

- `POST /api/admin/login`
- `GET /api/admin/overview`
- `GET /api/admin/dashboard`
- `GET /api/admin/comments`
- `DELETE /api/admin/comments/:id`
- `PUT /api/admin/comments/:id/reply`
- `DELETE /api/admin/comments/:id/reply`
- `GET /api/admin/newsletter/summary`
- `GET /api/admin/newsletter/campaigns`
- `GET /api/admin/newsletter/campaigns/:id/deliveries`
- `POST /api/admin/newsletter/campaigns`
- `POST /api/articles` (admin-auth)
- `PUT /api/articles/:id` (admin-auth)
- `DELETE /api/articles/:id` (admin-auth)

## Newsletter Tracking and Webhooks

### Behavior

- Campaign sends are queued and processed in-process (non-blocking).
- Campaigns stuck in `QUEUED` or `SENDING` are resumed on backend startup.
- Auto-send can be toggled from Admin -> Articles while publishing.

### Resend webhook setup

1. In Resend, create webhook:
   - URL: `https://your-domain.com/api/newsletter/webhooks/resend`
2. Subscribe to events:
   - `delivered`
   - `opened`
   - `clicked`
   - `bounced`
   - `complained`
3. Put secret in `RESEND_WEBHOOK_SECRET`.
4. Ensure:
   - `BASE_URL` is your backend public URL.
   - `SITE_URL` is your frontend public URL.

## Smoke Checks

Automated:

```bash
cd backend
pnpm run smoke:admin
```

Manual quick checks:

```bash
curl -i http://localhost:5000/api/health
curl -i http://localhost:5000/api/admin/overview
curl -i http://localhost:5000/api/admin/dashboard
curl -i -X POST http://localhost:5000/api/newsletter/send
```

Expected statuses:
- `/api/health` -> `200`
- `/api/admin/overview` -> `401` (without token)
- `/api/admin/dashboard` -> `401` (without token)
- `POST /api/newsletter/send` -> `410`

## Backend Restart Expectations

- If using `pnpm run dev` (`node server.js`), restart manually when backend files change.
- If using `pnpm run dev:watch` (`nodemon`), backend changes auto-reload.

## Troubleshooting

- `401` on admin endpoints:
  - Expected unless you send `Authorization: Bearer <jwt>`.
- Verification/unsubscribe links point to wrong host:
  - Set `BASE_URL` correctly.
- "Failed to fetch" from frontend:
  - Confirm backend is running and `VITE_API_BASE_URL` matches backend URL.
- Vite refuses to start due Node version:
  - Upgrade Node to `20.19+` or `22.12+`.
- Newsletter send fails:
  - Confirm `RESEND_API_KEY` and sender email (`NEWSLETTER_FROM_EMAIL` or `EMAIL_USER`) are set.
