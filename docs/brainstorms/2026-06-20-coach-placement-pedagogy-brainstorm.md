---
title: 'Coach pedagogy rework — intuitive placement & full-chapter practice'
type: brainstorm
date: 2026-06-20
participants: [Titux Metal, Claude]
related:
  - docs/brainstorms/2026-06-12-coach-mode-brainstorm.md
  - docs/brainstorms/2026-06-14-coach-design-wording-brainstorm.md
  - docs/plans/2026-06-13-coach-mode-v1.md
  - docs/plans/2026-06-15-coach-design-wording-plan.md
  - docs/stories/coach-mode-v1.md
  - docs/stories/coach-mode-v1.architecture.md
  - https://cubesolve.com/ (reference for clarity, not to copy verbatim)
---

# Coach pedagogy rework — intuitive placement & full-chapter practice

## Problem Statement

The current Coach implementation (chapters 1-7 on the milestone-demo model) **does not actually
teach a complete beginner to solve the cube**. Three structural defects — first seen in chapter 2,
but systemic:

1. **It teaches the trigger, never the placement.** A chapter boils down to "repeat the sexy move".
   But `R' D' R D` acts at a fixed location (front-right). Because the cube is held white-up /
   green-front at all times, a corner on the right that must go up on the left **destroys
   everything** if you run the algorithm as-is. The whole "bring the slot and the piece into
   position before acting" phase is missing.
2. **The demo cheats.** The "case" is built mechanically (`milestone` minus a single algorithm's
   footprint) → the face is nearly finished, so it looks easy. It teaches nothing about a face that
   is not done at all.
3. **Demo == practice.** Both reference the same `algorithmId` → same starting cube, same moves.
   Practice is just a second viewing.

