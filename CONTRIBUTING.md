# Contributing

## Branch Naming
Use:

`type/scope-short-description`

Examples:
- `feat/newsletter-docs`
- `fix/admin-token-expiry`
- `chore/readme-refresh`

## Lint and Formatting
Run frontend lint checks before opening a PR:

```bash
cd frontend
pnpm run lint
```

Notes:
- There is currently no dedicated formatter script in this repo.
- There is currently no dedicated backend lint script in this repo.

## Deploy Flow
- Push/merge to `main` triggers Vercel frontend deployment.
- Railway backend is configured to auto-redeploy from `main` (backend root directory).
- Ensure deploy environment variables are set in both Vercel and Railway before release.
