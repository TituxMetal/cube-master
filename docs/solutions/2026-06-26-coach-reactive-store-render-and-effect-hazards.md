# Coach route blanks the SPA or auto-completes the wrong chapter (nanostores read at render/effect time)

**Date:** 2026-06-26 **Area:** web

_From the Coach v1 post-review batch 1 (PR #27, commits `73b2be9`, `9aebdfb`, `550db6d`,
`c506750`)._

## Symptom

Four failure modes in the Coach lesson player, all stemming from the same root theme — a reactive
store (`coachStore` / `illustrative`) being evaluated during React's render or effect phase:

- **Blank SPA.** A teaching planner throwing (a regression, or out-of-range lesson data) crashed the
  _entire_ app to an unrecoverable white screen — not just the Coach route.
- **Silent dead-end demo.** A demo step with an out-of-range `groupIndex` rendered a 0-move demo:
  cube doesn't animate, no steps, no error, no way out.
- **Wrong chapter marked complete.** Opening a _shorter_ chapter (e.g. `finish`, 3 steps) right
  after leaving a _longer_ one at a late step (e.g. `white-corners` at step 7) marked the new
  chapter complete before the learner saw its first screen.
- **Coach permanently broken until refresh.** A throw inside the memoised milestone `compute()` left
  the module cache `null`, so every later `milestones()` call retried and rethrew forever.

## Root cause

- **nanostores `computed` does not catch callback throws, and `useStore($stepRecipe)` runs during
  render.** So any throw in the `$stepRecipe → resolveRecipe → runTeachingPlan → planner` chain
  unwinds through render. With no React error boundary anywhere in `apps/web/src/`, that blanks the
  whole SPA. The Solver wraps `solveCube` in try/catch + `$solveError`; Coach had no equivalent.
- **`group?.segments ?? []`** silently swallowed an out-of-range `groupIndex` into an empty recipe —
  failing quietly instead of loudly.
- **Two `useEffect`s keyed on the same `[lessonId]` run in one commit with the _previous_ render's
  closure.** On a `lessonId` change, the completion effect captured the prior chapter's `stepIndex`
  (stale) and compared it to the _new_ chapter's shorter length. Effect ordering means the
  startLesson effect (which resets the atoms) runs first, but the completion effect's `stepIndex`
  closure is still stale — reading the closure, not the store, is the bug.
- **A memoised module-level cache that throws on first compute caches nothing**, so it never
  recovers.

## Fix

- **Loud, not silent:** `resolveRecipe` now `throw`s a descriptive error on an out-of-range
  `groupIndex` instead of returning `[]`.
- **Recoverable, not fatal:** wrap the Coach route in a `react-error-boundary` `<ErrorBoundary>`
  (`CoachErrorBoundary`, `resetKeys={[lessonId]}`) with a French recovery fallback. No class
  component (house rule + no-class-components preference) — `react-error-boundary` is the sanctioned
  path since React has no native boundary _component_. The loud throw + the boundary compose: the
  throw is caught and turned into a recoverable screen, _not_ swallowed into an empty recipe (which
  would reinstate the silent dead-end).
- **Read the store live in the effect:** the completion effect now bails unless
  `$currentLessonId.get() === lessonId` and reads `$lessonStepIndex.get()` live (startLesson runs
  first and resets both), so a stale closure can't mark the wrong chapter complete.
- **Degrade, don't loop:** `illustrative.compute()` wraps its body in try/catch returning
  solved-cube fallback milestones (cached, so no rethrow loop) — a planner regression shows wrong
  visuals instead of a dead route.

## Prevention

- `lessons.spec.ts` asserts every teaching demo's `groupIndex` is in range
  (`< runTeachingPlan(scenario).groups.length`), so the throw can never fire from shipped data.
- `LessonPlayer.spec.tsx` has a regression test for the stale-index pair (white-corners step 7 →
  finish must not be auto-completed).
- `CoachErrorBoundary.spec.tsx` asserts a throwing child renders the fallback and resets on key
  change.
- **Principles for this codebase:** (1) any nanostores `computed` consumed via `useStore` can throw
  _at render_ — a route that runs planners/solvers needs an ErrorBoundary, like the Solver's
  `$solveError`. (2) An effect keyed on a routing prop (`lessonId`) must read store state **live**,
  never the render closure, or it races the sibling effect that resets that state. (3) A memoised
  module cache must guard its compute so one throw doesn't poison it permanently.

## Related

- `docs/solutions/2026-06-13-lesson-player-shows-cube-but-not-notation.md` — same player, view
  layer.
- `docs/adr/` — the Coach teaching-solver boundary (planners are the single source of demo moves).
