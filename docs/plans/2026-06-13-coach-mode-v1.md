---
title: 'feat: Coach mode v1 — 7-chapter beginner journey'
type: plan
date: 2026-06-13
status: approved
brainstorm: docs/brainstorms/2026-06-12-coach-mode-brainstorm.md
stories: docs/stories/coach-mode-v1.md
architecture: docs/stories/coach-mode-v1.architecture.md
confidence: high
---

# feat: Coach mode v1 — 7-chapter beginner journey

**Status:** approved

Ship Coach — the last unshipped mode — as the 7-chapter beginner journey, assembled almost entirely
from parts the repo already has. This plan answers **HOW and IN WHAT ORDER**; the **WHAT** is fixed
by [the stories](../stories/coach-mode-v1.md) and
[the architecture](../stories/coach-mode-v1.architecture.md). It exists to resolve the brainstorm's
open questions, pin the build sequence, and hand `/work` a dependency-ordered tracker.

Advances the **Coach** mode of [`docs/product.md`](../product.md) — Solver and Timer stay untouched
beyond the one shared seam they opt into later.

---

## Problem Statement

Coach is specified (stories + binding architecture) but not built. The stories are
dependency-ordered yet leave six decisions to planning that change the build order and risk profile:
the exact catalog roster, whether the solver consumes the catalog in v1, how notation is reconciled,
how practice success is detected, and how the Timer-migration follow-up is tracked. Picking these
wrong means either rework (a write-only catalog that quietly drifts from the solver) or scope creep
(refactoring all five shipped solver phases inside a Coach release). This plan closes those
decisions before code.

## Target End State

When this lands:

- A learner opens `/coach`, sees the beginner journey, opens **Second Layer**, walks understand →
  demo → practice, earns a checkmark, and can resume after reload — all seven chapters available,
  entirely inside the app.
- The engine domain layer owns a canonical algorithm catalog. **No promoted algorithm can drift from
  the Solver** — enforced **structurally** where the solver consumes the entry (`sune`, `anti-sune`,
  `yellow-cross-line`, `yellow-cross-l` — same object) and by a **parity spec** for the rest
  (`sexy-move`, `second-layer-insert-{right,left}`, `corner-3-cycle`): any divergence reddens CI.
- A versioned `{ version, data }` localStorage helper lives in `lib/`; Coach persists at version 1.
- `/coach/:lessonId` resolves through the hand-rolled router — no routing library added.
- ADR-0006 is Accepted, ADR-0002 is amended, ADR-0007 is authored. Zero new runtime dependencies.
- `format:check`, `lint:check`, `typecheck`, `test`, `build` all green; PR merged to `develop`.

## Scope and Non-Goals

**In scope:** STORY-001..008 as written — catalog, versioned storage, router params, lesson model +
Second Layer content, Coach store, lesson player, browser, and the remaining six chapters.

**Non-Goals** (inherited from brainstorm, restated as hard boundaries):

- No user accounts, sync, or progression backend.
- No F2L/OLL/PLL **content**; intermediate/advanced tiers ship empty (types ready).
- No case-grid trainer, no spaced repetition, no quiz mode.
- **No Timer refactor in v1.** The Timer is _not_ migrated onto the versioned helper now — that is
  an endorsed, explicitly-tracked **post-v1** task (see Follow-Ups), not silent debt.
- No MDX/markdown pipeline, no i18n, no new runtime dependency (NFR-002).

---

## Proposed Solution — Build Sequence

Three independent foundation tracks land first, converge into the Second Layer proof slice, which
gates the broadening. The stories are the source of truth for _what_ each task builds; this is the
_order_ and the _decisions_.

