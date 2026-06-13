---
title: 'Coach mode v1 — architecture'
type: architecture
date: 2026-06-13
slug: coach-mode-v1
stories: docs/stories/coach-mode-v1.md
source_brainstorm: docs/brainstorms/2026-06-12-coach-mode-brainstorm.md
related:
  - docs/adr/0006-algorithm-catalog-in-domain.md
  - docs/adr/0002-no-client-side-router.md
  - docs/architecture.md
  - docs/frontend.md
---

# Coach mode v1 — architecture

Binding architecture for Coach v1 (the 7-chapter beginner journey). Everything below is verified
against the live code (2026-06-13). The **Dependencies** and **Integration Pattern** sections are
binding: the implementer imports every listed module and follows the patterns exactly. The defining
property of this feature is **assembly, not invention** — every moving part either reuses existing
code or follows a pattern the repo already practices, and **no new external dependency is added**.

---

## 1. Requirements

### Functional Requirements

- **FR-001** — A canonical algorithm catalog exists in the engine domain layer, addressable by
  stable id, consumed by the five solver phases and Coach. _(STORY-001)_
- **FR-002** — A shared, versioned localStorage helper persists `{ version, data }` envelopes with a
  fallback-on-mismatch read path. _(STORY-002)_
- **FR-003** — The hand-rolled router resolves single-segment dynamic routes (`/coach/:lessonId`)
  while preserving exact-match precedence and the existing fallback. _(STORY-003)_
- **FR-004** — A typed lesson model represents a chapter as an ordered sequence of `kind`-tagged
  steps (`understand` / `demo` / `practice`); the Second Layer chapter is authored against it.
  _(STORY-004)_
- **FR-005** — Lesson `demo`/`practice` steps reference algorithms by catalog id only; a spec
  enforces referential integrity between lesson data and the catalog. _(STORY-004)_
- **FR-006** — A Coach store tracks current lesson/step, persists a progress checklist under
  `cubeMaster:coachProgress`, mirrors `$cubeAtStep` for demo playback, and derives practice cases
  via `invertMoves`. _(STORY-005)_
- **FR-007** — The lesson player renders a chapter step-by-step (reusing `CubeNet` and
  `StepControls`, with a new lesson-step navigator), marks completion, and resolves the Second Layer
  proof slice end-to-end at `/coach/second-layer`. _(STORY-006)_
- **FR-008** — A `/coach` browser lists chapters in order with completion checkmarks and resume; the
  intermediate/advanced tiers render empty. _(STORY-007)_
- **FR-009** — All seven beginner chapters are authored against the reviewed proof-slice shape.
  _(STORY-008)_

### Non-Functional Requirements

- **NFR-001 (Boundaries)** — The engine catalog stays framework-agnostic (zero React/Hono). Coach
  `features/*` import shared + other features only; `pages/*` import everything. Enforced by
  `eslint-plugin-boundaries`. _(House Rules)_
- **NFR-002 (No new deps)** — v1 adds **zero** runtime dependencies. No MDX/markdown pipeline, no
  routing library, no storage library. Typed TS content only.
- **NFR-003 (Persistence safety)** — Every persisted Coach store is versioned from day one; a
  missing key, malformed JSON, or version mismatch falls back to a default and never throws to the
  caller.
- **NFR-004 (No drift)** — What Coach demos must equal what the solver executes: both read the same
  catalog entry. A lesson step may never carry an inline `MoveToken[]`.
- **NFR-005 (Verification)** — `format:check`, `lint:check`, `typecheck`, `test`, `build` all green
  before any commit (Husky + CI). New tests are `.spec.ts(x)`, co-located, `bun:test`, happy-dom for
  DOM.
- **NFR-006 (Conventions)** — TS strict, no semicolons, arrow functions only, named exports only,
  import alias `~/` for `apps/web/src/*`, engine imported as `@packages/cube-engine`,
  `bun run <script>` never `npx`/`bunx`.

---

