import { describe, it, expect } from 'bun:test'

import { Color, CornerPosition, EdgePosition, Face } from '~/domain'
import type { CubeState } from '~/domain'

import { createSolvedState } from './createSolvedState'

describe('Use Case - createSolvedState', () => {
  it('should have exactly 8 corners, 12 edges, and 6 centers', () => {
    const solvedState: CubeState = createSolvedState()
    const corners = Object.keys(solvedState.corners)
    const edges = Object.keys(solvedState.edges)
    const centers = Object.keys(solvedState.centers)

    expect(corners).toHaveLength(8)
    expect(edges).toHaveLength(12)
    expect(centers).toHaveLength(6)
  })

  it('should use exactly the canonical corner and edge positions keys', () => {
    const solvedState: CubeState = createSolvedState()
    const expectedCornerPositions = Object.keys(CornerPosition)
    const expectedEdgePositions = Object.keys(EdgePosition)

    expect(Object.keys(solvedState.corners).sort()).toEqual(expectedCornerPositions.sort())
    expect(Object.keys(solvedState.edges).sort()).toEqual(expectedEdgePositions.sort())
  })

  it('should set each piece to its solved invariants', () => {
    const solvedState: CubeState = createSolvedState()

    for (const cornerPositionId of Object.keys(CornerPosition) as Array<
      keyof typeof CornerPosition
    >) {
      const cornerPiece = solvedState.corners[cornerPositionId]

      expect(cornerPiece.id).toBe(cornerPositionId)
      expect(cornerPiece.position).toBe(cornerPositionId)
      expect(cornerPiece.orientation).toBe(0)
    }

    for (const edgePositionId of Object.keys(EdgePosition) as Array<keyof typeof EdgePosition>) {
      const edgePiece = solvedState.edges[edgePositionId]

      expect(edgePiece.id).toBe(edgePositionId)
      expect(edgePiece.position).toBe(edgePositionId)
      expect(edgePiece.orientation).toBe(0)
    }
  })

  it('should set canonical center colors', () => {
    const solvedState: CubeState = createSolvedState()
    const expectedCenters = {
      [Face.Up]: Color.White,
      [Face.Front]: Color.Green,
      [Face.Right]: Color.Red,
      [Face.Back]: Color.Blue,
      [Face.Left]: Color.Orange,
      [Face.Down]: Color.Yellow
    }

    expect(solvedState.centers).toEqual(expectedCenters)
    expect(Object.keys(solvedState.centers).sort()).toEqual(Object.values(Face).sort())
  })
})
