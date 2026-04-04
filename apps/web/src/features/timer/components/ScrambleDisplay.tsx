import type { MoveToken } from '@packages/cube-engine'

interface ScrambleDisplayProps {
  scramble: readonly MoveToken[]
  onNewScramble?: () => void
}

export const ScrambleDisplay = ({ scramble, onNewScramble }: ScrambleDisplayProps) => (
  <section
    className='bg-cube-blue/30 border-l-cube-blue flex items-center gap-4 rounded-lg border-l-4 p-4'
    aria-label='Scramble'
  >
    <p className='flex-1 text-center font-mono text-lg tracking-wider'>
      {scramble.map((move, index) => (
        <span key={index} className='inline-block px-1'>
          {move}
        </span>
      ))}
    </p>
    {onNewScramble ? (
      <button
        type='button'
        className='btn btn-outline btn-sm cursor-pointer whitespace-nowrap'
        onClick={onNewScramble}
        aria-label='Generate new scramble'
      >
        New scramble
      </button>
    ) : null}
  </section>
)
