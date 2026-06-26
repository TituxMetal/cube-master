export { CoachErrorBoundary, LessonBrowser, LessonPlayer } from './components'
export { warmMilestones } from './data/illustrative'
export { LESSONS, getLesson } from './data/lessons'
export type { Lesson, LessonStep } from './data/types'
export { stepAlgorithmId } from './data/types'
export {
  goToStep,
  markLessonComplete,
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
