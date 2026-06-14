import { useEffect } from 'react'

import { getLesson } from '~/features/coach/data/lessons'
import {
  goToStep,
  nextStep,
  previousStep,
  startLesson,
  toggleLessonComplete,
  useCurrentStepMoves,
  useDemoFrame,
  useInverseMoves,
  useIsPracticeSolved,
  useLessonStepIndex,
  usePlaybackIndex,
  usePlaybackTotal,
  useProgress
} from '~/features/coach/stores/coachStore'
import { CubeNet } from '~/features/cube/components/CubeNet'
import { StepControls } from '~/features/solver/components/StepControls'
import { Link } from '~/lib/router'

import { LessonStepList } from './LessonStepList'
import { MoveSequence } from './MoveSequence'

const LessonNotFound = () => (
  <section className='flex flex-col items-start gap-4' aria-label='Lesson not found'>
    <h1 className='text-cube-green-text text-2xl font-bold'>Lesson not found</h1>
    <p className='text-base-content/70'>We could not find that chapter.</p>
    <Link to='/coach' className='btn btn-soft cursor-pointer'>
      ← Back to Coach
    </Link>
  </section>
)

export const LessonPlayer = ({ lessonId }: { lessonId: string }) => {
  useEffect(() => {
    startLesson(lessonId)
  }, [lessonId])

  const stepIndex = useLessonStepIndex()
  const playbackIndex = usePlaybackIndex()
  const playbackTotal = usePlaybackTotal()
  const moves = useCurrentStepMoves()
  const frame = useDemoFrame()
  const inverseMoves = useInverseMoves()
  const isPracticeSolved = useIsPracticeSolved()
  const progress = useProgress()

  const lesson = getLesson(lessonId)
  if (!lesson) return <LessonNotFound />

  const step = lesson.steps[stepIndex] ?? lesson.steps[0]
  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex >= lesson.steps.length - 1
  const isCompleted = progress.completedLessons.includes(lessonId)
  const hasCube = step.kind === 'demo' || step.kind === 'practice'

  return (
    <section className='flex flex-col gap-6' aria-label={`Lesson: ${lesson.title}`}>
      <header>
        <p className='text-cube-green-text text-sm font-semibold tracking-wide uppercase'>
          {lesson.title}
        </p>
        <h1 className='text-base-content text-2xl font-bold'>{step.title}</h1>
      </header>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-[1fr_16rem] lg:grid-cols-[1fr_18rem]'>
        <div className='flex flex-col gap-4'>
          <p className='text-base-content/80 leading-relaxed'>{step.body}</p>

          {hasCube && <MoveSequence moves={moves} currentIndex={playbackIndex} />}

          {hasCube && frame && (
            <div className='pointer-events-none'>
              <CubeNet stickersByFace={frame} />
            </div>
          )}

          {hasCube && (
            <StepControls
              currentStep={playbackIndex}
              totalSteps={playbackTotal}
              onPrevious={previousStep}
              onNext={nextStep}
            />
          )}

          {step.kind === 'demo' && inverseMoves.length > 0 && (
            <div className='text-base-content/70 flex flex-wrap items-center justify-center gap-2 text-sm'>
              <span>To set your cube back to solved, play:</span>
              <span className='flex flex-wrap gap-1' aria-label='Reset notation'>
                {inverseMoves.map((move, index) => (
                  <kbd key={index} className='kbd kbd-sm font-mono'>
                    {move}
                  </kbd>
                ))}
              </span>
            </div>
          )}

          {step.kind === 'practice' && isPracticeSolved && (
            <p className='text-success text-center font-semibold' aria-live='polite'>
              Solved! Nicely done.
            </p>
          )}
        </div>

        <aside className='card bg-base-200 overflow-hidden p-4' aria-label='Lesson steps'>
          <LessonStepList steps={lesson.steps} currentIndex={stepIndex} onSelect={goToStep} />
        </aside>
      </div>

      <nav className='flex items-center gap-4' aria-label='Lesson navigation'>
        <button
          type='button'
          className='btn btn-soft cursor-pointer'
          disabled={isFirstStep}
          onClick={() => goToStep(stepIndex - 1)}
          aria-label='Previous lesson step'
        >
          ← Back
        </button>

        {isLastStep ? (
          <div className='ml-auto flex items-center gap-3'>
            {isCompleted && (
              <span className='text-success font-semibold' aria-label='Chapter completed'>
                ✓ Completed
              </span>
            )}
            <button
              type='button'
              className={
                isCompleted
                  ? 'btn btn-soft cursor-pointer'
                  : 'btn bg-cube-green text-cube-green-content cursor-pointer'
              }
              onClick={() => toggleLessonComplete(lessonId)}
            >
              {isCompleted ? 'Mark as not done' : 'Finish chapter'}
            </button>
            <Link to='/coach' className='btn btn-soft cursor-pointer'>
              Back to Coach
            </Link>
          </div>
        ) : (
          <button
            type='button'
            className='btn bg-cube-green text-cube-green-content ml-auto cursor-pointer'
            onClick={() => goToStep(stepIndex + 1)}
            aria-label='Next lesson step'
          >
            Continue →
          </button>
        )}
      </nav>
    </section>
  )
}
