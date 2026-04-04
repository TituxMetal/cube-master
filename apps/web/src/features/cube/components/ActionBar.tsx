interface ActionBarProps {
  moveCount: number
  onReset: () => void
  onScramble?: () => void
}

export const ActionBar = ({ moveCount, onReset, onScramble }: ActionBarProps) => (
  <nav className='flex items-center gap-3' aria-label='Cube actions'>
    {onScramble ? (
      <button className='btn btn-primary btn-sm md:btn-md cursor-pointer' onClick={onScramble}>
        Scramble
      </button>
    ) : null}
    <button
      className='btn btn-ghost btn-sm md:btn-md cursor-pointer'
      onClick={onReset}
      disabled={moveCount === 0}
    >
      Reset
    </button>
    {moveCount > 0 ? (
      <output className='badge badge-neutral badge-sm md:badge-md' aria-live='polite'>
        {moveCount} moves
      </output>
    ) : null}
  </nav>
)
