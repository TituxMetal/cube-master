# CubeMaster Web

CubeMaster web application built with Hono + React + Vite.

## Scripts

```bash
bun run --cwd apps/web dev          # Start dev server
bun run --cwd apps/web build        # Build for production
bun run --cwd apps/web start        # Start production server
bun run --cwd apps/web test         # Run tests
bun run --cwd apps/web typecheck    # Type check
bun run --cwd apps/web lint:check   # Lint check
```

## Structure

```text
src/
  pages/              Page components
  features/cube/      Cube UI components
  layouts/            Page layouts
  lib/                Utilities (router)
  styles/             Global styles
  server.ts           Hono production server
```
