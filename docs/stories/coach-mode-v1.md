---
title: 'Coach mode v1 — stories'
type: stories
date: 2026-06-13
slug: coach-mode-v1
source_brainstorm: docs/brainstorms/2026-06-12-coach-mode-brainstorm.md
architecture: docs/stories/coach-mode-v1.architecture.md
related:
  - docs/adr/0006-algorithm-catalog-in-domain.md
  - docs/adr/0002-no-client-side-router.md
  - docs/product.md
---

# Coach mode v1 — stories

Coach is the last unshipped mode (Solver and Timer are live). v1 ships the **7-chapter beginner
journey**: one lesson per teaching phase, each a sequenced chapter (understand → live demo →
practice), green signature color. Lesson prose lives as typed TS in `features/coach/data/`,
referencing an algorithm catalog promoted into the engine's domain layer. Progress is a versioned
localStorage checklist. Lessons are addressable at `/coach/:lessonId`.

**Proof slice:** the **Second Layer** chapter end-to-end (STORY-001 → STORY-006). It exercises every
novelty at once — catalog promotion, lesson data shape, the step sequence, `invertMoves` practice
setup, progress checkmark, the parametric route. The remaining six chapters (STORY-008) propagate
only after the proof slice's shape survives review.

Stories are dependency-ordered. STORY-001..003 are gating structural changes; STORY-004..006 deliver
the proof slice; STORY-007..008 broaden it. IDs are referenced from the architecture doc's FRs.

---

## STORY-001: Algorithm catalog in the engine domain

**As a** developer building Coach and maintaining the Solver **I want** every named algorithm to
live once in the engine's domain layer with a stable id **So that** Coach can demo exactly what the
Solver executes, with no drift between them

Amends **ADR-0006** (Proposed → Accepted) per brainstorm Q6: the catalog holds the canonical form of
each named algorithm; consumers are the five solver phases **and** Coach; each entry must serve at
least one consumer and stay both machine-executable and teachable.

### Acceptance Criteria

- [ ] A new catalog module exists under `packages/cube-engine/src/domain/` exporting a typed,
      readonly collection of algorithm entries, each with: `id` (stable kebab/const string), `name`
      (human label), `moves` (`readonly MoveToken[]`), `method`
      (`'beginner' | 'intermediate'     | 'advanced'`), and a short `description` (one-line
      pedagogical note).
- [ ] The catalog is the single source for these canonical sequences (ids illustrative, finalized in
      planning): `sexy-move` (`R' D' R D` family), `second-layer-insert-right`,
      `second-layer-insert-left`, `yellow-cross-line` (`LINE_ALG`), `yellow-cross-l` (`L_ALG`),
      `sune`, `anti-sune`, `corner-3-cycle`, `ua-perm`, `ub-perm`, plus the two yellow-corner
      commutators. Final roster is ~15–25 entries (brainstorm open question, resolved in planning).
- [ ] Catalog entries are addressable by id via an exported lookup (e.g. `getAlgorithm(id)`),
      returning `undefined` for unknown ids — never throwing.
- [ ] The catalog is exported from the engine package barrel (`packages/cube-engine/src/index.ts`)
      so `apps/web` imports it from `@packages/cube-engine`.
- [ ] Each catalog entry's `moves` is validated by a `.spec.ts` to be a non-empty array of valid
      `MoveToken`s, and entry `id`s are unique.
- [ ] ADR-0006 is updated to Accepted, recording the amended consumer bar (five solver phases +
      Coach, ≥1 consumer per entry).

### Edge Cases

- Duplicate id at module load → the uniqueness spec fails CI (no runtime dedup magic).
- `getAlgorithm` with an unknown id → returns `undefined`; callers must handle absence.
- An entry that no consumer references → caught in review against the "≥1 consumer" bar, not by
  code.

### Notes

- [INTEGRATION] Engine domain layer stays framework-agnostic — zero React/Hono. The catalog is plain
  TS data + types, consistent with `domain/constants.ts`, `domain/moves/tokens.ts`.
