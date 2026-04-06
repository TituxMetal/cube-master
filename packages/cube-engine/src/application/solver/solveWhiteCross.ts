import type { ColorCode, CubeState, EdgePositionId, MoveToken } from '~/domain'
import { Color } from '~/domain/constants'
import { applyMove } from '~/domain/moves/apply'

import { findEdge } from './helpers'
import type { MoveGroup } from './types'

type EdgeTarget = {
  id: EdgePositionId
  colors: [ColorCode, ColorCode]
  face: 'F' | 'R' | 'B' | 'L'
  dPos: EdgePositionId
}

const TARGETS: readonly EdgeTarget[] = [
  { id: 'UF', colors: [Color.White, Color.Green], face: 'F', dPos: 'DF' },
  { id: 'UR', colors: [Color.White, Color.Red], face: 'R', dPos: 'DR' },
  { id: 'UB', colors: [Color.White, Color.Blue], face: 'B', dPos: 'DB' },
  { id: 'UL', colors: [Color.White, Color.Orange], face: 'L', dPos: 'DL' }
]

// D-layer edge positions in clockwise order (D move direction)
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

// Safe middle-layer extractions (temporarily disturb then restore U edges)
const EXTRACTION: Record<string, MoveToken[]> = {
  FR: ["R'", "D'", 'R'],
  FL: ['L', 'D', "L'"],
  BR: ['R', "D'", "R'"],
  BL: ["L'", "D'", 'L']
}

// face2 moves for direct insertion (white faces D → face2 → white faces U)
const FACE2: Record<string, MoveToken> = {
  F: 'F2',
  R: 'R2',
  B: 'B2',
  L: 'L2'
}

// Flipped insertion: piece at D-below-target with white on side face
// Each sequence inserts the edge and flips it so white faces U
const FLIPPED_INSERT: Record<string, MoveToken[]> = {
  UF: ['D', 'R', "F'", "R'"],
  UR: ['D', 'B', "R'", "B'"],
  UB: ['D', 'L', "B'", "L'"],
  UL: ["D'", "B'", 'L', 'B']
}

const solveOneWhiteEdge = (
  state: CubeState,
  target: EdgeTarget
): { state: CubeState; moves: MoveToken[] } => {
  let current = state
  const allMoves: MoveToken[] = []

  const apply = (moves: MoveToken[]) => {
    for (const m of moves) {
      current = applyMove(current, m)
      allMoves.push(m)
    }
  }

  let { position, orientation } = findEdge(current, target.colors)

  // Already solved
  if (position === target.id && orientation === 0) return { state: current, moves: [] }

  // Step 1: Get piece to D layer
  if (position[0] === 'U') {
    // Push down with face2 (only affects this U position)
    apply([FACE2[position[1]]])
  } else if (position[0] !== 'D') {
    // Middle layer (FR, FL, BR, BL)
    apply(EXTRACTION[position])
  }

  // Re-find after potential extraction
  ;({ position, orientation } = findEdge(current, target.colors))

  // Step 2: Rotate D to align below target
  apply(getDRotation(position, target.dPos))

  // Re-find after D rotation
  ;({ position, orientation } = findEdge(current, target.colors))

  // Step 3: Insert
  if (orientation === 0) {
    // White faces D → face2 brings it up with white on U
    apply([FACE2[target.face]])
  } else {
    // White faces side → flipped insertion
    apply(FLIPPED_INSERT[target.id])
  }

  return { state: current, moves: allMoves }
}

export const solveWhiteCross = (state: CubeState): { state: CubeState; groups: MoveGroup[] } => {
  let current = state
  const groups: MoveGroup[] = []

  for (const target of TARGETS) {
    const result = solveOneWhiteEdge(current, target)
    current = result.state
    if (result.moves.length > 0) groups.push({ moves: result.moves })
  }

  return { state: current, groups }
}
