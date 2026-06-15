import type { FaceCode, MoveToken, StickersByFace } from '@packages/cube-engine'
import type { CSSProperties } from 'react'

import { FaceGrid } from '~/features/cube/components/FaceGrid'

interface CubeNetProps {
  stickersByFace: StickersByFace
  className?: string
  // Per-face sticker indices to emphasise (Coach points at the pieces in play).
  highlight?: Partial<Record<FaceCode, readonly number[]>>
  // The move being demonstrated — draws a direction arrow on the affected face.
  activeMove?: MoveToken
}

// One fluid face size for the whole net, driven by container-query units so the
// 4×3 cross fits its panel by width AND height with no scroll (D-RESPONSIVE).
// `container-type: size` needs a determinate height, so the grid carries its own
// `aspect-ratio` — a height is always derivable from the card width, which keeps
// the net from collapsing even when the parent imposes no height (the April bug).
// The cells then take `min(width-budget, height-budget, cap)`; gaps/padding scale
// with the container too. Tuned at the proof-slice gate (P4).
const netStyle: CSSProperties = {
  containerType: 'size',
  aspectRatio: '4 / 3',
  '--cube-face-size': 'min(20cqw, 26cqh, 7rem)'
} as CSSProperties

export const CubeNet = ({
  stickersByFace,
  className = '',
  highlight,
  activeMove
}: CubeNetProps) => (
  <section className={`card bg-base-200 shadow-lg ${className}`} aria-label='Cube state'>
    <div
      className='grid grid-cols-4 grid-rows-3 place-items-center gap-[2cqmin] p-[3cqmin]'
      style={netStyle}
    >
      <FaceGrid
        stickers={stickersByFace.U}
        label='U'
        highlight={highlight?.U}
        activeMove={activeMove}
        className='col-start-2 row-start-1'
      />
      <FaceGrid
        stickers={stickersByFace.D}
        label='D'
        highlight={highlight?.D}
        activeMove={activeMove}
        className='col-start-2 row-start-3'
      />
      <FaceGrid
        stickers={stickersByFace.F}
        label='F'
        highlight={highlight?.F}
        activeMove={activeMove}
        className='col-start-2 row-start-2'
      />
      <FaceGrid
        stickers={stickersByFace.B}
        label='B'
        highlight={highlight?.B}
        activeMove={activeMove}
        className='col-start-4 row-start-2'
      />
      <FaceGrid
        stickers={stickersByFace.L}
        label='L'
        highlight={highlight?.L}
        activeMove={activeMove}
        className='col-start-1 row-start-2'
      />
      <FaceGrid
        stickers={stickersByFace.R}
        label='R'
        highlight={highlight?.R}
        activeMove={activeMove}
        className='col-start-3 row-start-2'
      />
    </div>
  </section>
)
