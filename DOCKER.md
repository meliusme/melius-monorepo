# Docker Setup Guide

This document explains how to run the entire Melius application stack using Docker.

## Services

The Docker Compose setup includes:

- **PostgreSQL 17**: Database server (port 5432)
- **Backend (NestJS)**: API server (port 3000)
- **Web (Next.js)**: Frontend application (port 3001)
- **pgAdmin**: Database management UI (port 5050)

## Prerequisites

- Docker Desktop installed
- Docker Compose installed

## Development Mode (with Hot Reload) 🔥

For local development with automatic code reloading:

1. **Start all services in development mode:**

   ```bash
   docker compose -f docker-compose.dev.yml up
   ```

2. **Run in background:**

   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

3. **View logs:**

   ```bash
   docker compose -f docker-compose.dev.yml logs -f backend
   docker compose -f docker-compose.dev.yml logs -f web
   ```

4. **Stop services:**

   ```bash
   docker compose -f docker-compose.dev.yml down
   ```

**Benefits of development mode:**

- ✅ Code changes are reflected immediately (hot reload)
- ✅ No need to rebuild containers after code changes
- ✅ Source code is mounted as volumes
- ✅ Faster iteration during development

## Production Mode (Optimized Builds)

For production deployment with optimized Docker images:

1. **Build and start all services:**

   ```bash
   docker compose up --build
   ```

2. **Run in detached mode (background):**

   ```bash
   docker compose up --build -d
   ```

3. **View logs:**

   ```bash
   # All services
   docker compose logs -f

   # Specific service
   docker compose logs -f backend
   docker compose logs -f web
   docker compose logs -f db
   ```

4. **Stop all services:**

   ```bash
   docker compose down
   ```

5. **Stop and remove volumes (clean slate):**
   ```bash
   docker compose down -v
   ```

## Access Points

Once running, you can access:

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **pgAdmin**: http://localhost:5050 (admin@admin.com / pgadmin4)

## Database Migrations

The backend container automatically runs Prisma migrations on startup. If you need to manually run migrations:

```bash
docker compose exec backend npx prisma migrate deploy
```

## Seed Database

To seed the database with initial data:

```bash
docker compose exec backend pnpm seed
docker compose exec backend pnpm seed2
```

## Development vs Production

### Development (Current Setup)

The current setup is optimized for production deployment with:

- Multi-stage builds for smaller images
- Production dependencies only
- Automated migrations on startup

### For Local Development

For development, it's recommended to run services locally:

```bash
# Terminal 1: Start database only
docker compose up db

# Terminal 2: Run backend locally
cd apps/backend
pnpm start:dev

# Terminal 3: Run frontend locally
cd apps/web
pnpm dev
```

## Troubleshooting

### Backend fails to start

Check if the database is healthy:

```bash
docker compose ps
docker compose logs db
```

### Port already in use

Stop any local services running on ports 3000, 3001, 5432, or 5050.

### Rebuild after code changes

```bash
docker compose up --build
```

### Remove all containers and start fresh

```bash
docker compose down -v
rm -rf pgdata/
docker compose up --build
```

## Environment Variables

All environment variables are defined in the root `.env` file. Make sure this file exists with all required variables before starting the services.

## Network

All services run on a shared Docker network called `melius-network`, allowing them to communicate using service names (e.g., `backend` can connect to `db` using the hostname `db`).
