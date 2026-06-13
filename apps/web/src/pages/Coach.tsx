import { LessonPlayer } from '~/features/coach'

export const Coach = ({ lessonId }: { lessonId?: string }) => {
  if (lessonId) return <LessonPlayer lessonId={lessonId} />

  return (
    <div>
      <h1 className='text-cube-green-text text-2xl font-bold'>Coach</h1>
      <p className='text-neutral-content mt-2'>Coming soon</p>
    </div>
  )
}
