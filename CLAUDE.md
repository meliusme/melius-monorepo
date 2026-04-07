# Melius Monorepo — Claude Code Guide

## Project Overview

**Melius** is an online therapy booking platform connecting patients with verified therapists. It's a pnpm workspace monorepo with a NestJS backend and Next.js frontend.

```
melius-monorepo/
├── apps/
│   ├── backend/     NestJS REST API (port 3000)
│   └── web/         Next.js 16 frontend (port 3001)
├── packages/
│   └── error-codes/ Shared error code generation (auto-runs on install)
├── docker-compose.dev.yml
├── docker-compose.yml
├── dev.sh / prod.sh
└── CLAUDE.md
```

## Key Commands

### Development

```bash
./dev.sh up           # Start all Docker services (hot reload)
./dev.sh down         # Stop all services
./dev.sh logs         # View logs
pnpm dev:backend      # Backend only (hot reload)
pnpm dev:web          # Frontend only (hot reload)
```

### Build & Lint

```bash
pnpm build            # Build both apps
pnpm lint             # Lint both apps
```

### Testing (backend only — no frontend tests yet)

```bash
pnpm test             # Run all unit tests
pnpm test:watch       # Watch mode
pnpm test:cov         # Coverage report
```

### Database (Prisma)

```bash
pnpm prisma:migrate   # Create + apply new migration
pnpm prisma:migrate:reset  # Reset DB and re-run all migrations
pnpm prisma:generate  # Regenerate Prisma client
pnpm prisma:studio    # Open Prisma Studio at port 5556
pnpm prisma:status    # Check migration status
pnpm prisma:validate  # Validate schema
```

### Seeding

```bash
pnpm seed             # Base users + profiles + specializations
pnpm seed:matches     # Availability slots + matches
pnpm seed:docs        # Therapist verification documents
pnpm db:seed:all      # Run all seeds in order
```

### API & Code Generation

```bash
pnpm gen:openapi      # Generate OpenAPI YAML + frontend TS types
pnpm gen:error-codes  # Regenerate shared error codes (also runs on install)
```

## Architecture

### Backend (NestJS)

**15 modules**, key ones:
- `AuthModule` — JWT (access + refresh with rotation), bcrypt, Passport, Google OAuth, email verification, password reset
- `UsersModule` / `ProfilesModule` — User, DocProfile, AdminProfile CRUD
- `MeetingsModule` — Booking, cancellation, 24h guard, auto-status cron
- `AvailabilityModule` — Therapist time slot management, overlap protection
- `PaymentsModule` — Stripe + Przelewy24, webhooks, refunds, idempotency
- `MatchesModule` — Problem/specialization scoring algorithm
- `DocModule` / `AdminModule` — Therapist verification flow (draft → submitted → approved/rejected)
- `RatingModule` — Post-session reviews (1-5 stars)
- `EmailModule` — Transactional email via Resend
- `ImageModule` — S3 uploads with Sharp processing
- `CleanupModule` — Cron jobs (refresh token cleanup, meeting status updates)

**Key design patterns:**
- Event-based architecture via NestJS Event Emitter (delimiter '.')
- Rate limiting: 60 req / 60 sec globally
- i18n via Handlebars templates
- All services have unit tests; Prisma is mocked with `jest.fn()`
- Refresh token rotation — old token invalidated on each refresh
- 24-hour session booking guard (users cannot cancel within 24h of meeting)

### Frontend (Next.js 16)

- App Router with i18n routing (Polish + English via next-intl)
- TanStack Query (React Query) for server state
- React Hook Form + Zod for forms
- Type-safe API client generated from OpenAPI (`apps/web/src/generated/openapi.ts`)
- Sass modules for styling with shared variables/mixins
- Turbopack dev server with inline SVG support

### Database (PostgreSQL + Prisma)

**14 models:** User, UserProfile, DocProfile, AdminProfile, Avatar, RefreshToken, Meeting, AvailabilitySlot, Payment, Rating, Problem, Specialization, Match, DocVerificationDocument

- All models use `Timestamptz` for timestamps
- Cascading deletes from User
- 36+ completed migrations in `apps/backend/prisma/migrations/`

## Development URLs

| Service | URL |
|---------|-----|
| Backend API | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api |
| OpenAPI JSON | http://localhost:3000/api-json |
| Frontend | http://localhost:3001 |
| pgAdmin | http://localhost:5050 (admin@admin.com / pgadmin4) |
| Prisma Studio | http://localhost:5556 |

## Environment Variables

Copy `.env.production.example` to `.env.production` for production. Development `.env` is committed with example values.

Required secrets:
- `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_EMAIL_SECRET`
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME`, `AWS_REGION`
- `RESEND_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `GOOGLE_AUTH_CLIENT_ID`, `GOOGLE_AUTH_CLIENT_SECRET`
- `P24_*` (optional — Polish payment provider)

Generate secrets: `openssl rand -base64 48`

## Deployment

- **Backend:** Railway (auto-detects Dockerfile), domain `api.melius-app.com`
- **Frontend:** Vercel, root dir `apps/web`, domain `melius-app.com`
- Backend Docker startup auto-runs Prisma migrations

## Testing Conventions

- Tests live alongside services as `*.spec.ts` files
- Prisma is always mocked — never hit real DB in unit tests
- Custom bcrypt mock at `apps/backend/src/__mocks__/bcrypt.ts`
- Use `jest.fn()` for all external dependencies
- HTTP test files: `api-tests.http`, `p24-test-flow.http` (root level)

## Code Generation Workflow

When changing the API (adding/modifying endpoints or DTOs):
1. Update backend controller/DTO with `@ApiProperty()` decorators
2. Run `pnpm gen:openapi` — regenerates `apps/web/src/generated/openapi.ts`
3. Update frontend API calls to use new types

When adding new error codes:
1. Edit `packages/error-codes/` source
2. Run `pnpm gen:error-codes`

## Pre-commit Hooks

Husky runs `lint-staged` automatically before each commit:
- Backend `*.{ts,js,json,md}` → Prettier + ESLint
- Frontend `*.{ts,js,css,scss,json,md}` → Prettier + ESLint

Never skip hooks with `--no-verify` unless absolutely necessary.
