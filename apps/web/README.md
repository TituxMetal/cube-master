# CubeMaster Web

CubeMaster web application built with Astro + React.

## Scripts

```bash
bun run --cwd apps/web dev          # Start dev server
bun run --cwd apps/web build        # Build for production
bun run --cwd apps/web test         # Run tests
bun run --cwd apps/web typecheck    # Type check
bun run --cwd apps/web lint:check   # Lint check
```

## Structure

```text
src/
  pages/              File-based routing
  features/cube/      Cube UI components
  components/ui/      Shared UI primitives
  layouts/            Page layouts
  styles/             Global styles
```
