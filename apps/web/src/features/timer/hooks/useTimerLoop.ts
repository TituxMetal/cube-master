import { useEffect, useRef } from 'react'

import { $timerState, tick } from '~/features/timer/stores/timerStore'

export const useTimerLoop = () => {
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const loop = () => {
      tick()
      rafRef.current = requestAnimationFrame(loop)
    }

    const unsubscribe = $timerState.listen(state => {
      cancelAnimationFrame(rafRef.current)

      if (state !== 'running') return

      rafRef.current = requestAnimationFrame(loop)
    })

    return () => {
      unsubscribe()
      cancelAnimationFrame(rafRef.current)
    }
  }, [])
}
