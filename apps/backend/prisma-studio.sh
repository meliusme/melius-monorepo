#!/bin/sh
docker exec melius-backend-dev sh -c 'cd /app/apps/backend && pnpm exec prisma studio --browser none --port 5556 --url "postgresql://postgres:postgres@db:5432/postgres?schema=public"'
