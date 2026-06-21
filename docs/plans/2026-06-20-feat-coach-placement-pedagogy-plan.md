---
title: 'feat: Coach pedagogy rework — intuitive placement & full-chapter practice'
type: plan
date: 2026-06-20
status: complete
brainstorm: docs/brainstorms/2026-06-20-coach-placement-pedagogy-brainstorm.md
confidence: medium
---

# Coach pedagogy rework — intuitive placement & full-chapter practice

**One-line summary:** Replace the "repeat one algorithm on a near-solved case" Coach model with a
**teaching solver** that emits _intuitive placement (U/D) + one trigger (sexy move & its mirror)_,
so each chapter teaches **where the piece goes** and ends with a **full-chapter practice** starting
from the previous milestone — proven first on Chapter 2, then propagated.

---

## Problem Statement

The shipped Coach (chapters 0-7 on the milestone-demo model, commit `b5a5396`) **does not teach a
complete beginner to solve the cube**. Three structural defects, systemic since Chapter 2:

1. **It teaches the trigger, never the placement.** A chapter reduces to "repeat the sexy move". But
   `R' D' R D` acts at one fixed location; with the cube held white-up/green-front and **no
   rotation**, a piece that belongs elsewhere is never brought into position first. The whole "place
   the slot and the piece, _then_ act" phase is absent.
2. **The demo cheats.** The case is built as `milestone − one algorithm's footprint`
   (`caseBase = applyMoves(namedState(goal), invertMoves(stepMoves))`, `coachStore.ts:122`), so it
   starts nearly finished and looks trivial.
3. **Demo == practice.** Both reference the same `algorithmId` → identical starting cube and moves
   (`white-corners.ts:37`); practice is a second viewing, not practice.

**The real need** (user's words, carried verbatim from the brainstorm): explanations that let a
**complete beginner** solve the cube **without memorizing many algorithms**, where placements become
**intuitive** when shown well, and an **end-of-chapter practice that solves the full chapter case**,
starting from a cube where **nothing of the chapter is solved**.

This plan answers **HOW**. The WHAT is settled in
[`docs/brainstorms/2026-06-20-coach-placement-pedagogy-brainstorm.md`](../brainstorms/2026-06-20-coach-placement-pedagogy-brainstorm.md).

---

## Target End State

When this lands:

- A **Coach teaching solver** (pure TS, in `cube-engine`) turns _previous-milestone → chapter-
  milestone_ into an **annotated sequence** of `setup` (U/D placement) and `trigger` (sexy move /
  mirror / named last-layer block) segments, grouped per piece — never touching Solver mode.
- Each algorithm chapter teaches a **recognize → place → trigger** rhythm with **several demo
  steps** (placement, right trigger, left mirror, repeats), each on a **different representative
  case** on a **realistic (not near-solved)** cube.
- Each algorithm chapter ends with a **full-chapter practice**: start = **previous milestone**
  (nothing of the chapter solved), the learner runs placement + trigger for **every** piece, guided
  move by move, success = reaching **this chapter's milestone**.
- New **intermediate milestones** exist for the last layer (`yellow-corners-oriented`,
  `yellow-corners-placed`), produced by the teaching solver, so Ch5/Ch6 no longer collapse to
  `solved`.
- Chapter 2 (White corners) is reworked end-to-end and **validated live on a 13" screen** before
  chapters 3-7 adopt the template.
- All five checks green; `PD6`, `PD7`, `D-CHAPTERS` are revised in the plan record; an ADR fixes the
  teaching-solver ↔ Solver boundary.

---

## Scope and Non-Goals

**In scope:**

- A Coach-dedicated **teaching solver** in `cube-engine` (`application/teaching/`).
- A revised **step + milestone model** (placement-aware demos; full-chapter practice; new last-layer
  milestones).
- **Catalog**: promote only the mirrors/blocks the teaching solver actually emits.
- **Chapter 2** reworked as the proof slice; **chapters 3-7** propagated _after_ Ch2 is validated.
- Revising `PD6`/`PD7`/`D-CHAPTERS`; one ADR for the teaching-solver boundary; solution entries.

**Non-goals (explicitly out):**

- **"Free" practice** (learner taps anything, hint computed on the fly) — deferred (brainstorm Q3).
- Any rework of **Solver** or **Timer** mode; any change to the shared solver phases.
- The **Timer localStorage migration** (tracked separately — [[coach-adr0007-storage-endorsed]]).
- **3D / dropping the flat CubeNet** (forbidden — [[coach-comprehensibility-bar]]).
- Introducing **cube-rotation notation** (`x/y/z`) — the user does not want it; the fixed frame
  stands ([[coach-placement-pedagogy]], D3).
- Propagating to chapters 3-7 **before** the Ch2 proof slice passes its live review.

---

## Proposed Solution

### 1. Teaching solver (`packages/cube-engine/src/application/teaching/`)

A new **pure** application module, sibling to `solver/`, reusing `domain/` + `catalog.ts`, importing
**nothing** from `solver/`'s phase files (it may reuse small pure domain helpers and the exported,
parity-pinned algorithm constants). It does not touch Solver mode and adds zero framework deps.

