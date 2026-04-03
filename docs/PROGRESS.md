# CubeMaster — Progress

## Build Order

- [x] **Project bootstrap** — Monorepo scaffolding, cube-engine package, demo page
- [ ] **Design system** — DaisyUI rubiks theme, Radix primitives, Sora + Fira Code fonts
- [ ] **Cube visualization** — CubeNet bound to real state, interactive controls, scramble/reset
- [ ] **Timer mode** — Scramble generator, timer, session history, statistics (Ao5/Ao12)
- [ ] **Solver mode** — Cube input UI, layer-by-layer solver, step-by-step navigation
- [ ] **Coach mode** — Lesson browser, beginner content, algorithm demos, practice mode
- [ ] **Polish** — Responsive pass, keyboard shortcuts, animations, error handling

## Current Feature: 01 — Hono Migration

### Phase 1: Remove Astro from Shared Configs

- [x] Clean packages/eslint-config (remove Astro parser and plugin)
- [x] Clean root package.json (remove prettier-plugin-astro)
- [x] Verify shared config still works

### Phase 2: Replace Astro with Hono + Vite

- [x] Remove Astro dependencies, add Hono + lucide-react
- [x] Update scripts (dev, build, start)
- [x] Delete Astro files (config, layouts, pages)
- [x] Create Vite config
- [x] Create HTML entry point + React entry point
- [x] Create Hono production server
- [x] Update TypeScript and ESLint configs
- [x] Verify all checks pass

### Phase 3: Client-Side Router

- [x] Create router component
- [x] Create route definitions
- [x] Tests for router

### Phase 4: Layout with Navbar and Footer

- [x] Create Layout component (navbar with mode tabs + signature footer)
- [x] Wire Layout into App
- [x] Tests for Layout

### Phase 5: Pages

- [x] Home page with mode cards
- [x] Placeholder pages (Solver, Coach, Timer)
- [x] CubeDemo on home page
- [x] Tests for pages

### Phase 6: Docker and Cleanup

- [x] Update Dockerfile.web CMD
- [x] Final cleanup (no .astro references remain)
- [x] Full verification (format, lint, typecheck, test, build)
