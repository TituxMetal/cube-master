import type { ColorCode, CubeState, EdgePositionId, MoveToken } from '~/domain'
import { Color, getAlgorithm } from '~/domain'
import { applyMove } from '~/domain/moves/apply'

import { findEdgeByColors, isEdgeHome } from './helpers'
import type { TeachingPlan, TeachingSegment, TeachingStepGroup } from './types'

// planSecondLayer (Ch3) — complete the middle layer. Taught as TWO gestures, the
// right insert and the left insert, each carried to the slot where the edge belongs
// (front *and* back): the U-placement trick of Ch2 cannot reach the middle slots
// without a cube rotation, and the fixed frame forbids rotation, so the insert is
// done in place at all four slots (mirrors the shared solver, no rotation, no U).
// The trigger segment names the *gesture* (`second-layer-insert-right/left`) for the
// UI; the moves it plays are the slot's own insert (held here as engine constants,
// like the solver — not inline lesson data, NFR-004).

const RIGHT = 'second-layer-insert-right'
const LEFT = 'second-layer-insert-left'

// The two canonical front-right inserts come from the catalog (parity, ADR-0006);
// the other slots' inserts are face-adapted positional variants, held locally.
const FR_RIGHT = getAlgorithm(RIGHT)?.moves ?? []
const FR_LEFT = getAlgorithm(LEFT)?.moves ?? []

type SlotTarget = {
  id: EdgePositionId
  colors: [ColorCode, ColorCode]
  rightAlignDPos: EdgePositionId
  insertRight: readonly MoveToken[]
  leftAlignDPos: EdgePositionId
  insertLeft: readonly MoveToken[]
}

const TARGETS: readonly SlotTarget[] = [
  {
    id: 'FR',
    colors: [Color.Green, Color.Red],
    rightAlignDPos: 'DF',
    insertRight: FR_RIGHT,
    leftAlignDPos: 'DR',
    insertLeft: FR_LEFT
  },
  {
    id: 'BR',
    colors: [Color.Blue, Color.Red],
    rightAlignDPos: 'DB',
    insertRight: ['D', 'R', "D'", "R'", "D'", "B'", 'D', 'B'],
    leftAlignDPos: 'DR',
    insertLeft: ["D'", "B'", 'D', 'B', 'D', 'R', "D'", "R'"]
  },
  {
    id: 'BL',
    colors: [Color.Blue, Color.Orange],
    rightAlignDPos: 'DB',
    insertRight: ["D'", "L'", 'D', 'L', 'D', 'B', "D'", "B'"],
    leftAlignDPos: 'DL',
    insertLeft: ['D', 'B', "D'", "B'", "D'", "L'", 'D', 'L']
  },
  {
    id: 'FL',
    colors: [Color.Green, Color.Orange],
    rightAlignDPos: 'DF',
    insertRight: ['D', 'L', "D'", "L'", "D'", "F'", 'D', 'F'],
    leftAlignDPos: 'DL',
    insertLeft: ["D'", "F'", 'D', 'F', 'D', 'L', "D'", "L'"]
  }
]

const D_ORDER: readonly EdgePositionId[] = ['DF', 'DR', 'DB', 'DL']
const dAlign = (from: EdgePositionId, to: EdgePositionId): MoveToken[] => {
  const steps = (D_ORDER.indexOf(to) - D_ORDER.indexOf(from) + 4) % 4
  if (steps === 0) return []
  if (steps === 1) return ['D']
  if (steps === 2) return ['D2']
  return ["D'"]
}

const applySeq = (state: CubeState, moves: readonly MoveToken[]): CubeState => {
  let s = state
  for (const m of moves) s = applyMove(s, m)
  return s
}

// One edge's worth of work: optionally evict a wrong middle edge, align on D, insert.
const solveOneEdge = (
  state: CubeState,
  target: SlotTarget
): { state: CubeState; group: TeachingStepGroup } => {
  let cur = state
  const segments: TeachingSegment[] = []
  const push = (kind: TeachingSegment['kind'], moves: readonly MoveToken[], catalogId?: string) => {
    if (moves.length === 0) return
    segments.push({ kind, moves: [...moves], catalogId })
    cur = applySeq(cur, moves)
  }

  let { position, orientation } = findEdgeByColors(cur, target.colors)

  // If the edge is stuck in the wrong middle slot, evict it with that slot's right
  // insert (drops it to D), then relocate it.
  if (position[0] !== 'D') {
    const occupied = TARGETS.find(t => t.id === position)
    if (occupied) push('trigger', occupied.insertRight, RIGHT)
    ;({ position, orientation } = findEdgeByColors(cur, target.colors))
  }

  // Align under the working slot, then insert. Orientation decides the gesture:
  // first colour on the side → right insert; first colour on D → left insert.
  if (orientation === 1) {
    push('setup', dAlign(position, target.rightAlignDPos))
    push('trigger', target.insertRight, RIGHT)
  } else {
    push('setup', dAlign(position, target.leftAlignDPos))
    push('trigger', target.insertLeft, LEFT)
  }

  return { state: cur, group: { segments } }
}

export const planSecondLayer = (state: CubeState): TeachingPlan => {
  let cur = state
  const groups: TeachingStepGroup[] = []

  // Multiple passes: evicting one edge can displace another.
  for (let pass = 0; pass < 4; pass++) {
    let anyUnsolved = false
    for (const target of TARGETS) {
      if (isEdgeHome(cur, target.id)) continue
      anyUnsolved = true
      const result = solveOneEdge(cur, target)
      cur = result.state
      if (result.group.segments.length > 0) groups.push(result.group)
    }
    if (!anyUnsolved) break
  }

  // Fail loudly rather than return a partial plan (see planWhiteCorners): a silently
  // incomplete middle layer would build a wrong `second-layer` milestone and a
  // chapter practice that "succeeds" on an unfinished layer.
  if (!TARGETS.every(t => isEdgeHome(cur, t.id))) {
    throw new Error('planSecondLayer could not complete the middle layer within the pass limit')
  }
  return { groups }
}
