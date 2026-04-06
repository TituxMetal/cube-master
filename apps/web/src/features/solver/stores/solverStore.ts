import { useStore } from '@nanostores/react'
import type {
  ColorCode,
  CubeState,
  FaceCode,
  MoveToken,
  ReconstructResult,
  Solution,
  StickersByFace
} from '@packages/cube-engine'
import {
  applyMoves,
  createSolvedState,
  generateScramble,
  reconstructState,
  solveCube,
  toStickers
} from '@packages/cube-engine'
import { atom, computed } from 'nanostores'

export type SolverView = 'input' | 'solution'

// --- Input atoms ---

export const $inputStickers = atom<StickersByFace>(toStickers(createSolvedState()))
export const $scrambleMoves = atom<MoveToken[]>([])
export const $solverView = atom<SolverView>('input')

const COLOR_CYCLE: readonly ColorCode[] = ['Wt', 'Yl', 'Rd', 'Og', 'Bl', 'Gn']

export const $validationResult = computed($inputStickers, (stickers): ReconstructResult => {
  return reconstructState(stickers)
})

// --- Solution atoms ---

export const $inputCubeState = atom<CubeState | null>(null)
export const $solution = atom<Solution | null>(null)
export const $currentStepIndex = atom<number>(0)

// --- Solution computed ---

export const $allMoves = computed($solution, (solution): MoveToken[] => {
  if (!solution) return []
  return solution.phases.flatMap(p => p.groups.flatMap(g => g.moves))
})

export const $totalSteps = computed($allMoves, (moves): number => moves.length)

export const $currentPhaseIndex = computed(
  [$solution, $currentStepIndex],
  (solution, stepIndex): number => {
    if (!solution) return 0
    let cumulative = 0
    for (let i = 0; i < solution.phases.length; i++) {
      cumulative += solution.phases[i].groups.reduce((s, g) => s + g.moves.length, 0)
      if (stepIndex < cumulative) return i
    }
    return solution.phases.length - 1
  }
)

export const $currentStepInPhase = computed(
  [$solution, $currentStepIndex, $currentPhaseIndex],
  (solution, stepIndex, phaseIndex): number => {
    if (!solution) return 0
    let base = 0
    for (let i = 0; i < phaseIndex; i++) {
      base += solution.phases[i].groups.reduce((s, g) => s + g.moves.length, 0)
    }
    return stepIndex - base
  }
)

export const $currentGroupIndex = computed(
  [$solution, $currentStepIndex, $currentPhaseIndex],
  (solution, stepIndex, phaseIndex): number => {
    if (!solution) return 0
    let base = 0
    for (let i = 0; i < phaseIndex; i++) {
      base += solution.phases[i].groups.reduce((s, g) => s + g.moves.length, 0)
    }
    const stepInPhase = stepIndex - base
    let groupBase = 0
    const groups = solution.phases[phaseIndex].groups
    for (let i = 0; i < groups.length; i++) {
      groupBase += groups[i].moves.length
      if (stepInPhase < groupBase) return i
    }
    return Math.max(0, groups.length - 1)
  }
)

export const $currentGroup = computed(
  [$solution, $currentPhaseIndex, $currentGroupIndex],
  (solution, phaseIndex, groupIndex): MoveToken[] => {
    if (!solution) return []
    const groups = solution.phases[phaseIndex]?.groups
    return groups?.[groupIndex]?.moves ?? []
  }
)

export const $currentStepInGroup = computed(
  [$solution, $currentStepIndex, $currentPhaseIndex, $currentGroupIndex],
  (solution, stepIndex, phaseIndex, groupIndex): number => {
    if (!solution) return 0
    let base = 0
    for (let i = 0; i < phaseIndex; i++) {
      base += solution.phases[i].groups.reduce((s, g) => s + g.moves.length, 0)
    }
    const groups = solution.phases[phaseIndex].groups
    for (let i = 0; i < groupIndex; i++) {
      base += groups[i].moves.length
    }
    return stepIndex - base
  }
)

