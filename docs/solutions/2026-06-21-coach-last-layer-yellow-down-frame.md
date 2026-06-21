# Coach last layer — the yellow-UP mental model leaks into a yellow-DOWN app

**Date:** 2026-06-21 **Area:** engine / coach

## Symptom

Reviewing the Coach last-layer chapters live, two incoherences surfaced that a beginner spots
immediately, cube in hand:

1. **Ch6 "placer les coins" breaks the yellow face.** The chapter promises "les coins sont déjà
   jaunes et le resteront", yet the placement visibly lifted yellow off the bottom and ground the
   gesture up to **4 times** before the yellow face came back.
2. **The copy says "en haut" while the yellow face is on the bottom.** Six places across
   `yellow-cross`, `orient-corners`, `place-corners` told the learner to put a figure/corner "en
   haut à gauche / en haut à droite" — but the app holds the cube **white-up / green-front, last
   layer on D (bottom), no rotation**. "En haut" is where the white first layer is.

Also found while digging: several teaching demos played **nothing** because they were pinned to a
plan group (`groupIndex: 1`) that does not exist for the production scramble (a line case has one
yellow-cross group, a single Sune has one orient group, the fixed-frame placement is one cycle).

## Root cause

All of it is **one root cause**: the last-layer content was authored with the **yellow-UP mental
model** of every standard tutorial, and never adapted to this app's fixed **yellow-DOWN,
no-rotation** frame.

- The placement planner used `corner-3-cycle` (`D R D' L' D R' D' L`), which **twists** the corners
  it cycles. Verified at the engine: one application leaves three non-yellow stickers on the D face.
  In the "orient corners first, then place" order, that twist undoes the orientation Sune just did,
  so the BFS needed ~4 cycles to net the twists back to zero — hence the flicker.
- "En haut" is the yellow-up artifact: with yellow held up, a back corner _looks_ top-left when you
  peer down. Hold the cube correctly (white up) and the same piece is at the **back-left bottom**.

I repeatedly got the cube geometry wrong by **reasoning from memory** (e.g. proposed orienting
corners with `R' U' R U`, which is U-based and wrong for a yellow-down layer; the engine's
last-layer algs are all D + side faces, never U). Every position claim only became reliable once
**verified against the engine** by applying the move list to a solved cube and reading the result.

## Fix

- **Orientation-safe placement.** Added a Coach-only catalog entry `a-perm`
  (`R F' R B2 R' F R B2 R2`): a corner 3-cycle that **preserves orientation** — yellow stays on the
  bottom throughout. `planPlaceLastCorners` now chains `a-perm`, not `corner-3-cycle`, so production
  placement is **one clean cycle**. The Solver's parity-pinned `corner-3-cycle` (ADR-0006) is left
  untouched — the A-perm is a separate, Coach-only block, behaviour-tested in `catalog.spec.ts`
  (cycles exactly 3 D corners, every corner stays oriented, edges + top intact).
- **Frame-correct positions, all verified at the engine** by inverting each algorithm onto a solved
  cube and reading which piece is the anchor / which edges form the figure:
  - A-perm anchor (fixed corner) = **DLF** → "devant à gauche".
  - Sune pre-oriented corner = **DBL** → "au fond à gauche".
  - Yellow-cross **L** = oriented edges DB+DL → coude "au fond à gauche"; **line** = DL+DR →
    "horizontale" (already correct).
  - Every last-layer "en haut" removed.
- **Empty demos** converted from teaching-`groupIndex` demos to legacy algorithm-from-case demos
  (Ch4 L, Ch5 Anti-Sune), so a variant the production cube does not exercise still shows its
  gesture.

Commit `59514ea` (placement + frame copy), `e8b78e2` (French), `08cda57` (white-corners efficiency).

## Prevention

- **Never reason cube geometry from memory — verify against the engine.** Apply the move list to
  `createSolvedState()` and read `corners[p].id/orientation`, `toStickers(s).D`, etc. A throwaway
  `_*.spec.ts` with `console.log` is the fastest loop; delete it after. This burned ~half the
  session until adopted as a rule.
- **Last-layer copy must use bottom-relative positions** (avant/arrière/gauche/droite, "au fond",
  "en bas") — never "en haut". The yellow layer is on D. If a position word appears, confirm the
  anchor piece at the engine first.
