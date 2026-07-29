# syntax=docker/dockerfile:1

# --- Build stage: install deps and produce dist/ ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
# npm ci requires lock/package sync; fall back to npm install if the
# container's bundled npm is older than the lockfile version.
RUN npm install --no-audit --no-fund --prefer-offline || npm install --no-audit --no-fund

COPY . .
# Re-install on Alpine so Vite/Rolldown native bindings match the Linux musl target.
RUN npm install --no-audit --no-fund
RUN npm run build

# --- Production stage: serve static dist/ with nginx ---
FROM nginx:alpine AS serve

RUN addgroup -S appgrp && adduser -S appusr -G appgrp \
    && chown -R appusr:appgrp /var/cache/nginx /var/log/nginx /etc/nginx/conf.d \
    && touch /var/run/nginx.pid && chown appusr:appgrp /var/run/nginx.pid

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/ /usr/share/nginx/html/

USER appusr
EXPOSE 80

# --- Dev stage: Vite dev server with hot reload ---
FROM node:20-alpine AS dev
WORKDIR /app

COPY package*.json ./
RUN npm install --no-audit --no-fund --prefer-offline || npm install --no-audit --no-fund

COPY . .

USER node
EXPOSE 5173
CMD ["sh", "-c", "npm run dev -- --host 0.0.0.0 --port 5173 --strictPort"]
