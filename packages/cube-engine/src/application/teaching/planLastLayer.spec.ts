import { describe, expect, it } from 'bun:test'

import { applyMoves } from '~/application/use-cases/applyMoves'
import { createSolvedState } from '~/application/use-cases/createSolvedState'
import { solveCube } from '~/application/use-cases/solveCube'
import { getAlgorithm } from '~/domain'
import type { CubeState, MoveToken } from '~/domain'

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
import { flattenTeachingPlan } from './types'

const SCRAMBLES: MoveToken[][] = [
  ['R', 'U2', "F'", 'L', 'D', 'B2', "R'", 'U', 'F2', "D'", 'L2', 'B'],
  ['F', "R'", 'U', 'D2', "L'", 'B', 'R', "F'", 'U2', 'D', "B'", 'L2'],
  ['B2', 'D', "R'", 'F', "U'", 'L2', 'B', "D'", 'R', 'F2', "L'", 'U'],
  ['L', "D'", 'F2', "R'", 'U', 'B', "L'", 'D', 'R2', "F'", 'U2', "B'"]
]

const solved = createSolvedState()
const run = (state: CubeState, plan: ReturnType<typeof planYellowCross>): CubeState =>
  applyMoves(state, [...flattenTeachingPlan(plan)])

// Replay solver phases [0..k) to reach a milestone (mirrors illustrative.ts).
const after = (scramble: MoveToken[], k: number): CubeState => {
  const scrambled = applyMoves(solved, scramble)
  const sol = solveCube(scrambled)
  return applyMoves(
    scrambled,
    sol.phases.slice(0, k).flatMap(p => p.groups.flatMap(g => g.moves))
  )
}

describe('last-layer teaching planners (Ch4-7)', () => {
  it('planYellowCross turns the second layer into the full yellow cross', () => {
    for (const scramble of SCRAMBLES) {
      const secondLayer = after(scramble, 3)
      expect(allDEdgesOriented(run(secondLayer, planYellowCross(secondLayer)))).toBe(true)
    }
  })

  it('chains orient → place → permute from the yellow cross to a solved last layer', () => {
    for (const scramble of SCRAMBLES) {
      const yellowCross = after(scramble, 4)
      expect(allDEdgesOriented(yellowCross)).toBe(true) // precondition

      const oriented = run(yellowCross, planOrientLastCorners(yellowCross))
      expect(allDCornersOriented(oriented)).toBe(true)
      expect(allDEdgesOriented(oriented)).toBe(true) // cross kept

      const placed = run(oriented, planPlaceLastCorners(oriented))
      expect(allDCornersPlaced(placed)).toBe(true)
      expect(allDCornersOriented(placed)).toBe(true) // clean yellow-corners-placed

      const finished = run(placed, planPermuteLastEdges(placed))
      expect(dLayerSolved(finished)).toBe(true)
    }
  })

  it('emits no cube-rotation token across the whole last layer', () => {
    const yellowCross = after(SCRAMBLES[0], 4)
    const oriented = run(yellowCross, planOrientLastCorners(yellowCross))
    const placed = run(oriented, planPlaceLastCorners(oriented))
    const moves = [
      ...flattenTeachingPlan(planOrientLastCorners(yellowCross)),
      ...flattenTeachingPlan(planPlaceLastCorners(oriented)),
      ...flattenTeachingPlan(planPermuteLastEdges(placed))
    ]
    for (const move of moves) expect(/[xyz]/i.test(move)).toBe(false)
  })
})

describe('edge-3-cycle (catalog) — corner-safe last-layer edge cycle', () => {
  const moves = getAlgorithm('edge-3-cycle')!.moves

  it('cycles exactly three D edges and leaves every corner (and the U layer) intact', () => {
    const after1 = applyMoves(solved, [...moves])
    // corners all home + oriented
    expect(allDCornersPlaced(after1)).toBe(true)
    // exactly three D edges displaced, all still oriented
    const dEdges = ['DF', 'DR', 'DB', 'DL'] as const
    const moved = dEdges.filter(p => after1.edges[p].id !== p).length
    expect(moved).toBe(3)
    expect(allDEdgesOriented(after1)).toBe(true)
  })
})
