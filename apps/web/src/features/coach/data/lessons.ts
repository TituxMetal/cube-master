import { secondLayer } from './second-layer'
import type { Lesson } from './types'
import { whiteCorners } from './white-corners'
import { whiteCross } from './white-cross'

// The lesson registry, in journey order. v1 ships the first three beginner
// chapters; the last-layer chapters (Follow-Up F5) land against this same shape.
export const LESSONS: readonly Lesson[] = [whiteCross, whiteCorners, secondLayer]

export const getLesson = (id: string): Lesson | undefined =>
  LESSONS.find(lesson => lesson.id === id)
