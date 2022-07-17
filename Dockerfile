# Build stage
FROM node:alpine AS base
WORKDIR /app
RUN apk update
ENV YARN_CACHE_FOLDER=.yarn-cache

# Install dev-deps
FROM base AS dev-deps
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
RUN yarn install --frozen-lockfile
# Install build-essentials - https://github.com/mhart/alpine-node/issues/27#issuecomment-390187978
# RUN apk add --no-cache --virtual .build-deps alpine-sdk python3 \
#   && yarn install

# Specific to prisma, generate prisma client
FROM dev-deps AS prisma-gen
COPY ./prisma/schema.prisma ./prisma/schema.prisma
RUN yarn prisma generate

# From dev-deps, copy cache, re-"install" prod deps and generate Prisma schdema
FROM base AS prod-deps
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
COPY --from=prisma-gen /app/${YARN_CACHE_FOLDER} /app/${YARN_CACHE_FOLDER}
RUN yarn install --frozen-lockfile --production --prefer-offline
# TODO: Double prisma gen call
COPY ./prisma/schema.prisma ./prisma/schema.prisma
RUN yarn prisma generate

# Copy dev-deps and source-code and build project
FROM prisma-gen as builder
COPY . .
RUN yarn build
RUN find . -name node_modules | xargs rm -rf

# App stage
FROM base as runner
COPY --from=prod-deps /app /app
COPY --from=builder /app /app
# CMD yarn start
CMD yarn start