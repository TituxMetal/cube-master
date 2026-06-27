import type { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import type { FallbackProps } from 'react-error-boundary'

import { goToStep } from '~/features/coach/stores/coachStore'
import { Link } from '~/lib/router'

// Coach's last line of defence. The teaching planners throw deliberately when a plan
// is incomplete, and `resolveRecipe` throws on out-of-range lesson data — but the
// call chain runs inside `useStore($stepRecipe)` at render time, and nanostores'
// `computed` does not catch callback throws. Without a boundary, any such throw blanks
// the entire SPA. This contains the failure to the Coach route and gives the learner a
// way out, mirroring the Solver's `$solveError` recovery UI.
const CoachErrorFallback = ({ resetErrorBoundary }: FallbackProps) => (
  <section className='flex flex-col items-start gap-4' aria-label='Erreur du Coach'>
    <h1 className='text-cube-green-text text-2xl font-bold'>Une erreur est survenue</h1>
    <p className='text-base-content/70'>
      Ce chapitre n’a pas pu se charger. Reviens au Coach ou réessaie.
    </p>
    <div className='flex items-center gap-2'>
      <button type='button' className='btn btn-soft cursor-pointer' onClick={resetErrorBoundary}>
        Réessayer
      </button>
      <Link to='/coach' className='btn bg-cube-green text-cube-green-content cursor-pointer'>
        Retour au Coach
      </Link>
    </div>
  </section>
)

// `resetKey` (the current lessonId) resets the boundary on navigation, so opening
// another chapter clears a stuck error without the learner pressing Réessayer.
//
// On the imperative "Réessayer" path, re-home the lesson to step 0 first. The throw
// comes from the *current* step's recipe ($currentStep), so re-rendering the same
// step would rethrow immediately and the button would do nothing. Step 0 is always an
// understand/interactive step that runs no planner, so it gives the retry a renderable
// target. Guarded to the imperative reason so it never overrides startLesson's resume
// on a navigation (keys) reset.
export const CoachErrorBoundary = ({
  resetKey,
  children
}: {
  resetKey?: string
  children: ReactNode
}) => (
  <ErrorBoundary
    FallbackComponent={CoachErrorFallback}
    resetKeys={[resetKey]}
    onReset={details => {
      if (details.reason === 'imperative-api') goToStep(0)
    }}
  >
    {children}
  </ErrorBoundary>
)