- [INTEGRATION] Whether the five solver phases are _refactored to consume_ the catalog in v1, or the
  promotion is write-only at first (catalog created, phases migrated incrementally), is a sequencing
  decision for `/plan` (brainstorm open question). This story only requires the catalog to _exist
  and contain the canonical forms_; positional variants inside solver phases may remain local
  derivations.
- [INTEGRATION] Source constants to promote, verified at brainstorm time:
  `solveYellowCorners.ts:10-26` (SUNE/ANTI_SUNE/perms/commutators), `solveWhiteCorners.ts:22-51`
  (sexy-move inserts), `solveSecondLayer.ts:25-58` (right/left inserts), `solveYellowCross.ts:8-12`
  (LINE_ALG/L_ALG), `solveWhiteCross.ts:37-59` (extraction/flipped-insert tables).

---

## STORY-002: Versioned localStorage utility in the shared layer

**As a** developer persisting Coach progress (and, later, migrating Timer) **I want** a shared,
versioned localStorage helper in `lib/` **So that** every persisted store carries a schema version
from day one and avoids the Timer's known migration footgun

### Acceptance Criteria

- [ ] A new module in `apps/web/src/lib/` exports a small typed helper that reads and writes a
      versioned envelope `{ version: number, data: T }` to a given localStorage key.
- [ ] On read: a missing key, malformed JSON, or a `version` lower than current routes through a
      caller-supplied migration/validation step and falls back to a provided default — it never
      throws to the caller.
- [ ] On read of an unknown/newer `version` than the code understands → returns the default (does
      not crash, does not silently coerce mismatched shapes).
- [ ] Writes wrap the payload in the current `{ version, data }` envelope.
- [ ] The helper is covered by `.spec.ts`: round-trip, missing key, malformed JSON, version
      mismatch, and `localStorage.setItem` throwing (quota) → silent no-op, no exception bubbles.
- [ ] The helper lives in the `shared` layer and imports only shared (boundary rule).

### Edge Cases

- `localStorage` unavailable (SSR/private mode/quota) → reads return default, writes are silently
  swallowed; the app keeps running in-memory.
- Two tabs writing concurrently → last-write-wins is acceptable (brainstorm decision); no locking.

### Notes

- [INTEGRATION] Models on the Timer's existing pattern (`features/timer/stores/sessionStore.ts`:
  `cubeMaster:solves`, `loadSolves`/`persistSolves`, nanostores `listen`) but adds the version field
  the Timer lacks.
- [INTEGRATION] Migrating the Timer onto this helper is **out of scope for v1** (brainstorm open
  question / no-refactor non-goal). Leave `cubeMaster:solves` untouched unless planning decides
  otherwise.

---

## STORY-003: Router parameter matching for /coach/:lessonId

**As a** learner **I want** each lesson to have its own URL **So that** I can share, deep-link,
resume, and use native back/forward instead of the chapter trapping me in one route

Amends **ADR-0002** (Accepted) per brainstorm Q5: a third path — extend the hand-rolled router with
parameter matching, still **no routing library** — is taken; the ADR's "route params aren't built
in" consequence and its size claim must be updated so the docs keep describing the actual router.

### Acceptance Criteria

- [ ] The hand-rolled router in `apps/web/src/lib/router.tsx` resolves single-segment dynamic routes
      of the form `/coach/:lessonId`, extracting the param and passing it to the matched render
      function.
- [ ] Exact-match routes (`/`, `/solver`, `/coach`, `/timer`) keep resolving exactly as before — no
      regression; static routes win over a dynamic pattern when both could match.
- [ ] An unmatched path still resolves to the existing fallback (no crash, no
      blank-without-fallback).
- [ ] `/coach` (browser) and `/coach/:lessonId` (lesson player) are both registered in `App.tsx`.
- [ ] Router behavior is covered by `.spec.tsx`: exact match, param extraction, static-beats-dynamic
      precedence, unmatched → fallback.
