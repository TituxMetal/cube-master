import type { ColorCode, CornerPositionId, CubeState, MoveToken } from '~/domain'
import { Color } from '~/domain/constants'
import { applyMove } from '~/domain/moves/apply'

import { findCorner } from './helpers'
import type { MoveGroup } from './types'

type CornerTarget = {
  id: CornerPositionId
  colors: [ColorCode, ColorCode, ColorCode]
  setupFace: 'F' | 'R' | 'B' | 'L'
  // Moves to insert a corner from D layer below this position
  // "Sexy move" variant: R' D' R D (adapted per corner)
  insert: MoveToken[]
  // D-layer position directly below this U corner
  dPos: CornerPositionId
}

// For each U-layer corner, define the insertion algorithm.
// The insertion assumes the corner is in the D layer directly below the target.
// Repeated application (1, 3, or 5 times) handles all 3 orientations.
const TARGETS: readonly CornerTarget[] = [
  {
    id: 'UFR',
    colors: [Color.White, Color.Green, Color.Red],
    setupFace: 'R',
    insert: ["R'", "D'", 'R', 'D'],
    dPos: 'DFR'
  },
  {
    id: 'URB',
    colors: [Color.White, Color.Red, Color.Blue],
    setupFace: 'B',
    insert: ["B'", "D'", 'B', 'D'],
    dPos: 'DRB'
  },
  {
    id: 'UBL',
    colors: [Color.White, Color.Blue, Color.Orange],
    setupFace: 'L',
    insert: ["L'", "D'", 'L', 'D'],
    dPos: 'DBL'
  },
  {
    id: 'ULF',
    colors: [Color.White, Color.Orange, Color.Green],
    setupFace: 'F',
    insert: ["F'", "D'", 'F', 'D'],
    dPos: 'DLF'
  }
]

// D-layer corner positions in clockwise order (D move direction)
const D_ORDER: readonly CornerPositionId[] = ['DFR', 'DRB', 'DBL', 'DLF']

const getDRotation = (from: CornerPositionId, to: CornerPositionId): MoveToken[] => {
  const fromIdx = D_ORDER.indexOf(from)
  const toIdx = D_ORDER.indexOf(to)
  const steps = (toIdx - fromIdx + 4) % 4

  if (steps === 1) return ['D']
  if (steps === 2) return ['D2']
  if (steps === 3) return ["D'"]
  return []
}

// Extract a corner from U layer to D layer
// Uses the target's insert sequence once: R' D' R D pushes UFR to DFR area
const EXTRACT: Record<string, MoveToken[]> = {
  UFR: ["R'", "D'", 'R'],
  URB: ["B'", "D'", 'B'],
  UBL: ["L'", "D'", 'L'],
  ULF: ["F'", "D'", 'F']
}

const isCornerSolved = (state: CubeState, target: CornerTarget): boolean => {
  const piece = state.corners[target.id]
  return piece.id === target.id && piece.orientation === 0
}

const solveOneWhiteCorner = (
  state: CubeState,
  target: CornerTarget
): { state: CubeState; moves: MoveToken[] } => {
  let current = state
  const allMoves: MoveToken[] = []

  const apply = (moves: MoveToken[]) => {
    for (const m of moves) {
      current = applyMove(current, m)
      allMoves.push(m)
    }
  }

  if (isCornerSolved(current, target)) return { state: current, moves: [] }

  let { position } = findCorner(current, target.colors)

  // Step 1: If piece is in U layer, extract to D
  if (position[0] === 'U') {
    apply(EXTRACT[position])
    ;({ position } = findCorner(current, target.colors))
  }

  // Step 2: Rotate D to position below target
  apply(getDRotation(position, target.dPos))

  // Step 3: Insert with repeated sexy moves (max 5 iterations handles all orientations)
  for (let i = 0; i < 5; i++) {
    if (isCornerSolved(current, target)) break
    apply(target.insert)
  }

  return { state: current, moves: allMoves }
}

export const solveWhiteCorners = (state: CubeState): { state: CubeState; groups: MoveGroup[] } => {
  let current = state
  const groups: MoveGroup[] = []

  for (const target of TARGETS) {
    const result = solveOneWhiteCorner(current, target)
    current = result.state
    if (result.moves.length > 0) groups.push({ moves: result.moves })
  }

  return { state: current, groups }
}
