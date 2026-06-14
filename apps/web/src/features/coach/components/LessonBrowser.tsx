import type { AlgorithmMethod } from '@packages/cube-engine'

import { LESSONS } from '~/features/coach/data/lessons'
import type { Lesson } from '~/features/coach/data/types'
import { useProgress } from '~/features/coach/stores/coachStore'
import { Link } from '~/lib/router'

// The tiers shown in the browser. Beginner holds the v1 chapters; intermediate
// and advanced are intentionally empty (types ready, content is post-v1) and
// render a placeholder rather than a blank gap.
const TIERS: { method: AlgorithmMethod; label: string }[] = [
  { method: 'beginner', label: 'Beginner' },
  { method: 'intermediate', label: 'Intermediate' },
  { method: 'advanced', label: 'Advanced' }
]

const byOrder = (a: Lesson, b: Lesson): number => a.order - b.order

const LessonRow = ({ lesson, isCompleted }: { lesson: Lesson; isCompleted: boolean }) => (
  <li>
    <Link
      to={`/coach/${lesson.id}`}
      className='card bg-base-200 hover:bg-base-300 focus-visible:ring-cube-green flex flex-row items-center gap-3 px-4 py-3 no-underline transition-colors focus-visible:ring-2 focus-visible:outline-none'
    >
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          isCompleted ? 'bg-cube-green text-cube-green-content' : 'bg-base-300 text-base-content/70'
        }`}
        aria-hidden='true'
      >
        {isCompleted ? '✓' : lesson.order}
      </span>
      <span className='text-base-content flex-1 font-semibold'>{lesson.title}</span>
      {isCompleted && (
        <span className='text-success text-sm font-semibold' aria-label='Completed'>
          Completed
        </span>
      )}
    </Link>
  </li>
)

export const LessonBrowser = () => {
  const progress = useProgress()
  const ordered = [...LESSONS].sort(byOrder)

  // Resume points at the last lesson in progress if it still resolves, else the
  // first chapter — never a dangling current (STORY-007 edge case).
  const resumeId = progress.current.lesson
  const resumeLesson = ordered.find(lesson => lesson.id === resumeId) ?? ordered[0]
  const hasResumed = resumeId !== null && resumeLesson?.id === resumeId

  return (
    <section className='flex flex-col gap-8' aria-label='Coach lessons'>
      <header className='flex flex-col gap-3'>
        <div>
          <p className='text-cube-green-text text-sm font-semibold tracking-wide uppercase'>
            Coach
          </p>
          <h1 className='text-base-content text-2xl font-bold'>The beginner journey</h1>
          <p className='text-base-content/70 mt-1'>
            Learn to solve the cube one chapter at a time — understand it, watch it, then do it
            yourself.
          </p>
        </div>

        {resumeLesson && (
          <Link
            to={`/coach/${resumeLesson.id}`}
            className='btn bg-cube-green text-cube-green-content w-fit cursor-pointer'
          >
            {hasResumed ? `Resume: ${resumeLesson.title}` : `Start: ${resumeLesson.title}`} →
          </Link>
        )}
      </header>

      {TIERS.map(tier => {
        const lessons = ordered.filter(lesson => lesson.method === tier.method)

        return (
          <div key={tier.method} className='flex flex-col gap-3'>
            <h2 className='text-cube-green-text text-lg font-bold'>{tier.label}</h2>

            {lessons.length === 0 ? (
              <p className='text-base-content/70 text-sm'>More chapters coming soon.</p>
            ) : (
              <ol className='flex flex-col gap-2'>
                {lessons.map(lesson => (
                  <LessonRow
                    key={lesson.id}
                    lesson={lesson}
                    isCompleted={progress.completedLessons.includes(lesson.id)}
                  />
                ))}
              </ol>
            )}
          </div>
        )
      })}
    </section>
  )
}
