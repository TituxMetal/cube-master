# CubeMaster — Agent Map

## Mission

CubeMaster is a Rubik's Cube companion app built around **three modes that coexist and are built
together**: **Solver** (signature blue), **Coach** (signature green), and **Timer** (signature red).
This is a hard constraint — all three modes are first-class and ship together. Never make the user
"pick one," and never reintroduce scoping language that implies choosing among them. A previous
"MVP" framing caused exactly that failure.

- **Solver** — input any valid cube state, walk a step-by-step layer-by-layer solution move by move.
- **Coach** — progressive lessons beginner→advanced, live algorithm demos on the cube.
- **Timer** — speedcube timer, WCA-style scrambles, session history, Ao5/Ao12 stats.

`packages/cube-engine/` is the backbone: Coach demos algorithms through it, Timer reuses its
scramble generator. Touch the engine, touch the product.

---

## Read First

Before any non-trivial edit, read these in order:

1. [`docs/product.md`](docs/product.md) — three modes, capabilities, status (Solver and Timer
   shipped; Coach is the next major piece).
2. [`docs/architecture.md`](docs/architecture.md) — monorepo layout, stack rationale, cube-engine
   layering, dependency boundaries.
3. [`docs/frontend.md`](docs/frontend.md) — design system: dark "rubiks" theme, OKLch tokens, mode
   colors, Sora/Fira Code, daisyUI+Radix layering, CubeNet.
4. [`docs/git-workflow.md`](docs/git-workflow.md) — branching, conventional commits, PR rules,
   rebase-merge + sync.
5. [`docs/adr/`](docs/adr/) — why Hono, why no router library, why a standalone engine, dependency
   boundaries, fly.io deploy.

---

## Task Routing

| If you are working on…                            | Read first                                                                                                                               |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Any feature across the three modes                | [`docs/product.md`](docs/product.md) — modes, status, what ships together                                                                |
| `packages/cube-engine/`                           | [`docs/architecture.md`](docs/architecture.md) §Cube engine + §Dependency boundaries                                                     |
| `apps/web/src/features/*` or `pages/*`            | [`docs/architecture.md`](docs/architecture.md) §Dependency boundaries; [`docs/frontend.md`](docs/frontend.md)                            |
| `apps/web/src/components/ui/`, `layouts/`, `lib/` | Shared-layer rules in [`docs/architecture.md`](docs/architecture.md) — shared may import only shared                                     |
| `apps/web/src/server.ts` or `/health`             | [`docs/architecture.md`](docs/architecture.md) §Server; `/health` stays registered before the SPA catch-all                              |
| Branching, commits, PRs                           | [`docs/git-workflow.md`](docs/git-workflow.md)                                                                                           |
| CI / Docker / fly.io deploy                       | `.github/workflows/ci.yml`; `fly-web.toml`; [`docs/adr/0005-flyio-native-github-deploy.md`](docs/adr/0005-flyio-native-github-deploy.md) |
| A decision, a plan, or a fix to record            | [`docs/adr/`](docs/adr/) · [`docs/plans/`](docs/plans/) · [`docs/solutions/`](docs/solutions/)                                           |
| Superseded legacy docs                            | [`docs/_archive/`](docs/_archive/) — reference only, do not extend                                                                       |

**Before any non-trivial debug, build, or deploy task**, grep [`docs/solutions/`](docs/solutions/)
for prior art (`rg --type md "<symptom>" docs/solutions/`) and read any match before writing code.
Each entry is symptom → root cause → fix → prevention.

---

## Repo Map

```
cube-master/
  apps/web/src/
    main.tsx                React 19 entry point
    App.tsx                 Root component + client-router mount
    server.ts               Hono app — serves built SPA, /health, catch-all
    lib/                    Client router, stores, shared utilities
    layouts/                Navbar + footer shell
    pages/                  Home, Solver, Coach, Timer
    types/  styles/         Shared types; global styles + theme
    features/
      cube/                 Reactive cube state, CubeNet, FaceGrid — shared base
      solver/ timer/        Per-mode UI (coach/ lands when Coach is built)
  packages/
    cube-engine/src/        domain/ application/ infrastructure/ — pure TS engine
    eslint-config/          Shared ESLint config (all workspaces)
    ts-config/              Shared TypeScript config
  docs/                     product · architecture · frontend · git-workflow
    adr/ plans/ solutions/  Decisions · plan lifecycle · problem→fix log
    agents-md-standard.md   The checks this file commits to
    _archive/               Superseded docs — read-only
  .github/workflows/ci.yml  CI: format→lint→typecheck→test→build; GHCR push on main/develop
  fly-web.toml              fly.io deploy config (native GitHub integration)
  turbo.json                Turborepo task graph
```

---

## House Rules

**TypeScript strict everywhere.** No semicolons. **Arrow functions only** — the `function` keyword
is banned. **Named exports only** — no default exports. Test files use **`.spec.ts`** (not
`.test.ts`). Import alias **`~/`** maps to `apps/web/src/*`. Always **`bun run <script>`** — never
`npx` / `bunx`.

**Dependency boundaries** (enforced by `eslint-plugin-boundaries`):

- `shared` (`lib/`, `components/ui/`, `types/`, `utils/`, `layouts/`, `config/`) → imports only
  shared.
- `feature` (`features/*`) → imports shared + other features.
- `pages` (`pages/*`) → imports everything.

Crossing layers upward is a lint error, not a style preference. **`packages/cube-engine/`** is
framework-agnostic with zero framework dependencies — keep it that way; anything pulling in React or
Hono belongs in `apps/web/`. Nothing credential-bearing belongs in this repo.

---

## Verification

All four must be green before any commit (Husky enforces it locally):

```sh
bun run format:check   # Prettier
bun run lint:check     # ESLint + eslint-plugin-boundaries
bun run typecheck      # tsc --noEmit across all workspaces
bun run test           # Bun test, .spec.ts files, happy-dom for DOM
bun run build          # Turbo build — required before PR
```

Husky: pre-commit → lint-staged · commit-msg → commitlint · pre-push → typecheck + test + build. CI
runs the same sequence on every PR/push and pushes a Docker image to GHCR on `main`/`develop`.
Deploy fires via fly.io's native GitHub integration using `fly-web.toml`.

---

## Done

A change is done when:

- `format:check`, `lint:check`, `typecheck`, `test`, and `build` are all green.
- The commit passes commitlint (conventional commits; `bun run commit` for the interactive prompt).
- The PR targets `develop` (full word — not `dev`), rebased on latest, merged via rebase-merge on
  GitHub. Full details in [`docs/git-workflow.md`](docs/git-workflow.md).

---

## First-Time Setup

```sh
bun install
```

Project-scoped Claude Code plugins are declared in [`.claude/settings.json`](.claude/settings.json).
The configured marketplaces provide `heart-of-gold-toolkit` (deep-thought / marvin / babel-fish),
`cc-lab`, and `compound-engineering` — these auto-resolve on clone if the marketplaces are
reachable.

---

## Maintenance Triggers

Update this file when a new `docs/` file is created (add it to Read First or Task Routing), when the
`eslint-plugin-boundaries` rules change, or when a mode is added or its signature color changes. The
checks this file commits to live in [`docs/agents-md-standard.md`](docs/agents-md-standard.md).
