import type { MoveToken } from '~/domain'

// The Coach teaching solver (TS-0..TS-4, plan 2026-06-20). A pure, framework-free
// application module — sibling to solver/, importing nothing from solver/'s phase
// files — that turns a cube state into an *annotated* move sequence: alternating
// `setup` (intuitive U/D placement) and `trigger` (a named catalog block — the
// sexy move, its mirror, or a last-layer block) segments. Coach demos and the
// full-chapter practice replay these so the learner sees "place the piece, then
// act", never an opaque algorithm. Stays in the fixed white-up / green-front frame:
// no `x/y/z` rotation token is ever emitted.

export type TeachingSegmentKind = 'setup' | 'trigger'

// One contiguous run of moves with a single pedagogical role. `setup` segments are
// U/D placement turns (never presented as an algorithm); `trigger` segments are a
// named catalog block and carry its `catalogId` so the UI can name + parity-pin it.
export type TeachingSegment = {
  readonly kind: TeachingSegmentKind
  readonly moves: readonly MoveToken[]
  readonly catalogId?: string
}

// One piece's worth of work — a place-then-trigger unit (e.g. one white corner, or
// one last-layer block application). Segments play in order.
export type TeachingStepGroup = {
  readonly segments: readonly TeachingSegment[]
}

// The annotated sequence for one chapter phase. The engine stays frame-agnostic, so
// the `from`/`to` milestone identity lives in the web layer (the teaching scenario
// descriptor) — here a plan is just its grouped segments. `flattenTeachingPlan`
// gives the raw move list a demo/practice replays.
export type TeachingPlan = {
  readonly groups: readonly TeachingStepGroup[]
}

// Every move a plan emits, in order — what a demo steps through and a practice
// validates against. Pure; no rotation tokens by construction.
export const flattenTeachingPlan = (plan: TeachingPlan): readonly MoveToken[] =>
  plan.groups.flatMap(group => group.segments.flatMap(segment => [...segment.moves]))
