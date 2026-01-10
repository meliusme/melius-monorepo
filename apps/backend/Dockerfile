# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages ./packages

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

# Install OpenSSL, Python, make, g++, wget and other required dependencies for native modules
RUN apk add --no-cache openssl libc6-compat python3 make g++ wget

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy backend package.json and prisma files
COPY apps/backend/package.json ./apps/backend/
COPY apps/backend/prisma ./apps/backend/prisma
COPY packages ./packages

# Copy node_modules from builder (includes Prisma Client)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules

# Rebuild native modules for Alpine
WORKDIR /app/node_modules/.pnpm/bcrypt@5.1.1/node_modules/bcrypt
RUN npm install --build-from-source
WORKDIR /app

# Copy built application from builder
WORKDIR /app/apps/backend
COPY --from=builder /app/apps/backend/dist ./dist

# Create non-root user and set ownership
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/src/main.js"]
