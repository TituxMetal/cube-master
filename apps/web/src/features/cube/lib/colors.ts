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

// A darker shade of each sticker colour, used to fill the per-sticker move arrows.
// This is ruwix's trick: a triangle drawn in a deeper tone of its own sticker reads
// crisply on every colour — no white/black outline needed, and never the muddy
// low-contrast result of one fixed arrow colour over six backgrounds.
export const arrowFillByColor: Record<ColorCode, string> = {
  Wt: '#565656',
  Yl: '#6d5e00',
  Rd: '#6f1414',
  Og: '#7a3c08',
  Bl: '#142a6e',
  Gn: '#155b2c'
} as const
