import type { MoveToken } from '@packages/cube-engine'

interface MoveHistoryProps {
  moves: readonly MoveToken[]
}

export const MoveHistory = ({ moves }: MoveHistoryProps) => (
  <section className='min-h-12' aria-label='Move history'>
    {moves.length === 0 ? (
      <p className='text-base-content/40 text-sm'>No moves yet</p>
    ) : (
      <ul className='flex flex-wrap gap-1.5 md:gap-2'>
        {moves.map((move, index) => (
          <li
            key={index}
            className='badge badge-outline badge-sm md:badge-md font-mono tracking-wide'
          >
            {move}
          </li>
        ))}
      </ul>
    )}
  </section>
)
