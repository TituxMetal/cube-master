# 0002 — No client-side router library

**Status:** Accepted **Date:** 2026-04-03 (amended 2026-06-13)

## Context

The app has four routes: `/`, `/solver`, `/coach`, `/timer`. A routing library (React Router,
TanStack Router) brings abstractions — loaders, outlets, route objects — and couples the app to
router-specific patterns, in exchange for features four flat routes don't need.

## Decision

Ship a **minimal hand-rolled client router**. It reads `location.pathname` and renders the matching
page component. Navigation uses `<a>` tags plus a `popstate` listener. Hono serves `index.html` for
all non-asset paths (SPA fallback). The View Transitions API can layer on smooth transitions later
without a library.

**Amendment (Coach v1).** The router now also resolves **single-segment dynamic routes**
(`/coach/:lessonId`): exact static routes match first, then a thin `:param` pattern pass extracts
the segment and passes it to the render function; a trailing slash normalizes to the static route.
This is still **no routing library** — roughly a dozen extra tested lines in `lib/router.tsx`,
covered by `router.spec.tsx` (exact match, param extraction, static-beats-dynamic precedence,
fallback). The core decision is reaffirmed.

## Consequences

- **Easier:** minimal dependencies, nothing router-specific to learn, full control over behavior.
  Lessons are now addressable (sharing, resume, native back/forward) without adopting a library.
- **Harder / accepted:** nested routes and route guards still aren't built in (single-segment params
  now are). If routing needs grow past flat routes with one dynamic segment, re-evaluate TanStack
  Router or Hono SSR with server-side routing — a deliberate future decision, not a default.