**Output shape (new types in `application/teaching/types.ts`):**

```ts
type TeachingSegmentKind = 'setup' | 'trigger'

type TeachingSegment = {
  kind: TeachingSegmentKind
  moves: readonly MoveToken[]
  catalogId?: string // present on 'trigger' segments → parity-pin + naming in the UI
}

type TeachingStepGroup = {
  segments: readonly TeachingSegment[] // one piece / one placement-then-trigger unit
}

type TeachingPlan = {
  from: GoalState // previous milestone (start)
  to: GoalState // this chapter's milestone (target)
  groups: readonly TeachingStepGroup[]
}
```

**Per-phase planners** (one per algorithm chapter), each `(state: CubeState) => TeachingPlan`:

- `planWhiteCorners` (Ch2): for each unsolved white corner — `setup` U-turns to bring the empty slot
  to the front working position, `setup` D-turns to bring the piece directly underneath, then
  `trigger` (`sexy-move` on the right **or** `sexy-move-mirror` on the left), repeated until seated,
  then a closing `setup` U-undo to restore. One `TeachingStepGroup` per corner.
- `planYellowCross` (Ch4): keep the existing two-algorithm + pattern-recognition shape
  (`yellow-cross-line` / `yellow-cross-l` + `D` alignment) re-expressed as `setup` + `trigger`
  segments. Lowest-risk planner (the shared `solveYellowCross` is already clean).
- `planOrientLastCorners` (Ch5): **reuse the sexy move repeated** (as cubesolve.com does) to orient
  the last-layer corners — 0 new algorithm. Emits the new `yellow-corners-oriented` milestone.
- `planPlaceLastCorners` (Ch6): `corner-3-cycle` (+ mirror if needed) with `D`-turn placement. Emits
  the new `yellow-corners-placed` milestone.
- `planPermuteLastEdges` (Ch7): `ua-perm` / `ub-perm` with `D` placement → `solved`.

Each planner is **deterministic** (no BFS) and **chains catalog blocks** — "the building blocks
already exist; the cost is to chain them, not to invent them" (brainstorm Q4).

### 2. Milestones (`apps/web/src/features/coach/data/illustrative.ts`)

Extend `GoalState` with the two new last-layer milestones and build them from the **teaching
solver** (the shared-solver BFS cannot yield clean intermediates):

```
GoalState += 'yellow-corners-oriented' | 'yellow-corners-placed'
milestone('yellow-corners-oriented') = applyMoves(milestone('yellow-cross'),       planOrientLastCorners(...).moves)
milestone('yellow-corners-placed')   = applyMoves(milestone('yellow-corners-oriented'), planPlaceLastCorners(...).moves)
```

