# Teaching solver — no-rotation feasibility (TS-0 spike)

**Date:** 2026-06-20 **Area:** engine / coach

## Symptom

The Coach pedagogy rework (plan `2026-06-20-feat-coach-placement-pedagogy-plan.md`) bets the whole
chapter model on a **teaching solver** that emits _intuitive placement (U/D) + one trigger (sexy
move & its mirror)_ with **no cube rotation** (the fixed white-up / green-front frame, no `x/y/z`).
Two assumptions were **unverified** and gated all chapter authoring behind spike **TS-0**:

1. White corners (Ch2) are reachable with **one gesture + mirror + U/D placement, no rotation**.
2. The last layer (Ch5-7) is sequenceable into **clean placement + trigger steps without rotation**,
   yielding real intermediate milestones (`yellow-corners-oriented`, `yellow-corners-placed`).

If either failed, the plan would have to re-scope (keep 5-7 on the current opaque-BFS model).

## Root cause / findings

A throwaway spike (`packages/cube-engine/src/spike-ts0.ts`, since deleted) built milestones the same
way `illustrative.ts` does (scramble → `solveCube` → replay phases) and tested candidate planners
against the engine over 20-30 random scrambles. Findings:

1. **Ch2 white corners — FEASIBLE.** A greedy planner using **only** `{U, U', U2, D, D', D2}` +
   `SEXY = R' D' R D` (right, works `UFR` from `DFR`) + `MIRROR = L D L' D'` (left, works `ULF` from
   `DLF`) reached the `white-corners` milestone with the cross intact on **30/30** scrambles, zero
   rotation tokens. The geometric key: **`R' D' R D` never touches `UF`/`UB`/`UL` (off the R face)
   and returns `UR` to itself every application**, so a single sexy move preserves the entire white
   cross — and it only disturbs `UFR`/`URB` among U-corners (the mirror only `ULF`/`UBL`). So
   _U-setup → trigger-repeated-until-seated → U-undo_ preserves every already-placed piece, as long
   as the working slot's back-neighbour (`URB` for right, `UBL` for left) doesn't hold a solved
   corner — which the planner avoids by choosing the right vs left trigger. Plan length was loose
   (≤71 moves) because the spike planner is naïve; the production `planWhiteCorners` will be
   tighter.

2. **Ch5/Ch6 corners — FEASIBLE with clean intermediates.** A bounded BFS over
   `{D-rotation + block}` reached, on **20/20** scrambles:
   - `yellow-corners-oriented` (full yellow face) from `yellow-cross` using only
     `SUNE`/`ANTI_SUNE` + `D` — **cross kept 20/20**.
   - `yellow-corners-placed` (corners home **and** still oriented) using only `corner-3-cycle` + `D`
     — **orientation kept 20/20**. `corner-3-cycle` is **edge-safe** (touches no D edge) on the
     solved cube, so it composes cleanly. Orient-then-place (the plan's Ch5→Ch6 naming) is
     geometrically sound; no reorder needed.

3. **Ch7 edges — the one real gap, now closed.** The catalog's **`ua-perm` (= `sune + D`) is NOT a
   corner-safe edge 3-cycle** — on a solved cube it disturbs corners and moves only 2 D edges. Used
   after the corners are placed, it **breaks them**, so a staged Ch7 with `ua/ub` stalls (5/20). The
   fix is a genuine corner-preserving D-frame U-perm:

   ```
   Ua (D-frame, corner-safe edge 3-cycle):  R D' R D R D R D' R' D' R2
   ```

   Verified: corners + whole U layer intact, exactly 3 D edges cycled, all edges stay oriented. With
   it, Ch7 reaches `solved` on **20/20**. **This is a new catalog entry the plan must promote for
   Ch7** — `ua-perm` as currently defined cannot finish a staged last layer.

## Fix / consequences for the plan

- **TS-0 gate: PASSED.** Both no-rotation assumptions hold. Chapter authoring is unblocked.
- **Catalog (plan §4 / TS-3):** beyond `sexy-move-mirror`, Ch7 needs a **corner-safe edge perm**
  (`R D' R D R D R D' R' D' R2`), not the existing `ua-perm`. Promote it parity-pinned; the planner
  for Ch7 (`planPermuteLastEdges`) uses it, not `sune + D`. The catalog `ua-perm`/`ub-perm` stay as
  the Solver's combined-BFS blocks (they are correct _there_).
- **Triggers:** right `R' D' R D`, mirror `L D L' D'` — both proven. Mirror parity should pin to
  this `L`-variant, not the per-face `F'`/`B'` variants in `solveWhiteCorners`.
- **Milestones:** `yellow-corners-oriented` and `yellow-corners-placed` are real reachable states;
  build them by composing teaching-solver output (plan §2 / PD-1).

## Prevention

- **Prove cube-geometry assumptions on the engine, never by hand.** The Ch7 corner-safe-edge-perm
  gap is invisible to armchair reasoning (`sune + D` _looks_ like a U-perm) and obvious in one
  `applyMoves(solved, …)` probe. Every teaching-solver planner gets a spec asserting it lands on its
  milestone and disturbs nothing it shouldn't (TS-2 onward).
- **A "named algorithm" is only clean in the frame it was derived for.** `ua-perm = sune + D` is a
  valid block inside the combined last-layer BFS but is **not** a standalone edge perm; staged
  pedagogy needs blocks that are clean _in isolation_.

## Related

- Plan `docs/plans/2026-06-20-feat-coach-placement-pedagogy-plan.md` (TS-0, assumptions table, Risk
  row 2 documented-exit — not needed, feasibility proven).
- Brainstorm `docs/brainstorms/2026-06-20-coach-placement-pedagogy-brainstorm.md` (Q1/Q4).
- Engine: `application/solver/solveWhiteCorners.ts` (`SEXY_MOVE`, per-face variants),
  `solveYellowCorners.ts` (`CORNER_3_CYCLE`, `UA_PERM`), `domain/catalog.ts` (ADR-0006 parity).
- [[coach-placement-pedagogy]] · [[coach-demo-pedagogy]] memories.
