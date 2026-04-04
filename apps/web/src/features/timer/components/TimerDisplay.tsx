import { formatTime } from '~/features/timer/lib/formatTime'
import type { TimerState } from '~/features/timer/stores/timerStore'

interface TimerDisplayProps {
  elapsedMs: number
  state: TimerState
}

export const TimerDisplay = ({ elapsedMs, state }: TimerDisplayProps) => {
  const isRunning = state === 'running'

  return (
    <output
      className={`bg-cube-red/30 flex min-h-56 items-center justify-center rounded-xl font-mono text-7xl transition-all duration-300 md:min-h-64 md:text-8xl ${isRunning ? 'text-cube-red-text shadow-[0_0_40px_rgba(220,60,40,0.15)]' : 'text-base-content'}`}
      aria-live='polite'
      aria-label='Timer'
    >
      {formatTime(elapsedMs)}
    </output>
  )
}