- [ ] ADR-0002 is updated: its "nested routes / route params / guards aren't built in" consequence
      and its size/line claim now describe the parametric capability; the core decision (no routing
      library) is reaffirmed.

### Edge Cases

- `/coach/` (trailing slash, empty id) → resolve to the browser, not a player with an empty id.
- `/coach/does-not-exist` → router resolves the player; the _player_ handles unknown ids
  (STORY-006), not the router.
- Deep-link refresh on `/coach/second-layer` → Hono already serves `index.html` for any path
  (existing server behavior); only client-side resolution was missing. No server change.

### Notes

- [INTEGRATION] Today matching is a single object lookup `routes[pathname]` (`router.tsx:40`); this
  story adds a thin pattern pass while preserving the `Record<string, () => ReactNode>` ergonomics
  for static routes. Keep the change ~20 tested lines (brainstorm scope).

---

## STORY-004: Lesson data model and Second Layer chapter content

**As a** content author and the lesson player **I want** a typed lesson schema and the Second Layer
chapter authored against it **So that** chapters are typechecked, reference the catalog by id, and
the proof slice has real content to render

### Acceptance Criteria

- [ ] A typed lesson model exists in `apps/web/src/features/coach/data/` defining a `Lesson` as a
      sequenced chapter: `id` (matches the `:lessonId` route segment), `title`, `method`, `order`,
      and an ordered `steps[]`.
- [ ] A step is a discriminated union of at least: `understand` (prose), `demo` (references a
      catalog algorithm by `id` to play on the CubeNet), and `practice` (references a catalog
      algorithm by `id` to scramble into a case). The union is `kind`-tagged so the player switches
      on it.
- [ ] `demo`/`practice` steps reference algorithms **by catalog id only** — no inline `MoveToken[]`
      in lesson data (this is the anti-drift contract from STORY-001 / ADR-0006).
- [ ] The Second Layer chapter is authored: understand → demo (right insert) → demo/understand (left
      insert) → practice, with green-toned, encouraging, second-person prose; every algorithm shown
      is demoable (no prose-only algorithm).
- [ ] A `.spec.ts` asserts every algorithm `id` referenced by every lesson step resolves in the
      catalog (`getAlgorithm(id) !== undefined`) — a referential-integrity guard between lesson data
      and the engine catalog.
- [ ] Lesson ids are unique across the lesson registry.

### Edge Cases

- A step references an id absent from the catalog → the referential-integrity spec fails (caught in
  CI, not at runtime for the learner).
- Notation mismatch: the engine teaches white-on-top / last-layer-D (SUNE = `R D R' D R D2 R'`)
  while web tutorials use U-based algs. The Second Layer prose must address this explicitly (a short
  "why our moves look different" note), per the brainstorm open question — visually consistent with
  the app, not word-for-word with YouTube.

### Notes

- [INTEGRATION] Typed TS data, **not** MDX/markdown — full typecheck, zero build plumbing, no new
  dependency (brainstorm Q2). The catalog holds the short per-algorithm description; the lesson
  holds the surrounding narrative.
- [INTEGRATION] The `method` field on lessons (and on catalog entries) encodes Intermediate/Advanced
  tiers now; those tiers ship empty in v1 (STORY-007). F2L-ready structure is paid for here, not by
  v1 content (brainstorm Q4).

---

## STORY-005: Coach store — progress, demo playback, practice setup

**As a** the lesson player **I want** a Coach feature store that tracks progress, drives demo
playback, and sets up practice cases **So that** the UI is a thin view over reactive state,
mirroring how Solver and Timer are built

### Acceptance Criteria

- [ ] A nanostores-based store in `apps/web/src/features/coach/stores/` holds: current lesson id,
      current step index, and a persisted progress checklist
      `{ completedLessons: string[], current: { lesson, step } }`.
