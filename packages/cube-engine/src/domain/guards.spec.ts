import { describe, expect, it } from 'bun:test'

import { isColor, isCornerPosition, isEdgePosition, isFace } from './guards'

describe('Cube Domain - Guards', () => {
  describe('isColor', () => {
    it('should accept only valid colors', () => {
      expect(isColor('Wt')).toBe(true)

      expect(isColor('P')).toBe(false)
      expect(isColor('WHITE')).toBe(false)
      expect(isColor(123)).toBe(false)
      expect(isColor(null)).toBe(false)
    })
  })

  describe('isFace', () => {
    it('should accept only valid faces', () => {
      expect(isFace('U')).toBe(true)

      expect(isFace('X')).toBe(false)
      expect(isFace('UP')).toBe(false)
      expect(isFace(123)).toBe(false)
      expect(isFace(null)).toBe(false)
    })
  })

  describe('isCornerPosition', () => {
    it('should accept only valid corner positions', () => {
      expect(isCornerPosition('UFR')).toBe(true)
      expect(isCornerPosition('DLF')).toBe(true)
      expect(isCornerPosition('XYZ')).toBe(false)
      expect(isCornerPosition('UFB')).toBe(false)
      expect(isCornerPosition(123)).toBe(false)
      expect(isCornerPosition(null)).toBe(false)
    })
  })

  describe('isEdgePosition', () => {
    it('should accept only valid edge positions', () => {
      expect(isEdgePosition('UF')).toBe(true)
      expect(isEdgePosition('BL')).toBe(true)
      expect(isEdgePosition('XY')).toBe(false)
      expect(isEdgePosition('UZ')).toBe(false)
      expect(isEdgePosition(123)).toBe(false)
      expect(isEdgePosition(null)).toBe(false)
    })
  })
})
