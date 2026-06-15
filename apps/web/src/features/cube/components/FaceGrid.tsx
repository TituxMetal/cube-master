import type { ColorCode, FaceCode, MoveToken } from '@packages/cube-engine'

import { CellArrow, cellArrowAngle, moveFace, moveTurn } from '~/features/cube/components/MoveArrow'
import { colorNameByCode, faceNameByCode, stickerClassByColor } from '~/features/cube/lib/colors'

interface FaceGridProps {
  stickers: readonly ColorCode[]
  className?: string
  label?: FaceCode
  // Sticker indices (0–8) to emphasise — used by Coach to point at the pieces a
  // step is about. Pure addition; omitting it leaves every call site unchanged.
  highlight?: readonly number[]
  // The move currently being demonstrated. When its face matches this grid's
  // label, a small rotation arrow is drawn on each sticker that travels.
  activeMove?: MoveToken
  // Smaller sizing for side-by-side nets (the White-Cross comparison).
  compact?: boolean
}

// One robust, fluid face size for the whole net: clamp scales it with the viewport
// without ever collapsing (unlike container queries against an indeterminate
// parent — the April/June bug). Caps near the Solver's proven large size; the
// compact variant keeps two nets readable side by side.
const FACE_SIZE = 'clamp(3.5rem, 8vw, 7rem)'
const FACE_SIZE_COMPACT = 'clamp(2.25rem, 4.5vw, 3.75rem)'

export const FaceGrid = ({
  stickers,
  label,
  className = '',
  highlight,
  activeMove,
  compact = false
}: FaceGridProps) => {
  if (stickers.length !== 9) {
    throw new Error(`FaceGrid expects 9 stickers, got ${stickers.length}`)
  }

  const turnsThisFace =
    activeMove !== undefined && label !== undefined && moveFace(activeMove) === label
  const turn = turnsThisFace ? moveTurn(activeMove) : null

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

      <ul
        className='bg-base-300 ring-base-content/20 grid grid-cols-3 gap-1 rounded-sm p-1 ring-1'
        style={{
          width: compact ? FACE_SIZE_COMPACT : FACE_SIZE,
          height: compact ? FACE_SIZE_COMPACT : FACE_SIZE
        }}
      >
        {stickers.slice(0, 9).map((color, index) => {
          const isHighlighted = highlight?.includes(index) ?? false
          const arrowAngle = turn ? cellArrowAngle(index, turn) : null

          return (
            <li
              key={index}
              data-highlighted={isHighlighted || undefined}
              className={`ring-base-content/10 relative aspect-square rounded-xs ring-1 ${stickerClassByColor[color]} ${
                isHighlighted
                  ? 'outline-cube-green-text z-10 outline outline-2 outline-offset-1'
                  : ''
              }`}
            >
              <span role='img' aria-label={colorNameByCode[color]} className='block size-full' />
              {arrowAngle !== null && <CellArrow angle={arrowAngle} />}
            </li>
          )
        })}
      </ul>
    </figure>
  )
}
