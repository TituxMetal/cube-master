# localStorage value cast to its typed shape without runtime validation

**Date:** 2026-04-04 **Area:** web

_Backfilled 2026-06-14 from commit `4a4c2d4`. This is the entry that proves the point of keeping a
solutions log: the same guard was re-invented in Coach (June) two months after Timer (April). A
capture-on-first-fix would have surfaced it before the second._

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

## Prevention

Any localStorage read passes through a validator before the cast. The shared versioned helper
`apps/web/src/lib/storage.ts` (ADR-0007) takes a `validate` callback for exactly this — new
persisted stores reuse it instead of re-deriving the guard. The Timer's unversioned
`cubeMaster:solves` is tracked for migration onto this helper (plan Follow-Up F1).
