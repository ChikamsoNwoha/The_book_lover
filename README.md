# The Book Lover

**Overview**
The Book Lover is a blog-style site with a public reader experience and a protected admin area for managing content. The frontend is a React + Vite app, and the backend is an Express API backed by MySQL.

**Stack**
- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, MySQL

**Prerequisites**
- Node.js 18+ recommended
- MySQL 8+ recommended
- pnpm (enable via Corepack: `corepack enable`)

**Backend Setup**
From the project root:
```bash
cd backend
pnpm install
```

Create or update `backend/.env`:
```bash
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=small_wins
DB_PORT=3306
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
EMAIL_USER=your_email_account
EMAIL_PASS=your_email_password_or_app_password
```

Start the backend:
```bash
cd backend
pnpm run dev
```

The API runs on `http://localhost:5000` by default.

**Database Setup**
Create the database and import the schema:
```bash
mysql -u your_db_user -p
CREATE DATABASE small_wins;
EXIT;
```

```bash
mysql -u your_db_user -p small_wins < backend/small_wins.sql
```

**Frontend Setup**
From the project root:
```bash
cd frontend
pnpm install
```

Optional: create `frontend/.env` to override the API base URL:
```bash
VITE_API_BASE_URL=http://localhost:5000
```

Start the frontend:
```bash
cd frontend
pnpm run dev
```

The app runs on `http://localhost:5173` by default.

**Admin Setup**
1. Generate a bcrypt hash (CLI arg or env var):
```bash
node backend/hash.js "YourPassword"
```
Optional env var:
```bash
ADMIN_PASSWORD=YourPassword node backend/hash.js
```
2. Insert the admin record in MySQL:
```sql
INSERT INTO admins (name, email, password_hash, is_active)
VALUES ('Admin', 'admin@example.com', '<HASH_FROM_STEP_2>', 1);
```
3. Log in at `http://localhost:5173/admin`.

**Run Locally (Quick Start)**
```bash
cd backend
pnpm install
pnpm run dev
```

```bash
cd frontend
pnpm install
pnpm run dev
```
