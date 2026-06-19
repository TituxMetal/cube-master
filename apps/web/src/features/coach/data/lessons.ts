import { cubeReading } from './cube-reading'
import { finish } from './finish'
import { orientCorners } from './orient-corners'
import { placeCorners } from './place-corners'
import { secondLayer } from './second-layer'
import type { Lesson } from './types'
import { whiteCorners } from './white-corners'
import { whiteCross } from './white-cross'
import { yellowCross } from './yellow-cross'

// The lesson registry, in journey order: Chapter 0 (notation primer) then the
// seven layer-by-layer chapters. The proof slice (Ch0 + White Cross) was reviewed
// live on a 13"; the rest follow the same template (PD6 milestone demos +
// interactive practice).
export const LESSONS: readonly Lesson[] = [
  cubeReading,
  whiteCross,
  whiteCorners,
  secondLayer,
  yellowCross,
  orientCorners,
  placeCorners,
  finish
]

export const getLesson = (id: string): Lesson | undefined =>
  LESSONS.find(lesson => lesson.id === id)
