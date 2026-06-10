# Feature Shape: Hono Migration

## Problem

The web app currently runs on Astro (inherited from the sample-project template). The MVP specifies
Hono as the server framework — lightweight, Bun-native, progressive. Astro adds unnecessary
complexity for an interactive tool app (SSG/SSR islands, Astro-specific file format, middleware
system). The app needs a simple server that serves a React SPA and can grow into an API server
later.

## Solution (Broad Strokes)

Replace Astro with Hono as the server framework in apps/web:

- Hono serves the React SPA with a fallback route for client-side routing
- Vite handles the build and dev experience (HMR, bundling)
- React renders the entire UI client-side (no SSR needed for MVP)
- The 4 routes (/, /solver, /coach, /timer) are handled by a minimal client-side router
- `.astro` files are replaced by React components and a single HTML entry point

This also removes Astro-specific dependencies, ESLint plugins, and config files.

## User Flow

1. User opens the app → Hono serves the HTML shell → React renders the home page
2. Home page shows three mode cards (Solve / Learn / Train) with signature colors
3. User clicks a mode card or a nav tab → client-side router updates the view, active tab highlights
4. User navigates between modes → navbar tab indicator follows, content area swaps
5. User visits /demo → the existing CubeNet demo renders as before

## Dependencies

**Requires:**

- cube-engine package (done)
- CubeNet/FaceGrid components (done, need to move from .astro pages to React routes)
- daisyUI rubiks theme (done, in globals.css)

**Enables:**

- Design system — Radix primitives and shared UI components in pure React (no Astro wrappers)
- All future features — built as React components without Astro constraints
- Future API routes — Hono can serve both the SPA and API endpoints

## What Must Exist (Backend)

**Hono server:**

- A Hono app that serves static files from the Vite build output
- A fallback route that serves `index.html` for all non-asset requests (SPA mode)
- Vite dev server integration via `@hono/vite-dev-server` for HMR in development

## What Must Exist (Frontend)

**Entry point:**

- An HTML template (`index.html`) at the project root with a `<div id="root">` mount point
- A React entry file that renders the app into the root element

**Routing:**

- A minimal client-side router (~20 lines) that reads `location.pathname` and renders the matching
  page component
- Route definitions for: Home (/), Solver (/solver), Coach (/coach), Timer (/timer)
- Navigation via `<a>` tags with `popstate` listener — no router library

**Pages:**

- Home page — placeholder with three mode cards (Solve / Learn / Train)
- Demo/cube page — the existing CubeDemo component (currently in demo.astro)
- Solver, Coach, Timer pages — empty placeholders for now

**Layout:**

- A root layout component replacing Main.astro with the definitive navigation and footer
- Navbar: "CubeMaster" brand + mode tabs (Solver / Coach / Timer) using daisyUI `navbar` + `tab`
  classes. Active tab highlighted with the mode's signature color (blue for Solver, green for Coach,
  red for Timer).
- Footer: daisyUI `footer` with copyleft icon + year + "CubeMaster", and the signature phrase "Built
  by Lgdweb with (heart icon) and lots of (coffee icon)." using lucide-react icons.
- Content area: `max-w-5xl` centered container with vertical padding

**Dependencies to add:**

- `hono`
- `@hono/vite-dev-server`
- `@hono/node-server` (for production Bun/Node serving)
- `lucide-react` (icons for footer: Copyleft, Heart, Coffee)

**Dependencies to remove:**

- `astro`
- `@astrojs/node`
- `@astrojs/react`
- `astro-eslint-parser`
- `eslint-plugin-astro`
- `prettier-plugin-astro` (root)

**Config changes:**

- Replace `astro.config.mjs` with `vite.config.ts`
- Remove `.astro` references from tsconfig, eslint, prettierignore
- Update build/dev/start scripts in package.json
- Update ESLint web config to remove Astro parser and plugin
- Update Dockerfile.web CMD to match new build output

## UI Reference

No visual change — the app should look identical after migration. Same rubiks theme, same CubeNet,
same layout structure.

## Open Questions

1. Should the Hono server handle SSR for the initial page load or serve a pure SPA (client-side
   rendering only)?
2. Should `vite-tsconfig-paths` stay in the Vite config or can Vite resolve `~/` aliases natively
   with the tsconfig?
3. Should the Dockerfile switch from the Astro entry.mjs to a Hono server entry?

## Out of Scope

- API routes (no backend logic yet)
- SSR/streaming (pure SPA for MVP)
- View Transitions API (deferred to Polish)
- Design system components (separate feature)

## Risks / Gotchas

- The ESLint shared web config (`packages/eslint-config/src/web.mjs`) imports `eslint-plugin-astro`
  and `astro-eslint-parser`. These must be removed from the shared config, which affects all
  consumers.
- The `prettier-plugin-astro` in the root package.json must also be removed.
- The current `bunfig.toml` test setup uses `happy-dom` which is framework-agnostic — it will work
  fine with Hono + React.
- The Dockerfile.web CMD currently runs `apps/web/dist/server/entry.mjs` (Astro output). After
  migration, this path will change to whatever Hono's build outputs.
- The `vite-tsconfig-paths` plugin currently in apps/web (for resolving cube-engine `~/` aliases)
  must be kept in the new Vite config.
