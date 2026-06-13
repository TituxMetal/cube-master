---
title: 'Coach mode v1 — lessons, content format, progress, scope'
type: brainstorm
date: 2026-06-12
participants: [Titux Metal, Claude]
related:
  - docs/adr/0006-algorithm-catalog-in-domain.md
  - docs/adr/0002-no-client-side-router.md
  - docs/product.md
  - docs/_archive/MVP.md (reference only)
  - docs/_archive/frontend-design.md (reference only, Coach layout sketch)
---

# Coach mode v1 — lessons, content format, progress, scope

## Problem Statement

Coach is the last unshipped mode. `docs/product.md` and ADR-0006 already fix the broad shape (lesson
browser, live demos, practice mode, algorithm catalog in the engine's domain layer). What was
actually undecided — and what this brainstorm settles — is four things: what a lesson _is_, where
its prose lives, whether learner progress is persisted, and the exact v1 perimeter. A fifth question
(routing) and a sixth (an ADR-0006 amendment) emerged during research.

## Context

Internal research (file references verified 2026-06-12):

- **The catalog does not exist yet.** ADR-0006 is Proposed; the algorithms sleep as bare
  `MoveToken[]` constants in `solveYellowCorners.ts:10-26` (SUNE, ANTI-SUNE, corner 3-cycle, Ua/Ub
  perms, two commutators).
- **Every solver phase already carries its own algorithms** as private constants: the sexy-move
  variant `R' D' R D` in `solveWhiteCorners.ts:13-51`, right/left inserts in
  `solveSecondLayer.ts:25-58`, `LINE_ALG`/`L_ALG` in `solveYellowCross.ts:8-12`, extraction and
  flipped-insert tables in `solveWhiteCross.ts:37-59`. The "two consumers (BFS + Coach)" premise of
  ADR-0006 was already inaccurate in the code: the solver is five consuming phases, not one.
- **Step playback machinery exists and is reusable**: `$cubeAtStep` (replays
  `allMoves.slice(0, stepIndex)`), `nextStep`/`previousStep`, and `StepControls` is generic (props
  `currentStep`/`totalSteps`/`onPrevious`/`onNext`, no solver coupling). `CubeNet` takes plain
  `StickersByFace`. All exported from `features/solver/index.ts`.
- **Practice mode is architecturally free**: `applyMoves` and `invertMoves` are public engine API —
  scramble-to-case is `invertMoves(algorithm)` applied to a solved cube.
- **Timer persistence pattern**: hand-rolled localStorage (`cubeMaster:solves`), plain Nanostores
  atom + `listen`, **no schema versioning** (known footgun). Nothing shared in `lib/` yet.
- **Routing**: the hand-rolled router (`lib/router.tsx`) does exact-match only. `/coach` is
  registered as a stub; `/coach/:lessonId` is unsupported today. ADR-0002 says re-evaluate when
  routing needs grow.
- **No markdown/MDX pipeline** in Vite, and no prior brainstorms/plans/solutions touch Coach.
  `docs/_archive/MVP.md` sketched a lesson schema
  (`title, category, explanation, algorithms[], practice cases[]`);
  `docs/_archive/frontend-design.md:304-316` sketched the Coach layout.

External grounding (2025–2026 state of the art):

- The field cleanly separates **chapter lessons with checklist completion** (J Perm, CubeSkills)
  from **case-grid trainers with Train/Recap** (csTimer, bestsiteever-style OLL trainers). Nobody
  notable merges them into one surface.
- J Perm's beginner method is exactly **7 sequential steps** — matching our 7 teaching phases — and
  leans on **one foundational 4-move sequence reused across steps**; notation is deliberately not
  required at the start.
- Content format consensus for apps this size: **typed TS data modules**; MDX is a documented cost
  (escapes typecheck, plugin dependency), not a default.
- Progress: per-lesson checkmarks are CubeSkills' _entire_ progress system; **version the
  localStorage schema from day one**; last-write-wins across tabs is acceptable.
- Algorithms: store in WCA notation, parseable by cubing.js `Alg`; hand-curate ~15–25 algorithms for
  v1 rather than importing any dataset (license and fit issues).

## Chosen Approach

Coach v1 ships the **7-chapter beginner journey**: one lesson per teaching phase, each lesson a
**sequenced chapter** with internal steps (understand → live demo → practice). Lesson narrative
lives as **typed TS data in `apps/web/src/features/coach/data/`**, referencing the engine's
algorithm catalog by id. The catalog (ADR-0006, amended) holds the **canonical form of every named
algorithm** in `packages/cube-engine/src/domain/`, consumed by the five solver phases and exposed by
Coach. Progress is a **versioned localStorage checklist** (`cubeMaster:coachProgress`) behind a
shared `lib/` storage utility. The hand-rolled router gains **parameter matching** so lessons are
addressable at `/coach/:lessonId`. The demo player mirrors the solver's `$cubeAtStep` pattern;
practice mode scrambles to a case via `invertMoves` on a solved cube.

## Why This Approach

It is the assembly of proven parts: the chapter-with-checklist model is the established lesson
pattern (J Perm/CubeSkills), the playback and scramble-to-case machinery already exists in the repo,
and typed TS content is the documented consensus for an app this size. Every piece either reuses
existing code or follows a pattern the repo already practices (Nanostores per feature, localStorage
like the Timer, no routing lib per ADR-0002). The one structural change — promoting canonical
algorithms into the catalog — was going to happen anyway under ADR-0006; the investigation showed it
serves five solver phases, not just the BFS.

## Subjective Contract

- **Target outcome:** a learner who has never solved a cube finishes the 7 chapters and solves one —
  J Perm-like clarity, one foundational sequence (the sexy move) reused across chapters, notation
  introduced gently rather than assumed.
- **Anti-goals:** an algorithm reference dump (AlgDb style); a case-grid trainer disguised as
  lessons; prose that assumes YouTube context the app doesn't provide.
- **References:** J Perm's 7-step beginner page (structure, mnemonics); CubeSkills' module → lesson
  → checkmark hierarchy; `docs/_archive/frontend-design.md` Coach layout sketch.
- **Anti-references:** bestsiteever/csTimer case grids (that's the _trainer_ pattern, reserved for
  the future intermediate tier); MVP-era scoping language that makes modes compete.
- **Tone or taste rules:** mode color is signature green; encouraging, concrete, second person;
  every algorithm shown must be demoable on the CubeNet, never prose-only.
- **Rejection criteria:** a lesson step that can't be completed without leaving the app; a demo that
  drifts from what the solver executes; chapter prose longer than the learner's patience (if a
  chapter needs scrolling pages of text, split the steps).

