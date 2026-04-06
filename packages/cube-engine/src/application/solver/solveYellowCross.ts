import type { CubeState, MoveToken } from '~/domain'
import { applyMove } from '~/domain/moves/apply'

import type { MoveGroup } from './types'

// Algorithm 1: solves "line" pattern (DF=1, DB=1 wrong, opposite edges)
// Commutator [F', R' D' R D] preserving U and middle layers
const LINE_ALG: MoveToken[] = ["F'", "R'", "D'", 'R', 'D', 'F']

// Algorithm 2: solves "L" pattern (DF=1, DR=1 wrong, adjacent edges)
// Commutator [R, D F D' F'] preserving U and middle layers
const L_ALG: MoveToken[] = ['R', 'D', 'F', "D'", "F'", "R'"]

type CrossPattern = 'cross' | 'dot' | 'line' | 'L'

const getOrientations = (state: CubeState): [number, number, number, number] => [
  state.edges.DF.orientation,
  state.edges.DR.orientation,
  state.edges.DB.orientation,
  state.edges.DL.orientation
]

const classifyPattern = (orient: [number, number, number, number]): CrossPattern => {
  const wrongCount = orient.filter(o => o === 1).length
  if (wrongCount === 0) return 'cross'
  if (wrongCount === 4) return 'dot'

  // 2 wrong edges: check if adjacent (L) or opposite (line)
  const wrongIndices = orient.map((o, i) => (o === 1 ? i : -1)).filter(i => i >= 0)
  const diff = Math.abs(wrongIndices[0] - wrongIndices[1])
  return diff === 2 ? 'line' : 'L'
}

// Find D rotation to align wrong edges with target positions.
// For L patterns, finds the "start" of the adjacent pair (handling wrap-around).
const findDRotation = (
  orient: [number, number, number, number],
  targetIndices: [number, number]
): MoveToken[] => {
  const wrongIndices = orient.map((o, i) => (o === 1 ? i : -1)).filter(i => i >= 0)
  const [a, b] = wrongIndices

  // Determine which index is the "start" of the pair
  const start = (a + 1) % 4 === b ? a : b
  const shift = (targetIndices[0] - start + 4) % 4

  if (shift === 1) return ['D']
  if (shift === 2) return ['D2']
  if (shift === 3) return ["D'"]
  return []
}

export const solveYellowCross = (state: CubeState): { state: CubeState; groups: MoveGroup[] } => {
  let current = state
  const groups: MoveGroup[] = []
  let iterationMoves: MoveToken[] = []

  const apply = (moves: MoveToken[]) => {
    for (const m of moves) {
      current = applyMove(current, m)
      iterationMoves.push(m)
    }
  }

  // Usually 2 applications (dot → L → cross). 3rd iteration as safety bound.
  for (let i = 0; i < 3; i++) {
    iterationMoves = []
    const orient = getOrientations(current)
    const pattern = classifyPattern(orient)

    if (pattern === 'cross') break

    if (pattern === 'dot') {
      apply(LINE_ALG)
      if (iterationMoves.length > 0) groups.push({ moves: iterationMoves })
      continue
    }

    if (pattern === 'line') {
      apply(findDRotation(orient, [0, 2]))
      apply(LINE_ALG)
      if (iterationMoves.length > 0) groups.push({ moves: iterationMoves })
      continue
    }

    // L pattern
    apply(findDRotation(orient, [0, 1]))
    apply(L_ALG)
    if (iterationMoves.length > 0) groups.push({ moves: iterationMoves })
  }

  return { state: current, groups }
}
