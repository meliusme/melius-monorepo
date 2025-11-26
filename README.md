# Melius Monorepo

This repository now houses both the NestJS backend and a new Next.js frontend in a single pnpm workspace.

## Layout

- `apps/backend` – NestJS API (existing project moved here).
- `apps/web` – Next.js app scaffolded for the frontend.

## Getting started

1. Install workspace dependencies from the repo root: `pnpm install`.
2. Start backend dev server: `pnpm dev:backend`.
3. Start frontend dev server: `pnpm dev:web`.

## Useful scripts

- `pnpm build` – build both apps.
- `pnpm lint` – lint backend and frontend.
- `pnpm test` – run backend tests.

## Notes

- Backend coverage output lives in `coverage/backend`.
- Workspace-aware scripts use pnpm filters; you can also run commands per app with `pnpm --filter @melius/backend <script>` or `--filter @melius/web <script>`.
