import type { CornerPositionId, CubeState, EdgePositionId, MoveToken } from '~/domain'
import { getAlgorithm } from '~/domain'
import { applyMove } from '~/domain/moves/apply'

import type { TeachingPlan, TeachingSegment, TeachingStepGroup } from './types'

// Last-layer teaching planners (Ch5 orient corners, Ch6 place corners, Ch7 permute
// edges). Each chains a single named block with D-turn placement, in the fixed frame
// (last layer on D, no cube rotation). Proven feasible by spike TS-0 — including the
// clean `yellow-corners-oriented` / `yellow-corners-placed` intermediate states and
// the corner-safe `edge-3-cycle` (the catalog ua-perm disturbs corners). See
// docs/solutions/2026-06-20-coach-no-rotation-teaching-solver-feasibility.md.

const D_CORNERS: readonly CornerPositionId[] = ['DFR', 'DRB', 'DBL', 'DLF']
const D_EDGES: readonly EdgePositionId[] = ['DF', 'DR', 'DB', 'DL']
const D_ROT: readonly MoveToken[][] = [[], ['D'], ['D2'], ["D'"]]

const applySeq = (state: CubeState, moves: readonly MoveToken[]): CubeState => {
  let s = state
  for (const m of moves) s = applyMove(s, m)
  return s
}

export const allDEdgesOriented = (s: CubeState): boolean =>
  D_EDGES.every(p => s.edges[p].orientation === 0)
export const allDCornersOriented = (s: CubeState): boolean =>
  D_CORNERS.every(p => s.corners[p].orientation === 0)
export const allDCornersPlaced = (s: CubeState): boolean =>
  D_CORNERS.every(p => s.corners[p].id === p && s.corners[p].orientation === 0)
export const dLayerSolved = (s: CubeState): boolean =>
  allDCornersPlaced(s) && D_EDGES.every(p => s.edges[p].id === p && s.edges[p].orientation === 0)

// A named teaching block: the catalog id + its move list (read once, parity-pinned).
type Block = { id: string; moves: readonly MoveToken[] }
const block = (id: string): Block => ({ id, moves: getAlgorithm(id)?.moves ?? [] })

// Encode the last layer (D corners + edges, id+orientation) for BFS visited dedup.
const encodeLL = (s: CubeState): string =>
  [
    ...D_CORNERS.map(p => `${s.corners[p].id}${s.corners[p].orientation}`),
    ...D_EDGES.map(p => `${s.edges[p].id}${s.edges[p].orientation}`)
  ].join(',')

// Bounded BFS over {D-rotation + one block} → the shortest chain reaching `goal`,
// rendered as teaching groups (one per block application: a D-placement setup
// segment, if any, then the trigger). Deterministic output (shortest, fixed action
// order); the search space is tiny (≤4 D-turns × few blocks). Returns an empty plan
// if already solved, or null if unreachable within `maxDepth`.
const bfsPlan = (
  start: CubeState,
  blocks: readonly Block[],
  goal: (s: CubeState) => boolean,
  maxDepth: number
): TeachingPlan | null => {
  type Choice = { dRot: MoveToken[]; block: Block }
  type Item = { state: CubeState; choices: Choice[]; depth: number }

  const toPlan = (choices: Choice[], finalAlign: MoveToken[]): TeachingPlan => {
    const groups: TeachingStepGroup[] = choices.map(choice => {
      const segments: TeachingSegment[] = []
      if (choice.dRot.length > 0) segments.push({ kind: 'setup', moves: choice.dRot })
      segments.push({ kind: 'trigger', moves: [...choice.block.moves], catalogId: choice.block.id })
      return { segments }
    })
    if (finalAlign.length > 0) groups.push({ segments: [{ kind: 'setup', moves: finalAlign }] })
    return { groups }
  }

  const queue: Item[] = [{ state: start, choices: [], depth: 0 }]
  const visited = new Set<string>([encodeLL(start)])
  let head = 0

  while (head < queue.length) {
    const item = queue[head++]
    for (const align of D_ROT) {
      if (goal(applySeq(item.state, align))) return toPlan(item.choices, [...align])
    }
    if (item.depth >= maxDepth) continue
    for (const dRot of D_ROT) {
      for (const b of blocks) {
        const action = [...dRot, ...b.moves]
        const next = applySeq(item.state, action)
        const key = encodeLL(next)
        if (visited.has(key)) continue
        visited.add(key)
        queue.push({
          state: next,
          choices: [...item.choices, { dRot: [...dRot], block: b }],
          depth: item.depth + 1
        })
      }
    }
  }
  return null
}

const fail = (phase: string): never => {
  throw new Error(`Teaching planner could not sequence ${phase} within depth limit`)
}

// Ch4 — turn the yellow line/L into the full yellow cross (orient the last-layer
// edges) with the two cross algorithms and D-alignment.
export const planYellowCross = (state: CubeState): TeachingPlan =>
  bfsPlan(state, [block('yellow-cross-line'), block('yellow-cross-l')], allDEdgesOriented, 4) ??
  fail('yellow-cross')

// Ch5 — orient the last-layer corners (full yellow face) with the sune family. 0 new
// algorithm; emits the `yellow-corners-oriented` milestone.
export const planOrientLastCorners = (state: CubeState): TeachingPlan =>
  bfsPlan(state, [block('sune'), block('anti-sune')], allDCornersOriented, 6) ??
  fail('orient-corners')

// Ch6 — place the (already oriented) last-layer corners with the orientation-safe
// corner cycle (a-perm), NOT the catalog corner-3-cycle: the latter twists the
// corners, lifting the yellow off the bottom and forcing many cycles to net it back.
// The a-perm keeps every corner yellow-down, so success is a clean `yellow-corners-
// placed` reached in one or two cycles, and the finished yellow face never flickers.
export const planPlaceLastCorners = (state: CubeState): TeachingPlan =>
  bfsPlan(state, [block('a-perm')], allDCornersPlaced, 5) ?? fail('place-corners')

// Ch7 — permute the last-layer edges with the corner-safe edge 3-cycle → solved.
export const planPermuteLastEdges = (state: CubeState): TeachingPlan =>
  bfsPlan(state, [block('edge-3-cycle')], dLayerSolved, 5) ?? fail('permute-edges')