First-two-layer milestones (`white-cross-only`, `white-corners`, `second-layer`, `yellow-cross`)
stay as they are (replayed from the shared solver) — no churn there.

### 3. Step + practice model (`apps/web/src/features/coach/data/types.ts`, `stores/coachStore.ts`)

- **Demos become placement-aware.** A `demo` step may reference a **teaching scenario** (a
  `from`/`to` milestone pair + a piece selector) instead of a single `algorithmId`. The store
  derives its moves from the teaching solver and the player highlights `setup` vs `trigger` segments
  (existing band-model arrows from [[coach-visual-feedback]]). Legacy single-`algorithmId` demos
  keep working for Chapter 1.
- **Full-chapter practice** (new `chapter-practice` step kind, or `practice` extended with a
  `fullChapter: true` discriminant — implementer's call at task PD-3): start = `namedState(from)`
  (the **previous** milestone), recipe = the **flattened teaching-solver sequence** for the whole
  chapter, learner taps every move, next-move hint + state-based validation reuse the PD7 tap
  machinery, success = `stickersEqual(frame, namedState(to))`.
- **NFR-004 stays clean:** lesson data carries **no inline `MoveToken[]`** — demos/practice name a
  catalog id (legacy) or a teaching scenario descriptor; all moves come from the engine at runtime.

### 4. Catalog (`packages/cube-engine/src/domain/catalog.ts`)

Promote **only** what the teaching solver emits, each **parity-pinned** to its live source constant
(ADR-0006): `sexy-move-mirror` (left trigger; parity-pinned to the `L`-variant already in
`solveWhiteCorners`), plus `ub-perm` and a `corner-3-cycle-mirror` **only if** Ch6/Ch7 planners emit
them. Do not promote speculative entries.

### 5. Chapter authoring

Rework **Chapter 2** end-to-end on the new template, validate live, then propagate the same template
to **3 → 4 → 5-7** (5-7 heavier: they need the new milestones + planners). FR learner-facing copy,
D-based white-on-top frame, one gesture foregrounded, placement told as a reflex.

---

## Decision Rationale

### D-TS-LOCATION — Teaching solver lives in `cube-engine`, not `features/coach`

**Decision:** `packages/cube-engine/src/application/teaching/`, a pure module sibling to `solver/`.
**Why:** It is pure cube logic (state → annotated move sequence) with **zero framework deps**, so it
belongs in the framework-agnostic engine ("the backbone Coach demos through", AGENTS.md). Living in
the engine makes it unit-testable in pure TS, lets it parity-pin against catalog/solver constants,
and keeps the React layer thin. It imports nothing from `solver/` phases, honoring "don't touch
Solver." **Alternative rejected:** put it under `features/coach/`. It would still import engine
domain, gains no isolation, and scatters pure cube logic into the UI layer. The "Coach-dedicated"
framing in the brainstorm is about _not lengthening Solver_, which the separate-module boundary
already satisfies. **Flagged:** the teaching-solver ↔ Solver boundary is a `/compound` + ADR
candidate (brainstorm Q3).

### D-GESTURE — One trigger + mirror + explicit U/D placement (adopts brainstorm Q1)

**Decision:** one trigger (`sexy-move`) + its mirror, plus an **intuitive placement phase**
(`U/U'/U2` for the slot, `D/D'/D2` for the piece, U-undo to restore). Placement turns are **never**
presented as algorithms. **Why:** matches the real need (few algorithms, intuitive placement); the
mirror gives a second working position (front-left) so only U-setup+undo is needed to reach the back
slots without rotation; reused later to orient the yellow corners. **Rejected:** engine as-is (4
per-face variants → 4 pseudo-algorithms = the defect we are fixing); cubesolve.com's U-based frame
(clashes with D3).

### D-DEMO-DECOUPLE — Several demos per chapter; practice covers the full chapter (adopts brainstorm Q2)

**Decision:** a chapter uses **several** demo steps (placement, right trigger, left mirror,
repeats), each on a **different representative case**; practice covers the **whole chapter** from
the previous milestone. **Revises `D-CHAPTERS` and `PD7`.** **Why:** ends "demo == practice", and
finally practices the real case (a phase that is _not_ done at all), not a near-solved cube.
Multiple demos are an explicit user request.

### D-PRACTICE-SOLVER — Practice runs teaching-solver moves (adopts brainstorm Q3 principle)

**Decision:** practice **runs the teaching solver's moves** (next-move hint, state-based
validation); never inline sequences → NFR-004 respected. The teaching solver emits **exactly** the
taught shape (placement U/D + trigger). **Revises `PD6`** (practice start moves to the _previous_
milestone). **Why:** "what practice does == what the chapter teaches == what the engine executes".
**Rejected:** free practice — heavier, fuzzy validation; deferred.