```
Phase A — Foundations (3 parallel tracks)
  A-catalog : ADR-0006 → catalog roster → catalog module → solver consumption   (STORY-001)
  A-storage : versioned localStorage helper + ADR-0007                          (STORY-002)
  A-router  : :param matching + ADR-0002 amendment                              (STORY-003)
        │  (all three must be green before B)
Phase B — Proof slice: Second Layer end-to-end
  lesson model + content → coach store → lesson player → PREVIEW GATE           (STORY-004..006)
        │  (preview reviewed before C)
Phase C — Broaden (gated on preview review)
  lesson browser + Coach page → remaining six chapters                          (STORY-007..008)
Phase D — Ship: full verification → PR to develop
```

The catalog track (A-catalog) is itself a short chain; A-storage and A-router are independent and
run alongside it. `/work` can interleave them but **must not** start Phase B until all three
foundations are green.

---

## Implementation Tasks

Dependency-ordered. Each task names its story/FR; acceptance criteria live in the stories — not
duplicated here. `[design]` = decision/doc work, `[code]` = implementation.

### Phase A — Foundations

**A-catalog (chain):**

- [ ] **A1** `[design]` Amend **ADR-0006 → Accepted**: canonical form of each named algorithm;
      consumers = five solver phases + Coach; ≥1 consumer per entry. _First task — catalog shape
      gates everything._ (STORY-001 / FR-001)
- [ ] **A2** `[design]` Finalize the **catalog roster + ids** from the verified source constants
      (see Decision D1). Pin the promote-vs-local boundary in the ADR or a short note. (STORY-001)
- [ ] **A3** `[code]` Add `packages/cube-engine/src/domain/catalog.ts`
      (`{ id, name, moves, method, description }` + `getAlgorithm(id) → Entry | undefined`) and
      `catalog.spec.ts` (unique ids, non-empty valid `MoveToken[]`). Export both from the package
      barrel. (STORY-001 / FR-001)
- [ ] **A4** `[code]` **Solver consumption (hybrid, per Decision D2):** replace the literal
      single-constant uses — `SUNE`/`ANTI_SUNE` in `solveYellowCorners`, `LINE_ALG`/`L_ALG` in
      `solveYellowCross` — with catalog references; rely on the existing `solve*.spec.ts` as the
      regression guard. Table-shaped uses stay local (catalog-only for Coach). (STORY-001 / NFR-004)
- [ ] **A4b** `[code]` **Catalog↔solver parity spec (per Decision D5).** Expose the anchor constants
      for the four promoted-but-**not**-consumed entries from their solver modules — `sexy-move` ↔
      `solveWhiteCorners` `TARGETS[0].insert`, `second-layer-insert-{right,left}` ↔
      `solveSecondLayer` `TARGETS[0].insert{Right,Left}` (FR anchor), `corner-3-cycle` ↔ the
      yellow-corners 3-cycle literal — via an internal extract-to-const + export (zero
      runtime-behaviour change). Then add
      `packages/cube-engine/src/application/solver/catalog-parity.spec.ts` asserting each catalog
      entry's `moves` is deep-equal to the **live** solver constant it was extracted from. Pin to
      the extraction source only — no rotational-equivalence proof of the four positional variants.
      (STORY-001 / NFR-004) _Depends: A3, A4._

**A-storage (independent track):**

- [ ] **A5** `[design]` Author **ADR-0007** (`docs/adr/0007-versioned-localstorage-envelope.md`,
      Proposed): shared versioned envelope; Timer migration named as endorsed post-v1 follow-up.
      (FR-002)
- [ ] **A6** `[code]` Add `apps/web/src/lib/storage.ts` (name TBD) + `storage.spec.ts`: load/save a
      `{ version, data }` envelope; fallback-to-default on missing/malformed/version-mismatch;
      best-effort writes (swallow quota); shared-layer import rules. (STORY-002 / FR-002, NFR-003)

**A-router (independent track):**

- [ ] **A7** `[code]` Extend `apps/web/src/lib/router.tsx` with single-segment `:param` matching:
      exact match wins first, then a thin pattern pass; preserve fallback. Add `router.spec.tsx`.
      Keep it ~20 tested lines. (STORY-003 / FR-003)
