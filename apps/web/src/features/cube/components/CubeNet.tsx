import type { StickersByFace } from '@packages/cube-engine'

import { FaceGrid } from '~/features/cube/components/FaceGrid'

interface CubeNetProps {
  stickersByFace: StickersByFace
  className?: string
}

export const CubeNet = ({ stickersByFace, className = '' }: CubeNetProps) => (
  <section className={`card bg-base-200 shadow-lg ${className}`} aria-label='Cube state'>
    <div className='card-body grid grid-cols-4 grid-rows-3 place-items-center gap-4 p-4 md:gap-6 md:p-6 lg:gap-8 lg:p-8'>
      <FaceGrid stickers={stickersByFace.U} label='U' className='col-start-2 row-start-1' />
      <FaceGrid stickers={stickersByFace.D} label='D' className='col-start-2 row-start-3' />
      <FaceGrid stickers={stickersByFace.F} label='F' className='col-start-2 row-start-2' />
      <FaceGrid stickers={stickersByFace.B} label='B' className='col-start-4 row-start-2' />
      <FaceGrid stickers={stickersByFace.L} label='L' className='col-start-1 row-start-2' />
      <FaceGrid stickers={stickersByFace.R} label='R' className='col-start-3 row-start-2' />
    </div>
  </section>
)