### D-MILESTONES-FROM-TEACHING — New last-layer milestones come from the teaching solver

**Decision:** add `yellow-corners-oriented` / `yellow-corners-placed`, built by composing teaching-
solver output, not the shared-solver BFS. **Why:** `solveYellowCorners` is a BFS emitting one opaque
group → no clean intermediate exists inside it (this is exactly why 5-7 collapse to `solved` today).
A deterministic sequencer is **required**, and it doubles as the milestone generator.

### D-STEP-KIND — Recommend a dedicated `chapter-practice` kind over overloading `practice`

**Decision (recommended, final shape at PD-3):** add a `chapter-practice` step kind rather than
overload `practice` with a flag. **Why:** the full-chapter practice differs materially (start =
previous milestone, recipe = multi-piece teaching sequence, success = chapter milestone). A distinct
kind keeps the store computeds and the player switch readable and keeps legacy single-algorithm
`practice`/`demo` (Chapter 1) untouched. The implementer may collapse to a flag if the union proves
thinner in practice — decided when wiring the store.

---

## Constraints and Boundaries

- **Fixed frame, no rotation.** White-up / green-front at all times; last layer solved on D; **no
  `x/y/z` notation** is introduced (D3, [[coach-placement-pedagogy]]). Everything is expressed in
  the fixed frame.
- **Dependency boundaries** (eslint-plugin-boundaries): `cube-engine` stays framework-agnostic (zero
  React/Hono). The teaching solver is pure TS. Coach (`features/*`) imports shared + features; it
  consumes the teaching solver as a pure function via a store computed, **not** via solver atoms.
- **NFR-004 (no drift):** no inline `MoveToken[]` in lesson data; moves come from the catalog or the
  teaching solver. Every `trigger` segment names its catalog id; promoted entries are parity-pinned
  to their live source constant (ADR-0006).
- **Comprehensibility bar** ([[coach-comprehensibility-bar]]): visuals every chapter, taught
  notation, small-laptop ergonomics, narrative FR prose, flat CubeNet only (never 3D), dark theme.
- **Visual feedback** ([[coach-visual-feedback]]): no drop shadows; discreet ruwix band-model arrows
  on all moving stickers; recognition/illustrative visuals show **realistic partial states, never a
  fake-solved cube** (a solved cube teaches nothing about the case to recognize); highlight only
  relevant pieces; text above the cube. **This is about starting/illustrative states, not the
  practice end state** — practice always resolves to its chapter milestone, which for Chapters 1-6
  is a partial state and for **Chapter 7 is the fully solved cube**.
- **House rules:** TS strict, no semicolons, arrow-functions only, named exports, `.spec.ts(x)`,
  `~/` alias, `bun run` only.

---

## Assumptions

