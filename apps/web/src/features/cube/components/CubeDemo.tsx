import { createSolvedState, toStickers } from '@packages/cube-engine'

import { CubeNet } from '~/features/cube/components/CubeNet'

export const CubeDemo = () => {
  const state = createSolvedState()
  const stickersByFace = toStickers(state)

  return (
    <main className='mx-auto max-w-5xl p-4'>
      <h1 className='mb-6 text-xl font-semibold'>CubeMaster — Engine Demo</h1>
      <CubeNet stickersByFace={stickersByFace} />
    </main>
  )
}
