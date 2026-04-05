import type { FaceCode, StickersByFace } from '@packages/cube-engine'

import { InteractiveFaceGrid } from '~/features/solver/components/InteractiveFaceGrid'

interface InteractiveCubeNetProps {
  stickers: StickersByFace
  onPaintSticker: (face: FaceCode, index: number) => void
}

export const InteractiveCubeNet = ({ stickers, onPaintSticker }: InteractiveCubeNetProps) => (
  <section className='card bg-base-200 shadow-lg' aria-label='Interactive cube state'>
    <div className='card-body grid grid-cols-4 grid-rows-3 place-items-center gap-4 p-4 md:gap-6 md:p-6 lg:gap-8 lg:p-8'>
      <InteractiveFaceGrid
        stickers={stickers.U}
        face='U'
        onPaintSticker={onPaintSticker}
        className='col-start-2 row-start-1'
      />
      <InteractiveFaceGrid
        stickers={stickers.L}
        face='L'
        onPaintSticker={onPaintSticker}
        className='col-start-1 row-start-2'
      />
      <InteractiveFaceGrid
        stickers={stickers.F}
        face='F'
        onPaintSticker={onPaintSticker}
        className='col-start-2 row-start-2'
      />
      <InteractiveFaceGrid
        stickers={stickers.R}
        face='R'
        onPaintSticker={onPaintSticker}
        className='col-start-3 row-start-2'
      />
      <InteractiveFaceGrid
        stickers={stickers.B}
        face='B'
        onPaintSticker={onPaintSticker}
        className='col-start-4 row-start-2'
      />
      <InteractiveFaceGrid
        stickers={stickers.D}
        face='D'
        onPaintSticker={onPaintSticker}
        className='col-start-2 row-start-3'
      />
    </div>
  </section>
)
