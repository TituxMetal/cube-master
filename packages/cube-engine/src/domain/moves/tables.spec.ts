import { describe, expect, it } from 'bun:test'

import { MOVE_TABLES } from './tables'

describe('Cube Domain - Permutation Tables', () => {
  describe('PermutationTable structure', () => {
    it('should have exactly 4 corner positions per cycle', () => {
      Object.values(MOVE_TABLES).forEach(table => {
        expect(table.cornerCycle).toHaveLength(4)
      })
    })

    it('should have exactly 4 edge positions per cycle', () => {
      Object.values(MOVE_TABLES).forEach(table => {
        expect(table.edgeCycle).toHaveLength(4)
      })
    })

    it('should have no duplicate positions within a corner cycle', () => {
      Object.values(MOVE_TABLES).forEach(table => {
        const unique = new Set(table.cornerCycle)
        expect(unique.size).toBe(4)
      })
    })

    it('should have no duplicate positions within an edge cycle', () => {
      Object.values(MOVE_TABLES).forEach(table => {
        const unique = new Set(table.edgeCycle)
        expect(unique.size).toBe(4)
      })
    })

    it('should have corner orientation deltas in range [0, 1, 2]', () => {
      Object.values(MOVE_TABLES).forEach(table => {
        table.cornerOrientationDeltas.forEach(delta => {
          expect([0, 1, 2]).toContain(delta)
        })
      })
    })

    it('should have edge orientation deltas in range [0, 1]', () => {
      Object.values(MOVE_TABLES).forEach(table => {
        table.edgeOrientationDeltas.forEach(delta => {
          expect([0, 1]).toContain(delta)
        })
      })
    })
  })

  describe('MOVE_TABLES', () => {
    it('should have exactly 6 entries', () => {
      expect(Object.keys(MOVE_TABLES)).toHaveLength(6)
    })
  })
})
