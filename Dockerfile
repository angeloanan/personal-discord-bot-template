# Build stage
FROM node:alpine AS base
WORKDIR /app
RUN apk update
RUN apk --no-cache add curl
RUN curl -f https://get.pnpm.io/v6.16.js | node - add --global pnpm
COPY pnpm-lock.yaml package.json ./
RUN pnpm fetch

# Install dev-deps
FROM base AS dev-deps
RUN pnpm install --frozen-lockfile --offline
# Install build-essentials - https://github.com/mhart/alpine-node/issues/27#issuecomment-390187978
# RUN apk add --no-cache --virtual .build-deps alpine-sdk python3 \
#   && yarn install

# Specific to prisma, generate prisma client
FROM dev-deps AS prisma-gen
COPY ./prisma/schema.prisma ./prisma/schema.prisma
RUN pnpm prisma generate

# From dev-deps, copy cache, re-"install" prod deps and generate Prisma schdema
FROM base AS prod-deps
COPY --from=prisma-gen /app/${YARN_CACHE_FOLDER} /app/${YARN_CACHE_FOLDER}
RUN pnpm install --frozen-lockfile --prod --offline
# TODO: Double prisma gen call
COPY ./prisma/schema.prisma ./prisma/schema.prisma
RUN pnpm prisma generate

# Copy dev-deps and source-code and build project
FROM prisma-gen as builder
COPY . .
RUN pnpm build
RUN find . -name node_modules | xargs rm -rf

# App stage
FROM base as runner
COPY --from=prod-deps /app /app
COPY --from=builder /app /app
# CMD pnpm start
CMD pnpm start