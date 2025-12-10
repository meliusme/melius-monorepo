# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code and prisma config
COPY apps/backend ./apps/backend

# Generate Prisma Client
WORKDIR /app/apps/backend
RUN pnpm exec prisma generate

# Build the application
RUN pnpm build

# Production stage
FROM node:22-alpine

# Install OpenSSL and other required dependencies
RUN apk add --no-cache openssl libc6-compat

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files and source
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend ./apps/backend
COPY .env ./.env

# Install all dependencies
WORKDIR /app/apps/backend
RUN cd /app && pnpm install --frozen-lockfile

# Copy built application from builder
COPY --from=builder /app/apps/backend/dist ./dist

# Generate Prisma Client AFTER copying dist (Prisma 7 will read from prisma.config.ts)
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main.js"]
