import type { CornerPositionId, CubeState, EdgePositionId } from '@packages/cube-engine'
import { createSolvedState, toStickers } from '@packages/cube-engine'
import { describe, expect, it } from 'bun:test'

import {
  secondLayerState,
  whiteCornersState,
  whiteCrossOnlyState,
  yellowCrossState,
  yellowCornersOrientedState,
  yellowCornersPlacedState
} from '~/features/coach/data/illustrative'

// Independent verification of the *production* milestone journey (the single
// FIXED_SCRAMBLE in illustrative.ts). The store specs only prove the chapter
// practice reaches the milestone the planner *defines* — tautological, since target
// and recipe come from the same planner output. These assertions instead check each
// milestone against the geometric meaning of its chapter, so a planner regression
// that yields a self-consistent-but-incomplete milestone for this scramble fails
// here instead of shipping green. Predicates are written fresh on purpose — they
// must not reuse the planner internals they guard.

const U_CORNERS: CornerPositionId[] = ['UFR', 'URB', 'UBL', 'ULF']
const U_EDGES: EdgePositionId[] = ['UF', 'UR', 'UB', 'UL']
const MID_EDGES: EdgePositionId[] = ['FR', 'BR', 'BL', 'FL']
const D_CORNERS: CornerPositionId[] = ['DFR', 'DRB', 'DBL', 'DLF']
const D_EDGES: EdgePositionId[] = ['DF', 'DR', 'DB', 'DL']

const cornerHome = (s: CubeState, p: CornerPositionId): boolean =>
  s.corners[p].id === p && s.corners[p].orientation === 0
const edgeHome = (s: CubeState, p: EdgePositionId): boolean =>
  s.edges[p].id === p && s.edges[p].orientation === 0
const cornersOriented = (s: CubeState, ps: CornerPositionId[]): boolean =>
  ps.every(p => s.corners[p].orientation === 0)
const edgesOriented = (s: CubeState, ps: EdgePositionId[]): boolean =>
  ps.every(p => s.edges[p].orientation === 0)

const firstLayerComplete = (s: CubeState): boolean =>
  U_CORNERS.every(p => cornerHome(s, p)) && U_EDGES.every(p => edgeHome(s, p))
const twoLayersComplete = (s: CubeState): boolean =>
  firstLayerComplete(s) && MID_EDGES.every(p => edgeHome(s, p))

const isSolved = (s: CubeState): boolean => {
  const solved = toStickers(createSolvedState())
  const stickers = toStickers(s)
  return (['U', 'D', 'F', 'B', 'L', 'R'] as const).every(face =>
    stickers[face].every((color, i) => color === solved[face][i])
  )
}

describe('production milestones are genuine, reachable partial states (SUG-1)', () => {
  it('white-cross-only: the four top edges are home, the first layer is not yet finished', () => {
    const s = whiteCrossOnlyState()
    expect(U_EDGES.every(p => edgeHome(s, p))).toBe(true)
    expect(firstLayerComplete(s)).toBe(false)
  })

  it('white-corners: the whole first layer is complete (top crown solved)', () => {
    const s = whiteCornersState()
    expect(firstLayerComplete(s)).toBe(true)
    expect(twoLayersComplete(s)).toBe(false)
  })

  it('second-layer: the first two layers are complete', () => {
    const s = secondLayerState()
    expect(twoLayersComplete(s)).toBe(true)
    expect(isSolved(s)).toBe(false)
  })

  it('yellow-cross: two layers complete and every last-layer edge oriented', () => {
    const s = yellowCrossState()
    expect(twoLayersComplete(s)).toBe(true)
    expect(edgesOriented(s, D_EDGES)).toBe(true)
  })

  it('yellow-corners-oriented: + the whole yellow face (last-layer corners oriented)', () => {
    const s = yellowCornersOrientedState()
    expect(twoLayersComplete(s)).toBe(true)
    expect(edgesOriented(s, D_EDGES)).toBe(true)
    expect(cornersOriented(s, D_CORNERS)).toBe(true)
  })

  it('yellow-corners-placed: + the last-layer corners home (still oriented)', () => {
    const s = yellowCornersPlacedState()
    expect(twoLayersComplete(s)).toBe(true)
    expect(edgesOriented(s, D_EDGES)).toBe(true)
    expect(D_CORNERS.every(p => cornerHome(s, p))).toBe(true)
  })
})
