import type { AlgorithmMethod, FaceCode, MoveToken } from '@packages/cube-engine'

// A lesson is a sequenced chapter: the player renders one step at a time. Steps
// reference algorithms by catalog id only — never inline algorithm sequences (the
// anti-drift contract, ADR-0006 / NFR-004). The one exception is the Chapter 0
// notation primer, whose `interactive` step carries individual face turns (R, R′)
// as the alphabet it teaches — notation atoms, not a teachable algorithm.

// A visual attached to an `understand` step. Either the solved cube (optionally a
// partial goal to highlight) or a named algorithm's *case* — rendered by applying
// the inverse of its moves to solved, so what the learner recognises is exactly
// what the demo resolves. `caseOf` references a catalog id (NFR-004). (D-VISUAL)
export type StepVisual = {
  state: 'solved' | { caseOf: string }
  highlight?: Partial<Record<FaceCode, readonly number[]>>
}

export type UnderstandStep = {
  kind: 'understand'
  title: string
  body: string
  visual?: StepVisual
}

// Chapter 0's tap-to-turn primer (D-CH0-MODEL / PD4). The player renders a local
// live cube the learner turns with the prompted moves; it reuses `applyMoves`,
// so no engine change. Kept to single face turns to stay a minimal extra kind.
export type InteractiveStep = {
  kind: 'interactive'
  title: string
  body: string
  // The face turns the learner is invited to try, in order (e.g. ['R', "R'"]),
  // rendered as tappable controls that turn the local cube.
  moves: readonly MoveToken[]
  // Faces to label/emphasise on the net (the "6 faces" step). Highlights the
  // centre sticker of each named face.
  faces?: readonly FaceCode[]
}

export type DemoStep = {
  kind: 'demo'
  title: string
  body: string
  algorithmId: string
  // Case-resolvers demo case → solved (default); the one pure-trigger (the sexy
  // move) may demo solved → forward. (D-DEMO / PD3)
  demoFrom?: 'case' | 'solved'
}

export type PracticeStep = {
  kind: 'practice'
  title: string
  body: string
  algorithmId: string
}

export type LessonStep = UnderstandStep | InteractiveStep | DemoStep | PracticeStep

export type Lesson = {
  id: string
  title: string
  method: AlgorithmMethod
  order: number
  steps: LessonStep[]
}

// The catalog id a demo/practice step plays, or null for steps with no algorithm.
export const stepAlgorithmId = (step: LessonStep): string | null =>
  step.kind === 'demo' || step.kind === 'practice' ? step.algorithmId : null

// Every catalog id a step references — the demo/practice algorithm and any
// `understand` visual `caseOf`. Used by the referential-integrity guard so a
// typo'd id reddens CI rather than rendering a blank cube.
export const stepCatalogIds = (step: LessonStep): readonly string[] => {
  const ids: string[] = []
  const algId = stepAlgorithmId(step)
  if (algId !== null) ids.push(algId)
  if (step.kind === 'understand' && step.visual && step.visual.state !== 'solved') {
    ids.push(step.visual.state.caseOf)
  }
  return ids
}
