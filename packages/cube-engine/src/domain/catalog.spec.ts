import { describe, expect, it } from 'bun:test'

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
})
