import { cubeReading } from './cube-reading'
import type { Lesson } from './types'
import { whiteCross } from './white-cross'

// The lesson registry, in journey order. This is the proof slice (Chapter 0 +
// White Cross), reviewed live on a 13" before the remaining chapters (F5) are
// authored against this same shape and added here.
export const LESSONS: readonly Lesson[] = [cubeReading, whiteCross]

export const getLesson = (id: string): Lesson | undefined =>
  LESSONS.find(lesson => lesson.id === id)
