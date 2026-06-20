import { describe, expect, it } from 'bun:test'

import { applyMoves } from '~/application/use-cases/applyMoves'
import { createSolvedState } from '~/application/use-cases/createSolvedState'
import { solveCube } from '~/application/use-cases/solveCube'
import type { CornerPositionId, CubeState, EdgePositionId, MoveToken } from '~/domain'

import { planSecondLayer } from './planSecondLayer'
import { planWhiteCorners } from './planWhiteCorners'
import { flattenTeachingPlan } from './types'

const SCRAMBLES: MoveToken[][] = [
  ['R', 'U2', "F'", 'L', 'D', 'B2', "R'", 'U', 'F2', "D'", 'L2', 'B'],
  ['F', "R'", 'U', 'D2', "L'", 'B', 'R', "F'", 'U2', 'D', "B'", 'L2'],
  ['B2', 'D', "R'", 'F', "U'", 'L2', 'B', "D'", 'R', 'F2', "L'", 'U'],
  ['L', "D'", 'F2', "R'", 'U', 'B', "L'", 'D', 'R2', "F'", 'U2', "B'"]
]

const U_CORNERS: CornerPositionId[] = ['UFR', 'URB', 'UBL', 'ULF']
const U_EDGES: EdgePositionId[] = ['UF', 'UR', 'UB', 'UL']
const MID_EDGES: EdgePositionId[] = ['FR', 'BR', 'BL', 'FL']
const solved = createSolvedState()

const cornerHome = (s: CubeState, p: CornerPositionId): boolean =>
  s.corners[p].id === p && s.corners[p].orientation === 0
const edgeHome = (s: CubeState, p: EdgePositionId): boolean =>
  s.edges[p].id === p && s.edges[p].orientation === 0

const whiteCrossState = (scramble: MoveToken[]): CubeState => {
  const scrambled = applyMoves(solved, scramble)
  const sol = solveCube(scrambled)
  return applyMoves(
    scrambled,
    sol.phases.slice(0, 1).flatMap(p => p.groups.flatMap(g => g.moves))
  )
}

describe('planSecondLayer (Ch3 teaching solver)', () => {
  it('completes the first two layers, every scramble', () => {
    for (const scramble of SCRAMBLES) {
      const cross = whiteCrossState(scramble)
      const firstLayer = applyMoves(cross, [
        ...flattenTeachingPlan(planWhiteCorners(cross, solved))
      ])
      const twoLayers = applyMoves(firstLayer, [
        ...flattenTeachingPlan(planSecondLayer(firstLayer))
      ])

      // First layer still intact
      expect(U_CORNERS.every(p => cornerHome(twoLayers, p))).toBe(true)
      expect(U_EDGES.every(p => edgeHome(twoLayers, p))).toBe(true)
      // Middle layer now complete
      expect(MID_EDGES.every(p => edgeHome(twoLayers, p))).toBe(true)
    }
  })

  it('names only the two insert gestures and emits no rotation token', () => {
    const cross = whiteCrossState(SCRAMBLES[0])
    const firstLayer = applyMoves(cross, [...flattenTeachingPlan(planWhiteCorners(cross, solved))])
    const plan = planSecondLayer(firstLayer)
    for (const group of plan.groups) {
      for (const segment of group.segments) {
        if (segment.catalogId) {
          expect(['second-layer-insert-right', 'second-layer-insert-left']).toContain(
            segment.catalogId
          )
        }
        for (const move of segment.moves) expect(/[xyz]/i.test(move)).toBe(false)
      }
    }
  })
})