- [ ] **A8** `[design]` Amend **ADR-0002**: update the "route params aren't built in" consequence
      and the size/line claim; reaffirm the core decision (no routing library). (STORY-003)

### Phase B — Proof slice (Second Layer)

- [ ] **B1** `[code]` Lesson data model under `features/coach/data/` (`Lesson`, `kind`-tagged `Step`
      union) + **Second Layer** content + `lessons.spec.ts` referential-integrity guard (every
      `algorithmId` resolves via `getAlgorithm`). Notation note per Decision D3. (STORY-004 /
      FR-004,5) _Depends: A3._
- [ ] **B2** `[code]` Coach store under `features/coach/stores/`: current lesson/step, progress
      checklist persisted at `cubeMaster:coachProgress` v1 via the A6 helper, own
      `$cubeAtStep`-shaped demo-frame computed atom, practice setup via `invertMoves`, clamped step
      actions + spec. Practice detection per Decision D4. (STORY-005 / FR-006) _Depends: A3, A6._
- [ ] **B3** `[code]` Lesson player under `features/coach/components/`: `LessonPlayer` switching on
      `step.kind`, reused `StepControls`, **new** `LessonStepList` (not `PhaseList`), green tokens,
      unknown-id not-found state; wire `/coach/second-layer` + spec. (STORY-006 / FR-007) _Depends:
      A7, B1, B2._
- [ ] **B4** `[gate]` **Preview gate** — capture the player on Second Layer (screenshot or live) and
      review against the Subjective Contract. Failure sends shape back, not forward. (Rollout rule)

### Phase C — Broaden (gated on B4)

- [ ] **C1** `[code]` Replace `pages/Coach.tsx` stub: `LessonBrowser` at `/coach` (tiered by
      `method`, checkmarks + resume, empty intermediate/advanced placeholders), player at
      `/coach/:lessonId`; register both routes in `App.tsx`; update `Coach.spec.tsx`. (STORY-007 /
      FR-008)
- [ ] **C2** `[code]` Author the remaining **six chapters** against the reviewed shape (White Cross,
      White Corners, Yellow Cross, Yellow Corners orient, Yellow Corners permute / final),
      catalog-id references only, sexy-move called back across chapters, referential-integrity spec
      green for all. (STORY-008 / FR-009) _Gated: B4 passed._

### Phase D — Ship

- [ ] **D1** Full verification green (`format:check`, `lint:check`, `typecheck`, `test`, `build`).
- [ ] **D2** PR to `develop` (full word), rebased, rebase-merge per
      [`docs/git-workflow.md`](../git-workflow.md). References this plan + the three ADRs.

---

## Decision Rationale

These resolve the brainstorm's open questions — the actual planning value-add.

### D1 — Catalog roster is ~8 named entries, not ~15–25

Grounding the source constants (verified 2026-06-13) shows the named-canonical set is smaller than
the brainstorm's estimate, because most "algorithm-looking" code is **positional table derivation**,
not a named algorithm. **Promote** (catalog entries): `sexy-move` (`R' D' R D` family),
`second-layer-insert-right`, `second-layer-insert-left`, `yellow-cross-line` (`F' R' D' R D F`),
`yellow-cross-l` (`R D F D' F' R'`), `sune` (`R D R' D R D2 R'`), `anti-sune`
(`R D2 R' D' R D' R'`), `corner-3-cycle` (`D R D' L' D R' D' L`). **Stay local** (solver mechanics,
not teachable named algorithms): the `EXTRACT`/`EXTRACTION`/`FLIPPED_INSERT`/`getDRotation` tables,
per-target inserts, and the last-layer Ua/Ub perms + two commutators — which are literal spreads of
`sune`/`anti-sune` (`[...SUNE, 'D']` etc.) and exist only for the BFS. Exact forms/ids finalized in
A2; ~8–12 entries expected. _Rejected:_ importing a dataset (license/fit) or padding to 15–25 with
positional variants (reintroduces drift).

### D2 — Solver consumes the catalog where it's a literal-constant swap; table uses stay catalog-only

