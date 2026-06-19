import type { AlgorithmMethod, FaceCode, MoveToken } from '@packages/cube-engine'

// A lesson is a sequenced chapter: the player renders one step at a time. Steps
// reference algorithms by catalog id only — never inline algorithm sequences (the
// anti-drift contract, ADR-0006 / NFR-004). The one exception is the Chapter 0
// notation primer, whose `interactive` step carries individual face turns (R, R′)
// as the alphabet it teaches — notation atoms, not a teachable algorithm.

// The named *milestone* states — the real goal of each chapter, reached on a cube
// whose later layers are still scrambled (or, for the last-layer chapters, whose
// first two layers are genuinely solved). A demo/practice resolves *to* its goal,
// not to the fully-solved cube — so the learner sees "the annoying case → this
// step's milestone" instead of "almost solved → solved", which read as pointless.
// Defaults to 'solved' (Ch7, and any step whose goal genuinely is the finished
// cube). The early chapters each have a real partial milestone; the last-layer
// chapters (Ch5 orient corners, Ch6 place corners, Ch7 place edges) resolve to
// 'solved' — there the first two layers + yellow cross are genuinely complete, so
// "near-solved → solved" is the truth, not the misleading fake PD6 rejects. (A
// clean all-yellow / corners-placed intermediate isn't derivable from the BFS
// solver's hybrid OLL/PLL algorithms — noted as a full-journey follow-up.) One per
// early chapter, in journey order:
//   white-cross-only  Ch1 — the white cross, rest mixed
//   white-corners     Ch2 — the whole white (first) layer
//   second-layer      Ch3 — the first two layers
//   yellow-cross      Ch4 — first two layers + the yellow cross on top
export type GoalState =
  | 'solved'
  | 'white-cross-only'
  | 'white-corners'
  | 'second-layer'
  | 'yellow-cross'

// Every named state the store renders without the step carrying any moves — so
// lesson data never holds an inline MoveToken[] (NFR-004): the milestones plus
// `cross-misaligned`, the white cross with its side bands rotated off their centres
// (the classic White-Cross mistake — an understand-only contrast, never a goal). A
// `caseOf` references a catalog algorithm's case.
export type IllustrativeState = GoalState | 'cross-misaligned'

// A visual attached to an `understand` step. Either an illustrative state
// (optionally with a partial goal to highlight) or a named algorithm's *case* —
// rendered by applying the inverse of its moves to the goal milestone (default
// solved), so what the learner recognises is exactly the state the matching demo
// resolves. (D-VISUAL / PD2)
export type StepVisual = {
  state: IllustrativeState | { caseOf: string; goal?: GoalState }
  highlight?: Partial<Record<FaceCode, readonly number[]>>
}

// The one non-uniform visual (PD2): two small captioned nets side by side — used
// once, for White Cross's "good cross vs sides not matching" contrast. Kept a
// bounded optional field, not a generalised layout model.
export type CompareVisual = {
  left: { visual: StepVisual; caption: string }
  right: { visual: StepVisual; caption: string }
}

export type UnderstandStep = {
  kind: 'understand'
  title: string
  body: string
  visual?: StepVisual
  compare?: CompareVisual
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
  // Case-resolvers demo case → goal (default); the one pure-trigger (the sexy
  // move) may demo goal → forward. (D-DEMO / PD3)
  demoFrom?: 'case' | 'solved'
  // The milestone the algorithm resolves *to* — the step's real goal, not the
  // fully-solved cube. Defaults to 'solved'. A case demo then plays from the case
  // (the milestone with the algorithm's footprint reversed, so the surrounding
  // layers stay scrambled) forward to this milestone. (the milestone-demo model)
  goal?: GoalState
}

export type PracticeStep = {
  kind: 'practice'
  title: string
  body: string
  algorithmId: string
  // The milestone the learner resolves *to* — success is reaching this state, not
  // the fully-solved cube. Defaults to 'solved'. (the milestone-demo model)
  goal?: GoalState
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

// The catalog id a visual's `caseOf` references, if any.
const visualCaseId = (visual: StepVisual): string | null =>
  typeof visual.state === 'object' ? visual.state.caseOf : null

// Every catalog id a step references — the demo/practice algorithm and any
// `understand` visual or comparison `caseOf`. Used by the referential-integrity
// guard so a typo'd id reddens CI rather than rendering a blank cube.
export const stepCatalogIds = (step: LessonStep): readonly string[] => {
  const ids: string[] = []
  const algId = stepAlgorithmId(step)
  if (algId !== null) ids.push(algId)
  if (step.kind === 'understand') {
    const visuals = [step.visual, step.compare?.left.visual, step.compare?.right.visual]
    for (const visual of visuals) {
      if (!visual) continue
      const caseId = visualCaseId(visual)
      if (caseId !== null) ids.push(caseId)
    }
  }
  return ids
}
