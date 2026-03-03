# Melius Monorepo

A monorepo with a NestJS backend and a Next.js frontend in a pnpm workspace.

Status: **IN PROGRESS** (actively developed).

## What This App Is

Melius is an online therapy booking platform that connects patients with therapists.
The core UX is intentionally fast: a light registration flow lets users start quickly and complete details later, in an Uber/Tinder-style onboarding pattern.
The UI/UX is minimalist and designed with younger users in mind.

Main product flows:

- fast, light registration/login and profile completion
- therapist profile creation and admin verification
- therapist matching and slot search
- session booking and payment (Stripe / Przelewy24)
- post-session rating and feedback

**Structure:**

- `apps/backend` – NestJS API + Prisma + PostgreSQL
- `apps/web` – Next.js 16 frontend

**Stack:** NestJS, Prisma, PostgreSQL 17, Next.js, TypeScript, Docker

---

## 📚 Documentation Index

- Product/docs (PL): [docs-pl.md](docs-pl.md)
- Product/docs (EN): [docs-en.md](docs-en.md)
- TODO/backlog (PL): [todo-pl.md](todo-pl.md)
- TODO/backlog (EN): [todo-en.md](todo-en.md)

---

## 🧱 What Is Used and How

- `NestJS` (`apps/backend`) - REST API, auth, roles, modules, cron jobs.
- `Prisma 7` + `PostgreSQL 17` - data layer, migrations, seed scripts, relational models.
- `JWT + cookies` - access/refresh session model with token rotation.
- `Stripe` + `Przelewy24` - payment providers (`/payments/*`).
- `Resend` - transactional email sending.
- `AWS S3` + `sharp` - avatar and therapist verification document storage/processing.
- `Next.js 16` (`apps/web`) - frontend app with i18n and API integration.
- `pnpm workspace` - monorepo dependency and script management.
- `Docker Compose` - local dev/prod-like orchestration (`docker-compose.dev.yml`, `docker-compose.yml`).

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

- Hot reload is enabled for backend and frontend.
- pgAdmin credentials: admin@admin.com / pgadmin4.
- Husky pre-commit hooks run automatically after `pnpm install`.

---

## 📌 Current Status (In Progress)

Done:

- Core MVP backend flows are implemented (auth, profiles, meetings, availability, payments).
- Therapist verification flow is implemented (`draft -> submitted -> approved/rejected`) with documents.
- P24 webhook flow includes idempotency and payment sanity/status checks.
- Therapist meeting dashboard scopes are implemented (`today/upcoming/past/cancelled`).
- Refresh-token rotation and cleanup cron are implemented.

In progress:

- Frontend booking flow after slot selection (currently marked TODO in `matchStepper.tsx`).
- Full event-based booking/cancellation email flow wiring.
- Final production hardening and documentation cleanup.

Planned / later:

- Public therapist profile endpoint (`GET /profiles/doc/:id`).
- Advanced matching scoring and weights.
- Rating moderation rules.
- Admin finance/statistics features (balance/payout/history).
- Image thumbnail/orphan cleanup improvements.

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

# Edit .env.production and fill all variables
vim .env.production
```

**IMPORTANT:**

- `.env.production` is in `.gitignore` - do not commit it.
- `CLIENT_URL=https://melius-app.com` (for CORS)

### 2. Deploy Backend (Railway)

1. Connect GitHub repo to Railway
2. Select `apps/backend` as root directory
3. Add all environment variables from `.env.production.example`
4. Add custom domain: `api.melius-app.com`

Railway auto-detects the Dockerfile and deploys automatically.

### 3. Deploy Frontend (Vercel)

1. Connect GitHub repo to Vercel
2. Set Root Directory: `apps/web`
3. Add environment variables:
   ```bash
   NEXT_PUBLIC_BACKEND_URL=https://api.melius-app.com
   BACKEND_URL=https://api.melius-app.com
   ```
4. Add custom domain: `melius-app.com`

Vercel auto-detects Next.js and deploys automatically on every Git push.

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

Test the production build locally with Docker before deploying to Railway:

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

# Backend container runs prisma migrate deploy on startup.
```

### Package.json Scripts

```bash
pnpm install              # Install dependencies
pnpm build                # Build all apps
pnpm lint                 # Lint backend and frontend
pnpm test                 # Run backend tests
pnpm gen:error-codes      # Generate shared error codes package
pnpm gen:openapi          # Generate OpenAPI artifacts (web TS types + backend YAML export)
```

### Testing

Unit tests live in `apps/backend/src/**/*.spec.ts` and are run with Jest + ts-jest.

```bash
pnpm test                       # Run all backend unit tests
pnpm --filter @melius/backend test:watch   # Watch mode
pnpm --filter @melius/backend test:cov    # With coverage report
```

Covered services (89 tests total):

| Service | What is tested |
|---|---|
| `AuthService` | login, register, setPassword, token rotation, session limits |
| `ProfilesService` | user/doc/admin profile updates, doc submission flow |
| `AvailabilityService` | slot creation, listing, deletion with overlap/auth guards |
| `MeetingsService` | booking, cancellation by user/doc, 24h guard, refund trigger |
| `RatingService` | rate creation guards, aggregation, paginated listing |
| `AdminService` | doc approve/reject flows, idempotency, reason validation |

Tests focus on service behavior — return values and thrown errors — not internal Prisma call shapes.
Prisma is replaced by plain `jest.fn()` mocks; `bcrypt` is mocked via `src/__mocks__/bcrypt.ts`.

### API Artifacts (Swagger/OpenAPI + Error Codes)

- Swagger JSON source endpoint: `http://localhost:3000/api-json` (backend must be running).
- `pnpm gen:openapi` generates web client types at `apps/web/src/generated/openapi.ts`.
- `pnpm gen:openapi` also runs backend OpenAPI YAML export via `apps/backend/scripts/export-openapi-yaml.mjs`.
- `pnpm gen:error-codes` generates shared error-code artifacts from `packages/error-codes/generate.js`.
- Error-code generation also runs automatically on `pnpm install` (via `postinstall`).

### Prisma (Database)

```bash
# Seeding
pnpm db:seed:all              # Run all seeds (seed + seed2 + seed-docs)

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

- `JWT_SECRET` / `JWT_REFRESH_SECRET` / `JWT_EMAIL_SECRET` - minimum 32 characters each
- `POSTGRES_PASSWORD` - PostgreSQL password (if using external DB)
- `AWS_*` - S3 credentials for file uploads
- `CLIENT_URL` - Frontend URL for CORS (https://melius-app.com)
- `RESEND_API_KEY` - Email service API key
- `RESEND_*` - Email templates and sender info
- `GOOGLE_AUTH_*` - OAuth credentials
- `STRIPE_*` - Payment keys and webhook secret
- `P24_*` - Przelewy24 payment gateway (optional)

**Note:** `DATABASE_URL` is auto-injected by the Railway PostgreSQL service.

**Frontend (Vercel):**

- `NEXT_PUBLIC_BACKEND_URL` - Backend API URL (https://api.melius-app.com)
- `BACKEND_URL` - (optional) for server-side calls

**Generate secure secrets:**

```bash
openssl rand -base64 48
```
