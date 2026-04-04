import { ActionBar } from '~/features/cube/components/ActionBar'
import { CubeNet } from '~/features/cube/components/CubeNet'
import { MoveControls } from '~/features/cube/components/MoveControls'
import { MoveHistory } from '~/features/cube/components/MoveHistory'
import {
  applyMoveAction,
  resetAction,
  useMoveHistory,
  useStickersByFace
} from '~/features/cube/stores/cube-store'

export const CubePlayground = () => {
  const stickersByFace = useStickersByFace()
  const moveHistory = useMoveHistory()

  return (
    <section className='space-y-6' aria-label='Interactive cube'>
      <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8'>
        <CubeNet stickersByFace={stickersByFace} />
        <aside className='card bg-base-200 flex-1 shadow-lg'>
          <div className='card-body gap-5 p-4 md:p-6'>
            <MoveControls onMove={applyMoveAction} />
            <div className='border-base-300 border-t pt-4'>
              <ActionBar moveCount={moveHistory.length} onReset={resetAction} />
            </div>
            <div className='border-base-300 border-t pt-4'>
              <h3 className='text-base-content/60 mb-2 text-xs font-semibold tracking-widest uppercase'>
                History
              </h3>
              <MoveHistory moves={moveHistory} />
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
