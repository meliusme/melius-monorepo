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

# Install OpenSSL, Python, make, g++ and other required dependencies for native modules
RUN apk add --no-cache openssl libc6-compat python3 make g++

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy backend package.json and prisma files
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma

# Install ALL dependencies (including devDependencies for Prisma CLI)
# This will properly build bcrypt for Alpine Linux
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
WORKDIR /app/apps/backend
RUN pnpm exec prisma generate

# Copy built application from builder
WORKDIR /app/apps/backend
COPY --from=builder /app/apps/backend/dist ./dist

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main.js"]
