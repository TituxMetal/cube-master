import type { FaceCode, MoveToken, StickersByFace } from '@packages/cube-engine'

import { FaceGrid } from '~/features/cube/components/FaceGrid'
import { MoveBadge } from '~/features/cube/components/MoveArrow'

interface CubeNetProps {
  stickersByFace: StickersByFace
  className?: string
  // Per-face sticker indices to emphasise (Coach points at the pieces in play).
  highlight?: Partial<Record<FaceCode, readonly number[]>>
  // The move being demonstrated — draws per-sticker arrows on the affected face
  // and a prominent move-label badge in the corner.
  activeMove?: MoveToken
  // Smaller faces + tighter padding, for two nets shown side by side.
  compact?: boolean
}

export const CubeNet = ({
  stickersByFace,
  className = '',
  highlight,
  activeMove,
  compact = false
}: CubeNetProps) => (
  <section className={`card bg-base-200 relative shadow-lg ${className}`} aria-label='Cube state'>
    <div
      className={`grid grid-cols-4 grid-rows-3 place-items-center ${
        compact ? 'gap-1 p-3' : 'gap-2 p-4 md:gap-3 md:p-6'
      }`}
    >
      <FaceGrid
        stickers={stickersByFace.U}
        label='U'
        highlight={highlight?.U}
        activeMove={activeMove}
        compact={compact}
        className='col-start-2 row-start-1'
      />
      <FaceGrid
        stickers={stickersByFace.D}
        label='D'
        highlight={highlight?.D}
        activeMove={activeMove}
        compact={compact}
        className='col-start-2 row-start-3'
      />
      <FaceGrid
        stickers={stickersByFace.F}
        label='F'
        highlight={highlight?.F}
        activeMove={activeMove}
        compact={compact}
        className='col-start-2 row-start-2'
      />
      <FaceGrid
        stickers={stickersByFace.B}
        label='B'
        highlight={highlight?.B}
        activeMove={activeMove}
        compact={compact}
        className='col-start-4 row-start-2'
      />
      <FaceGrid
        stickers={stickersByFace.L}
        label='L'
        highlight={highlight?.L}
        activeMove={activeMove}
        compact={compact}
        className='col-start-1 row-start-2'
      />
      <FaceGrid
        stickers={stickersByFace.R}
        label='R'
        highlight={highlight?.R}
        activeMove={activeMove}
        compact={compact}
        className='col-start-3 row-start-2'
      />
    </div>

    {activeMove && <MoveBadge move={activeMove} />}
  </section>
)
