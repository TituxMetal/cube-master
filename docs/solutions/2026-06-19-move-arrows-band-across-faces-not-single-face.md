# Move arrows drawn on one face only — didn't look like ruwix's per-sticker arrows

**Date:** 2026-06-19 **Area:** web

## Symptom

The Coach demo (and Solver) drew the move-direction arrows on **the single turning face only** — a
small arrow on each of that face's eight outer stickers. Reviewed against the reference (ruwix.com
screenshots in `~/screenshots/2026-06-15/`), it looked nothing like it: the arrows were on the wrong
stickers entirely, the triangles were ugly (white chevrons with a black outline), and the "rotation
arrow" was a janky pale arc. Double moves (`R2`, `U2`) showed **no arrows at all** in the Solver.
Two rounds of rework were rejected before the model was right.

## Root cause

Three separate things, one conceptual:

1. **Wrong mental model.** A face turn's visible motion on a flat net is the **band** — the strip of
   each of the **four neighbouring faces** that cycles — not the turning face's own stickers (those
   rotate in place). The code arrowed the turning face and left the band blank, the exact inverse of
   ruwix. For an `F` turn ruwix arrows U-bottom→right, R-left→down, D-top→left, L-right→up, and puts
   only a curved rotation arrow on F itself.
2. **Half turns returned no angle.** The old `cellArrowAngle` returned `null` for `turn === 'half'`,
   so `R2`/`U2` drew nothing. The Coach proof slice (`white-cross-flip = D R F' R'`) has no doubles,
   so the bug was only visible in the Solver — easy to miss.
3. **Arrow styling guessed instead of copied.** White-fill/black-outline triangles and a
   double-stroke arc were invented rather than matched to ruwix, which uses a clean solid triangle
   filled with a **darker shade of the sticker's own colour** and a **solid filled circular** arrow.

## Fix

In the shared `apps/web/src/features/cube/components/MoveArrow.tsx` (commit `d733fda`):

- **Band model.** A `MOVE_BANDS` table maps each base face to its four neighbour strips
  `{ face, indices, cw-angle }`. The cycle order comes straight from the engine's
  `MOVE_TABLES[face].edgeCycle` (e.g. `F = UF→FR→DF→FL = U→R→D→L`). Geometry, verified against
  ruwix: **F/B** wrap the cross centre four ways; **U/D** are a uniform horizontal band; **R/L** are
  a uniform vertical U-F-D band with **B as the seam** (opposite direction).
  `faceArrows(move, face)` returns either `{ rotation }` (this face is the one turning → curved
  arrow, no per-sticker arrows) or `{ cells: {index→angle} }` (this face carries part of the band).
  Half turns reuse the clockwise angle, so doubles are no longer arrow-less; the move badge carries
  the "×2".
- **Darkened-colour triangles.** `CellArrow` takes a `fill`; `arrowFillByColor` in
  `features/cube/lib/colors.ts` gives each sticker colour a deeper tone (grey on white, navy on
  blue, …). Crisp on every colour, no outline — ruwix's trick.
- **Solid rotation arrow.** `RotationArrow` is a single filled `ROTATION_PATH` (≈290° band + clean
  arrowhead), dark with a thin white outline, mirrored for `ccw`.
- Both `FaceGrid` (Coach) and the Solver's `InteractiveFaceGrid` consume `faceArrows`, so the fix is
  shared and the Solver inherits the double-move fix for free.

## Prevention

- **When a task points at a visual reference, replicate the real mechanic and verify against the
  actual reference image before claiming done.** What landed this — after two rejections — was
  rendering a tiny standalone HTML harness with `brave --headless --screenshot` and eyeballing it
  next to the ruwix screenshots, for all 18 cases (6 faces × 3 turns). Guessing from memory failed
  twice; the headless render caught every geometry and styling error in minutes. Reference shots
  live in `~/screenshots/<date>/`.
- **Derive cube geometry from the engine, not by hand.** The band cycle order is exactly
  `MOVE_TABLES[face].edgeCycle`; reusing it removes a whole class of hand-derivation errors.
- Tests pin the band: `faceArrows('F','U').cells === {6:90,7:90,8:90}`, the turning face has a
  rotation arrow and zero cell arrows, and half turns still arrow (`MoveArrow.spec`,
  `FaceGrid.spec`, `CubeNet.spec`). A regression to "single face" or "no doubles" reddens CI.

## Related

- `docs/solutions/2026-04-06-d-face-sticker-mapping-row-order.md` — same `stickerMapping`/net-row
  geometry that the band indices rely on.
- Plan `docs/plans/2026-06-15-coach-design-wording-plan.md` (P4 deferred fail-items).
- [[coach-visual-feedback]] memory — Titux's ruwix-exact arrow taste and the dim-veil highlight.
