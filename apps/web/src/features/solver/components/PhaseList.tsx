import type { Solution } from '@packages/cube-engine'

type PhaseListProps = {
  solution: Solution
  currentPhaseIndex: number
  currentStepInPhase: number
  onJumpToPhase: (index: number) => void
}

export const PhaseList = ({
  solution,
  currentPhaseIndex,
  currentStepInPhase,
  onJumpToPhase
}: PhaseListProps) => (
  <nav aria-label='Phase list'>
    <ol className='flex flex-col gap-1'>
      {solution.phases.map((phase, index) => {
        const isCompleted = index < currentPhaseIndex
        const isCurrent = index === currentPhaseIndex
        const moveCount = phase.groups.reduce((s, g) => s + g.moves.length, 0)

        return (
          <li key={phase.name}>
            <button
              type='button'
              className={`hover:bg-base-200 flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                isCompleted
                  ? 'text-success'
                  : isCurrent
                    ? 'text-cube-blue-text font-bold'
                    : 'text-base-content/60'
              }`}
              onClick={() => onJumpToPhase(index)}
              aria-label={`Jump to ${phase.name}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span className='w-5 text-center' aria-hidden='true'>
                {isCompleted ? '✓' : isCurrent ? '▸' : '·'}
              </span>
              <span className='flex-1'>{phase.name}</span>
              <span className='text-xs tabular-nums'>
                {isCompleted
                  ? `${moveCount}`
                  : isCurrent
                    ? moveCount > 0
                      ? `${currentStepInPhase}/${moveCount}`
                      : '—'
                    : moveCount > 0
                      ? `${moveCount}`
                      : '—'}
              </span>
            </button>

            {isCurrent && phase.groups.length > 0 && (
              <ul className='text-base-content/75 flex flex-col gap-0.5 px-3 pb-2 font-mono text-xs'>
                {phase.groups.map((group, gi) => (
                  <li key={gi} className='truncate'>
                    {group.moves.join(' ')}
                  </li>
                ))}
              </ul>
            )}
          </li>
        )
      })}
    </ol>
  </nav>
)
