# localStorage value cast to its typed shape without runtime validation

**Date:** 2026-04-04 **Area:** web

_Backfilled 2026-06-14 from commit `4a4c2d4`. This is the entry that proves the point of keeping a
solutions log: the same guard was re-invented in Coach (June) two months after Timer (April). A
capture-on-first-fix would have surfaced it before the second._

_Extended 2026-06-19 (coach-mode-v1 review) with a second, subtler failure mode: validation that
**exists but checks a weaker criterion than the consumer's real invariant** — which fails silently
(wrong output) instead of loudly (crash). See "Subtler failure mode" below._

## Symptom

Data read from localStorage was trusted blindly. A tampered, truncated, or schema-drifted value
(older app version, manual edit, partial write) was cast straight to its typed shape and used
downstream — e.g. `.map()` on what was no longer an array — crashing instead of falling back to a
sane default.

## Root cause

`JSON.parse(raw) as T` lies to the type system. The parsed JSON is genuinely `unknown`; asserting it
into a typed shape skips all validation. Persisted data is **untrusted input**, not a trusted value
of type `T`.

## Fix

Validate before trusting, then fall back to a default on mismatch.

- **Timer** (`features/timer/stores/sessionStore.ts`, commit `4a4c2d4`): guard with
  `Array.isArray(parsed)`; on failure `removeItem` and return `[]`.
- **Coach** (`features/coach/stores/coachStore.ts` `parseCoachProgress`, ADR-0007): a
  version-matching but malformed envelope is validated field-by-field and falls back to default —
  "never coerce a mismatched shape."

## Subtler failure mode — validation narrower than the invariant (silent wrong output)

_Found in the coach-mode-v1 review, 2026-06-19._ The April fix established "validate before you
trust." The June review found the next layer: a validator can be **present yet too weak** — it
checks a shape that is narrower than the invariant the consumer actually relies on. The cast no
longer crashes; it now returns a structurally-plausible value that is **semantically wrong**, and
nothing flags it. Three live instances:

1. **Coach** (`coachStore.ts` `parseCoachProgress`): accepts any `typeof step === 'number'` —
   including non-integer (`2.5`) and out-of-range. (Low impact here only by luck: `JSON.stringify`
   turns `NaN`/`Infinity` into `null` so they're rejected, and `startLesson` clamps with
   `Math.min(Math.max(0, resume), maxStep)`. The validator itself is still loose.)
2. **Timer** (`sessionStore.ts` `loadSolves`): `Array.isArray(parsed)` then
   `return parsed as Solve[]` — validates the container but **not each item**. A schema-drifted
   solve missing `dnf` silently feeds `s.dnf ? Infinity : s.time` and produces a **wrong Ao5/Ao12**
   with no error. This is exactly the criterion the April entry claimed was "fixed" —
   `Array.isArray` was the weaker criterion all along.
3. **The test that proves nothing** (`sessionStore.spec.ts` invalid-JSON case): asserts only that
   `clearSession()` yields `[]`, which passes whether or not the `catch { return [] }` guard ever
   runs. It asserts a **substituted criterion** rather than poisoning storage and exercising the
   guard it appears to cover.

Root cause is the same `unknown` lie as above, one level deeper: the validator/cast substitutes a
shape check that is **looser than the downstream invariant**, and the test substitutes an easier
assertion than the behaviour it names. This is the **"verify the need, don't substitute a weaker
criterion"** principle applied to persistence: a passing validator or a green test can only prove
the substituted shape/assertion, never the original invariant. Trace the **real** invariant the
consumer depends on (each `Solve` has a numeric `time` and boolean `dnf`; a step is a non-negative
integer in range) and validate/test _that_, not a convenient proxy.

## Prevention

Any localStorage read passes through a validator before the cast. The shared versioned helper
`apps/web/src/lib/storage.ts` (ADR-0007) takes a `validate` callback for exactly this — new
persisted stores reuse it instead of re-deriving the guard. The Timer's unversioned
`cubeMaster:solves` is tracked for migration onto this helper (plan Follow-Up F1).

Two sharper rules from the June review:

- **Validate the full invariant, per item — not the container or the JS `typeof`.** Check
  `Array.isArray` _and_ each element's required fields and types. For the step, require a
  non-negative integer in range (`Number.isInteger`, bounded by the step count), not merely a
  `number`. The bar is "could a value pass this validator and still break the consumer?" — if yes,
  the validator is substituting a weaker criterion. A shared `validateParsed` helper that takes a
  per-item predicate keeps this honest.
- **Storage-guard tests must poison storage, then read it back.** Write malformed / old-schema JSON
  to `localStorage`, call the loader, and assert it falls back (and ideally `removeItem`s the bad
  key). A test that only asserts the post-`clear` empty state never executes the guard and gives
  false confidence — the same substitution, one layer up.
