import type { ColorCode, CubeState, EdgePositionId, MoveToken } from '~/domain'
import { Color } from '~/domain/constants'
import { applyMove } from '~/domain/moves/apply'

import { findEdge } from './helpers'
import type { MoveGroup } from './types'

type SecondLayerTarget = {
  id: EdgePositionId
  colors: [ColorCode, ColorCode]
  // D-layer position to align before right insert (orientation 1: first color faces side)
  rightAlignDPos: EdgePositionId
  insertRight: MoveToken[]
  // D-layer position to align before left insert (orientation 0: first color faces D)
  leftAlignDPos: EdgePositionId
  insertLeft: MoveToken[]
}

// Canonical FR-slot inserts, exported so the catalog parity spec pins the
// promoted `second-layer-insert-{right,left}` entries to these live solver
// constants. The other targets' inserts are face-adapted positional variants
// (kept local).
export const SECOND_LAYER_INSERT_RIGHT: MoveToken[] = ["D'", "R'", 'D', 'R', 'D', 'F', "D'", "F'"]
export const SECOND_LAYER_INSERT_LEFT: MoveToken[] = ['D', 'F', "D'", "F'", "D'", "R'", 'D', 'R']

// Correct F2L insertion algorithms for white-on-top (preserving U edges AND corners).
// Each is a commutator [D'/D, face'][D/D', face] that creates a 3-cycle
// moving one D-layer edge into the middle layer.
//
// Right insert: orientation 0 at source (first color → D face)
// Left insert: orientation 1 at source (first color → side face)
const TARGETS: readonly SecondLayerTarget[] = [
  {
    id: 'FR',
    colors: [Color.Green, Color.Red],
    rightAlignDPos: 'DF',
    insertRight: SECOND_LAYER_INSERT_RIGHT,
    leftAlignDPos: 'DR',
    insertLeft: SECOND_LAYER_INSERT_LEFT
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

// D-layer edge positions in clockwise order
const D_ORDER: readonly EdgePositionId[] = ['DF', 'DR', 'DB', 'DL']

const getDRotation = (from: EdgePositionId, to: EdgePositionId): MoveToken[] => {
  const fromIdx = D_ORDER.indexOf(from)
  const toIdx = D_ORDER.indexOf(to)
  const steps = (toIdx - fromIdx + 4) % 4

  if (steps === 1) return ['D']
  if (steps === 2) return ['D2']
  if (steps === 3) return ["D'"]
  return []
}

const isEdgeSolved = (state: CubeState, target: SecondLayerTarget): boolean => {
  const piece = state.edges[target.id]
  return piece.id === target.id && piece.orientation === 0
}

const solveOneSecondLayerEdge = (
  state: CubeState,
  target: SecondLayerTarget
): { state: CubeState; moves: MoveToken[] } => {
  let current = state
  const allMoves: MoveToken[] = []

  const apply = (moves: MoveToken[]) => {
    for (const m of moves) {
      current = applyMove(current, m)
      allMoves.push(m)
    }
  }

  if (isEdgeSolved(current, target)) return { state: current, moves: [] }

  let { position, orientation } = findEdge(current, target.colors)

  // Step 1: If piece is in middle layer (wrong position), extract to D layer
  // Applying the right insert for the occupied slot displaces the piece to D
  if (position[0] !== 'D') {
    const occupiedTarget = TARGETS.find(t => t.id === position)
    if (occupiedTarget) {
      apply(occupiedTarget.insertRight)
    }
    ;({ position, orientation } = findEdge(current, target.colors))
  }

  // Step 2 & 3: Align and insert based on orientation
  // D moves preserve edge orientation, so check before aligning
  if (orientation === 1) {
    // First color faces side (matches center) → right insert (Δo=+1, net o=0)
    apply(getDRotation(position, target.rightAlignDPos))
    apply(target.insertRight)
  } else {
    // First color faces D → left insert (Δo=0, stays o=0)
    apply(getDRotation(position, target.leftAlignDPos))
    apply(target.insertLeft)
  }

  return { state: current, moves: allMoves }
}

export const solveSecondLayer = (state: CubeState): { state: CubeState; groups: MoveGroup[] } => {
  let current = state
  const groups: MoveGroup[] = []

  // May need multiple passes since extracting one edge can displace another
  for (let pass = 0; pass < 4; pass++) {
    let anyUnsolved = false

    for (const target of TARGETS) {
      if (isEdgeSolved(current, target)) continue

      anyUnsolved = true
      const result = solveOneSecondLayerEdge(current, target)
      current = result.state
      if (result.moves.length > 0) groups.push({ moves: result.moves })
    }

    if (!anyUnsolved) break
  }

  return { state: current, groups }
}
