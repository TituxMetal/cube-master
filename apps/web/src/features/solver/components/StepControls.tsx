type StepControlsProps = {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
}

export const StepControls = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext
}: StepControlsProps) => {
  const atStart = currentStep === 0
  const atEnd = currentStep === totalSteps

  return (
    <nav className='flex flex-col items-center gap-3' aria-label='Step controls'>
      <span className='text-base-content text-lg font-semibold tabular-nums'>
        Step {currentStep}/{totalSteps}
      </span>

      <div className='flex items-center gap-4'>
        <button
          type='button'
          className='btn btn-soft cursor-pointer'
          disabled={atStart}
          onClick={onPrevious}
          aria-label='Previous step'
        >
          ← Prev
        </button>

        <button
          type='button'
          className='btn btn-primary cursor-pointer'
          disabled={atEnd}
          onClick={onNext}
          aria-label='Next step'
        >
          Next →
        </button>
      </div>
    </nav>
  )
}