| Assumption                                                                                                                                           | Status            | Evidence / Action                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| White corners are reachable with **one gesture + mirror + U/D placement, no rotation** (U-setup → trigger → U-undo preserves placed corners & cross) | **Unverified**    | Geometrically plausible (U then U-undo is identity on placed pieces; the trigger preserves the rest of the U layer) but unproven → **spike task TS-0** before authoring Ch2 |
| Last layer (Ch5-7) is sequenceable into clean placement + trigger steps **without rotation**                                                         | **Unverified**    | The catalog blocks exist in the fixed frame; chaining them deterministically is the open risk → **spike task TS-0** covers 5-7 feasibility + clean intermediate milestones  |
| Catalog blocks already cover Ch5-7 (sexy repeated, corner-3-cycle, ua/ub-perm)                                                                       | **Verified**      | Engine research: all present in `catalog.ts` / `solveYellowCorners.ts`; only `ub-perm` + mirrors may need promotion                                                         |
| Demo/practice can derive moves from a pure engine function (no solver atoms)                                                                         | **Verified**      | Coach already derives `$demoFrame`/`$practiceFrame` from pure `applyMoves` + `getAlgorithm` (`coachStore.ts:139,184`); the teaching solver is the same shape                |
| PD7 tap machinery (next-move hint, leading-match progress, `stickersEqual` success) extends to a longer multi-piece recipe unchanged                 | **Likely**        | `$practiceProgress`/`$isPracticeSolved` are length-agnostic (`coachStore.ts:193,211`); confirm at PD-3                                                                      |
| Promoting mirrors as catalog entries keeps parity tests green                                                                                        | **Verified-able** | ADR-0006 parity pattern already used for `SEXY_MOVE`/`CORNER_3_CYCLE`/`UA_PERM`; pin mirrors to the per-face variants in `solveWhiteCorners`                                |

**Unverified assumptions are gated behind spike task TS-0** — no chapter authoring starts until the
no-rotation feasibility of placement (Ch2) and of the last-layer sequence (Ch5-7) is proven.

---

## Risk Analysis