NFR-004 (no drift) only has teeth if the solver and Coach read the _same_ entry. Three options:
**(a) write-only** catalog — cheap but creates a second copy that can silently diverge, violating
NFR-004 in spirit; **(b) full refactor** of all five phases — maximal assurance but widens a Coach
release into Solver internals (TARGETS/EXTRACT table rewrites) and risks regressing shipped
behavior; **(c) hybrid (chosen)** — consume the four literal single-constant uses (`SUNE`,
`ANTI_SUNE`, `LINE_ALG`, `L_ALG`), guarded by the existing `solve*.spec.ts`; leave table-shaped uses
local with Coach reading the canonical form. (c) gives NFR-004 teeth exactly where it's cheap and
safe, and the residual drift (table uses) is **not** left to trust — it is pinned by a parity spec,
see **D5**. _Rejected:_ (a) hides drift; (b) puts solver-refactor risk inside a Coach feature for no
v1 user value. `application/solver` importing `domain/catalog` is the correct dependency direction —
no boundary change.

### D3 — Notation: app-consistent (D-based), reconciled once in prose, no display-time remapping

The engine teaches white-on-top / last-layer-D (`sune = R D R' D R D2 R'`); web tutorials teach
U-based. v1 lessons stay **visually consistent with what the app executes** (D-based) and add a
short "why our moves look different" note in the first chapter that introduces notation, reused as
needed. No display-time U↔D mapping layer — it's new machinery (against the no-invention spirit) and
a fresh drift surface between shown and executed moves. Lands as content in B1/C2. _Rejected:_ a
remapping layer (complexity + drift) or silence (learner confusion vs YouTube).

### D4 — Practice success = full solved-state equality, self-contained in Coach

Practice setup is `applyMoves(solved, invertMoves(alg))`, so executing `alg` returns the cube to
**fully solved** — full-state comparison is exactly correct for every v1 beginner case
(algebraically guaranteed, not an approximation). Detection compares the player's current
`StickersByFace` to `toStickers(createSolvedState())` inside the Coach store. `isSolved` exists in
the engine but only in `demo.ts` (not exported); rather than widen the engine API, Coach deep-equals
stickers it already holds (keeps the engine surface minimal, NFR-002). _Alternative noted:_ promote
`isSolved` to the barrel if a `CubeState` compare reads cleaner — equivalent, defer to B2.
_Rejected:_ case-relevant partial compare (csTimer-style) — unnecessary complexity when v1 practice
always returns to solved.

### D5 — Catalog↔solver no-drift is enforced by a parity spec, not by trust

D2 deliberately keeps four promoted entries **out** of solver consumption — `sexy-move`,
`second-layer-insert-right`, `second-layer-insert-left`, `corner-3-cycle` (the table-shaped uses).
For those, the catalog holds a canonical form while the solver keeps its own literal: two copies
that _could_ silently diverge. That is unacceptable on the very feature whose point is no drift, and
it bites hardest on the **Second Layer proof slice** — the solver runs four positional insert
variants (`TARGETS[].insertRight/Left`, faces R/B/L/F) while Coach demos one canonical form. Under
the original plan, "Coach demos = solver executes" held at runtime for only one position in four;
the wording over-sold the property on exactly the chapter chosen to prove it.

An invariant can be held two ways: by **structure** (one source → violation impossible — that is
full consumption, the rejected option (b), with solver-regression risk for zero v1 user value) or by
**detection** (a test that goes red the instant the two diverge — near-free). **We take detection.**

**The spec (A4b):** for each promoted-but-not-consumed entry, assert the catalog's canonical `moves`
is deep-equal to the **exact** solver constant it was extracted from (sexy-move ↔
`solveWhiteCorners TARGETS[0].insert`; second-layer inserts ↔ `solveSecondLayer TARGETS[0]` FR
anchor; corner-3-cycle ↔ the yellow-corners 3-cycle literal). It pins each entry to its single
extraction source — it does **not** attempt to prove rotational equivalence of the four positional
variants (over-engineering). Realistic drift (someone edits the base constant, forgets the catalog)
→ CI red. The four _consumed_ entries need no spec: they are the same object by structure.