**The real need** (user's words): explanations that let a **complete beginner** solve the cube
**without memorizing many algorithms**, where placements become **intuitive** when shown well — and
an end-of-chapter practice that solves **the full chapter case**, starting from a cube where
**nothing of the chapter is solved**.

## Context

**Internal prior art** (research over existing docs):

- **PD6 / milestone-demo model** (plan 2026-06-15): demo/practice anchored on a phase _milestone_
  (cross done, first layer done…), not the solved cube. **Keep** as the target — but move the
  practice _starting point_ to the **previous milestone**.
- **PD7**: practice = the learner taps each move of the recipe (`algorithmId`) themselves.
  **Revise**: the recipe is no longer a single fixed algorithm, it is the whole phase's solution.
- **D-CHAPTERS**: one practice per chapter, left mirror shown in understanding only. **Revise**:
  practice becomes multi-piece (full chapter).
- **NFR-004**: no inline `MoveToken[]` in lesson data; moves come from the catalog/engine. **Keep**
  (practice derives its moves from a solver at runtime, not inline sequences).
- **D3 / D-NOTATION**: white-on-top / D-based frame, consistent with what the app executes.
  **Keep**.

**External reference**: https://cubesolve.com/ — cited as an **example of clarity**, not a model to
copy verbatim. Its full method fits in ~8 algorithms; for corners it uses a single trigger plus
intuitive placement ("bring the corner below the spot where it belongs").

**Frame constraint (drives chapters 4-7)**: the engine keeps **white-up / green-front at all
times**, with **no cube-rotation notation** (and the user does not want to introduce any). The last
layer (yellow) is therefore solved **on the bottom (D face)**, in a non-standard frame — hence
"hybrid" algorithms that are neither cubesolve.com's nor intuitive. With no rotation, you cannot
"turn the cube" to reach a known case: everything must be expressed in the fixed frame.

**Engine reality for the corner placement** (`solveWhiteCorners.ts`): the shared solver keeps the
cube fixed and applies **4 per-face variants of the sexy move** (`R'/B'/L'/F'`), with no rotation
and no U setup. This is exactly the pedagogy **to avoid**: it turns intuitive positioning into 4
pseudo-algorithms.

**Engine reality for chapters 4-7** (verified):

- **Ch4 yellow cross** (`solveYellowCross.ts`): **clean**. Two algorithms (`yellow-cross-line`,
  `yellow-cross-l`) + pattern recognition (dot→L→line→cross) + a `D` alignment. Both **contain the
  sexy move** (`[F', R'D'RD]`, `[R, DFD'F']`) — the through-line continues. Teachable ~as-is.
- **Ch5-7 yellow layer** (`solveYellowCorners.ts`): a **BFS over 7 algorithms** (Sune, Anti-Sune,
  `corner-3-cycle`, Ua/Ub-perm, 2 commutators) + `D` turns, emitting the **shortest combination that
  solves the whole layer at once**. The output is **non-pedagogical** → unusable for a guided
  practice, and **this is why the 5-7 milestones collapse to `solved`** (no clean intermediate
  exists inside the BFS).

**"Le Belge"** (user's recollection, identified): French nickname for the **second-layer insert**
(Ch3), with its mnemonic joke ("the Belgian should go right… but he goes left!") and its
**left/right mirror** — which the engine already has (`insertRight`/`insertLeft`). A good memory
hook for Ch3; it does not concern 4-7.

## Chosen Approach

**One gesture, intuitive placements.** Each chapter teaches:

1. **Recognize the case** (visual on a realistic cube, not near-solved).
2. **Place (intuitive, not an algorithm)**: `U/U'/U2` to bring the target slot to the front;
   `D/D'/D2` to bring the piece directly underneath.
3. **Trigger**: the sexy move `R' D' R D` on the right, **or its mirror** (same gestures, R↔L) on
   the left — one concept, not two algorithms to memorize. Repeated as needed.
4. **Practice the full chapter**: start = **previous milestone** (nothing of the chapter solved),
   the learner runs placement+trigger for **every** piece, guided move by move (next-move hint),
   success = reaching this chapter's **milestone**.

**A chapter uses as many demo steps as the teaching needs — explicitly more than one.** For example:
a demo for the intuitive setup/placement (the `U`/`D` positioning), a demo for the right trigger, a
demo for the left mirror, a demo for repeated application until the piece seats. The old "one demo
per chapter" template is dropped. Each demo plays a different, representative case; practice then
covers the whole chapter case. This is what **decouples** demos from practice.

## Why This Approach

- **Optimizes for**: real comprehension by a complete beginner (the need), with the **fewest
  algorithms** (the sexy move + mirror as a through-line, reused for orienting the yellow corners).
- **Costs**: a solver that emits the "setup U/D + sexy/mirror" shape (see Q4), and a multi-piece
  practice model (revises PD7/D-CHAPTERS).
- **Rejected — copy cubesolve.com verbatim**: needlessly rigid, and its U-based frame clashes with
  our agreed D-based frame (D3).
- **Rejected — engine as-is (4 per-face variants)**: zero engine cost, but **bad pedagogy** (4
  pseudo-algorithms instead of one gesture + intuition). That is precisely the defect we are fixing.

## Subjective Contract

- **Target outcome**: a learner who has never solved a cube follows a chapter, understands _why_ the
  piece moves there, and solves the full chapter case on their own at the end.
- **Anti-goals**: a catalog of algorithms to memorize; placements presented as formulas; "near-
  solved" demos that look easy; a practice that replays the demo.
- **References**: cubesolve.com (clarity, few algorithms, intuitive tone).
- **Anti-references**: the engine's current 4 per-face variants; jargon; walls of notation with no
  intuition.
- **Tone/taste rules**: narrative prose, FR lesson copy, D-based white-on-top frame, one gesture
  foregrounded, placement told as a reflex; honors [[coach-comprehensibility-bar]] and
  [[coach-visual-feedback]].
- **Rejection criteria**: practice starting from a near-solved cube; practice teaching moves other
  than the chapters'; a placement presented as an algorithm to remember; needing to "guess" that you
  must turn the cube without it having been shown.

## Preview And Proof Slice

- **Proof slice**: **Chapter 2 — White corners**. Reworked end to end (recognize → place →
  sexy/mirror → full first-layer practice from the cross alone), validated live, before propagating
  the template to the other chapters.
- **Required preview artifacts**: live review on a small (13") screen of the reworked Ch2 — the
  ergonomics bar from [[coach-comprehensibility-bar]] applies.
- **Rollout rule**: propagate to chapters 3-7 only after Ch2 is validated.

## Key Design Decisions

### Q1: Placement doctrine — RESOLVED

**Decision:** one trigger (sexy move `R' D' R D`) + its mirror (R↔L), plus an **intuitive placement
phase** (`U/U'/U2` for the slot, `D/D'/D2` for the piece). The placement turns are **never**
algorithms — they are intuition, shown explicitly. **Rationale:** matches the real need (few
algorithms, intuitive placements); one gesture to internalize, reused later; handles the "face not
done at all" case. **Alternatives rejected:** (a) engine as-is = 4 per-face variants → bad pedagogy;
(b) cubesolve.com to the letter → U-based frame incompatible with D3. **Revision note:** refines the
earlier blind "right + left mirror" pick by adding the explicit placement phase; discards the
engine's 4-variant model.

### Q2: Demo vs practice — RESOLVED

**Decision:** a chapter uses **several demo steps** (placement, right trigger, left mirror, repeats
— as many as the teaching needs, each on a different representative case); the **practice** covers
the **full chapter** from the previous milestone. **Rationale:** decouples the two (ends the "demo
== practice" defect), and finally practices the real case, not a near-solved cube. Multiple demos
are an explicit user request ("ajouter des étapes de démo, pas de souci"). **Alternatives
rejected:** (a) one demo per chapter — explicitly rejected by the user; (b) keep a single-case
practice distinct from the demo (lighter, but does not solve "the whole chapter from scratch", an
explicit user need). **Revises:** D-CHAPTERS (one demo + one practice per chapter) and PD7 (recipe =
one fixed algorithm).

### Q3: Source of the guided practice moves — RESOLVED (principle)

**Decision:** practice **runs a solver's moves** (next-move hint, state-based validation), never
inline sequences → NFR-004 respected. The solver must emit **exactly** the taught shape (placement
U/D + sexy/mirror). **Rationale:** "what practice does == what the chapter teaches == what the
engine executes". **Alternative rejected:** free practice (learner taps anything, hint computed on
the fly) — heavier, fuzzy validation; deferred out of scope.

### Q4: Coach-side teaching solver — RESOLVED (required, not optional)

**Decision:** a **Coach-dedicated teaching solver** produces sequences in clean steps (placement
U/D + trigger, plus clean intermediate milestones), **without touching Solver mode**. **Rationale:**
no longer a convenience. `solveYellowCorners` is a **BFS** that solves the whole yellow layer at
once with an unreadable output → it is **impossible** to derive a guided 5-7 practice or
intermediate milestones from it. A pedagogical sequencer is **required**. Good news: **all the
building blocks already exist in the catalog, in the fixed frame, with no rotation** — the cost is
to **chain** them, not to invent them. **Alternative rejected:** adapt the shared solver (lengthens
Solver mode; and its 5-7 BFS does not bend into clean steps).

## Open Questions

1. **Algorithm → chapter mapping in the fixed frame** (confirm at `/plan`; blocks already in the
   catalog):
   - **Ch5 orient corners**: **reuse the sexy move** `R'D'RD` repeated (as cubesolve.com does). 0
     new algorithm.
   - **Ch6 permute corners**: `corner-3-cycle` (`D R D' L' D R' D' L`) + mirror, placement via `D`
     turns.
   - **Ch7 permute edges**: `ua-perm` / `ub-perm`.
   - **Ch4 yellow cross**: keep `yellow-cross-line` / `yellow-cross-l` + pattern recognition. To
     verify: feasibility of each step **without rotation**, and the teaching solver producing clean
     intermediate milestones.
2. **New step kind(s)** or reuse of `understand`+`demo`+`practice` to carry the placement phase and
   the multi-piece practice — `types.ts` modeling to do at `/plan`.
3. **Catalog**: should mirrors be promoted (`sexy-move-mirror`, `corner-3-cycle-mirror`…), and how
   does the catalog pin the triggers while the teaching solver composes setup+trigger? `/compound`
   candidate: the "teaching-solver vs Solver" boundary.
4. **Effort 5-7 > 2-3**: the rework is heavier on the last layer (sequencer + intermediate
   milestones). Confirm the propagation order at `/plan` (2 → 3 → 4 → 5-7).

## Out of Scope

- "Free" practice (no move-by-move guidance).
- Any rework of **Solver** or **Timer** mode.
- The Timer localStorage migration (already tracked elsewhere, see
  [[coach-adr0007-storage-endorsed]]).
- Going 3D / dropping the flat CubeNet (forbidden, [[coach-comprehensibility-bar]]).
- Propagating to chapters 3-7 **before** the Ch2 proof slice is validated.

## Next Steps

- `/plan docs/brainstorms/2026-06-20-coach-placement-pedagogy-brainstorm.md` — sequence: (1) settle
  Q4 (teaching solver); (2) model the placement + multi-piece practice steps; (3) rework Ch2 as the
  proof slice; (4) live review; (5) propagate 3-7.
