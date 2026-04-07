# Manage the development Docker environment

Control the Docker Compose development environment. Use $ARGUMENTS to specify the action.

**Available actions:**

- `up` — Start all services (backend, frontend, postgres, pgadmin):
  ```bash
  cd /Users/ssymax/projects/melius-monorepo && ./dev.sh up
  ```

- `down` — Stop all services:
  ```bash
  cd /Users/ssymax/projects/melius-monorepo && ./dev.sh down
  ```

- `logs` — Follow logs from all services:
  ```bash
  cd /Users/ssymax/projects/melius-monorepo && ./dev.sh logs
  ```

- `restart` — Stop and start again:
  ```bash
  cd /Users/ssymax/projects/melius-monorepo && ./dev.sh down && ./dev.sh up
  ```

**Service URLs after startup:**
- Backend API: http://localhost:3000
- Swagger UI: http://localhost:3000/api
- Frontend: http://localhost:3001
- pgAdmin: http://localhost:5050 (admin@admin.com / pgadmin4)
- Prisma Studio: http://localhost:5556

If no argument is given in $ARGUMENTS, ask the user which action they want to perform.
