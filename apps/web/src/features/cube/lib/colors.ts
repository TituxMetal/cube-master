import type { ColorCode, FaceCode } from '@packages/cube-engine'

export const faceNameByCode: Record<FaceCode, string> = {
  U: 'Up',
  D: 'Down',
  F: 'Front',
  B: 'Back',
  L: 'Left',
  R: 'Right'
} as const

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