## 2. Architecture Decision Records

Two existing ADRs are amended (the change _is_ the decision); one new ADR is proposed.

### ADR amendment — 0006 (algorithm catalog in domain): Proposed → Accepted

- **Context.** ADR-0006 as written requires every catalog entry to serve "the BFS and Coach at
  once." Code audit disproves the premise: `LINE_ALG` is consumed only by `solveYellowCross`, the
  sexy move only by `solveWhiteCorners` — neither by the BFS. Under the strict bar, beginner lessons
  1–4 would have no entries to point at.
- **Decision.** The catalog holds the **canonical form of each named algorithm**. Consumers are the
  **five solver phases (BFS included) and Coach**; each entry must serve **≥1** consumer and stay
  both machine-executable and teachable. Positional variants inside solver phases remain local
  derivations.
- **Consequences.** Lessons 1–4 have real catalog targets; promotion is extraction, not authoring.
  ADR-0006 moves to Accepted. The catalog ships in `packages/cube-engine/src/domain/`.
- **Alternatives considered.** Keep the strict "both consumers" bar with inline move sequences in
  lessons 1–4 — rejected: reintroduces the exact solver/Coach drift the catalog exists to prevent.

### ADR amendment — 0002 (no client-side router): add parameter matching

- **Context.** ADR-0002 (Accepted) states nested routes, route params, and guards aren't built in,
  and frames the exit as adopting TanStack Router or Hono SSR. Coach needs `/coach/:lessonId`.
- **Decision.** Take a third path — extend the hand-rolled router with single-segment parameter
  matching — **still no routing library**. Update ADR-0002's "route params aren't built in"
  consequence and its size/line claim so the doc keeps describing the actual router.
- **Consequences.** Lessons are addressable (sharing, resume, native back/forward) for ~20 tested
  lines. Hono already serves `index.html` for deep links; only client-side resolution was missing —
  no server change. The core decision (no routing library) is reaffirmed.
