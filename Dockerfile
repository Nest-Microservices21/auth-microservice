ARG NODE_VERSION=22.3.0
ARG PNPM_VERSION=9.7.0

FROM node:${NODE_VERSION}-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
WORKDIR /usr/src/app
COPY package*.json pnpm-lock.yaml ./

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile 
FROM base AS build

WORKDIR /usr/src/app
COPY package*.json pnpm-lock.yaml ./

RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile 
COPY --chown=node:node . .
RUN pnpm run build 

# Development final stage
FROM base AS final-dev

WORKDIR /usr/src/app
COPY --from=build  /usr/src/app ./
CMD ["pnpm", "start:dev"]

# -----------------------------PRODUCTION------------------
FROM base AS final-prod
WORKDIR /usr/src/app
# Use --chown on COPY commands to set file permissions
USER node

COPY --from=build --chown=node:node /usr/src/app/dist ./dist
COPY --from=deps --chown=node:node /usr/src/app/node_modules ./node_modules
COPY --from=deps --chown=node:node /usr/src/app/package.json ./

USER root
RUN rm -rf /var/cache/apk/* /tmp/* /usr/src/app/.pnpm-store
# Switch back to node user
USER node
CMD ["pnpm", "start:prod"]