| Risk                                                                                                                                | Likelihood | Impact | Mitigation                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No-rotation placement is not actually intuitive** (U-setup/undo confuses beginners, or back-slot cases feel like a 5th algorithm) | Medium     | High   | TS-0 spike proves the move geometry; the **Ch2 live review on a 13" screen is the real gate** — failure sends it back to planning, not forward to 3-7                                                                                       |
| **Last-layer sequencer (5-7) is harder than chaining** (clean intermediate milestones don't fall out without rotation)              | Medium     | High   | Sequence the work 2→3→4→**5-7 last**; TS-0 includes a 5-7 feasibility probe; if a clean `yellow-corners-oriented`/`placed` proves infeasible without rotation, fall back to keeping 5-7 on the current model and re-scope (documented exit) |
| **Scope creep across 7 chapters**                                                                                                   | High       | Medium | Hard phase gate: foundations + Ch2 only until the review passes (rollout rule); 3-7 is a single gated phase with lighter per-chapter detail                                                                                                 |
| **Engine-boundary regression** (teaching solver drifts toward Solver, or pulls framework deps)                                      | Low        | Medium | Separate `application/teaching/` module; lint boundaries; ADR fixes the line; parity specs pin shared constants                                                                                                                             |
| **NFR-004 drift** (a scenario descriptor smuggles inline moves)                                                                     | Low        | Medium | Referential-integrity spec extended: every demo/practice resolves to a catalog id **or** a valid teaching scenario; no `MoveToken[]` literals in `data/`                                                                                    |
| **Regressing the already-green Ch0/Ch1**                                                                                            | Low        | Medium | Keep legacy single-`algorithmId` demo/practice paths; Ch1 untouched; full `bun run test` each phase                                                                                                                                         |

---

## Implementation Tasks

Dependency-ordered. `[ ]` = todo. These are the `/work` tracker.

> **Progress (2026-06-21, session 2).** All implementation (TS, PD, C2-1..C2-3, 37) and Phase R
> records (R-1, R-2, R-3) are done. **C2-4 is signed off** — Titux passed the live 13"
> comprehensibility review; chapters 3–7 were authored and reworked iteratively under that live
> feedback. A second live-review pass tightened Ch3–7 (commit pending): **Ch3 second layer reworked
> from two inserts to four named slot gestures** (front-right / front-left / back-right / back-left
> — see updated `37-1` and the ADR-0006 roster note), plus Ch4/Ch5/Ch6/Ch7 demo-decoupling fixes
> (`docs/solutions/2026-06-21-…-yellow-down-frame.md`, session-2 follow-up). The only open item is
> **PR step of R-4** (now done — see below). **All tasks complete; PR #11 → `develop` is open.** The
> only remaining action is Titux's manual merge after the automatic Copilot review — the agent does
> not rebase/merge.

### Phase TS — Teaching solver foundations (engine)

- [x] **TS-0 — Feasibility spike (gating).** Prove, with throwaway scripts/specs, that (a) Ch2 white
      corners and (b) Ch5-7 last layer are expressible as `setup`(U/D) + `trigger` segments
      **without rotation**, including clean `yellow-corners-oriented` / `yellow-corners-placed`
      intermediate states. Record findings in `docs/solutions/`. **Blocks all authoring.**
- [x] **TS-1** — Add `application/teaching/types.ts` (`TeachingSegment`, `TeachingStepGroup`,
      `TeachingPlan`). Named exports, no semicolons, arrow fns.
- [x] **TS-2** — Implement `planWhiteCorners` + spec (Ch2). Reuse the exported `SEXY_MOVE` and the
      per-face `L`-variant for parity; assert it lands on the `white-corners` milestone from
      `white-cross-only`.
- [x] **TS-3** — Promote `sexy-move-mirror` to the catalog, parity-pinned; extend the catalog spec.
- [x] **TS-4** — Export the teaching module from the engine barrel; confirm boundaries lint passes.

### Phase PD — Step + milestone model (web)

- [x] **PD-1** — Extend `GoalState` with `yellow-corners-oriented` / `yellow-corners-placed`; build
      them in `illustrative.ts` by composing teaching-solver output; memoise as today.
- [x] **PD-2** — Demos consume a **teaching scenario** (`from`/`to` + piece selector) in addition to
      legacy `algorithmId`; store derives moves from the teaching solver; player highlights `setup`
      vs `trigger` segments. Keep Ch1's legacy path working.
- [x] **PD-3** — Add the **full-chapter practice** step (recommend `chapter-practice` kind; final
      shape decided here): start = previous milestone, recipe = flattened teaching sequence, reuse
      PD7 tap/hint/validation, success = chapter milestone. Update `types.ts`, `coachStore.ts`
      computeds, `LessonPlayer.tsx` switch.
- [x] **PD-4** — Extend the referential-integrity spec (`lessons.spec.ts`): every demo/practice
      resolves to a catalog id **or** a valid teaching scenario; assert **no inline `MoveToken[]`**
      in `data/`.

### Phase C2 — Chapter 2 proof slice (web)

- [x] **C2-1** — Rework `white-corners.ts` end-to-end: recognize (realistic case) → place (U/D
      intuition) → sexy/mirror → repeats, as **several demo steps** on different representative
      cases.
- [x] **C2-2** — Add the full-first-layer practice (from `white-cross-only` → `white-corners`).
- [x] **C2-3** — FR copy pass honoring the tone rules; cheat-sheet + notation intact.
- [x] **C2-4 — Preview artifact + live review (GATE).** Live review of reworked Ch2 on a 13" screen
      against the ergonomics bar. **Passed** (Titux, 2026-06-21) → Phase 37 propagated; a second
      live pass refined Ch3–7.

### Phase 37 — Propagate to chapters 3-7 (web + engine) — gated on C2-4

- [x] **37-1** — Ch3 (second layer): **four named slot gestures** — front-right / front-left (front
      face) and back-right / back-left (back face) — each a legacy `algorithmId` +
      `demoFrom: 'case'` demo on its own clean case; placement via D; full-chapter practice
      `white-corners` → `second-layer`. _Reworked 2026-06-21 (live-review session 2): the original
      two-insert version showed only the front pair while the practice ran back-face (B) inserts the
      demos never taught. Promoted `second-layer-insert-{front-left,back-right,back-left}` to the
      catalog, parity-pinned to `solveSecondLayer` constants — see ADR-0006 roster note 2026-06-21._
- [x] **37-2** — Ch4 (yellow cross): `planYellowCross` (keep `yellow-cross-line/l` + pattern
      recognition); practice `second-layer` → `yellow-cross`.
- [x] **37-3** — Ch5 (orient corners): `planOrientLastCorners` (sexy repeated); practice
      `yellow-cross` → `yellow-corners-oriented`.
- [x] **37-4** — Ch6 (place corners): `planPlaceLastCorners` (`corner-3-cycle` + mirror if needed;
      promote `corner-3-cycle-mirror` only if emitted); practice → `yellow-corners-placed`.
- [x] **37-5** — Ch7 (permute edges): `planPermuteLastEdges` (`ua-perm`/`ub-perm`; promote `ub-perm`
      if emitted); practice → `solved`.

### Phase R — Record & verify

- [x] **R-1** — Revise `PD6`/`PD7`/`D-CHAPTERS` in the plan record (note they are superseded by
      D-DEMO-DECOUPLE / D-PRACTICE-SOLVER / D-MILESTONES-FROM-TEACHING).
- [x] **R-2** — Write an ADR fixing the **teaching-solver ↔ Solver boundary** (`docs/adr/`); update
      AGENTS.md Read-First/Task-Routing if a new doc lands.
- [x] **R-3** — `docs/solutions/` entry: the no-rotation placement model (symptom → root cause → fix
      → prevention), referencing TS-0.
- [x] **R-4** — Full verification (`format:check`, `lint:check`, `typecheck`, `test`, `build`)
      green; **PR #11 → `develop`** opened per `docs/git-workflow.md`. Merge is Titux's to do after
      the automatic Copilot review (no rebase/merge by the agent).

---

## Phased Implementation (exit criteria)

1. **TS — Teaching solver foundations.** _Exit:_ TS-0 spike proves no-rotation feasibility (Ch2 +
   5-7); `planWhiteCorners` lands on the milestone; catalog parity green.
2. **PD — Step + milestone model.** _Exit:_ new milestones build; demos/practice derive from the
   teaching solver; integrity spec forbids inline moves; Ch0/Ch1 still green.
3. **C2 — Chapter 2 proof slice.** _Exit:_ **live 13" review passes** the comprehensibility +
   ergonomics bar. Hard gate.
4. **37 — Propagate 3-7.** _Exit:_ every chapter teaches recognize→place→trigger with full-chapter
   practice; 5-7 use the new intermediate milestones; all specs green.
5. **R — Record & verify.** _Exit:_ decisions revised, ADR + solution recorded, five checks green,
   PR merged per workflow.

---

## Acceptance Criteria

- **A1** — A teaching solver in `cube-engine` returns, for each algorithm chapter, an annotated
  `setup`/`trigger` sequence grouped per piece, deterministically (no BFS), importing nothing from
  `solver/`.
- **A2** — Every algorithm chapter's **practice starts from the previous milestone** (nothing of the
  chapter solved) and **succeeds only on reaching the chapter milestone** — verified by a store spec
  asserting `start === namedState(previous)` and `success ⇔ stickersEqual(frame, namedState(goal))`.
