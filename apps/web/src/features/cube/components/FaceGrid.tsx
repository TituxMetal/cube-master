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

// Fixed per-breakpoint face sizes (rem), mirroring the Solver's InteractiveFaceGrid.
// Earlier tries were viewport-/container-driven and both failed: container-type:size
// collapsed in flex parents (the April bug), and `vw` tied the cube to the viewport
// width so it rendered a different size in Chromium vs Firefox (the scrollbar/vw
// divergence). Fixed rem renders identically in every engine and never collapses;
// vertical scroll absorbs the height. The smallest step (size-14) keeps a 4-wide net
// under 320px with no horizontal overflow.
const FACE_SIZE = 'size-14 sm:size-20 md:size-24 lg:size-28'
const FACE_SIZE_COMPACT = 'size-12 sm:size-14 md:size-16'

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
        className={`bg-base-300 ring-base-content/20 grid grid-cols-3 gap-1 rounded-sm p-1 ring-1 ${
          compact ? FACE_SIZE_COMPACT : FACE_SIZE
        }`}
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
