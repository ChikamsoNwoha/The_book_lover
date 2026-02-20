# The Book Lover

## What This App Is
The Book Lover is a full-stack blog platform with:
- Public reading features (stories, search, likes, comments, newsletter signup).
- A protected admin area for managing articles, comment moderation, and newsletter campaigns.

## Tech Stack
- Frontend: React 19, Vite 7, TypeScript, React Router 7, Tailwind CSS 4
- Backend: Node.js, Express 4, MySQL 8 (`mysql2`)
- Auth: JWT + bcrypt (admin routes)
- Email/Newsletter: Resend (campaign + webhook tracking)
- Hosting: Vercel (frontend), Railway (backend + MySQL)

## Live URLs
- Frontend: `https://the-small-wins.vercel.app`
- Backend API base: `https://thebooklover-production.up.railway.app`

## Architecture
`Vercel (frontend) -> Railway (Express backend) -> Railway MySQL`

The frontend reads `VITE_API_BASE_URL` and sends API requests to the Railway backend.

## Local Setup
### 1. Install dependencies
Run these from the repository root:

```bash
cd backend
pnpm install
cd ../frontend
pnpm install
```

### 2. Configure environment files
- Create `backend/.env` using `backend/.env.example`.
- Create `frontend/.env` using `frontend/.env.example`.

### 3. Create and seed database
Create the database, then import schema:

```bash
mysql -u <db_user> -p -e "CREATE DATABASE small_wins;"
mysql -u <db_user> -p small_wins < backend/small_wins.sql
```

### 4. Run backend and frontend
Use two terminals:

```bash
cd backend
pnpm run dev
```

```bash
cd frontend
pnpm run dev
```

Default local URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Deploy Notes
### Frontend (Vercel)
- Root directory: `frontend`
- Build command: `pnpm run build`
- Output directory: `dist`
- Required environment variable:

```bash
VITE_API_BASE_URL=https://thebooklover-production.up.railway.app
```

- SPA route rewrites are configured in `frontend/vercel.json`.

### Backend (Railway)
- Root directory: `backend`
- Start command: `node server.js`
- Health check: `/api/health`
- Add a Railway volume mounted at `/app/uploads`.

Required backend variables:

```bash
NODE_ENV=production
BASE_URL=https://thebooklover-production.up.railway.app
SITE_URL=https://the-small-wins.vercel.app

JWT_SECRET=replace_with_long_random_string
JWT_EXPIRES_IN=7d

DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}

RESEND_API_KEY=your_resend_api_key
RESEND_WEBHOOK_SECRET=your_resend_webhook_secret
NEWSLETTER_FROM_EMAIL=updates@your-domain.com

EMAIL_USER=optional_sender_fallback@example.com
EMAIL_PASS=optional_sender_password
```

Railway MySQL generated variables (reference-only, from Railway):
- `MYSQLHOST`
- `MYSQLPORT`
- `MYSQLUSER`
- `MYSQLPASSWORD`
- `MYSQLDATABASE`
- `MYSQL_DATABASE`
- `MYSQL_URL`
- `MYSQL_PUBLIC_URL`
- `MYSQL_ROOT_PASSWORD`

Notes:
- `SITE_URL` must include protocol (`https://...`) for CORS.
- Backend supports either `DB_*` vars or direct `MYSQL*` aliases.

