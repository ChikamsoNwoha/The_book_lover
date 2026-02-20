# The Book Lover Frontend

This directory contains the React + Vite frontend for The Book Lover.

For full project setup (backend, database, admin, newsletters), use the root README:
- `../README.md`

## Requirements

- Node.js `20.19+` (or `22.12+`)
- pnpm

## Setup

From repository root:

```bash
cd frontend
pnpm install
```

## Run in Development

```bash
cd frontend
pnpm run dev
```

Default app URL: `http://localhost:5173`

## Environment

Optional `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:5000
```

If omitted, frontend API requests default to `http://localhost:5000`.

## Deploy on Vercel

1. Import this repository into Vercel.
2. Set Root Directory to `frontend`.
3. Set environment variable:

```bash
VITE_API_BASE_URL=https://thebooklover-production.up.railway.app
```

4. Keep build settings:
   - Framework: `Vite`
   - Build command: `pnpm run build`
   - Output directory: `dist`

`frontend/vercel.json` is included to rewrite all routes to `index.html` so React Router paths work on refresh.

## Scripts

- `pnpm run dev` - start Vite dev server
- `pnpm run build` - create production build
- `pnpm run preview` - preview production build locally
- `pnpm run lint` - run ESLint
