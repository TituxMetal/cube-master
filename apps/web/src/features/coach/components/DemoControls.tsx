import { ChevronLeft, ChevronRight } from 'lucide-react'

type DemoControlsProps = {
  currentStep: number
  totalSteps: number
  onPrevious: () => void
  onNext: () => void
}

// Coach's own previous/next stepper for demo + practice playback. A French
// sibling of the Solver's StepControls (which stays English) — kept separate so
// neither mode's chrome leaks into the other. Compact icon buttons flank the
// counter so the stepper never wraps on a narrow phone (the P4 layout note).
export const DemoControls = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext
}: DemoControlsProps) => {
  const atStart = currentStep === 0
  const atEnd = currentStep === totalSteps

  return (
    <nav className='flex items-center justify-center gap-3' aria-label='Lecture du mouvement'>
      <button
        type='button'
        className='btn btn-circle btn-soft btn-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-40'
        disabled={atStart}
        onClick={onPrevious}
        aria-label='Coup précédent'
      >
        <ChevronLeft className='size-5' aria-hidden='true' />
      </button>

      <span className='text-base-content min-w-16 text-center text-sm font-semibold tabular-nums'>
        Coup {currentStep}/{totalSteps}
      </span>

      <button
        type='button'
        // The custom green background would otherwise survive :disabled, leaving
        // a "live"-looking button at the end; force a greyed disabled state.
        className='btn bg-cube-green text-cube-green-content btn-circle btn-sm disabled:bg-base-300 disabled:text-base-content/40 cursor-pointer disabled:cursor-not-allowed disabled:shadow-none'
        disabled={atEnd}
        onClick={onNext}
        aria-label='Coup suivant'
      >
        <ChevronRight className='size-5' aria-hidden='true' />
      </button>
    </nav>
  )
}
