# pdftoolconverteronline.com Enterprise API | Phase 0 (Foundation)

Backend foundation for `api.pdftoolconverteronline.com`. This phase contains **no document engines and no tools**:
no Ghostscript, no LibreOffice, no Poppler, no ImageMagick, no OCR, no BullMQ, no queue.
It exists so every later phase can add tools without touching the platform.

## Stack

Node.js 22 LTS, Fastify 5, TypeScript (strict, ESM), Pino, Zod, uuid, Docker, Docker Compose, Redis (provisioned only).

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Full report: version, phase, runtime facts, dependency status |
| GET | `/ready` | Readiness, returns 503 while draining or when a required dependency is down |
| GET | `/live` | Liveness, never touches dependencies |
| GET | `/v1/tools` | Tool catalogue, empty in Phase 0 by design |
| GET | `/v1/tools/:slug` | One tool summary, 404 until tools are registered |
| GET | `/docs` | OpenAPI explorer (`/docs/json` for the raw document) |

## Layout

```
src/
  core/        app factory, error model, logger, shutdown, server bootstrap, version
  config/      env loader + Zod validation + defaults, structured AppConfig singleton
  plugins/     helmet + cors, rate limit, multipart, swagger
  middlewares/ request context (correlation id, timing), error and not found handlers
  routes/      route composition: root probes, /v1 application surface, shared schemas
  modules/
    health/    probe service, schemas, routes
    registry/  tool manifest contracts and the in memory registry (empty)
    workspace/ file lifecycle contracts and state machine (interfaces only)
  platform/    system snapshot, dependency probe contract, Redis placeholder probe
  storage/     StorageDriver contract and retention policy (no driver bound yet)
  workers/     worker classes, resource profiles, job handler contracts (no worker runs)
  shared/      constants, HTTP status codes
  types/       Fastify augmentation, cross module types
  utils/       ids, time, byte helpers
tests/         config, health, registry and lifecycle tests (node:test)
scripts/       dev.sh, build.sh, healthcheck.mjs
```

## Commands

```bash
npm install
npm run dev        # watch mode, pretty logs
npm run build      # typecheck + emit dist/
npm start          # run the compiled server
npm test           # node:test suite via tsx
docker compose up --build
```

## Configuration

Every value is read once, coerced and validated in `src/config/env.ts`. Invalid or contradictory
configuration (for example an upload limit above the body limit) fails at startup, never at runtime.
See `.env.example` for the full list.

## Conventions carried into later phases

1. Tools declare **capabilities**, never binaries. The dispatcher resolves engines.
2. Every failure is an `AppError` with a stable public code; internals never reach clients.
3. Files move through the lifecycle state machine in `modules/workspace`, nothing bypasses it.
4. Readiness fails before sockets close, so deploys drain instead of dropping requests.
