import { useCallback, useEffect } from 'react'

import { ScrambleDisplay } from '~/features/timer/components/ScrambleDisplay'
import { SolveHistory } from '~/features/timer/components/SolveHistory'
import { StatsPanel } from '~/features/timer/components/StatsPanel'
import { TimerDisplay } from '~/features/timer/components/TimerDisplay'
import { useTimerLoop } from '~/features/timer/hooks/useTimerLoop'
import {
  deleteSolve,
  recordSolve,
  toggleDnf,
  useSolves
} from '~/features/timer/stores/sessionStore'
import {
  $currentScramble,
  $elapsedMs,
  $timerState,
  newScramble,
  resetTimer,
  startTimer,
  stopTimer,
  useCurrentScramble,
  useElapsedMs,
  useTimerState
} from '~/features/timer/stores/timerStore'

const handleTimerToggle = () => {
  const state = $timerState.get()

  if (state === 'idle') {
    startTimer()
    return
  }

  if (state === 'running') {
    stopTimer()
    recordSolve($elapsedMs.get(), $currentScramble.get())
    resetTimer()
  }
}

export const Timer = () => {
  const timerState = useTimerState()
  const elapsedMs = useElapsedMs()
  const scramble = useCurrentScramble()
  const solves = useSolves()

  useTimerLoop()

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.code !== 'Space') return

    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

    event.preventDefault()
    handleTimerToggle()
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <section className='flex flex-col gap-6' aria-label='Timer mode'>
      <ScrambleDisplay scramble={scramble} onNewScramble={newScramble} />
      <button
        type='button'
        className='w-full cursor-pointer border-none bg-transparent p-0'
        onClick={handleTimerToggle}
        aria-label='Toggle timer'
      >
        <TimerDisplay elapsedMs={elapsedMs} state={timerState} />
      </button>
      <div className='grid items-start gap-6 lg:grid-cols-[1fr_auto]'>
        <SolveHistory solves={solves} onToggleDnf={toggleDnf} onDelete={deleteSolve} />
        <StatsPanel solves={solves} />
      </div>
    </section>
  )
}