- **A3** — Every algorithm chapter has **more than one demo step**, and **no demo step shares its
  exact starting case with the chapter practice** (the demo==practice defect is gone) — asserted in
  `lessons.spec.ts`.
- **A4** — Ch5 and Ch6 resolve to `yellow-corners-oriented` and `yellow-corners-placed` respectively
  (no longer `solved`); both milestones are real reachable states.
- **A5** — No lesson step carries an inline `MoveToken[]`; every demo/practice resolves to a catalog
  id or a valid teaching scenario (NFR-004 spec extended and green).
- **A6** — No `x/y/z` rotation token appears anywhere in engine or lesson data.
- **A7** — Chapter 2's reworked slice passes a **live review on a 13" screen** against
  [[coach-comprehensibility-bar]] before any of 3-7 is authored.
- **A8** — `format:check`, `lint:check`, `typecheck`, `test`, `build` all green; PR merged per
  `docs/git-workflow.md`.

---

## Subjective Contract

- **Target outcome:** a learner who has never solved a cube follows a chapter, **understands why the
  piece moves where it does**, and solves the full chapter case on their own at the end.
- **Anti-goals:** a catalog of algorithms to memorize; placements presented as formulas; near-solved
  demos that look easy; a practice that replays the demo.
- **References:** cubesolve.com (clarity, few algorithms, intuitive tone) — _inspire, do not copy
  verbatim_; the engine's per-face variants as the **parity source**, not the pedagogy.
