import { describe, expect, it } from 'bun:test'

import { applyMoves } from '~/application/use-cases/applyMoves'
import { createSolvedState } from '~/application/use-cases/createSolvedState'
import type { CornerPositionId, EdgePositionId } from '~/domain'
import { toStickers } from '~/infrastructure/render/toStickers'

import { ALGORITHM_CATALOG, getAlgorithm } from './catalog'
import { isFaceMove } from './moves'

describe('ALGORITHM_CATALOG', () => {
  it('should have unique ids', () => {
    const ids = ALGORITHM_CATALOG.map(entry => entry.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('should give every entry a non-empty move sequence of valid MoveTokens', () => {
    for (const entry of ALGORITHM_CATALOG) {
      expect(entry.moves.length).toBeGreaterThan(0)
      for (const move of entry.moves) {
        expect(isFaceMove(move)).toBe(true)
      }
    }
  })

  it('should give every entry a name and a description', () => {
    for (const entry of ALGORITHM_CATALOG) {
      expect(entry.name.length).toBeGreaterThan(0)
      expect(entry.description.length).toBeGreaterThan(0)
    }
  })
})

describe('getAlgorithm', () => {
  it('should resolve a known id to its entry', () => {
    const entry = getAlgorithm('sune')
    expect(entry).toBeDefined()
    expect(entry?.id).toBe('sune')
    expect(entry?.moves).toEqual(['R', 'D', "R'", 'D', 'R', 'D2', "R'"])
  })

  it('should return undefined for an unknown id without throwing', () => {
    expect(getAlgorithm('does-not-exist')).toBeUndefined()
  })

  it('should expose the Coach-only sexy-move mirror as the left-hand L D L′ D′ trigger', () => {
    const entry = getAlgorithm('sexy-move-mirror')
    expect(entry).toBeDefined()
    expect(entry?.moves).toEqual(['L', 'D', "L'", "D'"])
  })

  // The Coach-only a-perm must cycle three bottom corners WITHOUT twisting them — the
  // whole point of using it instead of corner-3-cycle for placement. Verified by
  // behaviour, not just literal moves, so a wrong sequence reddens here.
  it('a-perm cycles exactly three D corners, yellow staying down, edges and top intact', () => {
    const solved = createSolvedState()
    const moves = getAlgorithm('a-perm')?.moves
    expect(moves).toEqual(['R', "F'", 'R', 'B2', "R'", 'F', 'R', 'B2', 'R2'])
    const after = applyMoves(solved, [...moves!])

    const D_CORNERS: CornerPositionId[] = ['DFR', 'DRB', 'DBL', 'DLF']
    const movedCorners = D_CORNERS.filter(p => after.corners[p].id !== p)
    expect(movedCorners.length).toBe(3) // a 3-cycle of bottom corners
    // every corner stays oriented (orientation 0) — no twist
    const ALL_CORNERS: CornerPositionId[] = ['UFR', 'URB', 'UBL', 'ULF', 'DFR', 'DRB', 'DBL', 'DLF']
    expect(ALL_CORNERS.every(p => after.corners[p].orientation === 0)).toBe(true)
    // the yellow (D) face is untouched as a colour set — still all one colour
    const yellow = toStickers(solved).D[4]
    expect(toStickers(after).D.every(c => c === yellow)).toBe(true)
    // edges and the whole top (white) layer are left home
    const ALL_EDGES: EdgePositionId[] = [
      'UF',
      'UR',
      'UB',
      'UL',
      'FR',
      'BR',
      'BL',
      'FL',
      'DF',
      'DR',
      'DB',
      'DL'
    ]
    expect(ALL_EDGES.every(p => after.edges[p].id === p && after.edges[p].orientation === 0)).toBe(
      true
    )
  })
})
