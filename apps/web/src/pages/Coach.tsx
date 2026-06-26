import { CoachErrorBoundary, LessonBrowser, LessonPlayer } from '~/features/coach'

export const Coach = ({ lessonId }: { lessonId?: string }) => (
  <CoachErrorBoundary resetKey={lessonId}>
    {lessonId ? <LessonPlayer lessonId={lessonId} /> : <LessonBrowser />}
  </CoachErrorBoundary>
)
