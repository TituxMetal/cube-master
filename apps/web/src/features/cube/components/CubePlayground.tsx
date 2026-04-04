import { ActionBar } from '~/features/cube/components/ActionBar'
import { CubeNet } from '~/features/cube/components/CubeNet'
import { MoveControls } from '~/features/cube/components/MoveControls'
import { MoveHistory } from '~/features/cube/components/MoveHistory'
import {
  applyMoveAction,
  resetAction,
  scrambleAction,
  useMoveHistory,
  useStickersByFace
} from '~/features/cube/stores/cube-store'

export const CubePlayground = () => {
  const stickersByFace = useStickersByFace()
  const moveHistory = useMoveHistory()

  return (
    <section
      className='flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8'
      aria-label='Interactive cube'
    >
      <CubeNet stickersByFace={stickersByFace} />
      <aside className='card bg-base-200 flex-1 shadow-lg'>
        <section className='card-body gap-5 p-4 md:p-6'>
          <MoveControls onMove={applyMoveAction} />
          <ActionBar
            moveCount={moveHistory.length}
            onReset={resetAction}
            onScramble={scrambleAction}
          />
          <h3 className='text-base-content/60 text-xs font-semibold tracking-widest uppercase'>
            History
          </h3>
          <MoveHistory moves={moveHistory} />
        </section>
      </aside>
    </section>
  )
}
