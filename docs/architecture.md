# CubeMaster — Architecture

A monorepo Rubik's Cube companion app. The stack prioritizes **simplicity**, **progressive
enhancement**, and **framework minimalism** — the smallest set of tools that does the job and can
grow without a rewrite.

## Stack

| Layer            | Technology            | Why                                                       |
| ---------------- | --------------------- | --------------------------------------------------------- |
| Runtime + PM     | Bun                   | Fast, native TS, workspace support, one tool              |
| Monorepo         | Turborepo             | Task orchestration + caching                              |
| Build            | Vite                  | HMR, fast builds                                          |
| Server           | Hono                  | Lightweight, Bun-native, progressive (SPA now, API later) |
| UI               | React 19              | Component model, ecosystem                                |
| Styling          | Tailwind CSS v4       | Utility-first, Vite plugin                                |
| UI primitives    | Radix UI              | Accessible, unstyled behavior                             |
| UI theme         | daisyUI               | Component classes + design tokens                         |
| State            | Nanostores            | Tiny, framework-agnostic                                  |
| Forms / validate | React Hook Form + Zod | Performant forms, schema validation                       |
| Testing          | Bun test              | Built-in, zero config, native tsconfig paths              |
| Language         | TypeScript (strict)   | Type safety across all layers                             |

Decisions with lasting consequences are recorded as ADRs — see [adr/](adr/).

## Workspaces

```text
apps/
  web/                  Hono server + React 19 SPA
packages/
  cube-engine/          Pure TypeScript Rubik's engine (framework-agnostic)
  eslint-config/        Shared ESLint configuration
  ts-config/            Shared TypeScript configuration
```

## Cube engine (`packages/cube-engine/`)

Pure TypeScript, zero framework dependencies — testable in isolation, reusable across all three
modes, usable from a CLI or server if ever needed. Layered:

```text
packages/cube-engine/src/
  domain/           Constants, guards, pieces, state, geometry, moves
  application/      Use cases (createSolvedState, applyMoves, generateScramble, solveCube, …)
  infrastructure/   Adapters (toStickers, the Random contract)
```

The Solver engine is the backbone of the product: Coach demos algorithms through it, Timer reuses
its scramble generator.

## Web app (`apps/web/`)

```text
apps/web/src/
  server.ts           Hono app — serves the built SPA, exposes /health, SPA catch-all
  client.tsx          React entry point
  components/ui/       Shared UI primitives (Radix wrappers styled with daisyUI)
  layouts/            Page layouts (navbar + footer shell)
  lib/                Shared utilities (router, stores, …)
  config/             App configuration
  types/  utils/      Shared types and helpers
  pages/              Page-level components (Home, Solver, Coach, Timer)
  features/
    cube/             Reactive cube UI (CubeNet, FaceGrid, controls) — shared base
    solver/  coach/  timer/   Per-mode components / utils / lib
```

### Routing — no client-side router library

Only four routes (`/`, `/solver`, `/coach`, `/timer`). A ~20-line client router reads
`location.pathname` and renders the matching page; navigation uses `<a>` tags + a `popstate`
listener. See [adr/0002-no-client-side-router.md](adr/0002-no-client-side-router.md).

### Server — Hono

Hono serves the built React SPA and is ready to grow API routes without a second service. `/health`
is registered **before** the SPA catch-all (a `.spec.ts` guards the ordering). See
[adr/0001-hono-over-astro.md](adr/0001-hono-over-astro.md).

## Dependency boundaries

Enforced by `eslint-plugin-boundaries`:

- **shared** (`src/lib`, `src/components/ui`, `src/types`, `src/utils`, `src/layouts`, `src/config`)
  → may import only from shared
- **feature** (`src/features/*`) → may import from shared + other features
- **pages** (`src/pages/*`) → may import from everything

See [adr/0004-layered-dependency-boundaries.md](adr/0004-layered-dependency-boundaries.md).

## Code conventions

Strict, enforced by lint + commit hooks (see [git-workflow.md](git-workflow.md)):

- Always `bun run <script>` — never `npx` / `bunx`
- No semicolons · arrow functions only (no `function` keyword) · named exports only
- Test files use `.spec.ts` (Bun test, happy-dom for DOM)
- `~/` import alias for `apps/web/src/*`
- TypeScript strict

## Build, test, deploy

- `bun run build` (turbo) · `bun run test` · `bun run typecheck` · `bun run lint:check` ·
  `bun run format:check`
- CI: `.github/workflows/ci.yml` validates then pushes Docker images to GHCR on main/develop
- Deploy: fly.io via native GitHub integration, config path `fly-web.toml` →
  [adr/0005-flyio-native-github-deploy.md](adr/0005-flyio-native-github-deploy.md)