- **Anti-references:** the engine's 4 per-face variants as teaching; jargon; walls of notation with
  no intuition; any "turn the cube" that was never shown.
- **Tone/taste rules:** narrative FR lesson prose, D-based white-on-top frame, one gesture
  foregrounded, placement told as a reflex; honors [[coach-comprehensibility-bar]] and
  [[coach-visual-feedback]].
- **Representative proof slice:** **Chapter 2 — White corners**, reworked end-to-end and validated
  live before propagation.
- **Rollout rule:** propagate to chapters 3-7 **only after** Ch2 passes its live review.
- **Rejection criteria:** practice starting from a near-solved cube; practice teaching moves other
  than the chapter's; a placement presented as an algorithm to remember; needing to "guess" you must
  turn the cube without it having been shown.
- **Required preview artifact:** live review of the reworked Ch2 on a small (13") screen (task
  C2-4); reviewer = Titux; a failed review sends the slice back to planning, not forward to 3-7.

---

## References

- Brainstorm:
  [`docs/brainstorms/2026-06-20-coach-placement-pedagogy-brainstorm.md`](../brainstorms/2026-06-20-coach-placement-pedagogy-brainstorm.md)
- Prior plans (decisions revised here):
  [`docs/plans/2026-06-13-coach-mode-v1.md`](2026-06-13-coach-mode-v1.md) ·
  [`docs/plans/2026-06-15-coach-design-wording-plan.md`](2026-06-15-coach-design-wording-plan.md)
  (`PD6` §423-441, `PD7` §443-456)
- Stories: [`docs/stories/coach-mode-v1.md`](../stories/coach-mode-v1.md) ·
  [`docs/stories/coach-mode-v1.architecture.md`](../stories/coach-mode-v1.architecture.md) (NFR-004)
- Engine: `packages/cube-engine/src/application/solver/solveWhiteCorners.ts` (`SEXY_MOVE`, per-face
  variants) · `solveYellowCross.ts` · `solveYellowCorners.ts` (BFS) · `domain/catalog.ts`
- Web: `apps/web/src/features/coach/data/{types.ts,illustrative.ts}` · `stores/coachStore.ts`
  (`caseBase:122`, `$practiceFrame:184`, `$isPracticeSolved:211`)
- ADRs: [`docs/adr/0006-algorithm-catalog-in-domain.md`](../adr/0006-algorithm-catalog-in-domain.md)
  (parity) · [`docs/adr/0002-no-client-side-router.md`](../adr/0002-no-client-side-router.md)
- Past solutions: `docs/solutions/2026-06-19-move-arrows-band-across-faces-not-single-face.md` ·
  `docs/solutions/2026-06-18-cubenet-cross-browser-sizing-and-mobile-overflow.md`
