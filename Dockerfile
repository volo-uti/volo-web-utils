# syntax=docker/dockerfile:1
# Stages: base (dependencies) -> check (the gate).
# `pnpm verify` builds the `check` stage.
ARG NODE_VERSION=lts

FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV CI=true
# Install the pnpm version pinned by "packageManager" (corepack is not used).
COPY package.json ./
RUN npm install --global "pnpm@$(node -p "require('./package.json').packageManager.split('@')[1]")"
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

FROM base AS check
RUN pnpm check
