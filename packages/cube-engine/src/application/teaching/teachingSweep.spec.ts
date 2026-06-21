import { describe, expect, it } from 'bun:test'

import { applyMoves } from '~/application/use-cases/applyMoves'
import { createSolvedState } from '~/application/use-cases/createSolvedState'
import { generateScramble } from '~/application/use-cases/generateScramble'
import type { RandomSource } from '~/application/use-cases/generateScramble'
import { solveCube } from '~/application/use-cases/solveCube'
import type { CornerPositionId, CubeState, EdgePositionId } from '~/domain'

import {
  allDCornersOriented,
  allDCornersPlaced,
  allDEdgesOriented,
  dLayerSolved,
  planOrientLastCorners,
  planPermuteLastEdges,
  planPlaceLastCorners,
  planYellowCross
} from './planLastLayer'
import { planSecondLayer } from './planSecondLayer'
import { planWhiteCorners } from './planWhiteCorners'
import { flattenTeachingPlan } from './types'
import type { TeachingPlan } from './types'

// SUG-2 — a property sweep over many scrambles, the regression home for the TS-0
// feasibility spike. The hand-picked specs lock four fixed cases; the production
// journey runs exactly one. Neither exercises the branchy paths (planWhiteCorners'
// stuck-corner extract, planSecondLayer's multi-pass eviction, planPermuteLastEdges'
// double edge-cycle) that only some cube states reach. Here every teaching planner
// is chained end-to-end on a deterministic fan of scrambles; with the planners now
// failing loudly on incompletion (SUG-3), any case they cannot sequence throws here
// instead of slipping through a green suite.

// Deterministic PRNG (mulberry32) → reproducible scrambles, no RNG flakiness and no
// Date.now/Math.random. A fixed seed keeps the fan identical run to run.
const mulberry32 = (seed: number): RandomSource => {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Each scramble runs the full layer-by-layer solveCube plus the whole teaching chain,
// so the sweep is deliberately bounded and given a generous timeout (it is a
// correctness net, not a hot path). Far more than the four hand-picked cases.
const SWEEP = 24
const SWEEP_TIMEOUT_MS = 30_000
const solved = createSolvedState()

const U_CORNERS: CornerPositionId[] = ['UFR', 'URB', 'UBL', 'ULF']
const U_EDGES: EdgePositionId[] = ['UF', 'UR', 'UB', 'UL']
const MID_EDGES: EdgePositionId[] = ['FR', 'BR', 'BL', 'FL']

const cornerHome = (s: CubeState, p: CornerPositionId): boolean =>
  s.corners[p].id === p && s.corners[p].orientation === 0
const edgeHome = (s: CubeState, p: EdgePositionId): boolean =>
  s.edges[p].id === p && s.edges[p].orientation === 0
const firstLayerComplete = (s: CubeState): boolean =>
  U_CORNERS.every(p => cornerHome(s, p)) && U_EDGES.every(p => edgeHome(s, p))
const twoLayersComplete = (s: CubeState): boolean =>
  firstLayerComplete(s) && MID_EDGES.every(p => edgeHome(s, p))

const advance = (state: CubeState, plan: TeachingPlan): CubeState =>
  applyMoves(state, [...flattenTeachingPlan(plan)])

// The white-cross-only state, built exactly as illustrative.ts does (solver phase 0).
const whiteCrossState = (scramble: ReturnType<typeof generateScramble>): CubeState => {
  const scrambled = applyMoves(solved, scramble)
  const solution = solveCube(scrambled)
  return applyMoves(
    scrambled,
    solution.phases.slice(0, 1).flatMap(phase => phase.groups.flatMap(group => group.moves))
  )
}

describe(`teaching planners — full-chain sweep over ${SWEEP} scrambles (SUG-2)`, () => {
  const random = mulberry32(0x1234abcd)
  const scrambles = Array.from({ length: SWEEP }, () => generateScramble(20, random))

  it(
    'chains white-corners → second-layer → cross → orient → place → permute to solved, no rotation',
    () => {
      for (const scramble of scrambles) {
        const cross = whiteCrossState(scramble)
        expect(U_EDGES.every(p => edgeHome(cross, p))).toBe(true) // precondition: cross is up

        // Build each plan once, advance through it, and collect its moves for the
        // no-rotation check — so solveCube and the planners run a single time each.
        const moves: string[] = []
        const step = (state: CubeState, plan: TeachingPlan): CubeState => {
          moves.push(...flattenTeachingPlan(plan))
          return advance(state, plan)
        }

        const firstLayer = step(cross, planWhiteCorners(cross, solved))
        expect(firstLayerComplete(firstLayer)).toBe(true)

        const secondLayer = step(firstLayer, planSecondLayer(firstLayer))
        expect(twoLayersComplete(secondLayer)).toBe(true)

        const yellowCross = step(secondLayer, planYellowCross(secondLayer))
        expect(twoLayersComplete(yellowCross)).toBe(true) // first two layers kept
        expect(allDEdgesOriented(yellowCross)).toBe(true)

        const oriented = step(yellowCross, planOrientLastCorners(yellowCross))
        expect(allDEdgesOriented(oriented)).toBe(true)
        expect(allDCornersOriented(oriented)).toBe(true)

        const placed = step(oriented, planPlaceLastCorners(oriented))
        expect(allDCornersPlaced(placed)).toBe(true)
        expect(allDCornersOriented(placed)).toBe(true)

        const finished = step(placed, planPermuteLastEdges(placed))
        expect(twoLayersComplete(finished)).toBe(true)
        expect(dLayerSolved(finished)).toBe(true)

        for (const move of moves) expect(/[xyz]/i.test(move)).toBe(false)
      }
    },
    SWEEP_TIMEOUT_MS
  )
})
