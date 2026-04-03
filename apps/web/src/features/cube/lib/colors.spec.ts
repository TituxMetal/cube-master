import { describe, expect, it } from 'bun:test'

import { colorNameByCode, stickerClassByColor } from '~/features/cube/lib/colors'

describe('Cube Colors', () => {
  describe('stickerClassByColor', () => {
    it('should map all 6 color codes to Tailwind classes', () => {
      expect(Object.keys(stickerClassByColor)).toHaveLength(6)
    })

    it('should use cube-* color classes (not raw Tailwind colors)', () => {
      Object.values(stickerClassByColor).forEach(className => {
        expect(className).toMatch(/^bg-cube-/)
      })
    })

    it('should map each color code to the correct class', () => {
      expect(stickerClassByColor.Wt).toBe('bg-cube-white')
      expect(stickerClassByColor.Yl).toBe('bg-cube-yellow')
      expect(stickerClassByColor.Rd).toBe('bg-cube-red')
      expect(stickerClassByColor.Og).toBe('bg-cube-orange')
      expect(stickerClassByColor.Bl).toBe('bg-cube-blue')
      expect(stickerClassByColor.Gn).toBe('bg-cube-green')
    })
  })

  describe('colorNameByCode', () => {
    it('should map all 6 color codes to human-readable names', () => {
      expect(Object.keys(colorNameByCode)).toHaveLength(6)
    })

    it('should map each color code to the correct name', () => {
      expect(colorNameByCode.Wt).toBe('white')
      expect(colorNameByCode.Yl).toBe('yellow')
      expect(colorNameByCode.Rd).toBe('red')
      expect(colorNameByCode.Og).toBe('orange')
      expect(colorNameByCode.Bl).toBe('blue')
      expect(colorNameByCode.Gn).toBe('green')
    })
  })
})