- [ ] Progress persists under key `cubeMaster:coachProgress` via the STORY-002 versioned helper
      (version 1 from day one).
- [ ] Marking a lesson complete adds its id to `completedLessons` (idempotent — no duplicates) and
      persists; reload restores both `completedLessons` and `current` ("resume where I was").
- [ ] A computed atom mirrors the Solver's `$cubeAtStep` pattern for **demo** steps: given a demo
      algorithm's `moves`, it exposes the `StickersByFace` at a given playback index by applying
      `moves.slice(0, index)` to a solved state and rendering via `toStickers`. (Coach owns this
      computation in its own store — it does **not** reach into `features/solver` internals.)
- [ ] For **practice** steps, the store derives the scrambled starting `StickersByFace` as
      `toStickers(applyMoves(solvedState, invertMoves(algorithm.moves)))` — scramble-to-case via the
      public engine API.
- [ ] `nextStep`/`previousStep`-style actions advance within a lesson and are clamped to
      `[0, totalSteps]` (no over/underflow), mirroring the Solver action contract.
- [ ] Store logic is covered by `.spec.ts`: progress round-trip via the versioned helper, idempotent
      completion, demo playback frame at index 0 = solved and at index N = fully applied, practice
      setup = inverse-scramble of the case.

### Edge Cases

- Resuming with a `current.lesson` id no longer in the registry (content removed) → fall back to the
  browser / first step, never render a broken player.
- Practice success detection scope (full solved-state compare vs case-relevant aspect) is a
  brainstorm open question — default to full-state compare for beginner cases unless planning
  narrows it; this story exposes the _setup_, detection criteria are pinned in STORY-006.

### Notes

- [INTEGRATION] Reuses public engine API only: `applyMoves`, `invertMoves`, `toStickers`,
  `createSolvedState`, all from `@packages/cube-engine`. No engine change needed for
  playback/practice.
- [INTEGRATION] Same store shape as `features/cube/stores/cube-store.ts` and the Timer stores:
  atoms + `computed` + plain action functions + thin `useStore` hooks; persistence via `listen`.

---

## STORY-006: Lesson player UI — Second Layer proof slice end-to-end

**As a** learner **I want** to open the Second Layer chapter and walk understand → demo → practice
with a progress checkmark **So that** I can learn and complete a chapter without ever leaving the
app

This story closes the **proof slice**. Its UI shape must be reviewed (screenshot or live) before
STORY-008 writes the remaining six chapters.

### Acceptance Criteria

- [ ] Navigating to `/coach/second-layer` renders the lesson player for that chapter, sourced from
      the lesson registry (STORY-004) and Coach store (STORY-005).
- [ ] The player renders each step by `kind`: `understand` shows prose; `demo` shows the algorithm
      playing on a `CubeNet` driven by `StepControls` (reused as-is — it is generic); `practice`
      shows the scrambled case on a `CubeNet` and lets the learner step the solution.
- [ ] `StepControls` is reused unchanged (`currentStep`/`totalSteps`/`onPrevious`/`onNext`); a
      **new** lesson-step navigator component (sibling to `PhaseList`, which is coupled to
      `Solution`) lists the chapter's steps and current position — `PhaseList` is **not** reused for
      lessons.
- [ ] Completing the last step marks the lesson complete (checkmark persists) and offers a way back
      to the browser / next chapter.
- [ ] The player uses the green signature color (`text-cube-green-text` / mode tokens), matching the
      stub's existing token usage.
- [ ] Unknown `/coach/:lessonId` (id not in registry) renders a graceful "lesson not found" state
      with a link back to `/coach` — not a blank screen or thrown error.
- [ ] Player behavior is covered by `.spec.tsx`: renders the Second Layer steps, demo advances
      frames, completion marks progress, unknown id → not-found state.

### Edge Cases

- Practice success: on a correctly executed case the player signals completion of the practice step;
  detection uses the criterion pinned here (default full solved-state compare for beginner cases).