- **Alternatives considered.** Current-lesson-in-an-atom with a single `/coach` route (no URL per
  lesson, back exits the mode) — rejected. Adopt TanStack Router (ADR-0002's own exit scenario) —
  disproportionate for one parametric pattern.

### ADR-0007 (proposed) — versioned localStorage envelope in shared

- **Context.** The Timer persists `cubeMaster:solves` with no schema version (a documented footgun).
  Coach adds a second persisted store and must not repeat it. Promoting persistence into a shared,
  versioned helper is a deliberate decision (beyond the brainstorm's "versioned localStorage" note):
  it is the seam through which the Timer is later migrated off its unversioned store.
- **Decision.** Introduce a shared `{ version, data }` localStorage helper in `apps/web/src/lib/`.
  Coach persists at version 1 from day one. Reads fall back to a default on
  missing/malformed/mismatched data; writes are best-effort (swallow quota errors). Last-write-wins
  across tabs.
- **Consequences.** Coach progress is migration-ready. The Timer **is not migrated in v1**
  (no-refactor non-goal), but migrating it onto this helper is an **endorsed follow-up** — the ADR
  is justified partly to enable it, not merely as Coach plumbing. The plan should record that
  migration as a tracked post-v1 task rather than leave it implicit.
- **Alternatives considered.** Per-store hand-rolled persistence (repeats the Timer footgun); a
  storage library (violates NFR-002).
- _Author this as `docs/adr/0007-versioned-localstorage-envelope.md` during planning._

---

## 3. Dependencies

**No new external packages.** v1 is built entirely on what is already installed. The binding
dependency list is the set of existing modules the implementation MUST import:

| Module / specifier                               | Source                                        | Purpose (binding)                                                            |
| ------------------------------------------------ | --------------------------------------------- | ---------------------------------------------------------------------------- |
| `applyMoves` from `@packages/cube-engine`        | `application/use-cases/applyMoves.ts`         | Replay a move slice on a `CubeState` for demo playback and practice setup.   |
| `invertMoves` from `@packages/cube-engine`       | `application/use-cases/invertMoves.ts`        | Scramble-to-case: `invertMoves(algorithm.moves)` on a solved cube.           |
| `toStickers` from `@packages/cube-engine`        | `infrastructure/render/toStickers.ts`         | `CubeState → StickersByFace` for the `CubeNet`.                              |
| `createSolvedState` from `@packages/cube-engine` | `application/use-cases/createSolvedState.ts`  | Solved starting state for demo/practice derivations.                         |
| `MoveToken`, `StickersByFace` (types)            | `@packages/cube-engine` barrel                | Catalog `moves` typing; `CubeNet` props.                                     |
| **NEW** algorithm catalog                        | `@packages/cube-engine` barrel (STORY-001)    | Canonical algorithms + `getAlgorithm(id)` lookup, referenced by lesson data. |
| `CubeNet` from `~/features/cube`                 | `features/cube/components/CubeNet.tsx`        | Render demo/practice frames; takes `StickersByFace` directly.                |
| `StepControls` from `~/features/solver`          | `features/solver/components/StepControls.tsx` | Generic prev/next controls — reused **as-is**, no fork.                      |
| `atom`, `computed` from `nanostores`             | already installed                             | Coach store state + derived demo frames.                                     |
| `listen` (nanostores)                            | already installed                             | Persist progress on change (Timer pattern).                                  |
| `useStore` from `@nanostores/react`              | already installed                             | Thin React hooks over Coach atoms.                                           |
| **NEW** versioned storage helper                 | `~/lib/` (STORY-002)                          | Persist `cubeMaster:coachProgress` with a schema version.                    |

**Explicitly NOT a dependency:** `PhaseList` (coupled to the engine `Solution` type — a new
lesson-step navigator is built instead); any MDX/markdown loader; any routing library; the raw
solver atoms (`$cubeAtStep` et al. are not in the `features/solver` barrel — Coach owns its own
playback computation).

---

## 4. Integration Pattern (binding)

**4.1 Catalog promotion (STORY-001).** Add a catalog module under
`packages/cube-engine/src/domain/`. Each entry:
`{ id, name, moves: readonly MoveToken[], method, description }`. Export the collection and a
`getAlgorithm(id)` returning `Entry | undefined` from the package barrel
`packages/cube-engine/src/index.ts`. Promote the verified constants: `SUNE`/`ANTI_SUNE`

- perms + commutators (`solveYellowCorners.ts:10-26`), sexy-move inserts
  (`solveWhiteCorners.ts:22-51`), right/left inserts (`solveSecondLayer.ts:25-58`),
  `LINE_ALG`/`L_ALG` (`solveYellowCross.ts:8-12`), extraction/flipped-insert tables
  (`solveWhiteCross.ts:37-59`). Whether the five phases are refactored to _consume_ the catalog in
  v1 or migrated incrementally is a `/plan` sequencing call — the catalog must at minimum _exist
  with the canonical forms_.

**4.2 Versioned storage (STORY-002).** Add `~/lib/<storage-helper>.ts` exporting load/save over a
`{ version, data }` envelope, modeled on `features/timer/stores/sessionStore.ts`
(`loadSolves`/`persistSolves`) but with the version field the Timer lacks. Lives in `shared`,
imports only shared.

**4.3 Router params (STORY-003).** In `apps/web/src/lib/router.tsx`, today's resolution is the
single lookup `routes[pathname]` (line 40). Add a thin pattern pass: try exact match first (static
beats dynamic), then match registered `:param` patterns for a single segment, extracting the value
and passing it to the render function. Register `/coach` and `/coach/:lessonId` in `App.tsx`
(alongside `'/'`, `'/solver'`, `'/timer'`). Preserve the fallback.

**4.4 Lesson data (STORY-004).** Under `apps/web/src/features/coach/data/`: a `Lesson` type and a
registry. `Lesson = { id, title, method, order, steps: Step[] }`; `Step` is a `kind`-tagged union
(`understand` | `demo` | `practice`), `demo`/`practice` carrying a catalog `algorithmId` (never
inline moves). Author the Second Layer chapter. A `.spec.ts` asserts every `algorithmId` resolves
via `getAlgorithm`.

**4.5 Coach store (STORY-005).** Under `apps/web/src/features/coach/stores/`, mirror
`features/cube/stores/cube-store.ts`:

- `atom` for current lesson id + step index; `atom` for the progress checklist, initialized from the
  versioned helper, persisted via `listen`.
- A `computed` demo-frame atom that, given a demo algorithm's `moves` and a playback index, returns
  `toStickers(applyMoves(createSolvedState(), moves.slice(0, index)))` — **Coach's own** copy of the
  `$cubeAtStep` shape (`solverStore.ts:127-134`), not an import of solver atoms.
- Practice setup: `toStickers(applyMoves(createSolvedState(), invertMoves(algorithm.moves)))`.
- `nextStep`/`previousStep` actions clamped to `[0, totalSteps]`, matching `solverStore.ts:179-188`.
- Thin `useStore` hooks exported from `features/coach/index.ts`.

**4.6 Lesson player (STORY-006).** Under `apps/web/src/features/coach/components/`: a `LessonPlayer`
switching on `step.kind` — `understand` renders prose; `demo` renders `<CubeNet>` driven by the demo
frame + reused `<StepControls>`; `practice` renders the inverse-scrambled `<CubeNet>`. A new
`LessonStepList` (sibling to `PhaseList`, **not** a reuse) lists steps. Unknown `:lessonId` → a
not-found state linking back to `/coach`. Green tokens (`text-cube-green-text`).

**4.7 Browser + pages (STORY-007).** `apps/web/src/pages/Coach.tsx` (replacing the "Coming soon"
stub) renders the browser at `/coach`; the `/coach/:lessonId` route renders the player. Group by
`method`; intermediate/advanced tiers render empty placeholders.

**Data flow (proof slice):**

```
/coach/second-layer
  → router extracts lessonId="second-layer"          (STORY-003)
  → pages/Coach resolves lesson from registry         (STORY-004)
  → Coach store sets current lesson, loads progress    (STORY-005, STORY-002)
  → LessonPlayer switches on step.kind:
       demo:     getAlgorithm(id).moves
                   → applyMoves(solved, moves.slice(0,i)) → toStickers → CubeNet + StepControls
       practice: getAlgorithm(id).moves
                   → invertMoves → applyMoves(solved, …) → toStickers → CubeNet
  → last step complete → progress.completedLessons += "second-layer" → persisted
```

---

## 5. File Structure

One file per responsibility. New paths (✚) and touched paths (✎):

```
packages/cube-engine/src/
  domain/
    catalog.ts                 ✚ algorithm catalog + getAlgorithm(id)
    catalog.spec.ts            ✚ unique ids, valid non-empty MoveToken[] per entry
  index.ts                     ✎ export catalog + getAlgorithm from barrel

apps/web/src/
  lib/
    storage.ts                 ✚ versioned { version, data } localStorage helper  (name TBD in plan)
    storage.spec.ts            ✚ round-trip, missing key, malformed, version mismatch, quota no-op
    router.tsx                 ✎ add single-segment :param matching (exact wins first)
    router.spec.tsx            ✎ exact match, param extraction, precedence, fallback
  App.tsx                      ✎ register '/coach' and '/coach/:lessonId'
  pages/
    Coach.tsx                  ✎ replace stub: browser at /coach, player at /coach/:lessonId
    Coach.spec.tsx             ✎ update from "Coming soon" assertion
  features/coach/              ✚ (new feature directory — does not exist today)
    index.ts                   ✚ barrel: components + store hooks/actions + types
    data/
      types.ts                 ✚ Lesson, Step (kind-tagged union)
      lessons.ts               ✚ lesson registry (Second Layer in v1; +6 in STORY-008)
      lessons.spec.ts          ✚ unique lesson ids; every algorithmId resolves in catalog
      second-layer.ts          ✚ Second Layer chapter content (proof slice)
    stores/
      coachStore.ts            ✚ current lesson/step, progress, demo frame, practice setup
      coachStore.spec.ts       ✚ progress round-trip, idempotent completion, playback, practice
    components/
      LessonPlayer.tsx         ✚ switches on step.kind; reuses CubeNet + StepControls
      LessonPlayer.spec.tsx    ✚ renders steps, demo advances, completion, unknown id → not-found
      LessonStepList.tsx       ✚ step navigator (sibling to PhaseList — NOT a reuse)
      LessonBrowser.tsx        ✚ /coach browser, tiered by method, checkmarks + resume
      LessonBrowser.spec.tsx   ✚ ordered list, completion state, empty tiers render

docs/adr/
  0006-algorithm-catalog-in-domain.md   ✎ Proposed → Accepted (amended consumer bar)
  0002-no-client-side-router.md          ✎ add :param consequence, update size claim
  0007-versioned-localstorage-envelope.md ✚ new (proposed)
```

No god files: data/types, registry, content, store, and each UI surface are separate. Coach demo
playback is Coach's own store module, not a solver import.

---

## 6. External Services

**None.** Coach v1 touches no network, no backend, no third-party API.

- **Persistence:** browser `localStorage` only, key `cubeMaster:coachProgress`, version 1. No
  accounts, no sync, no progression backend (explicit out-of-scope). Last-write-wins across tabs is
  acceptable.
- **Deploy/runtime:** unchanged. Hono already serves `index.html` for any path, so
  `/coach/:lessonId` deep-links and refreshes resolve with no server edit. `/health` and the SPA
  catch-all are untouched.

---

## 7. Security Considerations

The attack surface is small (no network, no auth, no server change), but persistence and content
deserve explicit handling:

- **Untrusted localStorage on read (OWASP A08 — integrity).** Treat every read of
  `cubeMaster:coachProgress` as untrusted: validate shape and version, fall back to default on any
  mismatch, never `JSON.parse` straight into typed state without a guard. This is the whole point of
  the versioned helper (FR-002/NFR-003).
- **No injection from lesson content (OWASP A03).** Lesson prose is typed TS authored in-repo,
  rendered by React (auto-escaped). Do **not** introduce `dangerouslySetInnerHTML` or any
  markdown/HTML pipeline — keeping content as typed TS removes the XSS vector entirely (also
  NFR-002).
- **Engine integrity / no drift.** Demos and practice run the _same_ catalog `moves` the solver
  executes; lesson data cannot carry inline moves. This prevents a lesson from teaching a sequence
  the engine wouldn't actually perform (correctness as much as a trust property).
- **Router input.** `:lessonId` is attacker-controllable via URL but is only ever used as a registry
  key lookup → an unknown id resolves to a not-found UI state, never a thrown error, never an eval
  or fetch. No path traversal surface (client-side key match, not a filesystem read).
- **Storage quota / availability.** Writes are best-effort and swallow exceptions (private mode,
  quota) so a full or disabled `localStorage` degrades to in-memory, never crashing the player.
- **No secrets.** Nothing credential-bearing enters this repo (House Rules); Coach introduces none.

---

## Validation checklist (architect self-check)

- [x] Every story has measurable acceptance criteria — see `coach-mode-v1.md`.
- [x] Stories are dependency-ordered — 001/002/003 gate; 004–006 proof slice; 007–008 broaden.
- [x] All dependencies listed with purpose — and the headline is "zero new external deps."
- [x] Integration pattern specific enough to implement without guessing — exact files, signatures,
      line references verified 2026-06-13.
- [x] ADRs explain WHY with alternatives — two amendments + one proposed (0007).
- [x] File structure matches project conventions — `.spec.ts(x)` co-located, boundaries respected,
      engine framework-agnostic.
- [x] No code written — design and docs only.
