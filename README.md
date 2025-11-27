# Melius Monorepo

This repository houses both the NestJS backend and Next.js frontend in a single pnpm workspace with full Docker support.

## Layout

- `apps/backend` – NestJS API with Prisma ORM, JWT auth, AWS S3, and email services
- `apps/web` – Next.js 16 frontend with Turbopack
- `docker-compose.yml` – Production Docker setup
- `docker-compose.dev.yml` – Development setup with hot reload

## Quick Start

### Docker (Recommended)

**Development mode** (with hot reload):

```bash
./dev.sh up        # Start all services
./dev.sh logs      # View logs
./dev.sh down      # Stop services
```

**Production mode**:

```bash
./prod.sh build    # Build and start
./prod.sh logs     # View logs
./prod.sh down     # Stop services
```

Services:

- Backend API: http://localhost:3000
- Frontend: http://localhost:3001
- PostgreSQL: localhost:5432
- pgAdmin: http://localhost:5050

### Local Development (without Docker)

1. Install dependencies: `pnpm install`
2. Set up PostgreSQL 17 locally
3. Configure `.env` in backend directory
4. Run Prisma migrations: `cd apps/backend && pnpm exec prisma migrate deploy`
5. Start backend: `pnpm dev:backend`
6. Start frontend: `pnpm dev:web`

## Useful Scripts

- `pnpm build` – Build both apps
- `pnpm lint` – Lint backend and frontend
- `pnpm test` – Run backend tests
- `pnpm --filter @melius/backend <script>` – Run backend-specific command
- `pnpm --filter @melius/web <script>` – Run frontend-specific command

## Docker Setup

The project uses **Node.js 22-alpine** with multi-stage builds for optimized production images:

- Backend: NestJS with Prisma Client generation
- Frontend: Next.js with production optimizations
- Database: PostgreSQL 17 with automatic migrations on startup

See `DOCKER.md` for detailed Docker documentation and `DEVELOPMENT.md` for development workflow guides.

## Notes

- Backend coverage output: `coverage/backend`
- Prisma schema: `apps/backend/prisma/schema.prisma`
- Environment variables required in root `.env` for Docker setup
