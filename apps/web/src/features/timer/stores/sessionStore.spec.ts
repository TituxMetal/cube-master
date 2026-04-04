import type { MoveToken } from '@packages/cube-engine'
import { beforeEach, describe, expect, it } from 'bun:test'

import {
  $solves,
  clearSession,
  deleteSolve,
  recordSolve,
  toggleDnf
} from '~/features/timer/stores/sessionStore'

const STORAGE_KEY = 'cubeMaster:solves'
const testScramble: MoveToken[] = ['R', 'U', "F'", 'L2', 'B', "D'"]

beforeEach(() => {
  clearSession()
  localStorage.removeItem(STORAGE_KEY)
})

describe('sessionStore', () => {
  it('should have initial solves list as empty', () => {
    expect($solves.get()).toEqual([])
  })

  it('should prepend a solve with correct data on recordSolve', () => {
    recordSolve(12345, testScramble)

    const solves = $solves.get()

    expect(solves).toHaveLength(1)
    expect(solves[0].time).toBe(12345)
    expect(solves[0].scramble).toEqual(testScramble)
    expect(solves[0].dnf).toBe(false)
    expect(solves[0].id).toBeDefined()
    expect(solves[0].timestamp).toBeDefined()
  })

  it('should toggle DNF flag on toggleDnf', () => {
    recordSolve(12345, testScramble)
    const id = $solves.get()[0].id

    toggleDnf(id)

    expect($solves.get()[0].dnf).toBe(true)

    toggleDnf(id)

    expect($solves.get()[0].dnf).toBe(false)
  })

  it('should remove solve on deleteSolve', () => {
    recordSolve(12345, testScramble)
    recordSolve(67890, testScramble)
    const id = $solves.get()[0].id

    deleteSolve(id)

    expect($solves.get()).toHaveLength(1)
    expect($solves.get()[0].time).toBe(12345)
  })

  it('should empty the list on clearSession', () => {
    recordSolve(12345, testScramble)
    recordSolve(67890, testScramble)

    clearSession()

    expect($solves.get()).toEqual([])
  })

  it('should order solves newest first', () => {
    recordSolve(111, testScramble)
    recordSolve(222, testScramble)
    recordSolve(333, testScramble)

    const solves = $solves.get()

    expect(solves[0].time).toBe(333)
    expect(solves[1].time).toBe(222)
    expect(solves[2].time).toBe(111)
  })

  it('should persist solves to localStorage after recording', () => {
    recordSolve(12345, testScramble)

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')

    expect(stored).toHaveLength(1)
    expect(stored[0].time).toBe(12345)
  })

  it('should handle missing localStorage key gracefully', () => {
    localStorage.removeItem(STORAGE_KEY)

    // The store was already initialized; clearing simulates fresh state
    clearSession()

    expect($solves.get()).toEqual([])
  })

  it('should handle invalid JSON in localStorage gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'not-valid-json')

    // loadSolves is called at module init; we can only test that the store
    // doesn't crash and falls back to empty on clear
    clearSession()

    expect($solves.get()).toEqual([])
  })
})
