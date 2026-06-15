import type { FaceCode, MoveToken, StickersByFace } from '@packages/cube-engine'

import { InteractiveFaceGrid } from '~/features/solver/components/InteractiveFaceGrid'

interface InteractiveCubeNetProps {
  stickers: StickersByFace
  onPaintSticker: (face: FaceCode, index: number) => void
  // The current solution move — forwarded so its face shows a direction arrow.
  activeMove?: MoveToken
}

export const InteractiveCubeNet = ({
  stickers,
  onPaintSticker,
  activeMove
}: InteractiveCubeNetProps) => (
  <section className='card bg-base-200 shadow-lg' aria-label='Interactive cube state'>
    <div className='card-body grid grid-cols-4 grid-rows-3 justify-items-center gap-1 p-4 md:gap-2 md:p-6 lg:gap-3 lg:p-8'>
      <InteractiveFaceGrid
        stickers={stickers.U}
        face='U'
        onPaintSticker={onPaintSticker}
        activeMove={activeMove}
        className='col-start-2 row-start-1'
      />
      <InteractiveFaceGrid
        stickers={stickers.L}
        face='L'
        onPaintSticker={onPaintSticker}
        activeMove={activeMove}
        className='col-start-1 row-start-2'
      />
      <InteractiveFaceGrid
        stickers={stickers.F}
        face='F'
        onPaintSticker={onPaintSticker}
        activeMove={activeMove}
        className='col-start-2 row-start-2'
      />
      <InteractiveFaceGrid
        stickers={stickers.R}
        face='R'
        onPaintSticker={onPaintSticker}
        activeMove={activeMove}
        className='col-start-3 row-start-2'
      />
      <InteractiveFaceGrid
        stickers={stickers.B}
        face='B'
        onPaintSticker={onPaintSticker}
        activeMove={activeMove}
        className='col-start-4 row-start-2'
      />
      <InteractiveFaceGrid
        stickers={stickers.D}
        face='D'
        onPaintSticker={onPaintSticker}
        activeMove={activeMove}
        className='col-start-2 row-start-3'
      />
    </div>
  </section>
)
