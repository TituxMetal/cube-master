import { describe, expect, it } from 'bun:test'

import { FACE_MOVES, isFaceMove } from './tokens'

describe('Cube Domain - Move Tokens', () => {
  describe('FACE_MOVES', () => {
    it('should contain exactly 18 face moves', () => {
      expect(FACE_MOVES).toHaveLength(18)
    })

    it('should have no duplicates', () => {
      const unique = new Set(FACE_MOVES)

      expect(unique.size).toBe(18)
    })

    it('should contain all 6 base moves', () => {
      expect(FACE_MOVES).toContain('U')
      expect(FACE_MOVES).toContain('D')
      expect(FACE_MOVES).toContain('L')
      expect(FACE_MOVES).toContain('R')
      expect(FACE_MOVES).toContain('F')
      expect(FACE_MOVES).toContain('B')
    })

    it('should contain all 6 prime moves', () => {
      expect(FACE_MOVES).toContain("U'")
      expect(FACE_MOVES).toContain("D'")
      expect(FACE_MOVES).toContain("L'")
      expect(FACE_MOVES).toContain("R'")
      expect(FACE_MOVES).toContain("F'")
      expect(FACE_MOVES).toContain("B'")
    })

    it('should contain all 6 double moves', () => {
      expect(FACE_MOVES).toContain('U2')
      expect(FACE_MOVES).toContain('D2')
      expect(FACE_MOVES).toContain('L2')
      expect(FACE_MOVES).toContain('R2')
      expect(FACE_MOVES).toContain('F2')
      expect(FACE_MOVES).toContain('B2')
    })
  })

  describe('isFaceMove', () => {
    it('should accept all 18 valid face moves', () => {
      for (const move of FACE_MOVES) {
        expect(isFaceMove(move)).toBe(true)
      }
    })

    it('should reject invalid strings', () => {
      expect(isFaceMove('X')).toBe(false)
      expect(isFaceMove('U3')).toBe(false)
      expect(isFaceMove('M')).toBe(false)
      expect(isFaceMove('')).toBe(false)
    })

    it('should reject non-string values', () => {
      expect(isFaceMove(null)).toBe(false)
      expect(isFaceMove(123)).toBe(false)
    })
  })
})
