import type { ColorCode, FaceCode } from '@packages/cube-engine'

import { colorNameByCode, faceNameByCode, stickerClassByColor } from '~/features/cube/lib/colors'

interface InteractiveFaceGridProps {
  stickers: readonly ColorCode[]
  face: FaceCode
  selectedColor: ColorCode
  onPaintSticker: (face: FaceCode, index: number) => void
  className?: string
}

export const InteractiveFaceGrid = ({
  stickers,
  face,
  selectedColor,
  onPaintSticker,
  className = ''
}: InteractiveFaceGridProps) => {
  if (stickers.length !== 9) {
    throw new Error(`InteractiveFaceGrid expects 9 stickers, got ${stickers.length}`)
  }

  return (
    <figure
      className={`inline-flex flex-col gap-2 ${className}`}
      aria-label={`${faceNameByCode[face]} face`}
    >
      <figcaption className='text-base-content/70 text-center text-xs tracking-widest'>
        {face}
      </figcaption>

      <ul className='bg-base-300 ring-base-content/20 grid size-20 grid-cols-3 gap-1 rounded-sm p-1 ring-1 md:size-28 lg:size-36'>
        {stickers.slice(0, 9).map((color, index) => {
          const isCenter = index === 4

          return (
            <li key={index}>
              <button
                type='button'
                className={`aspect-square w-full rounded-xs ring-1 transition-shadow ${stickerClassByColor[color]} ${
                  isCenter
                    ? 'ring-base-content/10 cursor-default'
                    : 'ring-base-content/10 hover:shadow-primary/20 cursor-pointer hover:shadow-md'
                }`}
                aria-label={`${faceNameByCode[face]} sticker ${index}: ${colorNameByCode[color]}`}
                disabled={isCenter}
                onClick={() => {
                  if (!isCenter) onPaintSticker(face, index)
                }}
              />
            </li>
          )
        })}
      </ul>
    </figure>
  )
}
