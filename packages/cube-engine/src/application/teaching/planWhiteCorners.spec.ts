import { describe, expect, it } from 'bun:test'

import { applyMoves } from '~/application/use-cases/applyMoves'
import { createSolvedState } from '~/application/use-cases/createSolvedState'
import { solveCube } from '~/application/use-cases/solveCube'
import { getAlgorithm } from '~/domain'
import type { CornerPositionId, CubeState, EdgePositionId, MoveToken } from '~/domain'

import { planWhiteCorners } from './planWhiteCorners'
import { flattenTeachingPlan } from './types'

const U_CORNERS: CornerPositionId[] = ['UFR', 'URB', 'UBL', 'ULF']
const U_EDGES: EdgePositionId[] = ['UF', 'UR', 'UB', 'UL']

// Fixed scrambles → deterministic spec (no RNG). Each is a valid 12-turn sequence.
const SCRAMBLES: MoveToken[][] = [
  ['R', 'U2', "F'", 'L', 'D', 'B2', "R'", 'U', 'F2', "D'", 'L2', 'B'],
  ['F', "R'", 'U', 'D2', "L'", 'B', 'R', "F'", 'U2', 'D', "B'", 'L2'],
  ['B2', 'D', "R'", 'F', "U'", 'L2', 'B', "D'", 'R', 'F2', "L'", 'U'],
  ['L', "D'", 'F2', "R'", 'U', 'B', "L'", 'D', 'R2', "F'", 'U2', "B'"]
]

const solved = createSolvedState()

// Build the white-cross-only state the same way illustrative.ts does (scramble →
// solve → replay phase 0). Test-only coupling to the solver; production planner
// imports nothing from solver/.
const whiteCrossState = (scramble: MoveToken[]): CubeState => {
  const scrambled = applyMoves(solved, scramble)
  const solution = solveCube(scrambled)
  return applyMoves(
    scrambled,
    solution.phases.slice(0, 1).flatMap(p => p.groups.flatMap(g => g.moves))
  )
}

const cornerHome = (s: CubeState, p: CornerPositionId): boolean =>
  s.corners[p].id === p && s.corners[p].orientation === 0
const edgeHome = (s: CubeState, p: EdgePositionId): boolean =>
  s.edges[p].id === p && s.edges[p].orientation === 0
const firstLayerComplete = (s: CubeState): boolean =>
  U_CORNERS.every(p => cornerHome(s, p)) && U_EDGES.every(p => edgeHome(s, p))

describe('planWhiteCorners (Ch2 teaching solver)', () => {
  it('completes the whole first layer from a white-cross state, every scramble', () => {
    for (const scramble of SCRAMBLES) {
      const start = whiteCrossState(scramble)
      expect(U_EDGES.every(p => edgeHome(start, p))).toBe(true) // precondition: cross is up
      const plan = planWhiteCorners(start, solved)
      const end = applyMoves(start, [...flattenTeachingPlan(plan)])
      expect(firstLayerComplete(end)).toBe(true)
    }
  })

  it('emits no cube-rotation token (fixed white-up / green-front frame)', () => {
    for (const scramble of SCRAMBLES) {
      const plan = planWhiteCorners(whiteCrossState(scramble), solved)
      for (const move of flattenTeachingPlan(plan)) {
        expect(/[xyz]/i.test(move)).toBe(false)
      }
    }
  })

  it('names a real catalog block on every trigger segment, and only setup/trigger kinds', () => {
    const plan = planWhiteCorners(whiteCrossState(SCRAMBLES[0]), solved)
    for (const group of plan.groups) {
      for (const segment of group.segments) {
        expect(segment.kind === 'setup' || segment.kind === 'trigger').toBe(true)
        if (segment.kind === 'trigger') {
          expect(segment.catalogId).toBeDefined()
          expect(getAlgorithm(segment.catalogId!)).toBeDefined()
        }
      }
    }
  })

  it('uses both the sexy move and its mirror across the catalog of triggers it can emit', () => {
    // Not every scramble needs the mirror, but the planner must be able to reach for
    // it — assert at least one scramble's plan references each trigger id.
    const ids = new Set<string>()
    for (const scramble of SCRAMBLES) {
      const plan = planWhiteCorners(whiteCrossState(scramble), solved)
      for (const group of plan.groups) {
        for (const segment of group.segments) {
          if (segment.catalogId) ids.add(segment.catalogId)
        }
      }
    }
    expect(ids.has('sexy-move')).toBe(true)
    expect(ids.has('sexy-move-mirror')).toBe(true)
  })
})

describe('sexy-move-mirror (catalog) — left-hand mirror behaviour', () => {
  const mirror = getAlgorithm('sexy-move-mirror')!.moves

  it('is order 6 like the sexy move (six applications return to solved)', () => {
    let s = solved
    for (let i = 0; i < 6; i++) s = applyMoves(s, [...mirror])
    expect(s).toEqual(solved)
  })

  it('disturbs the front-left corners (ULF/UBL) and leaves the right corners (UFR/URB) home', () => {
    const after = applyMoves(solved, [...mirror])
    expect(cornerHome(after, 'UFR')).toBe(true)
    expect(cornerHome(after, 'URB')).toBe(true)
    // at least one of the left corners moves — it is a left-front trigger
    expect(cornerHome(after, 'ULF') && cornerHome(after, 'UBL')).toBe(false)
  })
})
