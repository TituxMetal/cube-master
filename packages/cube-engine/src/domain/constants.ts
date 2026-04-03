export const Color = {
  White: 'Wt',
  Yellow: 'Yl',
  Red: 'Rd',
  Orange: 'Og',
  Blue: 'Bl',
  Green: 'Gn'
} as const

export const Face = {
  Up: 'U',
  Down: 'D',
  Front: 'F',
  Back: 'B',
  Left: 'L',
  Right: 'R'
} as const

export const CornerPosition = {
  UFR: Face.Up + Face.Front + Face.Right,
  URB: Face.Up + Face.Right + Face.Back,
  UBL: Face.Up + Face.Back + Face.Left,
  ULF: Face.Up + Face.Left + Face.Front,
  DFR: Face.Down + Face.Front + Face.Right,
  DRB: Face.Down + Face.Right + Face.Back,
  DBL: Face.Down + Face.Back + Face.Left,
  DLF: Face.Down + Face.Left + Face.Front
} as const

export const EdgePosition = {
  UF: Face.Up + Face.Front,
  UR: Face.Up + Face.Right,
  UB: Face.Up + Face.Back,
  UL: Face.Up + Face.Left,
  DF: Face.Down + Face.Front,
  DR: Face.Down + Face.Right,
  DB: Face.Down + Face.Back,
  DL: Face.Down + Face.Left,
  FR: Face.Front + Face.Right,
  FL: Face.Front + Face.Left,
  BR: Face.Back + Face.Right,
  BL: Face.Back + Face.Left
} as const
