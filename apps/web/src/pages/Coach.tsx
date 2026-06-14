import { LessonBrowser, LessonPlayer } from '~/features/coach'

export const Coach = ({ lessonId }: { lessonId?: string }) => {
  if (lessonId) return <LessonPlayer lessonId={lessonId} />

  return <LessonBrowser />
}
