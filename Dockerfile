# Multi-stage production Dockerfile for PlacePrep AI (Next.js + Prisma SQLite)

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Stage 2: Build Next.js application & seed initial SQLite database
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
ENV DATABASE_URL="file:./dev.db"
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate
RUN npx prisma db push --skip-generate
RUN node prisma/seed.js
RUN npm run build

# Stage 3: Minimal Production Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Ensure SQLite database is accessible at root as well
RUN ln -sf /app/prisma/dev.db /app/dev.db || true

# Grant write permissions on SQLite DB to nextjs user
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 8080

CMD ["npm", "run", "start", "--", "-p", "8080", "-H", "0.0.0.0"]
