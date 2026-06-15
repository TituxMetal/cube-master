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

// The direction each outer sticker travels on a clockwise quarter turn, as a CSS
// rotation (deg, 0 = up) for an up-pointing arrow. The face spins, so its eight
// outer stickers flow around the ring — drawing a small arrow on each makes the
// turn legible at a glance (the ruwix approach). Centre (4) never moves.
const CW_CELL_ANGLE: Record<number, number> = {
  0: 90,
  1: 90,
  2: 180,
  3: 0,
  5: 180,
  6: 0,
  7: 270,
  8: 270
}

// The arrow angle for a given outer cell and turn, or null when no per-cell arrow
// is drawn (the centre, or a half turn where a single direction would mislead).
export const cellArrowAngle = (index: number, turn: Turn): number | null => {
  if (turn === 'half' || index === 4) return null
  const cw = CW_CELL_ANGLE[index]
  if (cw === undefined) return null
  return turn === 'ccw' ? (cw + 180) % 360 : cw
}

// A small high-contrast arrow drawn over one sticker, pointing the way that
// sticker travels. White fill + dark outline so it reads on any colour.
export const CellArrow = ({ angle }: { angle: number }) => (
  <span
    data-cell-arrow=''
    className='pointer-events-none absolute inset-0 grid place-items-center'
    aria-hidden='true'
  >
    <svg
      viewBox='0 0 24 24'
      className='size-3/5 text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.95)]'
      fill='none'
      stroke='currentColor'
      strokeWidth='3.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      style={{ transform: `rotate(${angle}deg)` }}
    >
      <path d='M12 5 L12 19 M6 11 L12 5 L18 11' />
    </svg>
  </span>
)

// The big, unmissable move label pinned to the cube net's corner — the move being
// played, like ruwix's "F" / "B2". This is the primary "what am I turning" cue.
export const MoveBadge = ({ move }: { move: MoveToken }) => (
  <span
    className='bg-cube-green text-cube-green-content absolute right-2 bottom-2 z-20 rounded-md px-3 py-1 font-mono text-2xl font-bold shadow-lg'
    aria-label={`coup ${move}, ${turnLabel[moveTurn(move)]}`}
  >
    {move}
  </span>
)