- **Don't pin a demo to `groupIndex` for a variant the production scramble may not produce.** The
  teaching planner emits only the groups the fixed cube needs; a second-variant demo (L vs line,
  Sune vs Anti-Sune) must be a legacy algorithm-from-case demo, or it renders empty. There is no
  test guarding "every teaching demo is non-empty" — worth adding.
- **Orientation-preserving corner 3-cycles in the no-rotation frame are A-perms** (use F/B + R, no
  U, no rotation). `R F' R B2 R' F R B2 R2` (anchors DLF) and `R2 F2 R B R' F2 R B' R` (anchors DBL)
  both work in this engine; plain Niklas variants (`R D' L' D R' D' L D`) twist here.

## Follow-up — 2026-06-21 (session 2): second layer + method completeness

The same root cause (`groupIndex` demos show whatever the fixed scramble produces, decoupled from
the step's prose) bit the **second layer** and **yellow cross** too, and a live review pushed three
more fixes — all verified at the engine with throwaway `_probe.spec.ts`:

- **Ch3 second layer — the practice used gestures no demo showed.** `planSecondLayer` fills the two
  BACK slots with **back-face (B) inserts**; the demos only showed the two front inserts, so the
  practice asked the learner to turn B with nothing teaching it. Reworked as **four named slot
  gestures** (front-right / front-left / back-right / back-left), each a legacy `algorithmId` +
  `demoFrom: 'case'` demo on its own clean case. Promoted `second-layer-insert-front-left`,
  `-back-right`, `-back-left` to the catalog, **parity-pinned to `solveSecondLayer` constants**
  (`SECOND_LAYER_INSERT_FRONT_LEFT/_BACK_RIGHT/_BACK_LEFT`) — ADR-0006 roster note 2026-06-21. Each
  is ≤8 moves and leaves the whole top layer intact (verified). Engine-verified cases: front edges
  sit at **DF** (D[1]+F[7]), back edges at **DB** (D[7]+B[7]); slot stickers FR=F[5]/R[3],
  FL=F[3]/L[5], BR=R[5]/B[3], BL=B[5]/L[3]. **A naïve "front insert with F→B" is NOT a clean back
  insert** — `D' R' D R D B D' B'` breaks the top corners (UFR/UBL); the real back inserts are their
  own sequences.
- **Ch4 "barre" demo showed an L.** The bar demo was a `groupIndex` demo whose scramble figure was
  an L (DL+DF). Switched to a legacy `yellow-cross-line` demo so "barre" shows a real horizontal bar
  (DL+DR); the L demo uses `yellow-cross-l` (elbow DB+DL = back-left). Each figure highlighted.
- **Ch7 copy said "à l'arrière" — it's the FRONT.** `edge-3-cycle` keeps the **DF** edge fixed
  (engine verified), so the already-placed reference edge is kept **devant**, not at the back.

**Method completeness (verified over 80 random cubes, 0 failures).** `a-perm` (corners) and
`edge-3-cycle` (edges) solve **every** last-layer case — none "fail with the algorithm". The special
cases just need the **same gesture twice**: the first pass converts the hard case into the simple
one. Distribution at the place/permute steps: corners pre-placed = {0:31, 1:25, **2:22**, 4:2};
edges pre-placed = {0:19, 1:53, 4:8}. So "**two corners already placed**" and "**two edge pairs
swapped / zero pre-placed**" are common, not anomalies. The **0-oriented Sune** case is handled by
one Sune from any position (0 → 2 or 1 oriented, verified). The in-app practice's next-move hint
walks any case automatically; the chapter copy now names the special cases so a learner solving a
physical cube knows to apply the gesture again.

## Related

- `docs/solutions/2026-06-20-coach-no-rotation-teaching-solver-feasibility.md` — the TS-0 spike that
  proved no-rotation feasibility (this is the follow-on: feasibility was right, but the _placement
  algorithm choice_ and the _copy frame_ were wrong).
- `docs/plans/2026-06-20-feat-coach-placement-pedagogy-plan.md` — still describes Ch6 with
  `corner-3-cycle`; needs updating to the A-perm.
- `docs/adr/0006-algorithm-catalog-in-domain.md` — parity rule that forced adding a new entry rather
  than mutating `corner-3-cycle`.
