import { useStore } from '@nanostores/react'
import type { MoveToken } from '@packages/cube-engine'
import { atom } from 'nanostores'

export type Solve = {
  id: string
  time: number
  scramble: MoveToken[]
  timestamp: number
  dnf: boolean
}

const STORAGE_KEY = 'cubeMaster:solves'

const loadSolves = (): Solve[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) return []

    return JSON.parse(raw) as Solve[]
  } catch {
    return []
  }
}

const persistSolves = (solves: readonly Solve[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(solves))
  } catch {
    // Storage full or unavailable (private browsing) — silently ignore
  }
}

export const $solves = atom<Solve[]>(loadSolves())

$solves.listen(persistSolves)

export const recordSolve = (time: number, scramble: MoveToken[]) => {
  const solve: Solve = {
    id: crypto.randomUUID(),
    time,
    scramble: [...scramble],
    timestamp: Date.now(),
    dnf: false
  }
  $solves.set([solve, ...$solves.get()])
}

export const toggleDnf = (id: string) => {
  $solves.set($solves.get().map(s => (s.id === id ? { ...s, dnf: !s.dnf } : s)))
}

export const deleteSolve = (id: string) => {
  $solves.set($solves.get().filter(s => s.id !== id))
}

export const clearSession = () => {
  $solves.set([])
}

export const useSolves = (): Solve[] => useStore($solves)
