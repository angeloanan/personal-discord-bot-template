# Build stage
FROM node:20 AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm config set node-linker hoisted
COPY pnpm-lock.yaml package.json ./
RUN pnpm fetch

# Install dev-deps
FROM base AS builder
RUN pnpm install --frozen-lockfile --prefer-offline
COPY . .
RUN pnpm build
RUN find . -name node_modules | xargs rm -rf

FROM base AS prod-deps
RUN pnpm install --frozen-lockfile --production --prefer-offline

# App stage
FROM gcr.io/distroless/nodejs20-debian12 as runner
COPY --from=prod-deps /app /app
COPY --from=builder /app /app

WORKDIR /app
# CMD pnpm start
CMD ["dist/index.js"]