import type { AlgorithmMethod, FaceCode, MoveToken } from '@packages/cube-engine'

// A lesson is a sequenced chapter: the player renders one step at a time. Steps
// reference algorithms by catalog id only — never inline algorithm sequences (the
// anti-drift contract, ADR-0006 / NFR-004). The one exception is the Chapter 0
// notation primer, whose `interactive` step carries individual face turns (R, R′)
// as the alphabet it teaches — notation atoms, not a teachable algorithm.

// The named *milestone* states — the real goal of each chapter, reached on a cube
// whose later layers are still scrambled. A demo/practice resolves *to* its goal, not
// to the fully-solved cube, so the learner sees "the annoying case → this step's
// milestone" instead of "almost solved → solved", which reads as pointless. Every
// teaching milestone is built by chaining the teaching solver off the previous one
// (illustrative.ts), so each chapter's practice lands exactly on it. One per chapter,
// in journey order:
//   white-cross-only        Ch1 — the white cross, rest mixed
//   white-corners           Ch2 — the whole top crown (first layer)
//   second-layer            Ch3 — the first two layers
//   yellow-cross            Ch4 — first two layers + the yellow cross
//   yellow-corners-oriented Ch5 — + the whole yellow face (corners oriented)
//   yellow-corners-placed   Ch6 — + the last-layer corners home
//   solved                  Ch7 — the finished cube
export type GoalState =
  | 'solved'
  | 'white-cross-only'
  | 'white-corners'
  | 'second-layer'
  | 'yellow-cross'
  | 'yellow-corners-oriented'
  | 'yellow-corners-placed'

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

// A *teaching scenario* (D-DEMO-DECOUPLE / D-PRACTICE-SOLVER): which teaching-solver
// phase to run and the milestone pair it travels (previous milestone → this
// chapter's milestone). All moves come from the engine at runtime — lesson data
// never inlines a MoveToken[] (NFR-004). Phase 37 extends `TeachingPhase` with the
// remaining last-layer phases.
export type TeachingPhase =
  | 'white-corners'
  | 'second-layer'
  | 'yellow-cross'
  | 'orient-corners'
  | 'place-corners'
  | 'permute-edges'

export type TeachingScenario = {
  phase: TeachingPhase
  from: GoalState
  to: GoalState
}

// A demo step is EITHER legacy (a single catalog algorithm, Ch0/Ch1) OR a teaching
// demo (one group of a teaching plan, shown on a realistic partial state — the
// earlier pieces already placed). The store resolves both to a move list it steps
// through; a teaching demo also exposes its setup/trigger segments for highlighting.
export type DemoStep = {
  kind: 'demo'
  title: string
  body: string
} & (LegacyAlgorithmRef | TeachingDemoRef)

// Legacy: a case demo plays case → goal (default); the pure trigger may play
// goal → forward. (D-DEMO / PD3)
type LegacyAlgorithmRef = {
  algorithmId: string
  demoFrom?: 'case' | 'solved'
  goal?: GoalState
  scenario?: never
  groupIndex?: never
}

// Teaching: play group `groupIndex` of the chapter's teaching plan, on the cube with
// groups [0..groupIndex) already applied (a realistic recognize → place → trigger case).
type TeachingDemoRef = {
  scenario: TeachingScenario
  groupIndex: number
  algorithmId?: never
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

// The full-chapter practice (D-DEMO-DECOUPLE, revises PD7): start from the *previous*
// milestone (nothing of the chapter solved), run the whole teaching plan move by move,
// success = reaching this chapter's milestone. A distinct kind keeps the legacy
// single-algorithm `practice` (Ch1) untouched. (PD-3)
export type ChapterPracticeStep = {
  kind: 'chapter-practice'
  title: string
  body: string
  scenario: TeachingScenario
}

export type LessonStep =
  | UnderstandStep
  | InteractiveStep
  | DemoStep
  | PracticeStep
  | ChapterPracticeStep

// Whether a demo step is a teaching demo (vs a legacy single-algorithm demo).
export const isTeachingDemo = (step: DemoStep): step is DemoStep & TeachingDemoRef =>
  step.scenario !== undefined

// The teaching scenario a step carries, if any (teaching demo or chapter practice).
export const stepScenario = (step: LessonStep): TeachingScenario | null => {
  if (step.kind === 'chapter-practice') return step.scenario
  if (step.kind === 'demo' && isTeachingDemo(step)) return step.scenario
  return null
}

export type Lesson = {
  id: string
  title: string
  method: AlgorithmMethod
  order: number
  steps: LessonStep[]
}

// The catalog id a step plays directly, or null. A teaching demo / chapter practice
// carries no static id — its trigger blocks come from the engine at runtime.
export const stepAlgorithmId = (step: LessonStep): string | null => {
  if (step.kind === 'practice') return step.algorithmId
  if (step.kind === 'demo' && !isTeachingDemo(step)) return step.algorithmId
  return null
}

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
