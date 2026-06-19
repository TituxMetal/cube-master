import type { FaceCode, MoveToken } from '@packages/cube-engine'

// The face a move token turns, and which way. A token is a face letter optionally
// followed by `'` (counter-clockwise) or `2` (half turn) — e.g. R, R', D2.
export const moveFace = (move: MoveToken): FaceCode => move[0] as FaceCode

export type Turn = 'cw' | 'ccw' | 'half'

export const moveTurn = (move: MoveToken): Turn =>
  move.endsWith('2') ? 'half' : move.endsWith("'") ? 'ccw' : 'cw'

const turnLabel: Record<Turn, string> = {
  cw: 'sens horaire',
  ccw: 'sens anti-horaire',
  half: 'demi-tour'
}

// A face turn carries a *band* of stickers across its four neighbouring faces —
// that band is what reads as motion on the flat net, the way ruwix shows it. The
// turning face's own stickers rotate in place (they get the curved RotationArrow,
// not per-sticker arrows). For each move, these are the neighbour strips that
// cycle and the on-net travel direction (clockwise variant; 0 = up, 90 = right,
// 180 = down, 270 = left). Cycle order follows the engine's MOVE_TABLES edge
// cycles; verified against ruwix: F/B wrap the cross centre four ways, U/D
// translate the horizontal band, R/L translate the vertical U-F-D band with B as
// the seam.
type BandStrip = { face: FaceCode; indices: readonly number[]; cw: number }

const MOVE_BANDS: Record<FaceCode, readonly BandStrip[]> = {
  F: [
    { face: 'U', indices: [6, 7, 8], cw: 90 },
    { face: 'R', indices: [0, 3, 6], cw: 180 },
    { face: 'D', indices: [0, 1, 2], cw: 270 },
    { face: 'L', indices: [2, 5, 8], cw: 0 }
  ],
  B: [
    { face: 'U', indices: [0, 1, 2], cw: 270 },
    { face: 'L', indices: [0, 3, 6], cw: 180 },
    { face: 'D', indices: [6, 7, 8], cw: 90 },
    { face: 'R', indices: [2, 5, 8], cw: 0 }
  ],
  U: [
    { face: 'L', indices: [0, 1, 2], cw: 270 },
    { face: 'F', indices: [0, 1, 2], cw: 270 },
    { face: 'R', indices: [0, 1, 2], cw: 270 },
    { face: 'B', indices: [0, 1, 2], cw: 270 }
  ],
  D: [
    { face: 'L', indices: [6, 7, 8], cw: 90 },
    { face: 'F', indices: [6, 7, 8], cw: 90 },
    { face: 'R', indices: [6, 7, 8], cw: 90 },
    { face: 'B', indices: [6, 7, 8], cw: 90 }
  ],
  R: [
    { face: 'U', indices: [2, 5, 8], cw: 0 },
    { face: 'F', indices: [2, 5, 8], cw: 0 },
    { face: 'D', indices: [2, 5, 8], cw: 0 },
    { face: 'B', indices: [0, 3, 6], cw: 180 }
  ],
  L: [
    { face: 'U', indices: [0, 3, 6], cw: 180 },
    { face: 'F', indices: [0, 3, 6], cw: 180 },
    { face: 'D', indices: [0, 3, 6], cw: 180 },
    { face: 'B', indices: [2, 5, 8], cw: 0 }
  ]
}

const turnedAngle = (cw: number, turn: Turn): number => (turn === 'ccw' ? (cw + 180) % 360 : cw)

// What a single face draws for the active move: either it IS the turning face (a
// curved rotation arrow, no per-sticker arrows), or it carries part of the band
// (a per-sticker travel arrow on its cycling strip, keyed by sticker index). A
// half turn keeps the clockwise band direction — the move badge ("R2") carries
// the "twice"; drawing nothing is what made double moves look arrow-less.
export type FaceArrows = { rotation: Turn | null; cells: Record<number, number> }

export const faceArrows = (move: MoveToken, faceLabel: FaceCode): FaceArrows => {
  const turn = moveTurn(move)
  if (moveFace(move) === faceLabel) return { rotation: turn, cells: {} }

  const cells: Record<number, number> = {}
  for (const strip of MOVE_BANDS[moveFace(move)]) {
    if (strip.face !== faceLabel) continue
    for (const index of strip.indices) cells[index] = turnedAngle(strip.cw, turn)
  }
  return { rotation: null, cells }
}

// A clean solid triangle drawn over one sticker, pointing the way that sticker
// travels (the ruwix per-sticker cue). Filled with a darker shade of the sticker's
// own colour (arrowFillByColor) so it reads crisply on any colour with no outline.
// Falls back to a neutral grey when no fill is supplied.
export const CellArrow = ({ angle, fill = '#333333' }: { angle: number; fill?: string }) => (
  <span
    data-cell-arrow=''
    className='pointer-events-none absolute inset-0 grid place-items-center'
    aria-hidden='true'
  >
    <svg viewBox='0 0 24 24' className='size-2/3' style={{ transform: `rotate(${angle}deg)` }}>
      <path
        d='M12 5 L20 19 L4 19 Z'
        fill={fill}
        stroke={fill}
        strokeWidth='1.2'
        strokeLinejoin='round'
      />
    </svg>
  </span>
)

// The solid clockwise rotation arrow at the centre of the turning face (ruwix's
// "spin this face" cue): a filled ~290° circular band closing onto a clean
// arrowhead, dark with a thin white outline so it reads over any sticker colour
// (no drop shadow). Mirrored horizontally for a counter-clockwise turn; a half
// turn keeps the clockwise arc (the move badge carries the "twice").
const ROTATION_PATH =
  'M31.1 77.0 A33 33 0 1 1 68.9 77.0 L73.5 83.6 L56.2 76.8 L58.0 61.5 L62.6 68.0 A22 22 0 1 0 37.4 68.0 Z'

export const RotationArrow = ({ turn }: { turn: Turn }) => (
  <span
    data-rotation-arrow=''
    className='pointer-events-none absolute inset-0 grid place-items-center'
    aria-hidden='true'
  >
    <svg
      viewBox='0 0 100 100'
      className='size-3/5'
      style={turn === 'ccw' ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path
        d={ROTATION_PATH}
        fill='#141414'
        stroke='white'
        strokeWidth='3.5'
        strokeLinejoin='round'
      />
    </svg>
  </span>
)

// The move label pinned to the cube net's corner — the move being played, like
// ruwix's "F" / "B2". The primary "what am I turning" cue.
export const MoveBadge = ({ move }: { move: MoveToken }) => (
  <span
    className='bg-cube-green text-cube-green-content ring-base-content/15 absolute right-2 bottom-2 z-20 rounded-md px-3 py-1 font-mono text-2xl font-bold ring-1'
    aria-label={`coup ${move}, ${turnLabel[moveTurn(move)]}`}
  >
    {move}
  </span>
)
