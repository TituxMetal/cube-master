import type { ColorCode, FaceCode } from '@packages/cube-engine'

import { colorNameByCode, faceNameByCode, stickerClassByColor } from '~/features/cube/lib/colors'

interface InteractiveFaceGridProps {
  stickers: readonly ColorCode[]
  face: FaceCode
  onPaintSticker: (face: FaceCode, index: number) => void
  className?: string
}

export const InteractiveFaceGrid = ({
  stickers,
  face,
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

      <ul className='bg-base-300 border-base-content/40 inline-grid auto-rows-[20px] grid-cols-[repeat(3,20px)] gap-[3px] rounded-sm border p-[3px] md:auto-rows-[32px] md:grid-cols-[repeat(3,32px)] lg:auto-rows-[40px] lg:grid-cols-[repeat(3,40px)]'>
        {stickers.slice(0, 9).map((color, index) => {
          const isCenter = index === 4

          return (
            <li key={index}>
              <button
                type='button'
                className={`size-full rounded-xs ${stickerClassByColor[color]} ${
                  isCenter ? 'cursor-default' : 'cursor-pointer hover:brightness-110'
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
