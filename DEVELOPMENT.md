# Development with Hot Reload

## Quick Start

Preferred commands:

```bash
# Start development environment
./dev.sh up

# View logs (all or selected service)
./dev.sh logs
./dev.sh logs backend

# Stop development environment
./dev.sh down
```

Direct Docker Compose (equivalent):

```bash
docker compose -f docker-compose.dev.yml up -d
docker compose -f docker-compose.dev.yml logs -f
docker compose -f docker-compose.dev.yml down
```

## Dev vs Production Compose

Development (`docker-compose.dev.yml`):

- Hot reload for backend and frontend
- Source mounted from local filesystem
- Good for coding and debugging
- Slower first startup because dependencies are installed in containers

Production (`docker-compose.yml`):

- Backend + PostgreSQL only
- Frontend is not part of production compose (deployed separately on Vercel)
- Intended for production-like backend runtime checks

## URLs (Dev)

- Backend: http://localhost:3000
- Frontend: http://localhost:3001
- pgAdmin: http://localhost:5050

## Typical Development Workflow

1. Start environment:

   ```bash
   ./dev.sh up
   ```

2. Edit code in `apps/backend/` or `apps/web/`.
3. Verify changes:
   - Backend reloads automatically.
   - Frontend updates on refresh (`http://localhost:3001`).
4. Watch recompilation/errors:

   ```bash
   ./dev.sh logs backend
   ./dev.sh logs web
   ```

## Switching Modes

```bash
# Stop any running stack first
./dev.sh down
docker compose down

# Start development mode
./dev.sh up

# Or start production compose locally
./prod.sh build
```

## Troubleshooting

Changes not reflecting:

- Verify `docker-compose.dev.yml` is running
- Check backend logs: `./dev.sh logs backend`
- Restart services: `./dev.sh restart`

Slow first startup:

- First run installs dependencies
- Next runs are faster thanks to Docker volumes

Port conflicts:

- Stop previously running stack (`./dev.sh down` or `docker compose down`)

## In Progress Notes

- Match stepper frontend flow still has a TODO after slot selection (`apps/web/.../matchStepper.tsx`).
- Event-based booking/cancellation emails are partially wired (listener exists; full event emission is still being finalized).
