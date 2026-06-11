# 0006 — Algorithm catalog in the engine's domain layer

**Status:** Proposed **Date:** 2026-06-12

## Context

Named algorithms are data two modes depend on. The solver's BFS (`solveYellowCorners`) already
searches over sequences of algorithms to finish the last layer, and Coach must expose the same
algorithms as lessons with live demos. Without a single shared catalog, each consumer would carry
its own copy of the moves and the two would drift — the solver executing one thing, Coach teaching
another.

## Decision

The algorithm catalog lives in **`packages/cube-engine/src/domain/`** — algorithms are first-class
data, not an implementation detail of any one consumer. Two consumers read it: the solver's BFS
consumes it, Coach exposes it as lessons.

Each catalog entry contains at minimum:

- its name
- its moves
- its pedagogical description
- the case it handles
- the method used (beginner, intermediate, advanced)
- the teaching phase it belongs to

Two phase structures coexist over the same catalog: the **5 phases** are the structure of the
solver; the **7 phases** are the structure of a pedagogical journey — an ordering of lessons that
points into the catalog. Two views, one source of truth.

## Consequences

- **Easier:** the solver and Coach can never drift — both read the same entries. Lesson content is
  pure TypeScript data, testable in isolation like the rest of the domain layer, and reordering the
  pedagogical journey touches only the 7-phase view, never the catalog itself.
- **Harder / accepted:** pedagogical prose lives inside a framework-agnostic package, so wording
  changes go through the engine. Every entry must serve both consumers at once — machine-executable
  for the BFS, teachable for Coach — which sets a higher bar for adding one.
- **Expires when:** a third consumer appears (e.g. the Hono API serving lessons), or growth toward
  full OLL/PLL — that many algorithms stacked into a TS array may no longer hold up.
