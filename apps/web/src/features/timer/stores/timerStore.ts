import { useStore } from '@nanostores/react'
import type { MoveToken } from '@packages/cube-engine'
import { generateScramble } from '@packages/cube-engine'
import { atom } from 'nanostores'

export type TimerState = 'idle' | 'running' | 'stopped'

export const $timerState = atom<TimerState>('idle')
export const $elapsedMs = atom<number>(0)
export const $currentScramble = atom<MoveToken[]>(generateScramble())

let startTimestamp = 0

export const startTimer = () => {
  startTimestamp = performance.now()
  $timerState.set('running')
}

export const stopTimer = () => {
  const elapsed = performance.now() - startTimestamp
  $elapsedMs.set(elapsed)
  $timerState.set('stopped')
}

export const resetTimer = () => {
  startTimestamp = 0
  $elapsedMs.set(0)
  $timerState.set('idle')
  $currentScramble.set(generateScramble())
}

export const newScramble = () => {
  $currentScramble.set(generateScramble())
}

export const tick = () => {
  if ($timerState.get() !== 'running') return
  $elapsedMs.set(performance.now() - startTimestamp)
}

export const useTimerState = (): TimerState => useStore($timerState)
export const useElapsedMs = (): number => useStore($elapsedMs)
export const useCurrentScramble = (): MoveToken[] => useStore($currentScramble)
