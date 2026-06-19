---
title: 'feat: Coach design + wording — a comprehensible beginner journey (F4 + F5)'
type: plan
date: 2026-06-15
status: in_progress
brainstorm: docs/brainstorms/2026-06-14-coach-design-wording-brainstorm.md
confidence: high
---

# feat: Coach design + wording — a comprehensible beginner journey (F4 + F5)

Rebuild Coach so it **teaches, shows, and fits one screen**: an interactive notation primer (Chapter
0), a visual on every step, a compact single-viewport player, a fluid + arrow-capable shared
CubeNet, a narrative **French** voice, and a demo model where case-resolver chapters resolve to
solved. Validate on a **White Cross proof slice** reviewed live on a 13" MacBook Pro before
propagating to all 7 chapters.

This plan resolves Follow-Ups **F4** (design + wording, PR-gating) and **F5** (last-layer chapters
4–7) from [the v1 plan](2026-06-13-coach-mode-v1.md). It runs **on this same branch**
(`feature/coach-mode-v1`); landing it is what finally unblocks the v1 plan's **D2** (PR to
`develop`).

Advances the **Coach** mode of [`docs/product.md`](../product.md). Solver and Timer change only
through the **one shared seam** they opt into: the fluid CubeNet (and Solver gains move-arrows,
closing issue #7).

---

## Problem Statement

The in-progress Coach is structurally functional but, reviewed by Titux on 2026-06-14, **does not
actually teach a true beginner anything**. Three concrete failures (from the brainstorm):

1. **No visual examples.** White Cross shows _nothing_ — a learner who doesn't yet know what
   `L F B U R D` mean cannot follow prose alone.
2. **Notation is never taught.** The app explains none of the move notation; even minimal reference
   sites do this first.
3. **Ergonomics break on a 13".** You must scroll millimetre by millimetre to see prose + cube +
   moves together, because the all-vertical player stacks them and the CubeNet is not responsive
   (fixed `size-20/28/36` breakpoints — "breakpoints can't fit a box").

The brevity constraint was over-applied to the point of incomprehensibility. The goal is **not** the
best cube tutorial on the web — it is a _minimal but genuinely comprehensible_ beginner guide,
reasonably ergonomic, dark-themed, on the flat CubeNet.

## Target End State

When this lands:

- A **never-solved, non-anglophone** beginner opens `/coach`, reads **Chapitre 0 "Lire le cube"**
  (taps faces, turns `R` / `R'`), then walks all **7 chapters** in French and solves a cube —
  understanding _why_, not just copying moves.
- **Every step carries a visual.** No step is prose-only; `understand` steps render an illustrative
  cube state with piece highlighting.
- The **player has no _horizontal_ scroll on a 13"** and reads top-to-bottom as a single column
  (title → prose → cube → move-row → controls → nav; step list is a slim horizontal progress bar in
  the header). The **compact intent stands**: the important info sits near the top, reachable with
  little scrolling. Some _vertical_ scroll (clearing the navbar, more so on mobile) is **tolerated
  when needed** — not an objective to eliminate at all costs, not a free pass either. The hard
  defect is _horizontal_ scroll, or content overflowing its column. _(Shipped as a vertical
  **stack**, not the two-pane "text left / cube right" of D-LAYOUT — see F9 outcome.)_
- The **shared CubeNet is sized in fixed rem per breakpoint**
  (`size-14 sm:size-20 md:size-24 lg:size-28`, CSS-only, no new dependency) — it fits its panel **by
  width** with no horizontal scroll and renders identically across engines; height is absorbed by
  normal vertical scroll. Solver and Timer inherit it without layout regression. _(Container queries
  and `vw` were both tried and reverted — see F4 outcome +
  `docs/solutions/2026-06-18-cubenet-cross-browser-sizing-and-mobile-overflow.md`.)_
- The shared CubeNet supports **piece highlighting** and an **active-move arrow** overlay; Solver
  consumes the arrows → **GitHub issue #7 closed**.
- **All 7 chapters reference real, promoted, parity-pinned algorithms** — `white-cross-flip`
  (`D R F' R'`) and `ua-perm` (`[...SUNE,'D']`) are promoted to the catalog; "demo = solver
  executes" holds everywhere; no invented Coach-only algorithms (NFR-004).
- Case-resolver demos **play case → solved**; the v1 inverse-reset-notation aid is **removed** (no
  longer needed — D-DEMO dissolves that F4 debt).
- The **entire Coach is French** (prose + chrome); the rest of the app stays English — a documented,
  accepted deviation (ADR-0008).
- `format:check`, `lint:check`, `typecheck`, `test`, `build` all green; the proof slice passed its
  13" review; **v1 plan D2 PR opens to `develop`**.

## Scope and Non-Goals

**In scope:** the brainstorm's chosen approach in full — Chapter 0 primer, per-step visuals, compact
player, fluid + highlight + arrow CubeNet, FR voice + chrome, case→solved demo model, two engine
promotions, and **all 7 chapters** (rewrite 1–3, author 4–7).

**Non-Goals** (carried from brainstorm + v1):

- **No 3D** — flat CubeNet only. **Dark theme only.**
- No i18n infrastructure (FR is hardcoded; a real i18n layer is a tracked follow-up).
- No auto-play / speed slider (prev/next stepping only — D-CONTROLS).
- No "guided full-solve" capstone (one continuous scramble through all 7 chapters — a future build).
- No case-grid trainer, quiz, spaced repetition, accounts, or sync.
- No F2L/OLL/PLL content. No Timer/Solver feature work beyond inheriting the shared CubeNet.
- No remapping of D-based notation to U-based (D3 stands; the app teaches what it executes).
- No new runtime dependency (NFR-002); no inline `MoveToken[]` in steps (NFR-004).

---

## Proposed Solution — Build Sequence

Foundations land first (engine + shared CubeNet + data model + store + player shell), converge into
the **White Cross + Chapter 0 proof slice**, which is reviewed **live on a 13"** and gates the
broadening to the remaining chapters.

```
Phase F — Foundations (mostly parallel)
  F-engine   : promote white-cross-flip + ua-perm to catalog, parity-pinned
  F-cubenet  : fluid sizing (container queries) → highlight prop → active-move arrow (#7)
  F-model    : extend Step model (understand visual, interactive step, demo-direction)
  F-store    : case→solved demo frames; drop inverse-reset; tap-to-turn state
  F-player   : compact single-viewport layout; horizontal progress bar; FR chrome; cheat-sheet
        │  (all green before P)
Phase P — Proof slice: Chapter 0 + White Cross, end-to-end, in French
  author Ch0 (interactive primer) + rebuild Ch1 (flip demo/practice + visuals) → PREVIEW GATE (13")
        │  (a pass propagates; a failure returns here)
Phase B — Broaden (gated on P)
  rewrite Ch2 White Corners + Ch3 Second Layer → author Ch4–7 (F5), all FR, new template
Phase S — Ship
  full verification → ADR-0008 + ADR-0006 roster note → docs → open v1 D2 PR to develop
```

`/work` may interleave the Phase F tracks, but **must not** start Phase P until all foundations are
green, and **must not** start Phase B until the Phase P gate passes.

---

## Implementation Tasks

Dependency-ordered. `[code]` = implementation, `[design]` = decision/doc, `[content]` = FR lesson
copy, `[gate]` = human review. Acceptance lives in the Acceptance Criteria section.

### Phase F — Foundations

**F-engine — catalog promotions (engine only, independent):**

- [x] **F1** `[code]` Promote **`white-cross-flip`** (`['D','R',"F'","R'"]`, method `beginner`). In
      `solveWhiteCross.ts`, extract the `FLIPPED_INSERT['UF']` literal to an exported const
      `FLIPPED_EDGE_INSERT` and reference it in the table (zero runtime change). Add the catalog
      entry in `domain/catalog.ts`. Extend `catalog-parity.spec.ts` to deep-equal the entry's
      `moves` to the **live** `FLIPPED_EDGE_INSERT`. (D-WHITECROSS)
- [x] **F2** `[code]` Promote **`ua-perm`** (`['R','D',"R'",'D','R','D2',"R'",'D']`, method
      `beginner`). In `solveYellowCorners.ts`, extract `export const UA_PERM = [...SUNE, 'D']` and
      use it in the `ALGORITHMS` array in place of the inline spread (zero runtime change). Add the
      catalog entry; extend the parity spec to deep-equal the entry to the live `UA_PERM`.
      (D-CATALOG-FINISH) _Depends: none; parallel with F1._
- [x] **F3** `[design]` Record the two new entries in **ADR-0006**'s roster note (still within its
      stated scope; its expiry trigger is OLL/PLL scaling, not this). _Depends: F1, F2._

