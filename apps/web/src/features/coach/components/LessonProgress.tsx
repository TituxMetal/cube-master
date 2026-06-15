import type { LessonStep } from '~/features/coach/data/types'

type LessonProgressProps = {
  steps: LessonStep[]
  currentIndex: number
  onSelect: (index: number) => void
}

// A slim horizontal progress bar that replaces the old step sidebar (D-LAYOUT):
// one clickable segment per step, coloured by state, so the cube panel keeps its
// full width. The step title rides above so the learner always knows where they
// are without a width-eating list.
export const LessonProgress = ({ steps, currentIndex, onSelect }: LessonProgressProps) => (
  <nav aria-label='Progression de la leçon' className='flex flex-col gap-1'>
    <span className='text-base-content/60 text-xs font-semibold tabular-nums'>
      Étape {currentIndex + 1}/{steps.length}
    </span>
    <ol className='flex items-center gap-1'>
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex

        return (
          <li key={index} className='flex-1'>
            <button
              type='button'
              className={`focus-visible:ring-cube-green h-1.5 w-full cursor-pointer rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                isCompleted
                  ? 'bg-cube-green'
                  : isCurrent
                    ? 'bg-cube-green-text'
                    : 'bg-base-content/20 hover:bg-base-content/40'
              }`}
              onClick={() => onSelect(index)}
              aria-current={isCurrent ? 'step' : undefined}
              aria-label={`Étape ${index + 1} : ${step.title}`}
            />
          </li>
        )
      })}
    </ol>
  </nav>
)
