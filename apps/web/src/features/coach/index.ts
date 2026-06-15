export { LessonBrowser, LessonPlayer } from './components'
export { LESSONS, getLesson } from './data/lessons'
export type { Lesson, LessonStep } from './data/types'
export { stepAlgorithmId } from './data/types'
export {
  goToStep,
  nextStep,
  previousStep,
  startLesson,
  toggleLessonComplete,
  useCurrentLesson,
  useCurrentStep,
  useDemoFrame,
  useIsPracticeSolved,
  useLessonStepIndex,
  usePlaybackIndex,
  usePlaybackTotal,
  useProgress
} from './stores/coachStore'
export type { CoachProgress } from './stores/coachStore'
