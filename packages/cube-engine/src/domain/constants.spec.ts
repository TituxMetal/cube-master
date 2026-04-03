import { describe, expect, it } from 'bun:test'

import { Color, CornerPosition, EdgePosition, Face } from './constants'

describe('Cube Domain - Constants', () => {
  describe('Color constants', () => {
    it('should have exactly six color values', () => {
      const colorValues = Object.values(Color)

      expect(colorValues).toHaveLength(6)
    })

    it('should have unique color values', () => {
      const values = Object.values(Color)
      const uniqueValues = new Set(values)

      expect(uniqueValues.size).toBe(values.length)
    })
  })

  describe('Face constants', () => {
    it('should have six face values', () => {
      const faceValues = Object.values(Face)

      expect(faceValues).toHaveLength(6)
    })

    it('should have unique face values', () => {
      const values = Object.values(Face)
      const uniqueValues = new Set(values)

      expect(uniqueValues.size).toBe(values.length)
    })
  })

  describe('Corner positions', () => {
    it('should define exactly eight corner positions', () => {
      const cornerPositions = Object.keys(CornerPosition)

      expect(cornerPositions).toHaveLength(8)
    })

    it('should have unique corner positions', () => {
      const values = Object.keys(CornerPosition)
      const uniqueValues = new Set(values)

      expect(uniqueValues.size).toBe(values.length)
    })
  })

  describe('Edge positions', () => {
    it('should define exactly twelve edge positions', () => {
      const edgePositions = Object.keys(EdgePosition)

      expect(edgePositions).toHaveLength(12)
    })

    it('should have unique edge positions', () => {
      const values = Object.keys(EdgePosition)
      const uniqueValues = new Set(values)

      expect(uniqueValues.size).toBe(values.length)
    })
  })
})
