import { describe, it, expect } from 'bun:test'

import { makeKeyGuard, makeValueGuard } from './enumGuards'

describe('Enum Guards', () => {
  describe('makeValueGuard', () => {
    it('should create a guard that validates values of the enum-like object', () => {
      const Colors = { Red: 'R', Green: 'G', Blue: 'B' } as const
      const isColor = makeValueGuard(Colors)

      expect(isColor('R')).toBe(true)
      expect(isColor('G')).toBe(true)
      expect(isColor('B')).toBe(true)
      expect(isColor('Y')).toBe(false)
      expect(isColor(123)).toBe(false)
      expect(isColor(null)).toBe(false)
    })
  })
  describe('makeKeyGuard', () => {
    it('should create a guard that validates keys of the enum-like object', () => {
      const Directions = { Up: 0, Down: 1, Left: 2, Right: 3 } as const
      const isDirection = makeKeyGuard(Directions)

      expect(isDirection('Up')).toBe(true)
      expect(isDirection('Down')).toBe(true)
      expect(isDirection('Left')).toBe(true)
      expect(isDirection('Right')).toBe(true)
      expect(isDirection('Forward')).toBe(false)
      expect(isDirection(123)).toBe(false)
      expect(isDirection(null)).toBe(false)
    })
  })
})
