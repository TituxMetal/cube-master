# CubeMaster — Tech Stack

## Overview

CubeMaster is a monorepo Rubik's Cube companion app with three modes (Solver, Coach, Timer). The
stack prioritizes **simplicity**, **progressive enhancement**, and **framework minimalism**.

## Core Stack

| Layer            | Technology          | Rationale                                                     |
| ---------------- | ------------------- | ------------------------------------------------------------- |
| Runtime          | Bun                 | Fast, native TS support, already used as package manager      |
| Package Manager  | Bun                 | Workspace support, fast installs, lockfile already in place   |
| Monorepo         | Turborepo           | Task orchestration, caching, already configured               |
| Build            | Vite                | HMR, fast builds, ecosystem plugins                           |
| Server           | Hono                | Lightweight, Bun-native, progressive (SPA now, SSR/API later) |
| UI               | React 19            | Component model, hydration support, ecosystem                 |
| Styling          | Tailwind CSS v4     | Utility-first, v4 with Vite plugin                            |
| UI Components    | Radix UI            | Accessible, unstyled primitives (dialog, dropdown, etc.)      |
| UI Theme         | daisyUI             | Tailwind component classes, consistent design tokens          |
| State Management | Nanostores          | Tiny, framework-agnostic, already used in reference prototype |
| Forms            | React Hook Form     | Performant form handling, uncontrolled by default             |
| Validation       | Zod                 | Schema validation, integrates with React Hook Form            |
| Testing          | Bun test            | Built-in, zero config, fast, native tsconfig paths resolution |
| Language         | TypeScript (strict) | Type safety across all layers                                 |

## Server: Why Hono

The MVP has no backend requirements (no database, no auth, no API). But the app needs a server to:

- Serve the built React app in production
- Provide a clean dev experience with Vite integration (`@hono/vite-dev-server`)
- Be ready to add API routes later (coach lessons, timer persistence) without introducing a second
  service

Hono fits because:

- **Lightweight**: no framework overhead (unlike NestJS or Express)
- **Bun-native**: runs directly on Bun with zero adapter cost
- **Progressive**: starts as a static file server, grows into an API server when needed
- **Vite integration**: `@hono/vite-dev-server` gives HMR in dev, same as a pure Vite setup

### What Hono replaces

- **Astro**: the sample-project template used Astro, but CubeMaster doesn't need SSG/SSR islands —
  it's an interactive tool app
- **NestJS**: the sample-project API is overkill — no database, no auth, no REST resources needed

## Routing: No Client-Side Router

With only 4 routes (`/`, `/solver`, `/coach`, `/timer`), a client-side router library is
unnecessary.

**Approach: SPA served by Hono**

- Hono serves `index.html` for all routes (SPA fallback)
- A minimal client-side router (~20 lines) reads `location.pathname` and renders the matching page
- Navigation uses `<a>` tags + `popstate` listener — no library needed
- View Transitions API can be used for smooth page transitions

**Why not React Router / TanStack Router:**

- 4 routes don't justify a routing library and its abstractions
- Avoids coupling to router-specific patterns (loaders, outlets, etc.)
- Keeps the dependency count minimal

**Future option:** if routing needs grow (nested routes, params, guards), TanStack Router or Hono
SSR with server-side routing can be evaluated then.

## Cube Engine: Standalone Package

The cube engine is **pure TypeScript** with zero framework dependencies. It lives in
`packages/cube-engine/` and is imported by `apps/web/`.

```text
packages/cube-engine/
  src/
    domain/           Constants, guards, pieces, state, geometry, moves
    application/      Use-cases (createSolvedState, applyMoves, ...)
    infrastructure/   Adapters (toStickers, random contract)
```

This separation ensures the engine remains:

- **Testable** in isolation (Vitest, no DOM needed)
- **Reusable** across modes (Solver, Coach, Timer all import from it)
- **Framework-agnostic** (could be used in a CLI, a server, or another UI)

## App Architecture

```text
apps/web/
  src/
    server.tsx          Hono app (serves SPA, future API routes)
    client.tsx          React entry point (hydration/render)
    components/ui/      Shared UI primitives (buttons, inputs, etc.)
    layouts/            Page layouts
    lib/                Shared utilities (router, stores, etc.)
    config/             App configuration
    types/              Shared TypeScript types
    utils/              Shared utility functions
    pages/              Page-level components (Home, Solver, Coach, Timer)
    features/
      cube/             Cube UI (CubeNet, FaceGrid, controls)
      solver/           Solver-specific (components/, utils/, lib/)
      coach/            Coach-specific (components/, utils/, lib/)
      timer/            Timer-specific (components/, utils/, lib/)
```

