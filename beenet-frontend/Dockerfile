# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Stage 2: Development (Hot-Reload)
FROM base AS dev
RUN npm ci
COPY . .
ENV NODE_ENV=development
# Turbopack with polling for Docker and bind to 0.0.0.0
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]

# Stage 3: Builder
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build

# Stage 4: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install necessary runtime dependencies & set non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone Next.js build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0

CMD ["node", "server.js"]
