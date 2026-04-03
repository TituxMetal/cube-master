import type { ColorCode } from '@packages/cube-engine'

export const stickerClassByColor: Record<ColorCode, string> = {
  Wt: 'bg-cube-white',
  Yl: 'bg-cube-yellow',
  Rd: 'bg-cube-red',
  Og: 'bg-cube-orange',
  Bl: 'bg-cube-blue',
  Gn: 'bg-cube-green'
} as const

export const colorNameByCode: Record<ColorCode, string> = {
  Wt: 'white',
  Yl: 'yellow',
  Rd: 'red',
  Og: 'orange',
  Bl: 'blue',
  Gn: 'green'
} as const
