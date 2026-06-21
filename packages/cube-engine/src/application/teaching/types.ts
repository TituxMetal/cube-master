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

// Net quarter-turns (mod 4) on one face → its canonical single token, or nothing.
const faceTurn = (face: 'U' | 'D', quarters: number): MoveToken[] => {
  const n = ((quarters % 4) + 4) % 4
  if (n === 0) return []
  return n === 1 ? [face] : n === 2 ? [`${face}2` as MoveToken] : [`${face}'` as MoveToken]
}

// Simplify a run of placement turns. Placement is only ever U/D turns, and U/D are
// opposite faces (they commute), so the net effect is the per-face quarter-turn sum —
// U2 then U2 cancels, U then U' cancels, U then U becomes U2. Bails to the input
// untouched if anything other than a U/D turn appears (never expected in a setup).
const simplifySetupMoves = (moves: readonly MoveToken[]): MoveToken[] => {
  let u = 0
  let d = 0
  for (const m of moves) {
    const quarters = m.length === 1 ? 1 : m[1] === '2' ? 2 : 3
    if (m[0] === 'U') u += quarters
    else if (m[0] === 'D') d += quarters
    else return [...moves]
  }
  return [...faceTurn('U', u), ...faceTurn('D', d)]
}

// Collapse consecutive `setup` segments — merging and cancelling their placement
// turns — while leaving every `trigger` (a named catalog block) untouched. When the
// whole plan is chained for the full-chapter practice, one group's closing restore
// meets the next group's opening placement; without this they read as `U U'` or
// `U2 U2` no-ops on screen — exactly the speed-coded sloppiness we refuse. Empty
// setups (a restore that fully cancels the next placement) drop out entirely.
export const collapseTeachingSetups = (segments: readonly TeachingSegment[]): TeachingSegment[] => {
  const out: TeachingSegment[] = []
  let pending: MoveToken[] = []
  const flush = () => {
    if (pending.length === 0) return
    const simplified = simplifySetupMoves(pending)
    if (simplified.length > 0) out.push({ kind: 'setup', moves: simplified })
    pending = []
  }
  for (const segment of segments) {
    if (segment.kind === 'setup') {
      pending.push(...segment.moves)
      continue
    }
    flush()
    out.push(segment)
  }
  flush()
  return out
}