This requires exposing those anchor constants from their solver modules (internal extract-to-const +
export, zero runtime-behaviour change) so the spec imports the **live** value — hard-coding the
expected literal would not catch a solver-side edit, the very drift we are guarding. The spec lives
at `packages/cube-engine/src/application/solver/catalog-parity.spec.ts` (application layer →
legitimately imports the domain catalog and its own solver constants).

The honest, stronger framing this buys: **no drift on every promoted algorithm — enforced
structurally where consumed, by a parity spec otherwise.**

---

## Constraints and Boundaries

- **Dependency boundaries** (eslint-plugin-boundaries): engine catalog framework-agnostic (zero
  React/Hono); `features/coach/*` import shared + features only; `lib/storage` is shared → imports
  only shared; `pages/Coach` imports everything. Coach owns its demo-frame computation — it does
  **not** import solver atoms (`$cubeAtStep` is not in the solver barrel).
- **No drift contract (NFR-004):** a lesson `Step` may never carry an inline `MoveToken[]` — demo/
  practice reference catalog ids only.
- **House Rules:** TS strict, no semicolons, arrow-functions-only, named exports only, `.spec.ts(x)`
  co-located, `~/` alias, engine as `@packages/cube-engine`, `bun run <script>` only.
- **Server invariant:** `/health` stays registered before the SPA catch-all; no server edit needed
  (catch-all already serves `index.html` for `/coach/:lessonId`).
- **Docs language:** English (repo convention).

## Assumptions

| Assumption                                                                                                      | Status            | Evidence                                                                                                             |
| --------------------------------------------------------------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| Promoted named constants are literal copies of what phases execute → consuming them can't regress solver output | Verified-by-guard | All five phases have `solve*.spec.ts` asserting output; a drifted value fails CI                                     |
| Second-layer inserts and white-corner/cross extractions are positional, safe to leave local                     | Verified          | `solveSecondLayer.ts` per-target `insertRight/insertLeft`; `EXTRACT`/`EXTRACTION`/`FLIPPED_INSERT` keyed by position |
| Practice (`invertMoves` of a solved cube) returns to full solved → full-state compare is exact                  | Verified          | Algebraic: `applyMoves(solved, inv(alg))` then `alg` → solved; matches STORY-005 setup                               |
| Hono serves `index.html` for `/coach/:lessonId` deep-links/refresh — no server change                           | Verified          | `server.ts:12` `app.get('*', serveStatic(…'/index.html'))`, after `/health` at `:7`                                  |
| `StepControls` is generic, reusable as-is                                                                       | Verified          | Props are exactly `currentStep/totalSteps/onPrevious/onNext`; no solver coupling                                     |
| All engine APIs Coach needs are exported (`applyMoves`, `invertMoves`, `toStickers`, `createSolvedState`)       | Verified          | Present in `packages/cube-engine/src/index.ts` barrel                                                                |
| No equality helper is exported for practice detection                                                           | Verified          | `isSolved` exists only in `demo.ts` (unexported) → Coach deep-equals stickers (D4)                                   |
| Catalog (domain) consumed by solver (application) is a legal dependency direction                               | Verified          | application→domain is the standard direction; no boundary rule crossed                                               |

No unverified assumptions remain — grounding closed each one.

## Risk Analysis

