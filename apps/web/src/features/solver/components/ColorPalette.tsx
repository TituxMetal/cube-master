import type { ColorCode } from '@packages/cube-engine'

import { colorNameByCode, stickerClassByColor } from '~/features/cube/lib/colors'

const COLOR_CYCLE: readonly ColorCode[] = ['Wt', 'Yl', 'Rd', 'Og', 'Bl', 'Gn']

export const ColorPalette = () => (
  <figure className='flex items-center gap-1.5' aria-label='Color cycle order'>
    {COLOR_CYCLE.map((color, i) => (
      <span key={color} className='flex items-center gap-1.5'>
        <span
          className={`size-5 rounded-full md:size-6 ${stickerClassByColor[color]}`}
          aria-label={colorNameByCode[color]}
        />
        <span className='text-base-content/40 text-xs' aria-hidden='true'>
          {i < COLOR_CYCLE.length - 1 ? '→' : '↩'}
        </span>
      </span>
    ))}
  </figure>
)
