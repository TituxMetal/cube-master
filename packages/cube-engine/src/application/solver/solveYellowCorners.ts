import type { CornerPositionId, CubeState, EdgePositionId, MoveToken } from '~/domain'
import { getAlgorithm } from '~/domain'
import { applyMove } from '~/domain/moves/apply'

import type { MoveGroup } from './types'

const D_CORNERS: readonly CornerPositionId[] = ['DFR', 'DRB', 'DBL', 'DLF']
const D_EDGES: readonly EdgePositionId[] = ['DF', 'DR', 'DB', 'DL']

// Algorithms that preserve U+M layers. Canonical source is the domain catalog
// (ADR-0006) so the solver executes exactly what Coach demos; copied into
// mutable arrays for the spread-based action table below.
const SUNE: MoveToken[] = [...getAlgorithm('sune')!.moves]
const ANTI_SUNE: MoveToken[] = [...getAlgorithm('anti-sune')!.moves]

// Corner 3-cycle: (DFR→DLF→DBL), DRB stays. Exported so the catalog parity spec
// pins the promoted `corner-3-cycle` entry to this live solver constant.
export const CORNER_3_CYCLE: MoveToken[] = ['D', 'R', "D'", "L'", 'D', "R'", "D'", 'L']

// Ua perm (last-layer edge 3-cycle): Sune followed by D. Exported so the catalog
// parity spec pins the promoted `ua-perm` entry to this live solver constant.
export const UA_PERM: MoveToken[] = [...SUNE, 'D']

const ALGORITHMS: MoveToken[][] = [
  SUNE,
  ANTI_SUNE,
  CORNER_3_CYCLE,
  // Ua perm (edge swap)
  UA_PERM,
  // Ub perm
  [...ANTI_SUNE, "D'"],
  // [Sune, D] commutator (corner twist)
  [...SUNE, 'D', ...ANTI_SUNE, "D'"],
  // [Sune, D2] commutator
  [...SUNE, 'D2', ...ANTI_SUNE, 'D2']
]

const applySeq = (state: CubeState, moves: MoveToken[]): CubeState => {
  let s = state
  for (const m of moves) s = applyMove(s, m)
  return s
}

const isDLayerSolved = (state: CubeState): boolean => {
  for (const p of D_CORNERS) {
    if (state.corners[p].id !== p || state.corners[p].orientation !== 0) return false
  }
  for (const p of D_EDGES) {
    if (state.edges[p].id !== p || state.edges[p].orientation !== 0) return false
  }
  return true
}

// Encode D-layer state as a compact string for visited-state tracking
const encodeState = (state: CubeState): string => {
  const parts: string[] = []
  for (const p of D_EDGES) parts.push(state.edges[p].id + state.edges[p].orientation)
  for (const p of D_CORNERS) parts.push(state.corners[p].id + state.corners[p].orientation)
  return parts.join(',')
}

// BFS to find the shortest sequence of algorithms that solves the D layer
const bfsSolve = (state: CubeState, maxDepth: number): MoveToken[] | null => {
  // Generate all actions: D-rotation + algorithm
  const actions: MoveToken[][] = []
  const dMoves: MoveToken[][] = [[], ['D'], ['D2'], ["D'"]]

  for (const dRot of dMoves) {
    for (const alg of ALGORITHMS) {
      actions.push([...dRot, ...alg])
    }
  }

  // BFS with index-based queue (avoids O(n) shift)
  type QueueItem = { state: CubeState; moves: MoveToken[]; depth: number }
  const queue: QueueItem[] = [{ state, moves: [], depth: 0 }]
  let head = 0
  const visited = new Set<string>()
  visited.add(encodeState(state))

  while (head < queue.length) {
    const item = queue[head++]

    // Try D alignment first (might already be solved with just a D rotation)
    for (const dAlign of dMoves) {
      if (isDLayerSolved(applySeq(item.state, dAlign))) {
        return [...item.moves, ...dAlign]
      }
    }

    if (item.depth >= maxDepth) continue

    for (const action of actions) {
      const newState = applySeq(item.state, action)
      const key = encodeState(newState)
      if (visited.has(key)) continue
      visited.add(key)
      queue.push({
        state: newState,
        moves: [...item.moves, ...action],
        depth: item.depth + 1
      })
    }
  }

  return null
}

export const solveYellowCorners = (state: CubeState): { state: CubeState; groups: MoveGroup[] } => {
  // Check if already solved with D rotation
  const dMoves: MoveToken[][] = [[], ['D'], ['D2'], ["D'"]]
  for (const dRot of dMoves) {
    if (isDLayerSolved(applySeq(state, dRot))) {
      const result = applySeq(state, dRot)
      return { state: result, groups: dRot.length > 0 ? [{ moves: dRot }] : [] }
    }
  }

  // BFS with increasing depth
  for (let depth = 1; depth <= 5; depth++) {
    const solution = bfsSolve(state, depth)
    if (solution) {
      return { state: applySeq(state, solution), groups: [{ moves: solution }] }
    }
  }

  throw new Error('Yellow layer solver failed to find solution within depth limit')
}
