import { useEffect } from 'react'

import { CoachErrorBoundary, LessonBrowser, LessonPlayer, warmMilestones } from '~/features/coach'

export const Coach = ({ lessonId }: { lessonId?: string }) => {
  // Prewarm the solver-derived milestone cache during idle time: the first milestone
  // access runs solveCube (~420ms) on the main thread, so doing it here — while the
  // learner reads the first screen — means the first demo opens against a warm cache
  // instead of freezing on the click (#17). Falls back to a short timer where
  // requestIdleCallback is unavailable; the cleanup cancels it on unmount.
  useEffect(() => {
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(() => warmMilestones())
      return () => window.cancelIdleCallback(handle)
    }
    const timer = setTimeout(warmMilestones, 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <CoachErrorBoundary resetKey={lessonId}>
      {lessonId ? <LessonPlayer lessonId={lessonId} /> : <LessonBrowser />}
    </CoachErrorBoundary>
  )
}
