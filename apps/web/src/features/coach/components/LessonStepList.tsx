import type { LessonStep } from '~/features/coach/data/types'

type LessonStepListProps = {
  steps: LessonStep[]
  currentIndex: number
  onSelect: (index: number) => void
}

// A lesson-step navigator. Sibling to the Solver's PhaseList (which is coupled to
// the engine Solution type) — built fresh for lessons, green-toned.
export const LessonStepList = ({ steps, currentIndex, onSelect }: LessonStepListProps) => (
  <nav aria-label='Lesson steps'>
    <ol className='flex flex-col gap-1'>
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex

        return (
          <li key={index}>
            <button
              type='button'
              className={`hover:bg-base-200 flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                isCompleted
                  ? 'text-success'
                  : isCurrent
                    ? 'text-cube-green-text font-bold'
                    : 'text-base-content/60'
              }`}
              onClick={() => onSelect(index)}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`Go to step ${index + 1}: ${step.title}`}
            >
              <span className='w-5 text-center' aria-hidden='true'>
                {isCompleted ? '✓' : isCurrent ? '▸' : '·'}
              </span>
              <span className='flex-1'>{step.title}</span>
              <span className='text-base-content/50 text-xs uppercase'>{step.kind}</span>
            </button>
          </li>
        )
      })}
    </ol>
  </nav>
)
