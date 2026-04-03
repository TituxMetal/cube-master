# CubeMaster

A Rubik's Cube companion app combining three modes: **Solver** (input cube state, get step-by-step
solution), **Coach** (learn solving methods from beginner to advanced), and **Timer** (speedcube
timer with scrambles and stats).

## Tech Stack

| Layer            | Technology          |
| ---------------- | ------------------- |
| Runtime          | Bun                 |
| Monorepo         | Turborepo           |
| Build            | Vite                |
| Server           | Hono                |
| UI               | React 19            |
| Styling          | Tailwind CSS v4     |
| UI Components    | Radix UI + daisyUI  |
| State Management | Nanostores          |
| Testing          | Bun test            |
| Language         | TypeScript (strict) |

See [docs/tech-stack.md](docs/tech-stack.md) for detailed rationale.

## Prerequisites

- [Bun](https://bun.sh/) `>=1.2.0`
- Git

## Getting Started

```bash
bun install
bun run dev
```

## Project Structure

```text
apps/
  web/                    Hono server + React UI
packages/
  cube-engine/            Pure TypeScript Rubik's Cube 3x3 engine
  eslint-config/          Shared ESLint configuration
  ts-config/              Shared TypeScript configuration
docs/
  MVP.md                  MVP scope and features
  tech-stack.md           Technology choices and rationale
  frontend-design.md      Design system and UI conventions
```

## Scripts

```bash
bun run dev              # Start all apps in development mode
bun run build            # Build all applications
bun run test             # Run all tests
bun run typecheck        # Type check all TypeScript
bun run lint:check       # Lint check
bun run format:check     # Format check
bun run clean            # Clean build artifacts
bun run reset            # Clean and reinstall dependencies
```

## Documentation

- [MVP Definition](docs/MVP.md)
- [Tech Stack](docs/tech-stack.md)
- [Frontend Design](docs/frontend-design.md)

## License

[MIT](LICENSE)

## Author

**Titux Metal**
