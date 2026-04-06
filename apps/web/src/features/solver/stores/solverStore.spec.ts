import { createSolvedState, toStickers } from '@packages/cube-engine'
import type { Solution } from '@packages/cube-engine'
import { beforeEach, describe, expect, it } from 'bun:test'

import {
  $allMoves,
  $cubeAtStep,
  $currentMove,
  $currentPhaseIndex,
  $currentStepIndex,
  $currentStepInPhase,
  $inputStickers,
  $scrambleMoves,
  $solution,
  $solverView,
  $totalSteps,
  $validationResult,
  cycleStickerColor,
  jumpToPhase,
  newSolve,
  nextStep,
  previousStep,
  resetInput,
  scrambleInput,
  solveAction
} from '~/features/solver/stores'

beforeEach(() => {
  newSolve()
})

describe('solverStore', () => {
  it('should initialize stickers to solved state', () => {
    const expected = toStickers(createSolvedState())
    expect($inputStickers.get()).toEqual(expected)
  })

  it('should validate solved stickers as valid', () => {
    const result = $validationResult.get()
    expect(result.ok).toBe(true)
  })

  it('should cycle sticker color on click', () => {
    expect($inputStickers.get()['U'][0]).toBe('Wt')
    cycleStickerColor('U', 0)
    expect($inputStickers.get()['U'][0]).toBe('Yl')
    cycleStickerColor('U', 0)
    expect($inputStickers.get()['U'][0]).toBe('Rd')
  })

  it('should wrap color cycle back to white after green', () => {
    for (let i = 0; i < 5; i++) cycleStickerColor('U', 0)
    expect($inputStickers.get()['U'][0]).toBe('Gn')
    cycleStickerColor('U', 0)
    expect($inputStickers.get()['U'][0]).toBe('Wt')
  })

  it('should not cycle center stickers (index 4)', () => {
    const before = $inputStickers.get()['U'][4]
    cycleStickerColor('U', 4)
    expect($inputStickers.get()['U'][4]).toBe(before)
  })

  it('should reset stickers to solved state', () => {
    cycleStickerColor('U', 0)
    resetInput()
    const expected = toStickers(createSolvedState())
    expect($inputStickers.get()).toEqual(expected)
  })

  it('should scramble input stickers', () => {
    scrambleInput()
    const solved = toStickers(createSolvedState())
    expect($inputStickers.get()).not.toEqual(solved)
  })

  it('should store scramble moves after scramble', () => {
    scrambleInput()
    expect($scrambleMoves.get().length).toBeGreaterThan(0)
  })

  it('should clear scramble moves on reset', () => {
    scrambleInput()
    resetInput()
    expect($scrambleMoves.get()).toEqual([])
  })

  it('should invalidate after cycling creates wrong color count', () => {
    cycleStickerColor('U', 0)
    const result = $validationResult.get()
    expect(result.ok).toBe(false)
  })

  it('should revalidate after scramble', () => {
    scrambleInput()
    const result = $validationResult.get()
    expect(result.ok).toBe(true)
  })
})

describe('solverStore — solution', () => {
  const setupSolvedState = () => {
    scrambleInput()
    solveAction()
  }

  it('should compute solution and switch to solution view', () => {
    setupSolvedState()

    expect($solution.get()).not.toBeNull()
    expect($solverView.get()).toBe('solution')
  })

  it('should store input cube state on solve', () => {
    setupSolvedState()

    const cubeAtStep0 = $cubeAtStep.get()
    expect(cubeAtStep0).not.toBeNull()
    expect(cubeAtStep0).toEqual($inputStickers.get())
  })

  it('should not solve if validation fails', () => {
    cycleStickerColor('U', 0)
    solveAction()

    expect($solution.get()).toBeNull()
    expect($solverView.get()).toBe('input')
  })

  it('should have correct total steps', () => {
    setupSolvedState()

    const solution = $solution.get() as Solution
    expect($totalSteps.get()).toBe(solution.totalMoves)
  })

  it('should increment step with nextStep', () => {
    setupSolvedState()

    expect($currentStepIndex.get()).toBe(0)
    nextStep()
    expect($currentStepIndex.get()).toBe(1)
  })

  it('should cap nextStep at total steps', () => {
    setupSolvedState()

    const total = $totalSteps.get()
    $currentStepIndex.set(total)
    nextStep()
    expect($currentStepIndex.get()).toBe(total)
  })

  it('should decrement step with previousStep', () => {
    setupSolvedState()

    nextStep()
    nextStep()
    previousStep()
    expect($currentStepIndex.get()).toBe(1)
  })

  it('should cap previousStep at 0', () => {
    setupSolvedState()

    previousStep()
    expect($currentStepIndex.get()).toBe(0)
  })

  it('should jump to correct phase step index', () => {
    setupSolvedState()

    const solution = $solution.get() as Solution
    const phase0Moves = solution.phases[0].groups.reduce((s, g) => s + g.moves.length, 0)
    const phase1Moves = solution.phases[1].groups.reduce((s, g) => s + g.moves.length, 0)

    jumpToPhase(1)
    expect($currentStepIndex.get()).toBe(phase0Moves)

    jumpToPhase(2)
    expect($currentStepIndex.get()).toBe(phase0Moves + phase1Moves)
  })

  it('should compute correct currentPhaseIndex', () => {
    setupSolvedState()

    expect($currentPhaseIndex.get()).toBe(0)

    const solution = $solution.get() as Solution
    const phase0Moves = solution.phases[0].groups.reduce((s, g) => s + g.moves.length, 0)

    $currentStepIndex.set(phase0Moves)
    expect($currentPhaseIndex.get()).toBe(1)

    $currentStepIndex.set(phase0Moves + 1)
    expect($currentPhaseIndex.get()).toBe(1)
  })

  it('should compute correct currentStepInPhase', () => {
    setupSolvedState()

    const solution = $solution.get() as Solution
    const phase0Moves = solution.phases[0].groups.reduce((s, g) => s + g.moves.length, 0)

    $currentStepIndex.set(phase0Moves + 3)
    expect($currentPhaseIndex.get()).toBe(1)
    expect($currentStepInPhase.get()).toBe(3)
  })

  it('should return current move token', () => {
    setupSolvedState()

    const allMoves = $allMoves.get()
    expect($currentMove.get()).toBe(allMoves[0])

    nextStep()
    expect($currentMove.get()).toBe(allMoves[1])
  })

  it('should update cubeAtStep when stepping', () => {
    setupSolvedState()

    const step0 = $cubeAtStep.get()
    nextStep()
    const step1 = $cubeAtStep.get()

    expect(step1).not.toBeNull()
    expect(step1).not.toEqual(step0)
  })

  it('should return solved cube at last step', () => {
    setupSolvedState()

    const total = $totalSteps.get()
    $currentStepIndex.set(total)

    const finalStickers = $cubeAtStep.get()
    const solvedStickers = toStickers(createSolvedState())
    expect(finalStickers).toEqual(solvedStickers)
  })

  it('should clear everything with newSolve', () => {
    setupSolvedState()
    nextStep()

    newSolve()

    expect($solution.get()).toBeNull()
    expect($currentStepIndex.get()).toBe(0)
    expect($cubeAtStep.get()).toBeNull()
    expect($solverView.get()).toBe('input')
    expect($inputStickers.get()).toEqual(toStickers(createSolvedState()))
  })
})
