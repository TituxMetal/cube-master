export { LessonPlayer, LessonStepList } from './components'
export { LESSONS, getLesson } from './data/lessons'
export type { Lesson, LessonStep } from './data/types'
export { stepAlgorithmId } from './data/types'
export {
  completeLesson,
  goToStep,
  nextStep,
  previousStep,
  startLesson,
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