- Mid-chapter reload → player resumes at `current.step` from persisted progress (STORY-005), URL
  stays `/coach/second-layer`.
- A demo with a long move sequence → step prose stays short; if a chapter needs scrolling pages of
  text, split into more steps (brainstorm rejection criterion).

### Notes

- [INTEGRATION] Reuses `CubeNet` (`features/cube`, takes `StickersByFace`) and `StepControls`
  (`features/solver`, generic). `features` may import other `features` (boundary rule) — but the
  demo _computation_ lives in Coach's store (STORY-005), not borrowed from solver atoms.
- [INTEGRATION] Replaces the `pages/Coach.tsx` "Coming soon" stub wiring so `/coach` and
  `/coach/:lessonId` resolve to real Coach surfaces.

---

## STORY-007: Lesson browser and tiered method navigation

**As a** learner **I want** a `/coach` browser that lists chapters in order and shows my progress,
with the intermediate/advanced tiers present but empty **So that** I can see the whole journey, pick
up where I left off, and the F2L structure exists without F2L content

### Acceptance Criteria

- [ ] `/coach` renders a browser listing beginner chapters in `order`, each showing a completion
      checkmark sourced from Coach progress (STORY-005), and a "resume" affordance to `current`.
- [ ] Each chapter entry links to its `/coach/:lessonId` player.
- [ ] The browser groups by `method`; Intermediate and Advanced tiers render as empty/hidden
      placeholders (no content authored, no broken links) — adding F2L later is data-only, zero
      refactor (brainstorm Q4).
- [ ] In v1 the beginner tier shows all 7 chapters once STORY-008 lands; with only the proof slice
      authored it shows whatever chapters exist in the registry (no hardcoded count).
- [ ] Browser behavior is covered by `.spec.tsx`: lists authored chapters in order, reflects
      completion state, empty tiers render without errors.

### Edge Cases

- Zero completed chapters → "resume" points at the first chapter / start, not a dangling `current`.
- A tier with no lessons → renders its placeholder, never a layout break or empty `.map` crash.

### Notes

- [INTEGRATION] References for the browser → player → checkmark hierarchy: CubeSkills module →
  lesson → checkmark; `docs/_archive/frontend-design.md` Coach layout sketch (reference only).

---

## STORY-008: Remaining six beginner chapters

**As a** beginner learner **I want** all seven chapters of the beginner method authored **So that**
I can go from never-solved to solving a cube entirely inside Coach

**Gated:** propagates only after the STORY-006 proof slice shape survives review (brainstorm rollout
rule).

### Acceptance Criteria

- [ ] The six chapters beyond Second Layer are authored against the STORY-004 lesson model: White
      Cross, White Corners, (Second Layer — already done), Yellow Cross, Yellow Corners (orient),
      Yellow Corners (permute) / final step — covering the 7-phase beginner journey end-to-end.
- [ ] Every chapter follows the reviewed proof-slice shape (understand → demo → practice steps),
      references algorithms by catalog id only, and is green-toned/encouraging/second-person.
- [ ] One foundational sequence (the sexy move) is explicitly reused and called back across
      chapters, per the subjective contract.
- [ ] The referential-integrity spec (STORY-004) passes for **all** chapters — every referenced
      algorithm id resolves in the catalog.
- [ ] A learner can complete all 7 chapters in order; the browser reflects full completion.

### Edge Cases

- A phase that is not one-algorithm (White Cross, Second Layer) → multiple demo/understand steps,
  not forced into a single algorithm (brainstorm Q1 rejection of micro-lesson-per-algorithm).
- Any chapter needing an algorithm not yet in the catalog → extend the catalog (STORY-001 contract),
  never inline moves in lesson data.

### Notes

- [INTEGRATION] No new structural work — pure content authoring against the proven shape. If a
  chapter surfaces a missing step `kind`, that is a model change (STORY-004) and a review trigger,
  not an inline workaround.