| Risk                                                               | Likelihood | Impact | Mitigation                                                                                                                                 |
| ------------------------------------------------------------------ | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Solver-consumption (A4) regresses a shipped phase                  | Low        | High   | Existing `solve*.spec.ts` guard every phase; run before/after A4; revert that phase to catalog-only if any spec reddens                    |
| Catalog↔solver drift on the 4 promoted-but-not-consumed entries    | Low        | Medium | Parity spec (A4b / D5) makes any divergence a red CI — enforced, not trusted. Convergence (F2) is then optional cleanup, not a safety need |
| Preview gate (B4) rejects the player shape after B-stack built     | Low        | Medium | Proof slice is _one_ chapter precisely so rework is cheap; C2 is gated behind it                                                           |
| Practice detection wrong if a future case doesn't return to solved | Low        | Medium | D4 holds for all v1 beginner cases; revisit detection when intermediate cases (partial states) arrive                                      |
| Notation note insufficient — learner confusion vs YouTube          | Medium     | Low    | Subjective-contract review at B4; prose is content, cheap to iterate                                                                       |
| Router `:param` change breaks an exact route                       | Low        | High   | `router.spec.tsx` asserts static-beats-dynamic precedence + fallback before B3 wires routes                                                |

---

## Subjective Contract & Preview Gate

Coach is design- and copy-sensitive — the contract is inherited verbatim from the brainstorm and is
binding for B1/B3/C2.

- **Target outcome:** a never-solved learner finishes the 7 chapters and solves a cube — J Perm-like
  clarity, the sexy move as one foundational sequence reused across chapters, notation introduced
  gently.
- **Anti-goals:** an algorithm reference dump; a case-grid trainer disguised as lessons; prose that
  assumes YouTube context.
- **Tone:** signature green; encouraging, concrete, second person; every algorithm shown is demoable
  on the CubeNet, never prose-only.
- **References:** J Perm 7-step beginner page; CubeSkills module→lesson→checkmark; archived Coach
  layout sketch. **Anti-references:** csTimer/bestsiteever case grids; MVP-era mode-competition
  language.
- **Rejection criteria:** a step that can't complete without leaving the app; a demo that drifts
  from what the solver executes; chapter prose longer than the learner's patience (split steps
  instead).
- **Required preview artifact (gate B4):** the Second Layer player seen (screenshot or live) and
  reviewed against this contract **before** C2 writes the other six chapters. Reviewer: Titux. A
  failure returns the work to B-stack, not forward to C.

---

## Follow-Ups (post-v1, tracked — not in this scope)

- **F1 — Timer migration onto the versioned helper.** ADR-0007 is justified partly to enable this;
  `cubeMaster:solves` stays unversioned in v1 (no-refactor non-goal). Recorded here so it is tracked
  debt, not implicit. _(Endorsed; schedule after v1 ships.)_
- **F2 — (optional) Converge table-shaped solver algorithms onto the catalog.** With the A4b parity
  spec guarding the invariant, this is structural tidiness — **not** safety debt; no-drift is
  already enforced. Revisit only if full consumption becomes cheap (e.g. a positional-variant
  generator).
- **F3 — Catalog growth toward OLL/PLL** triggers ADR-0006's stated expiry (TS-array scaling);
  revisit storage form then.

## References

- Brainstorm:
  [`docs/brainstorms/2026-06-12-coach-mode-brainstorm.md`](../brainstorms/2026-06-12-coach-mode-brainstorm.md)
- Stories: [`docs/stories/coach-mode-v1.md`](../stories/coach-mode-v1.md) — acceptance criteria per
  FR
- Architecture (binding):
  [`docs/stories/coach-mode-v1.architecture.md`](../stories/coach-mode-v1.architecture.md)
- ADRs: [`0006`](../adr/0006-algorithm-catalog-in-domain.md) (amend→Accepted),
  [`0002`](../adr/0002-no-client-side-router.md) (amend), `0007` (author in A5)
- Verified source constants: `solveYellowCorners.ts:10-26`, `solveSecondLayer.ts:13-58`,
  `solveYellowCross.ts:8-12`, `solveWhiteCorners.ts:14-69`, `solveWhiteCross.ts:37-59` (under
  `packages/cube-engine/src/application/solver/`)
- Reusable machinery: `router.tsx`, `features/solver` barrel (`StepControls`), `features/cube`
  (`CubeNet`, `cube-store`), `features/timer/stores/sessionStore.ts` (persistence pattern to
  generalize)