## Key Routes (Backend + Frontend Connections)
| Method | Path | What it does | Frontend connection |
| --- | --- | --- | --- |
| GET | `/api/health` | Health check response (`{ ok: true }`) | Not directly called by frontend |
| GET | `/api/db-check` | Tests live DB query connectivity | Not directly called by frontend |
| GET | `/api/articles` | Returns paginated articles list | `frontend/src/Pages/StoryCard.tsx`, `frontend/src/admin/ArticlesManager.tsx` |
| GET | `/api/articles/category/:category` | Returns paginated category-filtered articles | `frontend/src/Pages/StoryCard.tsx` |
| GET | `/api/articles/stats` | Returns likes/comments counts per article ID | `frontend/src/Pages/StoryCard.tsx` |
| GET | `/api/articles/:id` | Returns one article by ID and increments views | `frontend/src/Pages/StoryDetail.tsx` |
| POST | `/api/articles` | Creates article (admin JWT, optional image/newsletter queue) | `frontend/src/admin/ArticlesManager.tsx` |
| PUT | `/api/articles/:id` | Updates article (admin JWT, image replace/remove support) | `frontend/src/admin/ArticlesManager.tsx` |
| DELETE | `/api/articles/:id` | Deletes article (admin JWT) | `frontend/src/admin/ArticlesManager.tsx` |
| POST | `/api/interactions/view/:id` | Increments article views counter | Not directly called by frontend |
| POST | `/api/interactions/like/:id` | Registers like by client IP (duplicate-protected) | `frontend/src/lib/likes.tsx` |
| GET | `/api/interactions/likes/:id` | Returns like count for one article | `frontend/src/Pages/StoryDetail.tsx` |
| POST | `/api/interactions/comment/:id` | Creates comment for one article | `frontend/src/Pages/StoryDetail.tsx` |
| GET | `/api/interactions/comments/:id` | Returns comments (and admin reply if present) | `frontend/src/Pages/StoryDetail.tsx` |
| POST | `/api/newsletter/subscribe` | Adds subscriber and sends verification email | `frontend/src/components/Footer.tsx` |
| GET | `/api/newsletter/verify/:token` | Verifies subscriber token from email link | Email link flow (not a frontend API call) |
| GET | `/api/newsletter/unsubscribe/:token` | Unsubscribes via tokenized email link | Email link flow (not a frontend API call) |
| POST | `/api/newsletter/send` | Legacy endpoint, now returns `410 Gone` | Not directly called by frontend |
| POST | `/api/newsletter/webhooks/resend` | Receives/validates Resend webhook events | Resend webhook integration only |
| GET | `/api/search` | Fulltext article search (`q`, `offset`) | `frontend/src/components/Navbar.tsx` |
| POST | `/api/admin/login` | Admin login; returns JWT token | `frontend/src/admin/AdminLogin.tsx` |
| GET | `/api/admin/overview` | Dashboard totals + latest comments (admin JWT) | `frontend/src/admin/AdminOverview.tsx` |
| GET | `/api/admin/dashboard` | Alias of overview response (admin JWT) | Not directly called by frontend |
| GET | `/api/admin/comments` | Paged comments list for moderation (admin JWT) | `frontend/src/admin/CommentsManager.tsx` |
| DELETE | `/api/admin/comments/:id` | Deletes comment (admin JWT) | `frontend/src/admin/CommentsManager.tsx` |
| PUT | `/api/admin/comments/:id/reply` | Creates/updates admin reply to comment (admin JWT) | `frontend/src/admin/CommentsManager.tsx` |
| DELETE | `/api/admin/comments/:id/reply` | Deletes admin reply (admin JWT) | `frontend/src/admin/CommentsManager.tsx` |
| GET | `/api/admin/newsletter/summary` | Newsletter audience + aggregate campaign metrics (admin JWT) | `frontend/src/admin/NewsletterManager.tsx` |
| GET | `/api/admin/newsletter/campaigns` | Lists newsletter campaigns with filters (admin JWT) | `frontend/src/admin/NewsletterManager.tsx` |
| GET | `/api/admin/newsletter/campaigns/:id/deliveries` | Lists recipient-level delivery events for campaign (admin JWT) | `frontend/src/admin/NewsletterManager.tsx` |
| POST | `/api/admin/newsletter/campaigns` | Creates manual or auto-article newsletter campaign (admin JWT) | `frontend/src/admin/NewsletterManager.tsx`, `frontend/src/admin/ArticlesManager.tsx` (auto-article option via article create) |

## Folder Structure
```text
.
|- backend/
|  |- admin/                 # Admin auth + moderation routes
|  |- routes/                # Public/admin API route modules
|  |- services/              # Newsletter processing + Resend integration
|  |- utils/                 # DB table bootstrapping helpers
|  |- migrations/            # SQL migrations
|  |- .env.example
|  |- .env.railway.example
|  |- railway.json
|  `- server.js
|- frontend/
|  |- src/
|  |  |- Pages/              # Public pages
|  |  |- admin/              # Admin dashboard UI
|  |  |- components/         # Shared UI components
|  |  `- lib/                # API client + utility hooks
|  |- .env.example
|  |- vercel.json
|  `- vite.config.ts
|- CONTRIBUTING.md
`- README.md
```
