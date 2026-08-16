# pdftoolconverteronline.com Enterprise API | Phase 0 image.
# Deliberately contains NO document engines: no Ghostscript, no LibreOffice, no Poppler,
# no ImageMagick, no Tesseract. Engine images arrive in later phases as separate builds.

# ---------- Stage 1: dependencies ----------
FROM node:22-bookworm-slim AS deps
WORKDIR /opt/pdftoolconverteronline/api
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
COPY package.json package-lock.json* ./
# Full install (including dev deps) so the TypeScript build can run in the next stage.
RUN npm install --no-audit --no-fund

# ---------- Stage 2: build ----------
FROM node:22-bookworm-slim AS build
WORKDIR /opt/pdftoolconverteronline/api
COPY --from=deps /opt/pdftoolconverteronline/api/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------- Stage 3: production dependencies only ----------
FROM node:22-bookworm-slim AS prod-deps
WORKDIR /opt/pdftoolconverteronline/api
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
COPY package.json package-lock.json* ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

# ---------- Stage 4: runtime ----------
FROM node:22-bookworm-slim AS runtime
WORKDIR /opt/pdftoolconverteronline/api

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=8080 \
    LOG_PRETTY=false \
    WORKSPACE_ROOT=/var/lib/pdftoolconverteronline

# dumb-init gives us correct signal forwarding so graceful shutdown actually runs.
RUN apt-get update \
 && apt-get install -y --no-install-recommends dumb-init poppler-utils file \
 && rm -rf /var/lib/apt/lists/*

COPY --from=prod-deps /opt/pdftoolconverteronline/api/node_modules ./node_modules
COPY --from=build /opt/pdftoolconverteronline/api/dist ./dist
COPY package.json ./
COPY scripts/healthcheck.mjs ./scripts/healthcheck.mjs

# Workspace directories owned by the unprivileged runtime user.
RUN mkdir -p /var/lib/pdftoolconverteronline/uploads \
             /var/lib/pdftoolconverteronline/tmp \
             /var/lib/pdftoolconverteronline/outputs \
             /var/lib/pdftoolconverteronline/quarantine \
 && chown -R node:node /var/lib/pdftoolconverteronline /opt/pdftoolconverteronline/api

USER node
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node scripts/healthcheck.mjs

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
