import type { ColorCode, FaceCode } from '@packages/cube-engine'

import { colorNameByCode, stickerClassByColor } from '~/features/cube/lib/colors'

const faceNameByCode: Record<FaceCode, string> = {
  U: 'Up',
  D: 'Down',
  F: 'Front',
  B: 'Back',
  L: 'Left',
  R: 'Right'
}

interface FaceGridProps {
  stickers: readonly ColorCode[]
  className?: string
  label?: FaceCode
}

export const FaceGrid = ({ stickers, label, className = '' }: FaceGridProps) => {
  if (stickers.length !== 9) {
    throw new Error(`FaceGrid expects 9 stickers, got ${stickers.length}`)
  }

  return (
    <figure
      className={`inline-flex flex-col gap-2 ${className}`}
      aria-label={label ? `${faceNameByCode[label]} face` : undefined}
    >
      {label ? (
        <figcaption className='text-base-content/70 text-center text-xs tracking-widest'>
          {label}
        </figcaption>
      ) : null}

      <ul className='bg-base-300 ring-base-content/20 grid size-20 grid-cols-3 gap-1 rounded-sm p-1 ring-1 md:size-28 lg:size-36'>
        {stickers.slice(0, 9).map((color, index) => (
          <li
            key={index}
            className={`ring-base-content/10 hover:shadow-primary/20 aspect-square rounded-xs ring-1 transition-shadow hover:shadow-md ${stickerClassByColor[color]}`}
          >
            <span role='img' aria-label={colorNameByCode[color]} className='block size-full' />
          </li>
        ))}
      </ul>
    </figure>
  )
}
