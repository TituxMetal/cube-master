# 0009 — Coach teaching solver is a separate engine module, not a Solver extension

**Status:** Accepted **Date:** 2026-06-21

## Context

Coach must teach a complete beginner to solve the cube _intuitively_: for each piece, show **where
it goes** (placement) and **one gesture** to seat it (a trigger and its mirror), in a fixed white-up
/ green-front frame with **no cube rotation**. The shipped Solver (`application/solver/`) cannot
serve this: its phases emit the shortest machine sequence (`solveYellowCorners` is an opaque BFS
that yields one combined last-layer block), so there is no clean intermediate state to teach
against, and its per-target positional variants are solver mechanics, not teachable gestures.

Two ways to get the teaching sequences were on the table:

1. Extend the Solver phases to also emit annotated, placement-aware, rotation-free steps.
2. Add a **separate** pure module that composes the same catalog blocks deterministically into
   `setup`(U/D) + `trigger` segments.

The forces: keep Solver mode untouched (a hard product constraint — "don't touch Solver"); keep the
engine framework-agnostic (ADR-0003); avoid drift between what the Solver executes and what Coach
teaches (ADR-0006 already guards the _algorithm_ values via parity specs, but not the _sequencing_).

## Decision

The Coach teaching logic lives in **`packages/cube-engine/src/application/teaching/`**, a pure
application module **sibling to `solver/`**, and the boundary between the two is fixed:

- **Teaching imports nothing from `solver/`.** It may import `domain/` (cube state, moves,
  `catalog.ts`) and the **exported, parity-pinned algorithm constants**, but not solver phase files.
  It is the only place that knows the pedagogical _sequencing_ (placement-then-trigger, per piece).
- **`solver/` never imports `teaching/`.** Solver mode is unchanged; it keeps emitting shortest
  machine sequences.
- **Teaching is deterministic, not a second BFS over the whole solve.** Each planner
  (`planWhiteCorners`, `planSecondLayer`, `planYellowCross`, `planOrientLastCorners`,
  `planPlaceLastCorners`, `planPermuteLastEdges`) chains catalog blocks and bounded local search to
  reach a named milestone, returning a `TeachingPlan` of `setup`/`trigger` segments grouped per
  piece. It is the **source of truth for the new last-layer milestones** (`yellow-corners-oriented`,
  `yellow-corners-placed`), which the Solver's combined BFS cannot expose.
- **Shared algorithm values stay single-sourced.** Every `trigger` segment names a `catalog.ts` id;
  promoted entries (`sexy-move-mirror`, the corner-safe `edge-3-cycle`) are parity-pinned to their
  live source constants exactly as ADR-0006 requires. Teaching may pick a _different_ block than the
  Solver where the frame demands it (Ch7 uses the corner-safe `edge-3-cycle`, not the Solver's
  `ua-perm = sune + D`, which is not a standalone edge cycle — see the TS-0 feasibility solution).

The web layer consumes teaching output as a **pure function via a Coach store computed**, never via
solver atoms — preserving `eslint-plugin-boundaries` layering.

## Consequences

- **Easier:** Solver mode is provably untouched; teaching is unit-testable in pure TS against the
  engine (every planner has a spec asserting it lands on its milestone and disturbs nothing it
  shouldn't); the React layer stays thin (one computed). New pedagogical milestones have a real
  home.
- **No drift — enforced, not trusted.** Algorithm _values_ are guarded by ADR-0006 parity specs;
  teaching _sequencing_ is guarded by the planner milestone specs and the `teachingSweep` spec over
  many scrambles. The lessons integrity spec forbids inline `MoveToken[]` in lesson data (NFR-004).
- **Harder / accepted:** two sequencers now exist over one catalog (Solver's BFS for machine solves,
  teaching's deterministic planners for pedagogy). This is deliberate: they optimize for different
  goals (shortest vs teachable) and must not be collapsed. A change to a shared block must keep both
  green.
- **Expires when:** a future need makes the Solver itself teach (unlikely), or the two sequencers
  are proven to converge on identical output for every chapter — at which point one could be
  dropped.

## Alternatives considered

- **Extend the Solver phases to emit teaching steps** — rejected: lengthens and complicates Solver
  mode (the explicit "don't touch Solver" constraint), and its BFS phases have no clean intermediate
  states to teach against. The separate-module boundary gives isolation the in-place approach can't.
- **Put the teaching solver under `features/coach/`** — rejected: it is pure cube logic (state →
  annotated sequence) with zero framework deps, so it belongs in the framework-agnostic engine
  (ADR-0003); living there keeps it unit-testable and lets it parity-pin against catalog constants,
  instead of scattering cube logic into the React layer.
