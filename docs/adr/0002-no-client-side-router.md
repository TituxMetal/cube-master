# 0002 — No client-side router library

**Status:** Accepted **Date:** 2026-04-03

## Context

The app has four routes: `/`, `/solver`, `/coach`, `/timer`. A routing library (React Router,
TanStack Router) brings abstractions — loaders, outlets, route objects — and couples the app to
router-specific patterns, in exchange for features four flat routes don't need.

## Decision

Ship a **minimal hand-rolled client router (~20 lines)**. It reads `location.pathname` and renders
the matching page component. Navigation uses `<a>` tags plus a `popstate` listener. Hono serves
`index.html` for all non-asset paths (SPA fallback). The View Transitions API can layer on smooth
transitions later without a library.

## Consequences

- **Easier:** minimal dependencies, nothing router-specific to learn, full control over behavior.
- **Harder / accepted:** nested routes, route params, and guards aren't built in. If routing needs
  grow that far, re-evaluate TanStack Router or Hono SSR with server-side routing — a deliberate
  future decision, not a default.