## Preview And Proof Slice

- **Proof slice:** the **Second Layer** lesson end-to-end — it exercises every novelty at once:
  catalog promotion (right/left insert), lesson data shape, the step sequence (understand → demo →
  practice), `invertMoves` practice setup, progress checkmark, and the `/coach/:lessonId` route.
- **Required preview artifacts:** the lesson player UI should be seen (screenshot or live) on the
  proof slice before the remaining six chapters are written.
- **Rollout rule:** the other six chapters propagate only after the proof slice's shape survives
  review.

## Key Design Decisions

### Q1: What is a lesson? — RESOLVED

**Decision:** A lesson = one teaching phase = a **sequenced chapter** with internal steps
(understand → live demo → practice). Seven chapters cover the beginner method. **Rationale:**
Matches the established J Perm/CubeSkills model and the 7-phase pedagogical journey of ADR-0006; the
internal step sequence answers the "multi-part form" motivation idea and guides the learner instead
of dumping content. **Alternatives considered:** Single-page chapter (simpler, less guidance —
rejected as weaker on motivation); micro-lesson per algorithm (breaks immediately: White Cross and
Second Layer phases are not one-algorithm phases).

### Q2: Where does lesson prose live? — RESOLVED

**Decision:** Typed TS data in `apps/web/src/features/coach/data/`, referencing catalog entries by
id. The catalog keeps only the short per-algorithm pedagogical description (ADR-0006).
**Rationale:** Full typecheck, zero build plumbing, narrative wording changes don't ship through the
engine package. External consensus for this app size. **Alternatives considered:** Everything in the
engine domain (single source, but long prose in a framework-agnostic package and every wording tweak
becomes an engine change — the exact pressure ADR-0006 lists as its expiry condition); markdown via
`?raw` imports (diff-friendly but untyped frontmatter and a second format for only 7 lessons); JSON
(strictly dominated by TS here: no comments, no reuse, no checked conformance).

### Q3: Is learner progress persisted? — RESOLVED

