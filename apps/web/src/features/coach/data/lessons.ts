import { secondLayer } from './second-layer'
import type { Lesson } from './types'

// The lesson registry. Second Layer is the v1 proof slice; the remaining six
// beginner chapters land in STORY-008 against this same shape.
export const LESSONS: readonly Lesson[] = [secondLayer]

export const getLesson = (id: string): Lesson | undefined =>
  LESSONS.find(lesson => lesson.id === id)
