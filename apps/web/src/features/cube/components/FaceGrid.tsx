import type { ColorCode, FaceCode, MoveToken } from '@packages/cube-engine'

import { MoveArrow, moveFace } from '~/features/cube/components/MoveArrow'
import { colorNameByCode, faceNameByCode, stickerClassByColor } from '~/features/cube/lib/colors'

interface FaceGridProps {
  stickers: readonly ColorCode[]
  className?: string
  label?: FaceCode
  // Sticker indices (0–8) to emphasise — used by Coach to point at the pieces a
  // step is about. Pure addition; omitting it leaves every call site unchanged.
  highlight?: readonly number[]
  // The move currently being demonstrated. When its face matches this grid's
  // label, a rotation-direction arrow is drawn over the stickers.
  activeMove?: MoveToken
}

export const FaceGrid = ({
  stickers,
  label,
  className = '',
  highlight,
  activeMove
}: FaceGridProps) => {
  if (stickers.length !== 9) {
    throw new Error(`FaceGrid expects 9 stickers, got ${stickers.length}`)
  }

  const showArrow =
    activeMove !== undefined && label !== undefined && moveFace(activeMove) === label

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

      <div className='relative'>
        <ul className='bg-base-300 ring-base-content/20 grid h-[var(--cube-face-size,5rem)] w-[var(--cube-face-size,5rem)] grid-cols-3 gap-1 rounded-sm p-1 ring-1'>
          {stickers.slice(0, 9).map((color, index) => {
            const isHighlighted = highlight?.includes(index) ?? false

            return (
              <li
                key={index}
                data-highlighted={isHighlighted || undefined}
                className={`ring-base-content/10 hover:shadow-primary/20 aspect-square rounded-xs ring-1 transition-shadow hover:shadow-md ${stickerClassByColor[color]} ${
                  isHighlighted
                    ? 'outline-cube-green-text z-10 outline outline-2 outline-offset-1'
                    : ''
                }`}
              >
                <span role='img' aria-label={colorNameByCode[color]} className='block size-full' />
              </li>
            )
          })}
        </ul>

        {showArrow && <MoveArrow move={activeMove} />}
      </div>
    </figure>
  )
}
