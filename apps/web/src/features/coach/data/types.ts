import type { AlgorithmMethod } from '@packages/cube-engine'

// A lesson is a sequenced chapter: understand → demo → practice steps the player
// renders one at a time. demo/practice steps reference an algorithm by catalog
// id only — never inline moves (the anti-drift contract, ADR-0006 / NFR-004).

export type UnderstandStep = {
  kind: 'understand'
  title: string
  body: string
}

export type DemoStep = {
  kind: 'demo'
  title: string
  body: string
  algorithmId: string
}

export type PracticeStep = {
  kind: 'practice'
  title: string
  body: string
  algorithmId: string
}

export type LessonStep = UnderstandStep | DemoStep | PracticeStep

export type Lesson = {
  id: string
  title: string
  method: AlgorithmMethod
  order: number
  steps: LessonStep[]
}

// The catalog id a demo/practice step plays, or null for prose-only steps.
export const stepAlgorithmId = (step: LessonStep): string | null =>
  step.kind === 'demo' || step.kind === 'practice' ? step.algorithmId : null
