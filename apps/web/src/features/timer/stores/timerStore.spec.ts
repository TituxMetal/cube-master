import { beforeEach, describe, expect, it } from 'bun:test'

import {
  $currentScramble,
  $elapsedMs,
  $timerState,
  resetTimer,
  startTimer,
  stopTimer
} from '~/features/timer/stores/timerStore'

beforeEach(() => {
  resetTimer()
})

describe('timerStore', () => {
  it('should have initial state as idle', () => {
    expect($timerState.get()).toBe('idle')
  })

  it('should have initial elapsed time as 0', () => {
    expect($elapsedMs.get()).toBe(0)
  })

  it('should generate an initial scramble with 20 moves', () => {
    expect($currentScramble.get()).toHaveLength(20)
  })

  it('should set state to running on start', () => {
    startTimer()

    expect($timerState.get()).toBe('running')
  })

  it('should set state to stopped on stop', () => {
    startTimer()
    stopTimer()

    expect($timerState.get()).toBe('stopped')
  })

  it('should set state to idle on reset', () => {
    startTimer()
    stopTimer()
    resetTimer()

    expect($timerState.get()).toBe('idle')
  })

  it('should clear elapsed time on reset', () => {
    startTimer()
    stopTimer()
    resetTimer()

    expect($elapsedMs.get()).toBe(0)
  })

  it('should generate a new scramble on reset', () => {
    const firstScramble = $currentScramble.get()
    resetTimer()
    const secondScramble = $currentScramble.get()

    expect(secondScramble).toHaveLength(20)
    expect(secondScramble).not.toEqual(firstScramble)
  })
})
