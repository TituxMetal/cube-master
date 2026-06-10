# 0001 — Hono over Astro for the web server

**Status:** Accepted **Date:** 2026-04-03

## Context

`apps/web` was inherited from a sample-project template running on **Astro**. CubeMaster is an
interactive tool app — not a content site — with no SSG/SSR-islands needs. Astro added cost the app
didn't pay back: a bespoke `.astro` file format, an islands/middleware model, and Astro-specific
ESLint/Prettier plugins threaded through the shared config. The app needs a server only to serve a
built React SPA and, later, to host API routes (Coach lessons, Timer persistence) without standing
up a second service.

Alternatives: stay on Astro; introduce NestJS or Express; pure Vite with no server.

## Decision

Replace Astro with **Hono** as the server framework in `apps/web`. Hono serves the React SPA with a
catch-all fallback for the client router, integrates with Vite (`@hono/vite-dev-server`) for HMR in
dev, and runs natively on Bun via `@hono/node-server`. React renders the whole UI client-side; no
SSR for now.

## Consequences

- **Easier:** lightweight server, zero framework overhead, a clean path to add API routes inside the
  same service later. Bun-native, no adapter cost.
- **Harder / accepted:** no SSR or islands — fine for an interactive tool, would need revisiting
  only if SEO/first-paint of content pages ever mattered.
- Removed Astro deps and the Astro ESLint parser/plugin from the shared `eslint-config` (a change
  that touched all consumers). The `/health` route is registered before the SPA catch-all so it
  isn't shadowed — a `server.spec.ts` guards the ordering.
