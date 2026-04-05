import type { ColorCode } from '@packages/cube-engine'
import { Color } from '@packages/cube-engine'

import { colorNameByCode, stickerClassByColor } from '~/features/cube/lib/colors'

const COLORS = Object.values(Color) as ColorCode[]

interface ColorPaletteProps {
  selectedColor: ColorCode
  onSelectColor: (color: ColorCode) => void
}

export const ColorPalette = ({ selectedColor, onSelectColor }: ColorPaletteProps) => (
  <nav className='flex gap-3' aria-label='Color palette'>
    {COLORS.map(color => (
      <button
        key={color}
        type='button'
        className={`size-8 cursor-pointer rounded-full md:size-10 ${stickerClassByColor[color]} ${
          color === selectedColor ? 'ring-base-content ring-2 ring-offset-2' : ''
        }`}
        aria-label={`Select ${colorNameByCode[color]}`}
        aria-pressed={color === selectedColor}
        onClick={() => onSelectColor(color)}
      />
    ))}
  </nav>
)
