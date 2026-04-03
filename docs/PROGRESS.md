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

- [ ] Clean packages/eslint-config (remove Astro parser and plugin)
- [ ] Clean root package.json (remove prettier-plugin-astro)
- [ ] Verify shared config still works

### Phase 2: Replace Astro with Hono + Vite

- [ ] Remove Astro dependencies, add Hono + lucide-react
- [ ] Update scripts (dev, build, start)
- [ ] Delete Astro files (config, layouts, pages)
- [ ] Create Vite config
- [ ] Create HTML entry point + React entry point
- [ ] Create Hono production server
- [ ] Update TypeScript and ESLint configs
- [ ] Verify all checks pass

### Phase 3: Client-Side Router

- [ ] Create router component
- [ ] Create route definitions
- [ ] Tests for router

### Phase 4: Layout with Navbar and Footer

- [ ] Create Layout component (navbar with mode tabs + signature footer)
- [ ] Wire Layout into App
- [ ] Tests for Layout

### Phase 5: Pages

- [ ] Home page with mode cards
- [ ] Placeholder pages (Solver, Coach, Timer)
- [ ] CubeDemo on home page
- [ ] Tests for pages

### Phase 6: Docker and Cleanup

- [ ] Update Dockerfile.web CMD
- [ ] Final cleanup (no .astro references remain)
- [ ] Full verification (format, lint, typecheck, test, build)
