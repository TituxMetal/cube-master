import { ColorPalette } from '~/features/solver/components/ColorPalette'
import { InteractiveCubeNet } from '~/features/solver/components/InteractiveCubeNet'
import { PhaseList } from '~/features/solver/components/PhaseList'
import { StepControls } from '~/features/solver/components/StepControls'
import {
  cycleStickerColor,
  jumpToPhase,
  newSolve,
  nextStep,
  previousStep,
  resetInput,
  scrambleInput,
  solveAction,
  useCubeAtStep,
  useCurrentGroup,
  useCurrentMove,
  useCurrentPhaseIndex,
  useCurrentStepIndex,
  useCurrentStepInGroup,
  useCurrentStepInPhase,
  useInputStickers,
  useScrambleMoves,
  useSolution,
  useSolveError,
  useSolverView,
  useTotalSteps,
  useValidationResult
} from '~/features/solver/stores'

const InputView = () => {
  const stickers = useInputStickers()
  const scrambleMoves = useScrambleMoves()
  const validation = useValidationResult()
  const solveError = useSolveError()

  const isSolved =
    validation.ok && Object.values(stickers).every(face => face.every(c => c === face[4]))

  const canSolve = validation.ok && !isSolved

  return (
    <>
      {scrambleMoves.length > 0 && (
        <p className='text-base-content/70 font-mono text-sm' aria-label='Scramble notation'>
          Scramble: {scrambleMoves.join(' ')}
        </p>
      )}

      <ColorPalette />

      <InteractiveCubeNet stickers={stickers} onPaintSticker={cycleStickerColor} />

      <div className='min-h-8' aria-live='polite'>
        {solveError ? (
          <p className='text-error text-sm'>{solveError}</p>
        ) : validation.ok ? (
          isSolved ? (
            <p className='text-base-content/60 text-sm'>Cube is already solved</p>
          ) : (
            <p className='text-success text-sm'>Valid cube state</p>
          )
        ) : (
          <ul className='text-error list-disc pl-5 text-sm'>
            {validation.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        )}
      </div>

      <nav className='flex items-center gap-4' aria-label='Solver actions'>
        <button type='button' className='btn btn-soft cursor-pointer' onClick={resetInput}>
          Reset
        </button>
        <button type='button' className='btn btn-soft cursor-pointer' onClick={scrambleInput}>
          Scramble
        </button>
        <button
          type='button'
          className='btn btn-primary ml-auto cursor-pointer'
          disabled={!canSolve}
          onClick={solveAction}
        >
          Solve
        </button>
      </nav>
    </>
  )
}

const SolutionView = () => {
  const solution = useSolution()
  const cubeAtStep = useCubeAtStep()
  const currentStepIndex = useCurrentStepIndex()
  const currentPhaseIndex = useCurrentPhaseIndex()
  const currentStepInPhase = useCurrentStepInPhase()
  const totalSteps = useTotalSteps()
  const currentGroup = useCurrentGroup()
  const currentStepInGroup = useCurrentStepInGroup()
  const currentMove = useCurrentMove()

  if (!solution || !cubeAtStep) return null

  return (
    <>
      <div className='flex items-start gap-4'>
        <div
          className='flex min-h-14 flex-1 flex-wrap items-center justify-center gap-2'
          aria-live='polite'
          aria-label='Current algorithm'
        >
          {currentStepIndex >= totalSteps ? (
            <p className='text-success text-xl font-bold'>Solved!</p>
          ) : currentGroup.length > 0 && currentMove ? (
            currentGroup.map((move, i) => (
              <kbd
                key={i}
                className={`kbd ${
                  i === currentStepInGroup
                    ? 'kbd-xl bg-primary text-primary-content text-lg font-bold'
                    : 'kbd-lg text-base-content/70'
                }`}
              >
                {move}
              </kbd>
            ))
          ) : (
            <p className='text-base-content/60 text-sm'>Press Next to start</p>
          )}
        </div>
        <button
          type='button'
          className='btn btn-soft shrink-0 cursor-pointer'
          onClick={newSolve}
          aria-label='New solve'
        >
          New Solve
        </button>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-[1fr_16rem] lg:grid-cols-[1fr_18rem]'>
        <div className='pointer-events-none' inert>
          <InteractiveCubeNet
            stickers={cubeAtStep}
            onPaintSticker={() => {}}
            activeMove={currentMove ?? undefined}
          />
        </div>

        <aside className='card bg-base-200 overflow-hidden p-4' aria-label='Solution phases'>
          <PhaseList
            solution={solution}
            currentPhaseIndex={currentPhaseIndex}
            currentStepInPhase={currentStepInPhase}
            onJumpToPhase={jumpToPhase}
          />
          <p className='text-base-content/60 mt-3 text-center text-xs'>
            {solution.totalMoves} moves total
          </p>
        </aside>
      </div>

      <StepControls
        currentStep={currentStepIndex}
        totalSteps={totalSteps}
        onPrevious={previousStep}
        onNext={nextStep}
      />
    </>
  )
}

export const Solver = () => {
  const view = useSolverView()

  return (
    <section className='flex flex-col gap-6' aria-label='Solver'>
      <header>
        <h1 className='text-cube-blue-text text-2xl font-bold'>Solver</h1>
        <p className='text-base-content/60 mt-1 text-sm'>
          {view === 'input'
            ? 'Click stickers to cycle colors, then solve'
            : 'Step through the solution'}
        </p>
      </header>

      {view === 'input' ? <InputView /> : <SolutionView />}
    </section>
  )
}
