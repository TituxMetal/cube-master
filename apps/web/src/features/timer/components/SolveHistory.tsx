import { useState } from 'react'

import { formatTime } from '~/features/timer/lib/formatTime'
import type { Solve } from '~/features/timer/stores/sessionStore'

interface SolveHistoryProps {
  solves: readonly Solve[]
  onToggleDnf: (id: string) => void
  onDelete: (id: string) => void
}

const ScrambleLine = ({ scramble }: { scramble: readonly string[] }) => {
  const [expanded, setExpanded] = useState(false)
  const summary = scramble.slice(0, 6).join(' ')
  const full = scramble.join(' ')
  const needsTruncation = scramble.length > 6

  return (
    <button
      type='button'
      className='text-base-content cursor-pointer text-left font-mono text-xs underline decoration-transparent transition-colors hover:decoration-current'
      onClick={e => {
        e.stopPropagation()
        setExpanded(prev => !prev)
      }}
      aria-label={expanded ? 'Collapse scramble' : 'Expand scramble'}
    >
      {expanded || !needsTruncation ? full : `${summary} \u2026`}
    </button>
  )
}

export const SolveHistory = ({ solves, onToggleDnf, onDelete }: SolveHistoryProps) => (
  <section aria-label='Session history'>
    {solves.length === 0 ? (
      <p className='text-neutral-content py-8 text-center'>
        No solves yet — press spacebar to start
      </p>
    ) : (
      <ol className='flex flex-col gap-2'>
        {solves.map((solve, index) => (
          <li
            key={solve.id}
            className='bg-cube-green/30 flex items-center gap-3 rounded-lg px-4 py-3'
          >
            <span className='text-base-content w-8 font-mono text-sm'>{solves.length - index}</span>
            <span className='flex min-w-0 flex-1 flex-col gap-0.5'>
              <span className={`font-mono text-lg ${solve.dnf ? 'badge badge-error' : ''}`}>
                {solve.dnf ? 'DNF' : formatTime(solve.time)}
              </span>
              <ScrambleLine scramble={solve.scramble} />
            </span>
            <span className='flex gap-2'>
              <button
                type='button'
                className='btn btn-soft btn-xs cursor-pointer'
                onClick={() => onToggleDnf(solve.id)}
                aria-label={solve.dnf ? 'Remove DNF' : 'Mark as DNF'}
              >
                {solve.dnf ? 'Undo' : 'DNF'}
              </button>
              <button
                type='button'
                className='btn btn-error btn-xs cursor-pointer'
                onClick={() => onDelete(solve.id)}
                aria-label='Delete solve'
              >
                Delete
              </button>
            </span>
          </li>
        ))}
      </ol>
    )}
  </section>
)
