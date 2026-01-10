# Melius Monorepo

Monorepo with backend (NestJS) and frontend (Next.js) in pnpm workspace.

**Structure:**

- `apps/backend` – NestJS API + Prisma + PostgreSQL
- `apps/web` – Next.js 16 frontend

**Stack:** NestJS, Prisma, PostgreSQL 17, Next.js, TypeScript, Docker

---

## 🚀 Development

```bash
./dev.sh up      # Start (hot reload)
./dev.sh down    # Stop
```

**URLs:**

- Backend: http://localhost:3000
- Frontend: http://localhost:3001
- pgAdmin: http://localhost:5050

**Notes:**

- Hot reload enabled for backend and frontend
- pgAdmin credentials: admin@admin.com / pgadmin4
- Husky pre-commit hooks run automatically after `pnpm install`

---

## 🐳 Production

### 1. Backend Configuration

```bash
# Create .env.production
cp .env.production.example .env.production

# Generate secrets
openssl rand -base64 48  # JWT_SECRET
openssl rand -base64 48  # JWT_REFRESH_SECRET
openssl rand -base64 48  # JWT_EMAIL_SECRET
openssl rand -base64 32  # POSTGRES_PASSWORD

# Edit .env.production and fill ALL variables
vim .env.production
```

**IMPORTANT:**

- `.env.production` is in .gitignore - DO NOT commit!
- `CLIENT_URL=https://melius-app.com` (for CORS)

### 2. Deploy Backend (Railway)

1. Connect GitHub repo to Railway
2. Select `apps/backend` as root directory
3. Add all environment variables from `.env.production.example`
4. Add custom domain: `api.melius-app.com`

Railway auto-detects Dockerfile and deploys automatically.

### 3. Deploy Frontend (Vercel)

1. Connect GitHub repo to Vercel
2. Set Root Directory: `apps/web`
3. Add environment variables:
   ```bash
   NEXT_PUBLIC_BACKEND_URL=https://api.melius-app.com
   BACKEND_URL=https://api.melius-app.com
   ```
4. Add custom domain: `melius-app.com`

Vercel auto-detects Next.js and deploys automatically from Git push.

---

## 📦 Production Setup

```
Frontend (melius-app.com)
    ↓ Vercel
    - Next.js
    - Auto-deploy from Git

Backend (api.melius-app.com)
    ↓ Railway
    - NestJS (Docker)
    - PostgreSQL 17 (Railway service)
    - Auto-deploy from Git
```

**DNS Configuration:**

- `melius-app.com` → Vercel (CNAME)
- `api.melius-app.com` → Railway (CNAME)

### 4. Local Production Testing (Optional)

Test production build locally with Docker before Railway deploy:

```bash
# Setup environment
cp .env.production.example .env.production
vim .env.production  # Fill with test values

# Run with Docker Compose
docker compose --env-file .env.production up --build -d

# Or use helper script
./prod.sh build
```

---

## 🛠️ Commands

### Docker Development

```bash
./dev.sh up       # Start all services with hot reload
./dev.sh down     # Stop all services
./dev.sh logs     # View logs (optional: logs backend/web)
./dev.sh restart  # Restart services
./dev.sh ps       # Check status
```

### Package.json Scripts

```bash
pnpm install              # Install dependencies
pnpm build                # Build all apps
pnpm lint                 # Lint backend and frontend
pnpm test                 # Run backend tests
pnpm gen:openapi          # Generate OpenAPI types
```

### Prisma (Database)

```bash
# Seeding
pnpm db:seed:all              # Run both seeds (seed + seed2)

# Migrations
pnpm prisma:migrate           # Create and apply migration
pnpm prisma:migrate:create    # Create migration only (no apply)
pnpm prisma:migrate:deploy    # Apply pending migrations
pnpm prisma:migrate:reset     # Reset database and apply all migrations
pnpm prisma:status            # Check migration status

# Schema & Client
pnpm prisma:generate          # Generate Prisma Client
pnpm prisma:format            # Format schema file
pnpm prisma:validate          # Validate schema
pnpm prisma:push              # Push schema changes to DB (no migration)

# Tools
pnpm prisma:studio            # Open Prisma Studio (port 5556)
pnpm db:clean                 # Truncate all tables
```

---

## 🔐 Environment Variables

**Backend (Railway):**

Set these in Railway dashboard (see `.env.production.example` for all variables):

- `JWT_SECRET` / `JWT_REFRESH_SECRET` / `JWT_EMAIL_SECRET` - min 32 chars each
- `POSTGRES_PASSWORD` - PostgreSQL password (if using external DB)
- `AWS_*` - S3 credentials for file uploads
- `CLIENT_URL` - Frontend URL for CORS (https://melius-app.com)
- `RESEND_API_KEY` - Email service API key
- `RESEND_*` - Email templates and sender info
- `GOOGLE_AUTH_*` - OAuth credentials
- `STRIPE_*` - Payment keys and webhook secret
- `P24_*` - Przelewy24 payment gateway (optional)

**Note:** `DATABASE_URL` is auto-injected by Railway PostgreSQL service

**Frontend (Vercel):**

- `NEXT_PUBLIC_BACKEND_URL` - Backend API URL (https://api.melius-app.com)
- `BACKEND_URL` - (optional) for server-side calls

**Generate secure secrets:**

```bash
openssl rand -base64 48
```
