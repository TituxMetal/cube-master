import type { MoveToken } from '@packages/cube-engine'

type MoveSequenceProps = {
  moves: readonly MoveToken[]
  currentIndex: number
}

// Renders the algorithm as readable notation (R, D, R′ …) and highlights the
// upcoming move in the signature green — mirroring how the Solver shows its
// current move, so Coach teaches the sequence, not just the animated cube.
export const MoveSequence = ({ moves, currentIndex }: MoveSequenceProps) => (
  <div
    className='flex min-h-12 flex-wrap items-center justify-center gap-2'
    aria-label='Algorithm notation'
  >
    {moves.map((move, index) => {
      const isCurrent = index === currentIndex

      return (
        <kbd
          key={index}
          className={`kbd font-mono ${
            isCurrent
              ? 'kbd-xl bg-cube-green text-cube-green-content text-lg font-bold'
              : 'kbd-lg text-base-content/70'
          }`}
          aria-current={isCurrent ? 'step' : undefined}
        >
          {move}
        </kbd>
      )
    })}
  </div>
)
