import type { FaceCode } from '@packages/cube-engine'
import { Check, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import { useEffect } from 'react'

import { LESSONS, getLesson } from '~/features/coach/data/lessons'
import type { InteractiveStep, LessonStep, UnderstandStep } from '~/features/coach/data/types'
import {
  applyInteractiveMove,
  goToStep,
  markLessonComplete,
  nextStep,
  previousStep,
  resetInteractive,
  resolveStepVisual,
  startLesson,
  useCurrentStepMoves,
  useDemoFrame,
  useInteractiveFrame,
  useIsPracticeSolved,
  useLessonStepIndex,
  usePlaybackIndex,
  usePlaybackTotal,
  useProgress,
  useUnderstandVisual
} from '~/features/coach/stores/coachStore'
import { CubeNet } from '~/features/cube/components/CubeNet'
import { Link } from '~/lib/router'

import { DemoControls } from './DemoControls'
import { LessonProgress } from './LessonProgress'
import { MoveSequence } from './MoveSequence'
import { NotationCheatSheet } from './NotationCheatSheet'

const LessonNotFound = () => (
  <section className='flex flex-col items-start gap-4' aria-label='Leçon introuvable'>
    <h1 className='text-cube-green-text text-2xl font-bold'>Leçon introuvable</h1>
    <p className='text-base-content/70'>Ce chapitre est introuvable.</p>
    <Link to='/coach' className='btn btn-soft cursor-pointer'>
      ← Retour au Coach
    </Link>
  </section>
)

// Centre-sticker highlight for each face a Chapter 0 step names — points at the
// face without claiming the whole sticker grid.
const facesHighlight = (faces: readonly FaceCode[]): Partial<Record<FaceCode, readonly number[]>> =>
  Object.fromEntries(faces.map(face => [face, [4]]))

// The right pane's cube content for an understand step: the one-off side-by-side
// comparison (PD2) or a single illustrative net, both highlighted.
const UnderstandVisualPane = ({ step }: { step: UnderstandStep }) => {
  const visual = useUnderstandVisual()

  if (step.compare) {
    const left = resolveStepVisual(step.compare.left.visual)
    const right = resolveStepVisual(step.compare.right.visual)

    return (
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {[
          { caption: step.compare.left.caption, resolved: left },
          { caption: step.compare.right.caption, resolved: right }
        ].map(({ caption, resolved }, index) =>
          resolved ? (
            <figure key={index} className='flex flex-col items-center gap-2'>
              <CubeNet stickersByFace={resolved.stickers} highlight={resolved.highlight} compact />
              <figcaption className='text-base-content/70 text-center text-xs'>
                {caption}
              </figcaption>
            </figure>
          ) : null
        )}
      </div>
    )
  }

  if (!visual) return null
  return <CubeNet stickersByFace={visual.stickers} highlight={visual.highlight} />
}

// The interactive tap-to-turn primer (Chapter 0): a live cube plus the face turns
// the learner can try.
const InteractivePane = ({ step }: { step: InteractiveStep }) => {
  const frame = useInteractiveFrame()
  // Highlight only the naming step (no moves): there, dimming everything but the
  // named centres makes them pop. On the turning step the point is to watch the
  // whole cube move, so the net stays fully lit.
  const highlight = step.faces && step.moves.length === 0 ? facesHighlight(step.faces) : undefined

  return (
    <div className='flex flex-col items-center gap-3'>
      <CubeNet stickersByFace={frame} highlight={highlight} />
      {step.moves.length > 0 && (
        <div className='flex flex-wrap items-center justify-center gap-2'>
          {step.moves.map((move, index) => (
            <button
              key={index}
              type='button'
              className='btn bg-cube-green text-cube-green-content btn-sm cursor-pointer font-mono'
              onClick={() => applyInteractiveMove(move)}
              aria-label={`Tourner ${move}`}
            >
              {move}
            </button>
          ))}
          <button
            type='button'
            className='btn btn-ghost btn-circle btn-sm cursor-pointer'
            onClick={resetInteractive}
            aria-label='Réinitialiser'
          >
            <RotateCcw className='size-5' aria-hidden='true' />
          </button>
        </div>
      )}
    </div>
  )
}

// The playback cube for a demo/practice step, with notation, an active-move arrow,
// and Coach's French stepper.
const PlaybackPane = ({ step }: { step: LessonStep }) => {
  const moves = useCurrentStepMoves()
  const frame = useDemoFrame()
  const playbackIndex = usePlaybackIndex()
  const playbackTotal = usePlaybackTotal()
  const isPracticeSolved = useIsPracticeSolved()

  const activeMove = playbackIndex < moves.length ? moves[playbackIndex] : undefined

  return (
    <div className='flex flex-col items-center gap-3'>
      <MoveSequence moves={moves} currentIndex={playbackIndex} />
      {frame && (
        <div className='pointer-events-none w-full'>
          <CubeNet stickersByFace={frame} activeMove={activeMove} />
        </div>
      )}
      <DemoControls
        currentStep={playbackIndex}
        totalSteps={playbackTotal}
        onPrevious={previousStep}
        onNext={nextStep}
      />
      {step.kind === 'practice' && isPracticeSolved && (
        <p className='text-success text-center font-semibold' aria-live='polite'>
          Résolu&nbsp;! Bien joué.
        </p>
      )}
    </div>
  )
}

const StepCubePane = ({ step }: { step: LessonStep }) => {
  if (step.kind === 'understand') return <UnderstandVisualPane step={step} />
  if (step.kind === 'interactive') return <InteractivePane step={step} />
  return <PlaybackPane step={step} />
}

export const LessonPlayer = ({ lessonId }: { lessonId: string }) => {
  useEffect(() => {
    startLesson(lessonId)
  }, [lessonId])

  const stepIndex = useLessonStepIndex()
  const progress = useProgress()

  const lesson = getLesson(lessonId)

  // Reaching the last step *is* finishing the chapter — mark it complete here so
  // the player needs no dedicated "terminer" button (P4 chrome note). Idempotent.
  useEffect(() => {
    if (lesson && stepIndex >= lesson.steps.length - 1) markLessonComplete(lessonId)
  }, [lesson, lessonId, stepIndex])

  if (!lesson) return <LessonNotFound />

  const step = lesson.steps[stepIndex] ?? lesson.steps[0]
  const isFirstStep = stepIndex === 0
  const isLastStep = stepIndex >= lesson.steps.length - 1
  const isCompleted = progress.completedLessons.includes(lessonId)

  // The next chapter in journey order, so the learner can continue without
  // detouring back to the Coach index.
  const ordered = [...LESSONS].sort((a, b) => a.order - b.order)
  const nextLesson = ordered[ordered.findIndex(item => item.id === lessonId) + 1]

  return (
    <section className='flex flex-col gap-4' aria-label={`Leçon : ${lesson.title}`}>
      <header className='flex flex-col gap-3'>
        <div>
          <p className='text-cube-green-text text-sm font-semibold tracking-wide uppercase'>
            {lesson.title}
          </p>
          <h1 className='text-base-content text-2xl font-bold'>{step.title}</h1>
        </div>
        <LessonProgress steps={lesson.steps} currentIndex={stepIndex} onSelect={goToStep} />
        <NotationCheatSheet />
      </header>

      {/* Text above the cube (stacked, centred): most steps are text-light, so a
          two-pane split wasted the space beside the net. */}
      <div className='flex flex-1 flex-col items-center gap-5'>
        <p className='text-base-content/80 max-w-2xl leading-relaxed'>{step.body}</p>

        <div className='w-full max-w-xl'>
          <StepCubePane step={step} />
        </div>
      </div>

      <nav className='flex items-center gap-2 sm:gap-3' aria-label='Navigation de la leçon'>
        <button
          type='button'
          className='btn btn-soft btn-circle btn-sm sm:btn-md cursor-pointer disabled:opacity-40'
          disabled={isFirstStep}
          onClick={() => goToStep(stepIndex - 1)}
          aria-label='Étape précédente'
        >
          <ChevronLeft className='size-5' aria-hidden='true' />
        </button>

        {isLastStep ? (
          <div className='ml-auto flex items-center gap-2 sm:gap-3'>
            {isCompleted && (
              <span
                className='text-success inline-flex items-center gap-1 text-sm font-semibold'
                aria-label='Chapitre terminé'
              >
                <Check className='size-4' aria-hidden='true' />
                Terminé
              </span>
            )}
            {nextLesson ? (
              <Link
                to={`/coach/${nextLesson.id}`}
                className='btn bg-cube-green text-cube-green-content btn-sm sm:btn-md cursor-pointer'
                aria-label='Chapitre suivant'
              >
                Chapitre suivant
                <ChevronRight className='size-4' aria-hidden='true' />
              </Link>
            ) : (
              <Link to='/coach' className='btn btn-soft btn-sm sm:btn-md cursor-pointer'>
                Retour au Coach
              </Link>
            )}
          </div>
        ) : (
          <button
            type='button'
            className='btn bg-cube-green text-cube-green-content btn-circle btn-sm sm:btn-md ml-auto cursor-pointer'
            onClick={() => goToStep(stepIndex + 1)}
            aria-label='Étape suivante'
          >
            <ChevronRight className='size-5' aria-hidden='true' />
          </button>
        )}
      </nav>
    </section>
  )
}