**Decision:** Yes — a versioned localStorage checklist under `cubeMaster:coachProgress`
(`{ version, completedLessons[], current: { lesson, step } }`), built on a new shared, versioned
storage utility in `apps/web/src/lib/`. **Rationale:** The chapter model needs checkmarks and
"resume where I was" to deliver its motivation promise; checklists are the proven minimum
(CubeSkills' whole progress system). Cost is low — it generalizes the Timer's existing pattern — and
versioning from day one avoids the Timer's known schema-migration footgun. **Alternatives
considered:** Out of scope for v1 (contradicts the stated goal that the learner "continues and stays
motivated"); in-memory only (UI promises a memory it doesn't keep).

### Q4: v1 perimeter — RESOLVED

**Decision:** **Beginner method only, types ready.** Content = the 7 beginner chapters. The data
model (`method` on catalog entries and lessons, tiered browser) already encodes
Intermediate/Advanced; those tiers ship empty or hidden. **Rationale:** The "F2L-ready structure" is
paid for by ADR-0006's required fields, not by v1 work. Adding F2L later means writing data, zero
refactor. **Alternatives considered:** Visible locked F2L track (forces designing the F2L curriculum
now for locked UI); real first F2L lessons (intuitive F2L needs a new step kind and widens v1 by a
third).

### Q5: Routing to a lesson (emerged from research) — RESOLVED, amends ADR-0002

**Decision:** Extend the hand-rolled router in `lib/router.tsx` with parameter matching; register
`/coach` (browser) and `/coach/:lessonId` (lesson player). This **amends ADR-0002** (Accepted),
which states "nested routes, route params, and guards aren't built in" and frames the exit as
re-evaluating TanStack Router or Hono SSR — a third path (extend the hand-rolled router, still no
library) is being taken instead, so the ADR must say so or the docs lie about the code.
**Rationale:** Lessons become addressable (sharing, resume, native back/forward) for ~20 tested
lines, staying within ADR-0002's core decision (no routing library). Hono already serves
`index.html` for deep links; only client-side resolution was missing. **Alternatives considered:**
Current-lesson-in-an-atom with a single `/coach` route (no URL per lesson, back exits the mode);
adopting TanStack Router (ADR-0002's exit scenario, disproportionate for one parametric pattern).

### Q6: ADR-0006's "both consumers" bar (emerged from assumption audit) — RESOLVED, amends ADR-0006

**Decision:** Amend ADR-0006 (still Proposed): the catalog holds the **canonical form of each named
algorithm** (sexy move, right/left insert, LINE_ALG/L_ALG, SUNE, ANTI-SUNE, perms, commutators…).
Consumers are the **five solver phases** (BFS included) **and Coach**; each entry must serve at
least one consumer and stay both machine-executable and teachable. Positional variants inside solver
phases remain local derivations. **Rationale:** ADR-0006 as written says every entry must serve "the
BFS and Coach at once" — under that bar, lessons 1–4 would have no catalog entries to point at, and
the audit flagged this as the approach's one unverified assumption. Investigation (chosen over
proceeding on faith) showed the premise was already false in the code: `LINE_ALG` is consumed by
`solveYellowCross`, the sexy move by `solveWhiteCorners` — neither by the BFS. The amendment records
reality rather than betting against it. **Alternatives considered:** Keep the strict bar with inline
move sequences in lessons 1–4 — rejected because it reintroduces exactly the solver/Coach drift
ADR-0006 exists to prevent.

## Open Questions

- **Notation convention in lessons:** the engine works white-on-top, last layer = D (SUNE is
  `R D R' D R D2 R'`), while web tutorials teach U-based algorithms (`R U R' U'`). Coach will be
  visually consistent with the app but not word-for-word with YouTube. Lesson prose must address
  this explicitly (a "why our moves look different" note, or a display-time mapping). To resolve
  during planning.
- **Exact v1 catalog roster and entry ids** (~15–25 canonical algorithms): which named sequences
  from each phase get promoted, and under what names.
- **Do solver phases consume the catalog in v1**, or is promotion write-only at first (catalog
  created, phases refactored incrementally)? Plan decides the sequencing; drift risk is the argument
  for refactoring sooner.
- **Practice-mode success detection:** full-state comparison against solved, or only the
  case-relevant aspect (csTimer checks only the relevant aspect)? Full-state is simpler and probably
  right for beginner cases.
- **Lesson player components:** reuse `StepControls` as-is; `PhaseList` is coupled to the `Solution`
  type and likely needs a sibling for lessons.
- **Timer migration to the shared storage utility** (`cubeMaster:solves` has no version field):
  worth doing opportunistically or leave untouched per the no-refactor non-goal?

## Out of Scope

- User accounts or any progression backend.
- Full OLL/PLL (ADR-0006 names it as a design-expiry condition) and any F2L _content_ in v1.
- Case-grid trainer with Train/Recap and spaced repetition — that's the intermediate-tier trainer
  pattern, distinct from lessons.
- Quiz mode (already marked out in the archived MVP spec).
- Any refactor of Solver or Timer beyond what the shared storage utility strictly needs.
- Markdown/MDX content pipeline and i18n.

## Next Steps

- Amend ADR-0006 per Q6 (canonical catalog, five solver phases + Coach as consumers) and move it
  toward Accepted — first task of planning, since the catalog shape gates everything.
- Amend ADR-0002 per Q5: the hand-rolled router gains parameter matching (`/coach/:lessonId`), still
  no library. Update its "route params aren't built in" consequence and its size claim so the ADR
  keeps describing the actual router — same failure mode as the 5/7-phase drift fixed in
  `docs/product.md`.
- `/plan docs/brainstorms/2026-06-12-coach-mode-brainstorm.md` to create the implementation plan,
  starting from the Second Layer proof slice.
- Candidate for `/compound` once built: "every solver phase already carries its algorithms as
  private constants — catalog promotion is extraction, not authoring" turned out to be the
  load-bearing discovery of this brainstorm.
