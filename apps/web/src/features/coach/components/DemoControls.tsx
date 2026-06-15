type DemoControlsProps = {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
}

// Coach's own previous/next stepper for demo + practice playback. A French
// sibling of the Solver's StepControls (which stays English) — kept separate so
// neither mode's chrome leaks into the other.
export const DemoControls = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext
}: DemoControlsProps) => {
  const atStart = currentStep === 0
  const atEnd = currentStep === totalSteps

  return (
    <nav className='flex flex-col items-center gap-2' aria-label='Lecture du mouvement'>
      <span className='text-base-content text-sm font-semibold tabular-nums'>
        Coup {currentStep}/{totalSteps}
      </span>

      <div className='flex items-center gap-3'>
        <button
          type='button'
          className='btn btn-soft btn-sm cursor-pointer'
          disabled={atStart}
          onClick={onPrevious}
          aria-label='Coup précédent'
        >
          ← Précédent
        </button>

        <button
          type='button'
          className='btn bg-cube-green text-cube-green-content btn-sm cursor-pointer'
          disabled={atEnd}
          onClick={onNext}
          aria-label='Coup suivant'
        >
          Suivant →
        </button>
      </div>
    </nav>
  )
}
