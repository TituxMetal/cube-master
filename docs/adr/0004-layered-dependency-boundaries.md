# 0004 — Layered dependency boundaries

**Status:** Accepted **Date:** 2026-04-03

## Context

As the three modes grow, the web app's internal modules risk tangling — a shared utility importing a
feature, two features reaching into each other's internals, pages and features becoming
indistinguishable. Without an enforced rule, "just import it" erodes the structure until nothing is
safely movable.

## Decision

Enforce import direction with **`eslint-plugin-boundaries`**, three layers:

- **shared** (`src/lib`, `src/components/ui`, `src/types`, `src/utils`, `src/layouts`, `src/config`)
  → may import only from shared
- **feature** (`src/features/*`) → may import from shared + other features
- **pages** (`src/pages/*`) → may import from everything

## Consequences

- **Easier:** shared code stays genuinely shared (no upward deps), features compose without becoming
  a tangle, and pages are the only place everything comes together. Violations fail lint, so the
  structure is guarded on every commit.
- **Harder / accepted:** new modules must be placed in the right layer up front; occasionally a util
  has to be promoted or a boundary reconsidered deliberately rather than bypassed.
