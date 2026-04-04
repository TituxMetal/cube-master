export const formatTime = (ms: number): string => {
  const totalCentiseconds = Math.floor(ms / 10)
  const centiseconds = totalCentiseconds % 100
  const totalSeconds = Math.floor(totalCentiseconds / 100)
  const seconds = totalSeconds % 60
  const minutes = Math.floor(totalSeconds / 60)

  const cc = String(centiseconds).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')

  return `${minutes}:${ss}.${cc}`
}
