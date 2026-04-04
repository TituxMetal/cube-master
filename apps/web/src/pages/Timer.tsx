import { useCallback, useEffect } from 'react'

import {
  ScrambleDisplay,
  SolveHistory,
  StatsPanel,
  TimerDisplay
} from '~/features/timer/components'
import { useTimerLoop } from '~/features/timer/hooks'
import {
  $currentScramble,
  $elapsedMs,
  $timerState,
  deleteSolve,
  newScramble,
  recordSolve,
  resetTimer,
  startTimer,
  stopTimer,
  toggleDnf,
  useCurrentScramble,
  useElapsedMs,
  useSolves,
  useTimerState
} from '~/features/timer/stores'

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
    if (event.code !== 'Space' || event.repeat) return

    const target = event.target
    if (
      target instanceof Element &&
      target.closest('button, a, input, textarea, select, [role="button"]')
    ) {
      return
    }

    event.preventDefault()
    handleTimerToggle()
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <section className='flex flex-col gap-6' aria-label='Timer mode'>
      <ScrambleDisplay
        scramble={scramble}
        onNewScramble={timerState === 'idle' ? newScramble : undefined}
      />
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
