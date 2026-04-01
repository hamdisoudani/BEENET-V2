# Stage 1: Base
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Stage 2: Development (Hot-Reload)
FROM base AS dev
RUN npm ci
COPY . .
ENV NODE_ENV=development
# Don't use preserveWatchOutput, it causes issues with deleteOutDir
CMD ["npm", "run", "start:dev"]

# Stage 3: Builder
FROM base AS builder
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --omit=dev

# Stage 4: Production (Minimal Distroless Image)
FROM gcr.io/distroless/nodejs20-debian12:nonroot AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 4000
CMD ["dist/main.js"]
