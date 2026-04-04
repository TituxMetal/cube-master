import { describe, expect, it } from 'bun:test'

import { formatTime } from '~/features/timer/lib/formatTime'

describe('formatTime', () => {
  it('should format zero as 0:00.00', () => {
    expect(formatTime(0)).toBe('0:00.00')
  })

  it('should format sub-second values', () => {
    expect(formatTime(450)).toBe('0:00.45')
  })

  it('should format sub-minute values', () => {
    expect(formatTime(45670)).toBe('0:45.67')
  })

  it('should format values over one minute', () => {
    expect(formatTime(83450)).toBe('1:23.45')
  })

  it('should format values over ten minutes', () => {
    expect(formatTime(623450)).toBe('10:23.45')
  })

  it('should floor centiseconds rather than rounding', () => {
    expect(formatTime(999)).toBe('0:00.99')
    expect(formatTime(9)).toBe('0:00.00')
    expect(formatTime(15)).toBe('0:00.01')
  })
})