**F-cubenet — shared CubeNet upgrades (shared layer; Solver + Timer inherit):**

- [x] **F4** `[code]` **Fluid sizing spike + apply (D-RESPONSIVE).** Replace discrete
      `size-20/28/36` on `FaceGrid` with **one fluid face size** driven by Tailwind v4 container
      queries (in core since v4.0; repo is on `tailwindcss@4.2.2` → **no plugin, no dependency**).
      CSS-only, no JS. **This is a spike before propagation** — the feature support is not the risk
      (container queries + `cq*` units are baseline since early 2023); the risk is the layout
      plumbing, so the spike is structured as **path A (attempt) → path B (proven fallback)**, and
      **must not** ship a `container-type: size` against a parent without a determinate height (the
      April collapse):

      - **Path A — fit by width AND height (preferred; satisfies the 13" contract).** Give the cube
        panel a **bounded height** first: the right pane is a flex/grid track with `min-h-0` inside a
        player shell bounded by the viewport (`~100dvh − navbar`), so `container-type: size` has a
        height to resolve against. Size cells via `min(<cqw>, <cqh>, <cap>)`. **Acceptance:** no scroll
        to see prose + cube + moves on a 13", and the panel does **not** collapse to 0.
      - **Path B — fallback, no collapse risk (use if A can't be made to hold).** `container-type:
        inline-size` (width-only → never collapses) + `aspect-ratio: 4/3` on the net + a `max-height`
        on the pane to prevent vertical overflow; size by width via `cqi`. Sidesteps
        `container-type: size` entirely.

      **Decision rule:** attempt A; if the panel cannot be given a stable bounded height without
      fighting the layout, fall to B. **Either** path passes F4 iff the proof-slice panel has **no
      scroll on a 13"** and no collapse. The current breakpoint sizing stays reachable as a last
      resort only if both fail (which would re-open the layout approach, not just tuning). Eyeball
      Solver and Timer after, whichever path lands. _First F-cubenet task — gates the layout work
      (F9)._

      **Outcome (2026-06-18) — both A and B failed; shipped the fallback.** `container-type: size`
      collapsed to ~0 inside the flex `items-center` parent (the April bug), and the `vw`/`cqi`
      fallback tied the cube to the viewport so it rendered a different size in Chromium vs Firefox.
      Shipped **fixed rem per breakpoint** instead (`size-14 sm:size-20 md:size-24 lg:size-28`,
      mirroring the Solver's `InteractiveFaceGrid`): identical across engines, never collapses, no
      horizontal scroll; any extra height is absorbed by vertical scroll (tolerated when needed — the
      compact intent still holds; see the balanced no-scroll clarification in the Subjective
      Contract). F4 is **done via the breakpoint fallback, not A/B**.
      Full root cause in `docs/solutions/2026-06-18-cubenet-cross-browser-sizing-and-mobile-overflow.md`
      (S2).

- [x] **F5** `[code]` Add an optional **highlight** capability to `CubeNet` + `FaceGrid`
      (`highlight?: Partial<Record<FaceCode, readonly number[]>>` → ring/emphasis on those sticker
      indices). Pure addition; existing call sites unaffected. (D-VISUAL needs this.) _Depends: F4._
- [x] **F6** `[code]` Add an optional **active-move arrow** overlay to `CubeNet`
      (`activeMove?: MoveToken` → a direction arrow on the affected face, derived from the token).
      SVG/CSS overlay, no dependency. Wire Solver's current move to it → **close issue #7** (eyeball
      Solver). _Depends: F4. May be tuned/finished within Phase P if direction-mapping proves fiddly
      — highlight (F5) is the must-have, arrows are the should-have._

**F-model — lesson Step model (coach data; independent of cubenet):**

- [x] **F7** `[design]` Extend `features/coach/data/types.ts` (D-VISUAL, D-CH0-MODEL, D-DEMO): -
      `UnderstandStep` gains
      `visual?: { state: 'solved' | { caseOf: string }; highlight?: Partial<Record<FaceCode, readonly number[]>> }`
      — render solved/partial **or** an algorithm's case (`applyMoves(solved, invertMoves(alg))`),
      with highlighting. No inline `MoveToken[]` (NFR-004): a `caseOf` references a catalog id. -
      Add an **`InteractiveStep`** kind for Chapter 0 tap-to-turn (`kind: 'interactive'`; carries
      which faces are tappable / the prompted moves). Local live cube, reuses `applyMoves`. -
      `DemoStep` gains `demoFrom?: 'case' | 'solved'` (default `'case'`) so case-resolvers demo
      case→solved and the one pure-trigger (`sexy-move`) can stay solved→forward. Update the
      `LessonStep` union and `lessons.spec.ts` referential-integrity guard.

**F-store — demo frames + interactivity (depends on F7):**

- [x] **F8** `[code]` Rework `coachStore` `$demoFrame` per **D-DEMO**: a demo with
      `demoFrom: 'case'` starts from `applyMoves(solved, invertMoves(moves))` and plays **forward to
      solved**; `demoFrom: 'solved'` keeps the v1 solved→forward path. **Remove the inverse-reset
      machinery** (`$inverseMoves` surface) — no longer needed since case-resolver demos end solved.
      Add a `$understandVisual` computed (resolves a step's `visual` to a `StickersByFace` +
      highlight). Add tap-to-turn state for `InteractiveStep`. Update `coachStore.spec.ts`.
      _Depends: F7._

**F-player — compact player + chrome (depends on F4, F5, F7):**

- [x] **F9** `[code]` Rebuild `LessonPlayer` to **D-LAYOUT**: two-pane **text left / (cube +
      move-row + controls) right**, both visible without scrolling on a 13"; replace the `1fr_16rem`
      step **sidebar** with a **slim horizontal progress bar in the header**. Mobile: tight stack
      (title → 2–3 prose lines → cube → controls → nav). Render the new `understand` visual (F8) and
      `interactive` step. Drop the inverse-reset block. _Depends: F4, F5, F7, F8._

      **Outcome:** shipped as a **single vertical stack** on all widths (title → prose → cube →
      move-row → controls → nav), **not** the two-pane "text left / cube right". This is **deliberate**:
      the two-pane layout left too much empty space beside the cube on desktop (the CubeNet isn't tall
      enough to fill the column). The slim horizontal progress bar in the header landed as planned.
      Consequence: some vertical scroll (past the navbar, more so on mobile) is tolerated when needed
      — the goal stays compact, only horizontal scroll is an outright defect (see the Subjective
      Contract clarification).

- [x] **F10** `[code]` Add a **collapsible notation cheat-sheet** (6 faces + `'` / `2`) available in
      every lesson's chrome (D-NOTATION). Reusable component in the player shell. _Depends: F9._
- [x] **F11** `[content]` **Translate all player/browser chrome to French** (D-LANG):
      `LessonPlayer`, `LessonBrowser`, `LessonStepList`/progress bar, `StepControls` labels,
      cheat-sheet, not-found and practice-solved messages. Hardcoded FR strings;
      identifiers/comments stay EN. _Depends: F9, F10. Must land with Phase P so the 13" review sees
      the real FR chrome._

### Phase P — Proof slice (Chapter 0 + White Cross, in French)

- [x] **P1** `[content]` Author **Chapitre 0 "Lire le cube"** (`order: 0`): "Les 6 faces"
      (tap-to-highlight), "Tourner une face" (tap `R`, then `R'`), "Un détail sur nos coups" (the
      D-vs-U note, **once, here**). FR drafts in the brainstorm are the starting copy. _Depends:
      F8–F11._
- [x] **P2** `[content]` Rebuild **Chapitre 1 — La croix blanche** to the fixed template
      (D-CHAPTERS): keep intuitive matching (understand + visuals, incl. the "bonne croix vs côtés
      non alignés" comparison), **add a `demo` + `practice`** for the flipped-edge case using
      `white-cross-flip`, `demoFrom: 'case'`. Catalog-id refs only. FR copy from the brainstorm.
      _Depends: F1, F8–F11._
- [x] **P3** `[code]` Wire `/coach` (Chapter 0 + White Cross visible, ordered) through the new
      player + fluid/arrow CubeNet; update `Coach.spec.tsx` / `LessonPlayer.spec.tsx`. _Depends: P1,
      P2._
- [x] **P4** `[gate]` **PREVIEW GATE — Titux reviewed live on his 13" MacBook Pro (2026-06-15):
      FAILED**, then reworked, then **PASSED (2026-06-19)** to unblock Phase B (see the re-proof
      note below and P5). The fail flagged (among others) a microscopic/illegible CubeNet on early
      steps, a pale self-biting arrow, horizontal overflow on the bottom nav, and a broken home
      page. Rework in commits `cd53e88`→`ebb18c6` resolved the **scroll / CubeNet-sizing / layout**
      items — Titux confirms **those** are now acceptable (fixed-rem sizing, single-column stack, no
      horizontal scroll; see F4 + F9 outcomes and S2).

      **Deferred fail-items resolved + validated (2026-06-19, commits `d733fda`→`abc22f0`).** The
      remaining fail items are now fixed and **Titux validated them** ("tout est bon cette fois"):
      - **Arrow design → ruwix-faithful.** The earlier model arrowed only the single turning face;
        it now draws the **band across the four neighbouring faces** (the cycling strips), each
        triangle a clean solid in a **darker shade of its sticker colour** (`arrowFillByColor`), with
        a **solid circular rotation arrow** on the turning face. Verified by headless render against
        the ruwix screenshots in `~/screenshots/2026-06-15/`.
      - **Solver "petit 2" → fixed.** Double moves (R2/U2…) were arrow-less because the old per-cell
        angle returned null for half turns; the band model keeps the arrows on half turns (badge
        carries the "×2"). Shared `MoveArrow`, so Solver inherits it.
      - **Wording → icons.** Wide-text nav/stepper buttons replaced by lucide icon buttons; the
        "terminer le chapitre" toggle dropped for auto-completion on reaching the last step.
      - **Partial-state visuals / highlight → dim-veil.** Highlighting now veils the non-relevant
        stickers instead of a low-contrast outline; the white cross keeps its centre lit.

      Open questions still standing: **sexy-move framing** (Chapter 2 unauthored). White Cross depth
      → flip-only (decided, see `white-cross.ts`). No fresh *formal* full-slice 13" sign-off is
      recorded as a single event, but every called-out fail-item is now individually validated.

      **Phase B go given + demo model reopened (2026-06-19).** Titux gave the explicit go for Phase B.
      Reviewing the White Cross demo he rejected the **case → solved** model (PD3): starting from a
      *quasi-solved* cube and ending fully solved "ne montre pas le cas embêtant" — he wants the demo
      to start from a **real mid-solve case** (surrounding layers still scrambled) and end on **the
      step's milestone** (the white cross done), not the whole cube solved. This supersedes PD3 for
      case-resolver demos — see **PD6**. A short re-proof on Ch1 (the new milestone demo, live on the
      13") gated Phase B authoring.

      **Re-proof passed (2026-06-19).** Titux reviewed the reworked Ch1 (milestone demo + interactive
      practice) on his 13" and **validated it to unblock Phase B** ("oui c'est mieux… vas-y ça passe…
      je valide pour qu'on puisse faire les autres chapitres"). **Standing concern, deferred by him to
      the full-journey review:** demo and practice still teach the *same* case back-to-back, and the
      intuitive insertion step (Ch1 step 3) shows no motion. He explicitly judged that this can only be
      assessed once the template is **propagated to all chapters** ("tant que c'est pas propagé… c'est
      tourner en rond"). So Phase B authors on the current template and the **chapter-structure
      question (separate demo vs. integrated/again) is reopened at the end of Phase B**, on the whole
      journey, not per chapter. **Phase B is unblocked.**

- [x] **P5** `[gate]` **Milestone-demo re-proof (Ch1) — PASSED (validated by Titux 2026-06-19).**
      Foundations reworked per PD6 (commits pending): `types.ts` adds `GoalState` + a per-step
      `goal`; `illustrative.ts` exposes `CubeState` milestones; `coachStore` builds a case demo as
      `applyMoves(goal, invertMoves(alg))` (ends on the milestone) and scores practice against the
      milestone; Ch1 demo/practice carry `goal: 'white-cross-only'` with faithful FR prose. Full
      verification green (format/lint/typecheck/271 tests/build). **Known trade-off to judge:**
      anchored on the cross milestone, `invertMoves(white-cross-flip)` displaces one cross arm into
      the scramble rather than leaving a clean flip-in-slot, so the case reads as "one cross edge
      still to place on a mixed cube" — the prose was rewritten to match. A pass propagates the
      model to Phase B; a failure tunes Ch1 (e.g. a less-scrambled anchor for this one demo) before
      broadening. _Depends: P3._

      **Demo vs practice disambiguated — practice is now interactive (2026-06-19).** Reviewing the
      slice Titux flagged that **demo and practice did exactly the same thing** (both rendered the
      same `PlaybackPane` stepper; only the end message differed) — the practice was never made
      interactive, so it read as a second viewing. Resolved per **PD7**: a **demo** stays the cube the
      learner *watches* step through (prev/next), a **practice** is now the cube the learner *drives*
      — they **tap each move of the recipe themselves** (reusing the Ch0 tap mechanic, seeded from the
      case), the notation highlights how far they've got, the active-move arrow + the next move's
      button hint the next tap, and success is reaching the milestone. Store: `$practiceMoves` /
      `$practiceFrame` / `$practiceProgress` + `applyPracticeMove`/`resetPractice`; `$demoFrame` is
      demo-only; `$isPracticeSolved` scores the learner's taps. This is part of the P5 gate.

### Phase B — Broaden (gated on P4 + P5)

- [ ] **B1** `[content]` Rewrite **Chapitre 2 — Les coins blancs** to the template: understand +
      visuals, `sexy-move` demo (framing per the P4 decision), practice case→solved. FR. _Depends:
      P4._
- [ ] **B2** `[content]` Rewrite **Chapitre 3 — Le deuxième étage** to the template: right +
      mirrored left inserts (`second-layer-insert-{right,left}`), demos `demoFrom: 'case'`, one
      practice. FR. _Depends: P4._
- [ ] **B3** `[content]` Author **Chapitre 4 — La croix jaune** (`yellow-cross-line`,
      `yellow-cross-l`): recognize dot/L/line, demo each case→solved. Resolve the dot-case
      presentation (apply twice vs own recognize step) during authoring. FR. _Depends: P4._
- [ ] **B4** `[content]` Author **Chapitre 5 — Orienter les coins** (`sune`, `anti-sune`): whole top
      face yellow. FR. _Depends: P4._
- [ ] **B5** `[content]` Author **Chapitre 6 — Placer les coins** (`corner-3-cycle`): cycle corners
      home. FR. _Depends: P4._
- [ ] **B6** `[content]` Author **Chapitre 7 — Finir** (`ua-perm`, promoted in F2): permute the last
      edges → solved. FR. _Depends: F2, P4._
- [ ] **B7** `[code]` `lessons.ts` registry lists all **8** lessons (Ch0–7); `lessons.spec.ts`
      referential-integrity guard green for all; `LessonBrowser` tiers/orders them correctly.
      _Depends: B1–B6._

### Phase S — Ship

- [ ] **S1** `[design]` Author **ADR-0008** — "Coach UI language is French" — recording the accepted
      deviation from the repo's English-UI convention (prose + chrome FR; rest of app EN; no i18n
      layer; revisit if usage justifies). Add it to AGENTS.md Read First / Task Routing if it
      belongs there.
- [x] **S2** `[design]` Capture the **CubeNet cross-browser sizing** lesson as a `docs/solutions/`
      entry — **done:**
      `docs/solutions/2026-06-18-cubenet-cross-browser-sizing-and-mobile-overflow.md`. The captured
      fix is the **opposite** of the original guess: **not** container queries but **fixed rem** —
      never size with `vw` or `container-type: size` on a flex child (it collapses); plus
      `flex-wrap` on navbar/footer and `grid-cols-1 sm:grid-cols-2` on the compare nets to kill the
      mobile horizontal overflow.
- [ ] **S3** `[code]` Full verification green: `format:check`, `lint:check`, `typecheck`, `test`,
      `build`.
- [ ] **S4** `[design]` Update the **v1 plan**: mark F4 + F5 done, link this plan, flip **D2** to
      ready.
- [ ] **S5** **Open the PR to `develop`** (full word), rebased, rebase-merge per
      [`docs/git-workflow.md`](../git-workflow.md). References this plan, the v1 plan, ADR-0006
      note, ADR-0008. This is the v1 plan's **D2** — merge = Coach 100% done (Titux's bar).

---

## Decision Rationale

The brainstorm resolved the product decisions (D-LANG … D-CHAPTERS); these are the **planning**
decisions — sequencing and a few model choices the brainstorm left to planning.

### PD1 — Foundations before the proof slice; proof slice before broaden

The brainstorm's whole point is "don't author 7 chapters on a layout/engine that fails a 13"." So
the shared CubeNet, data model, store, and player shell are built **first**, proven on **one**
chapter (White Cross) + Chapter 0, reviewed on the **actual 13"**, and only then propagated. This
keeps rework cheap: a gate failure throws away one chapter's content, not seven. _Rejected:_ author
all chapters then restyle (the exact failure mode the brainstorm diagnoses).

### PD2 — `understand` visuals reference a catalog `caseOf`, not inline moves

A "recognize the case" visual must show the **same** state the demo resolves. Encoding it as
`{ caseOf: algorithmId }` (rendered via `applyMoves(solved, invertMoves(alg))`) reuses the practice
setup machinery, keeps "what you recognize = what the demo fixes", and honours NFR-004 (no inline
`MoveToken[]`). "Le but" visuals reference `'solved'` (optionally a partial) + a highlight set.
_Rejected:_ inline setup scrambles per step (a fresh drift surface and an NFR-004 violation in
spirit). _One-off note:_ the Ch1 "bonne croix vs côtés non alignés" side-by-side is the single
non-uniform visual — implement it as two small CubeNets in that step, not a generalized model.

### PD3 — Demo direction is a per-step flag (`demoFrom`), defaulting to `case`

D-DEMO makes case-resolvers demo case→solved while the one pure-trigger (sexy move) may stay
solved→forward, "decided at the proof slice." A per-`DemoStep` `demoFrom: 'case' | 'solved'`
(default `'case'`) encodes both without branching on algorithm identity in the store, and lets P4
settle the sexy-move framing by flipping one field. Removing the inverse-reset surface is safe
precisely because case-resolver demos now end solved. _Rejected:_ hard-coding direction by algorithm
id (brittle); keeping the inverse-reset block (dead weight once demos end solved).

### PD4 — Chapter 0 is a new `interactive` step kind, not a bespoke page

Tap-to-turn is genuinely new interaction, but folding it into the lesson model (a fourth `Step` kind
on a normal `Lesson`) keeps Chapter 0 inside the same player, progress bar, and cheat-sheet as every
other chapter — no parallel rendering path. It reuses the already-exported `applyMoves` (no engine
change). _Rejected:_ a standalone notation page outside the lesson system (duplicate chrome, a
second player to maintain).

### PD5 — Arrows ship in the slice but highlight is the hard dependency

`understand` visuals **require** highlight (F5) — it gates Phase P. Active-move **arrows** (F6,
issue #7) are in the slice per D-ARROWS but are the fiddlier piece (token→face→direction mapping).
If arrow direction-mapping threatens the slice, highlight ships and arrows are finished within Phase
P rather than blocking it. This keeps the gate about comprehension (visuals, no-scroll), not about
an SVG overlay. _Rejected:_ dropping arrows (they're resolved in the brainstorm and close #7);
letting arrows block the comprehension gate.

### PD6 — Case-resolver demos resolve to the step's _milestone_, not the solved cube (supersedes PD3's end-state)

Reviewing the White Cross demo (2026-06-19), Titux rejected the case→**solved** end-state: starting
from a quasi-solved cube and ending fully solved hides the real, mid-solve case and reads as
pointless. The fix anchors a demo on a **milestone** (the step's true goal — the white cross done,
the first layer done, …) instead of solved. A demo/practice step carries an optional
`goal: GoalState` (default `'solved'`); the store builds a case demo as
`applyMoves(milestone, invertMoves(alg))` and plays forward, landing **exactly on the milestone**
(the surrounding layers stay scrambled), and practice success is equality to that milestone, not
solved. This is **provably correct by construction** — `(milestone · invert(A)) · A = milestone`,
the same invertibility the old model relied on, re-anchored — **reachable** (milestones are
solver-derived, generalising `illustrative.ts` from phase 0 to phases 0..k, mirroring the five
solver phases), and **NFR-004-clean** (a step still references a catalog id + a named milestone,
never inline moves). It keeps `demoFrom` (PD3) for _direction_ but changes the _destination_; the
last-layer chapters keep `goal: 'solved'` because there the surrounding cube genuinely is solved.
_Rejected:_ hand-building a clean flip-in-slot case (breaks invertibility + risks impossible
states); keeping case→solved (the rejected behaviour). _Trade-off accepted:_ a milestone-anchored
case can displace a piece into the scramble rather than show a textbook in-slot case — judged per
chapter at the gate (P5), prose written to match.

### PD7 — Practice is interactive (the learner taps the moves); demo stays watch-only

Reviewing the slice (2026-06-19) Titux found **demo and practice indistinguishable** — both rendered
the same stepper, only the end message differed, because practice was never made interactive. The
intent (D-CHAPTERS) was demo = _watch the algorithm resolve_, practice = _do it yourself_; only the
first half shipped. The fix makes **practice genuinely interactive**: the learner **taps each move
of the recipe** on the case (reusing the Chapter 0 tap mechanic + `applyMoves`, no engine change),
the cube responds live, the notation highlights matched progress, the active-move arrow and the next
move's emphasised button hint the next tap, and success is reaching the milestone (PD6). The demo
keeps the prev/next stepper (app-driven). This makes the two steps clearly distinct and removes the
redundancy, at the cost of one extra render path + three small store atoms. _Rejected:_ merging
demo+practice into one step (loses the explicit "à toi de jouer" beat Titux wanted kept); free-form
input from the full 18-move palette (overwhelming for a true beginner — the palette is the
algorithm's own moves, guided).

---

## Constraints and Boundaries

- **Hard product constraints:** never 3D (flat CubeNet only); dark theme only; prev/next stepping
  only (no auto-play).
- **NFR-002:** zero new runtime dependency — responsive is CSS-only (container queries); no
  animation lib.
- **NFR-004:** no step carries an inline `MoveToken[]` — demo/practice/`caseOf` reference catalog
  ids only. Both new entries are parity-pinned to live solver constants.
- **Dependency boundaries** (eslint-plugin-boundaries): the upgraded CubeNet/FaceGrid stay in
  **shared** `features/cube` (Solver + Timer inherit); `features/coach/*` import shared + features;
  `packages/cube-engine` stays framework-agnostic (the promotions are pure TS).
- **House Rules:** TS strict, no semicolons, arrow-functions-only, named exports only, co-located
  `.spec.ts(x)`, `~/` alias, `bun run <script>` only.
- **Convention deviation (documented):** FR product copy (prose + chrome) inside an EN-UI app + EN
  docs — recorded in ADR-0008.

## Subjective Contract & Preview Gate

Binding for every `[content]` and player task; inherited from the brainstorm.

- **Target outcome:** a never-solved, **non-anglophone** beginner follows the 7 chapters and solves
  a cube — understanding _why_, not just copying.
- **Voice:** narrative / vulgarisation — encouraging, concrete, second person, **French**. Never "1.
  fais ci 2. fais ça". Short, but **every step is anchored to a visual** — the lever is the visual,
  not more text.
- **Anti-goals:** an algorithm reference dump; a wall of text; prose that assumes YouTube context; a
  case-grid trainer.
- **References:** cubesolve.com (animated notation section, highlighted pieces, directional arrows,
  reassuring tone); ruwix (minimal notation primer, "good cross vs sides not matching"
  side-by-side). **Anti-references:** csTimer/bestsiteever case grids; any "pick one mode" /
  MVP-competition language.
- **Rejection criteria (a result is wrong even if it compiles):**
  - a step that shows nothing (pure prose);
  - **a step with _horizontal_ scroll, or content that overflows its column, on a 13"** — the goal
    stays compact (key info reachable with little scrolling); some vertical scroll (clearing the
    navbar, mobile) is tolerated when needed, but never horizontal;
  - a demo that teaches a sequence the solver doesn't execute (no Coach-only invented algorithms);
  - chapter prose longer than a beginner's patience (split into steps with visuals instead);
  - any 3D rendering; any light-theme surface.
- **Proof slice:** White Cross + Chapter 0, rebuilt on the new layout + fluid CubeNet + primer, with
  the `white-cross-flip` demo + practice.
- **Required preview artifact (gate P4):** reviewed **live by Titux on his 13" MacBook Pro** (not
  just a large screen) against this contract, **before** any other chapter is touched. **Reviewer:**
  Titux. **A failure returns the work to Phase P; only a pass propagates to Chapters 2–7.**

## Assumptions

| Assumption                                                                                              | Status            | Evidence                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tailwind v4 container queries can fit the 4×3 net in a panel by width **and** height without collapsing | **Refuted (F4)**  | `container-type: size` collapsed in the flex parent and the `vw` fallback diverged across engines; shipped **fixed rem per breakpoint** instead — see F4 outcome + solution 2026-06-18 |
| `FLIPPED_INSERT['UF']` extract-to-const leaves solver output unchanged                                  | Verified-by-guard | `solveWhiteCross.spec.ts` asserts output; a drifted value reddens CI                                                                                                                   |
| `[...SUNE,'D']` → `UA_PERM` extract-to-const leaves solver output unchanged                             | Verified-by-guard | `solveYellowCorners.spec.ts` asserts output; the parity spec pins `ua-perm` to the live const                                                                                          |
| Tap-to-turn (Chapter 0) needs no engine change                                                          | Verified          | `applyMoves` is exported from the engine barrel; `applyMoves(state,[move])` covers a single tap                                                                                        |
| Highlight can target stickers by index on the existing render                                           | Verified          | `FaceGrid` maps `stickers.slice(0,9)` by index → a `highlight` set rings those cells                                                                                                   |
| Fluid CubeNet is a pure visual change to a shared component                                             | Verified          | `CubeNet`/`FaceGrid` props are `stickersByFace`/`className`/`label`; sizing is internal — Solver/Timer call sites unchanged                                                            |
| The 7 chapters' algorithms are all in (or promoted to) the catalog                                      | Verified          | Ch2–6 use existing entries; Ch1 `white-cross-flip` (F1) and Ch7 `ua-perm` (F2) are the only promotions                                                                                 |
| FR copy quality is judged by a native speaker                                                           | Verified          | Reviewer is Titux (native FR), live on the 13" at P4                                                                                                                                   |

The single unverified assumption (**container-query fitment**) is de-risked by making **F4 an
explicit spike** that must succeed before the layout work, and is the top entry in Risk Analysis.

## Risk Analysis

| Risk                                                                         | Likelihood | Impact | Mitigation                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Container-query CubeNet collapses / doesn't fit by height (the April pain)   | Medium     | High   | **F4 is a structured spike:** path A (`container-type: size` over a bounded-height pane) → path B (`inline-size` + `aspect-ratio`, no collapse risk) → breakpoints only if both fail. Never ship `size` against a parent without a determinate height. Proven on the White Cross panel before propagating. **Materialized:** both A and B failed → shipped the fixed-rem fallback (solution 2026-06-18) |
| Fluid CubeNet regresses Solver or Timer layout                               | Low        | Medium | Pure-visual shared change; eyeball Solver **and** Timer right after F4; revert to prior sizing for those pages if needed                                                                                                                                                                                                                                                                                |
| Case→solved demo + inverse-reset removal breaks the 3 already-built chapters | Medium     | Medium | Do it in foundations (F8) with `coachStore.spec` updates; Ch2/Ch3 are rewritten in Phase B anyway against the new store                                                                                                                                                                                                                                                                                 |
| Active-move arrows (#7) balloon in scope (token→direction mapping)           | Medium     | Low    | PD5 — highlight is the gating dependency; arrows can finish inside Phase P; gate is comprehension, not the overlay                                                                                                                                                                                                                                                                                      |
| Preview gate (P4) rejects the player shape after foundations are built       | Low        | Medium | Slice is **one** chapter + Ch0 precisely so rework is cheap; Phase B is fully gated behind P4                                                                                                                                                                                                                                                                                                           |
| FR copy fails a true beginner despite the structure                          | Medium     | Medium | The 13" review at P4 is against the comprehension contract; prose is content, cheap to iterate; FR drafts already in the brainstorm                                                                                                                                                                                                                                                                     |
| `interactive` step kind leaks complexity into the player                     | Low        | Low    | PD4 — minimal, reuses `applyMoves`, kept to R/R'; one extra `step.kind` branch                                                                                                                                                                                                                                                                                                                          |

---

## Phased Implementation — exit criteria

- **Phase F (Foundations) — exit when:** both promotions parity-pinned and all engine specs green
  (F1–F3); fluid CubeNet proven on the White Cross panel and Solver/Timer eyeballed (F4);
  highlight + arrow props exist and Solver consumes arrows (F5, F6); Step model extended and
  `lessons.spec` green (F7); store demos case→solved with inverse-reset gone (F8); player is
  single-viewport with FR chrome + cheat-sheet (F9–F11). Full verification green.
- **Phase P (Proof slice) — exit when:** Chapter 0 + White Cross are live in French on the new
  player, and **Titux has reviewed them on his 13" and passed the gate** (P4), with the two
  slice-time open questions resolved. _A failure re-opens Phase P._
- **Phase B (Broaden) — exit when:** Chapters 2–7 authored in FR to the template, all 8 lessons in
  the registry, `lessons.spec` referential-integrity green, browser tiers/orders correctly.
- **Phase S (Ship) — exit when:** ADR-0008 + ADR-0006 note + container-query solution doc written;
  full verification green; v1 plan D2 flipped; PR opened to `develop`.

## References

- Brainstorm:
  [`docs/brainstorms/2026-06-14-coach-design-wording-brainstorm.md`](../brainstorms/2026-06-14-coach-design-wording-brainstorm.md)
  (decisions D-LANG … D-CHAPTERS; FR drafts for Ch0–3)
- v1 plan (this fills F4 + F5, unblocks D2):
  [`docs/plans/2026-06-13-coach-mode-v1.md`](2026-06-13-coach-mode-v1.md)
- ADRs: [`0006`](../adr/0006-algorithm-catalog-in-domain.md) (roster note),
  [`0002`](../adr/0002-no-client-side-router.md), `0008` (author in S1)
- Engine constants to promote: `solveWhiteCross.ts` `FLIPPED_INSERT['UF']`; `solveYellowCorners.ts`
  `[...SUNE,'D']` (under `packages/cube-engine/src/application/solver/`)
- Catalog + parity: `packages/cube-engine/src/domain/catalog.ts`,
  `application/solver/catalog-parity.spec.ts`
- Player + data: `apps/web/src/features/coach/components/LessonPlayer.tsx`, `data/types.ts`,
  `stores/coachStore.ts`
- Shared CubeNet: `apps/web/src/features/cube/components/{CubeNet,FaceGrid}.tsx`; theme tokens in
  `apps/web/src/styles/globals.css`
- Past solutions: `docs/solutions/2026-06-13-lesson-player-shows-cube-but-not-notation.md` (notation
  must render, asserted in spec); `docs/solutions/2026-04-06-d-face-sticker-mapping-row-order.md`
  (derive face row order from viewing direction — relevant to highlight/arrow indexing)
- GitHub issue #7 — Solver move-direction arrows (closed by F6)
