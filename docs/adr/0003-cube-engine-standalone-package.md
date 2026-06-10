# 0003 — Cube engine as a standalone framework-agnostic package

**Status:** Accepted **Date:** 2026-04-03

## Context

The Rubik's cube logic — state model, the 18 face moves, scramble generation, validation, and the
layer-by-layer solver — is the heart of the product and the single largest piece of logic in it. All
three modes depend on it: Solver computes solutions, Coach demos algorithms through it, Timer reuses
its scramble generator. If this logic were entangled with React or the app's DOM, it would be hard
to test and impossible to reuse elsewhere.

## Decision

Keep the engine in **`packages/cube-engine/`** as **pure TypeScript with zero framework
dependencies**, layered:

```text
domain/           Constants, guards, pieces, state, geometry, moves
application/      Use cases (createSolvedState, applyMoves, generateScramble, solveCube, …)
infrastructure/   Adapters (toStickers, the Random contract)
```

Randomness enters through an injectable `Random` contract so scrambles and solves are deterministic
in tests.

## Consequences

- **Easier:** the engine is unit-testable in isolation (no DOM), reusable across all modes, and
  portable to a CLI or server. Orientation conventions and solver phases are verified independently
  and in sequence.
- **Harder / accepted:** a workspace boundary to maintain and a public surface (exported types and
  use cases) to keep stable for `apps/web`. The discipline of "no framework imports here" must be
  held deliberately.
