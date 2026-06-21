# 0006 — Algorithm catalog in the engine's domain layer

**Status:** Accepted **Date:** 2026-06-12 (amended 2026-06-13)

## Context

Named algorithms are data two modes depend on. The solver's BFS (`solveYellowCorners`) already
searches over sequences of algorithms to finish the last layer, and Coach must expose the same
algorithms as lessons with live demos. Without a single shared catalog, each consumer would carry
its own copy of the moves and the two would drift — the solver executing one thing, Coach teaching
another.

The original (Proposed) decision required every entry to serve "the BFS and Coach at once." A code
audit while planning Coach v1 disproved that premise: `LINE_ALG`/`L_ALG` are consumed only by
`solveYellowCross`, the sexy move only by `solveWhiteCorners`, the second-layer inserts only by
`solveSecondLayer` — none by the BFS. Under the strict "both consumers at once" bar, beginner
lessons 1–4 would have no entry to point at, defeating the catalog's purpose.

## Decision

The algorithm catalog lives in **`packages/cube-engine/src/domain/`** — algorithms are first-class
data, not an implementation detail of any one consumer. It holds the **canonical form of each named
algorithm**: `{ id, name, moves, method, description }`, addressable by stable id via
`getAlgorithm(id)` (returns `undefined` for unknown ids, never throws).

**Amended consumer bar.** Consumers are the **five solver phases (BFS included) and Coach**. Each
entry must serve **≥1** consumer and stay both machine-executable and teachable. Positional variants
inside solver phases (per-target inserts, extraction tables, D-rotation derivations) remain **local
derivations** — they are solver mechanics, not named teachable algorithms, and are not promoted.

Two phase structures coexist over the same catalog: the **5 phases** are the structure of the
solver; the **7 phases** are the structure of the pedagogical journey — an ordering of lessons that
points into the catalog. Two views, one source of truth.

## Consequences

- **Easier:** beginner lessons 1–4 have real catalog targets; promotion is extraction, not
  authoring. Lesson content is pure TypeScript data, testable in isolation like the rest of the
  domain layer. Reordering the pedagogical journey touches only the 7-phase view, never the catalog.
- **No drift — enforced, not trusted.** Where the solver consumes an entry it reads the _same_
  catalog value (structural identity). Where it keeps a local literal (the table-shaped uses), a
  parity spec (`application/solver/catalog-parity.spec.ts`) deep-equals the catalog entry against
  the live solver constant — any divergence reddens CI. See the Coach v1 plan, Decision D5.
- **Harder / accepted:** pedagogical prose lives inside a framework-agnostic package, so wording
  changes go through the engine. An entry must still be machine-executable _and_ teachable, a higher
  bar than a plain constant.
- **Expires when:** a third consumer appears (e.g. a Hono API serving lessons), or growth toward
  full OLL/PLL — that many algorithms stacked into a TS array may no longer hold up (see plan
  Follow-Up F3).

## Roster note — 2026-06-15 (Coach design + wording, F4/F5)

Two more entries were promoted to complete the beginner journey's "demo = solver executes"
guarantee, both parity-pinned to their live solver constants (no drift):

- **`white-cross-flip`** (`D R F′ R′`) — extracted from `FLIPPED_INSERT['UF']` in
  `solveWhiteCross.ts` to `FLIPPED_EDGE_INSERT`; gives White Cross a real demo + practice for the
  misoriented-edge case (D-WHITECROSS).
- **`ua-perm`** (`R D R′ D R D2 R′ D` = `[...SUNE, 'D']`) — extracted from the inline spread in
  `solveYellowCorners.ts` to `UA_PERM`; the last-layer edge cycle the "Finir" chapter teaches
  (D-CATALOG-FINISH).

This stays within the amended consumer bar (each serves ≥1 solver phase and is teachable); the
expiry trigger is unchanged — OLL/PLL scaling, not these two extractions.

## Roster note — 2026-06-21 (Coach second-layer, four-slot teaching)

Coach's second-layer chapter now teaches the insert as **four named gestures, one per slot** —
front-right, front-left, back-right, back-left — so a learner who recognises their case can run the
right short gesture directly (live-review feedback: the demos must _show_ the back-face inserts the
practice uses, not just the two front ones). Three more inserts were promoted, parity-pinned to live
`solveSecondLayer` constants (`SECOND_LAYER_INSERT_FRONT_LEFT` / `_BACK_RIGHT` / `_BACK_LEFT`):

- **`second-layer-insert-front-left`** (`D L D′ L′ D′ F′ D F`) — the mirror of the right insert.
- **`second-layer-insert-back-right`** (`D R D′ R′ D′ B′ D B`) — back-right slot, via the back face.
- **`second-layer-insert-back-left`** (`D′ L′ D L D B D′ B′`) — back-left slot, via the back face.

These were previously "local positional variants" of `solveSecondLayer`'s `TARGETS`. They cross the
catalog bar now because Coach teaches them as gestures (each ≤8 moves, top layer intact). This is a
deliberate, bounded exception to "positional variants stay local" — the four second-layer slots are
the named vocabulary the chapter teaches, not internal solver mechanics. The expiry trigger is
unchanged — OLL/PLL scaling, not these promotions.

## Alternatives considered

- **Keep the strict "both consumers at once" bar** with inline move sequences in lessons 1–4 —
  rejected: reintroduces the exact solver/Coach drift the catalog exists to prevent.
- **Full solver refactor** (every phase consumes the catalog, including positional tables) —
  rejected for v1: widens a Coach release into solver internals (TARGETS/EXTRACT rewrites) and risks
  regressing shipped behavior for zero v1 user value. The parity spec gives no-drift teeth without
  it. Convergence stays an optional post-v1 tidy (plan Follow-Up F2).
