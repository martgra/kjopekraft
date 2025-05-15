FROM oven/bun:alpine AS base
WORKDIR /app

# --- Dependencies Stage ---
FROM base AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install

# --- Builder Stage ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN bun run build

# --- Runner (Production) Stage ---
FROM oven/bun:alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S nodejs -g 1001 && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public

RUN mkdir .next && chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "run", "server.js"]