export const $currentMove = computed(
  [$allMoves, $currentStepIndex],
  (moves, stepIndex): MoveToken | null => {
    if (stepIndex >= moves.length) return null
    return moves[stepIndex] ?? null
  }
)

export const $cubeAtStep = computed(
  [$inputCubeState, $allMoves, $currentStepIndex],
  (cubeState, allMoves, stepIndex): StickersByFace | null => {
    if (!cubeState) return null
    const movesToApply = allMoves.slice(0, stepIndex)
    return toStickers(applyMoves(cubeState, movesToApply))
  }
)

export const cycleStickerColor = (face: FaceCode, index: number) => {
  if (index === 4) return

  const current = $inputStickers.get()
  const currentColor = current[face][index]
  const nextIndex = (COLOR_CYCLE.indexOf(currentColor) + 1) % COLOR_CYCLE.length
  const faceStickers = [...current[face]]
  faceStickers[index] = COLOR_CYCLE[nextIndex]
  $inputStickers.set({ ...current, [face]: faceStickers })
}

export const resetInput = () => {
  $inputStickers.set(toStickers(createSolvedState()))
  $scrambleMoves.set([])
}

export const scrambleInput = () => {
  const moves = generateScramble()
  const state = applyMoves(createSolvedState(), moves)
  $inputStickers.set(toStickers(state))
  $scrambleMoves.set(moves)
}

// --- Solution actions ---

export const $solveError = atom<string | null>(null)

export const solveAction = () => {
  const validation = $validationResult.get()
  if (!validation.ok) return

  $solveError.set(null)
  try {
    const solution = solveCube(validation.state)
    $inputCubeState.set(validation.state)
    $solution.set(solution)
    $currentStepIndex.set(0)
    $solverView.set('solution')
  } catch {
    $solveError.set('Solver failed — the cube state may not be solvable')
  }
}

export const nextStep = () => {
  const total = $totalSteps.get()
  const current = $currentStepIndex.get()
  if (current < total) $currentStepIndex.set(current + 1)
}

export const previousStep = () => {
  const current = $currentStepIndex.get()
  if (current > 0) $currentStepIndex.set(current - 1)
}

export const jumpToPhase = (index: number) => {
  const solution = $solution.get()
  if (!solution) return
  let stepIndex = 0
  for (let i = 0; i < index; i++) {
    stepIndex += solution.phases[i].groups.reduce((s, g) => s + g.moves.length, 0)
  }
  $currentStepIndex.set(stepIndex)
}

export const newSolve = () => {
  $solution.set(null)
  $inputCubeState.set(null)
  $currentStepIndex.set(0)
  $solveError.set(null)
  resetInput()
  $solverView.set('input')
}

// --- Hooks ---

export const useInputStickers = (): StickersByFace => useStore($inputStickers)
export const useScrambleMoves = (): MoveToken[] => useStore($scrambleMoves)
export const useValidationResult = (): ReconstructResult => useStore($validationResult)
export const useSolveError = (): string | null => useStore($solveError)
export const useSolverView = (): SolverView => useStore($solverView)
export const useSolution = (): Solution | null => useStore($solution)
export const useCurrentStepIndex = (): number => useStore($currentStepIndex)
export const useCubeAtStep = (): StickersByFace | null => useStore($cubeAtStep)
export const useCurrentPhaseIndex = (): number => useStore($currentPhaseIndex)
export const useTotalSteps = (): number => useStore($totalSteps)
export const useCurrentStepInPhase = (): number => useStore($currentStepInPhase)
export const useCurrentGroup = (): MoveToken[] => useStore($currentGroup)
export const useCurrentStepInGroup = (): number => useStore($currentStepInGroup)
export const useCurrentMove = (): MoveToken | null => useStore($currentMove)