Dependency rules enforced by `eslint-plugin-boundaries`:

- **shared** (`src/lib`, `src/components/ui`, `src/types`, `src/utils`, `src/layouts`, `src/config`)
  → can only import from shared
- **feature** (`src/features/*`) → can import from shared + other features
- **pages** (`src/pages/*`) → can import from everything

## What's NOT in the Stack

| Technology   | Why not                                                            |
| ------------ | ------------------------------------------------------------------ |
| NestJS       | No REST API needed for MVP, Hono covers future needs               |
| Astro        | Not needed — CubeMaster is an interactive tool, not a content site |
| React Router | 4 routes don't justify a routing library                           |
| better-auth  | No user accounts in MVP                                            |
| Prisma       | No database in MVP                                                 |
| 3D libraries | No 3D visualization in MVP                                         |

## Dependencies to Add

| Package                 | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `hono`                  | Server framework                         |
| `@hono/vite-dev-server` | Vite integration for dev                 |
| `@hono/node-server`     | Node/Bun HTTP adapter (if needed)        |
| `@radix-ui/*`           | Accessible unstyled UI primitives        |
| `daisyui`               | Tailwind component classes, design theme |

## Git Workflow

### Branching

```text
main ← develop ← feature/*, fix/*, hotfix/*
```

- **`main`** — production-ready code, always stable
- **`develop`** — integration branch, receives completed features
- **`feature/*`** — one branch per feature (`feature/timer-mode`, `feature/cube-visualization`)
- **`fix/*`** — bug fixes (`fix/sticker-mapping-orientation`)
- **`hotfix/*`** — urgent fixes applied directly to main (`hotfix/timer-crash`)

**Naming rules:**

- Always use full words, never abbreviations: `feature` not `feat`, `fix` not `fx`
- Use kebab-case after the prefix: `feature/solver-step-navigation`
- Be descriptive: `feature/coach-lesson-browser` not `feature/coach`

### Commits

- **Conventional commits**: `type(scope): description`
- **Types** (enforced by `@commitlint/config-conventional`): `feat`, `fix`, `refactor`, `test`,
  `docs`, `style`, `chore`, `build`, `ci`, `perf`, `revert`
- **Atomic**: one logical change per commit
- **Description**: concise, imperative mood ("add timer component" not "added timer component")
- Run all checks before committing: `bun run test`, `bun run typecheck`, `bun run lint:check`,
  `bun run format:check`

**Important:** `feat` is a commit type imposed by commitlint — it does NOT mean PRs and branch names
should use `feat`. PRs and branches always use full words (`feature`, not `feat`).

### Pull Requests

- **Required** for merging: `feature/*` → `develop`, `develop` → `main`
- **Always assign** the PR to the author (assignee)
- **Always use labels** — create them if they don't exist. Examples:
  - `feature`, `fix`, `refactor`, `documentation`
  - `cube-engine`, `solver`, `coach`, `timer` (scope labels)
  - `ready-for-review`, `work-in-progress`
- **Title**: always use full words, no abbreviations — `feature` not `feat`, even if the commit says
  `feat`. The PR title is human-facing, not a commit message.
- **Description**: summary of changes + test plan

### Merging and Sync

- **Rebase merge only** — keep every commit in the history, no squash
- Merge and branch deletion are always done **manually on GitHub** by the developer
- After merging on GitHub, Claude handles the local sync when asked:
  1. Fetch and prune remote branches (`git fetch --prune`)
  2. Clean up the local branch that was deleted on GitHub
  3. Checkout `develop` (or `main` if the merge target was `main`)
  4. Pull latest changes

### History

- Keep it clean and readable
- Linear history via rebase (not merge commits)
- Every commit stays in the log — no squashing

## Dependencies to Remove (from template)

| Package          | Reason            |
| ---------------- | ----------------- |
| `astro`          | Replaced by Hono  |
| `@astrojs/node`  | Astro adapter     |
| `@astrojs/react` | Astro integration |
| `astro-icon`     | Astro-specific    |
| `better-auth`    | No auth in MVP    |
