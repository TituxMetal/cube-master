import type { FaceCode, MoveToken } from '@packages/cube-engine'

// The face a move token turns, and which way. A token is a face letter optionally
// followed by `'` (counter-clockwise) or `2` (half turn) — e.g. R, R', D2.
export const moveFace = (move: MoveToken): FaceCode => move[0] as FaceCode

type Turn = 'cw' | 'ccw' | 'half'

const moveTurn = (move: MoveToken): Turn =>
  move.endsWith('2') ? 'half' : move.endsWith("'") ? 'ccw' : 'cw'

const turnLabel: Record<Turn, string> = {
  cw: 'clockwise',
  ccw: 'counter-clockwise',
  half: 'half turn'
}

// A rotation-direction overlay drawn on top of the face a move turns. SVG only,
// no dependency — a curved arrow (mirrored for counter-clockwise) plus a small
// "2" badge for half turns. Consumed by the shared CubeNet and the Solver's
// interactive net so both teach which way the face goes (closes issue #7).
export const MoveArrow = ({ move }: { move: MoveToken }) => {
  const turn = moveTurn(move)
  const flip = turn === 'ccw'

  return (
    <span
      className='pointer-events-none absolute inset-0 z-10 grid place-items-center'
      aria-label={`turn ${move} ${turnLabel[turn]}`}
    >
      <svg
        viewBox='0 0 24 24'
        className='text-cube-green-text size-3/5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
        fill='none'
        stroke='currentColor'
        strokeWidth='2.5'
        strokeLinecap='round'
        strokeLinejoin='round'
        style={flip ? { transform: 'scaleX(-1)' } : undefined}
        role='img'
      >
        <path d='M5 12a7 7 0 1 1 2.7 5.5' />
        <path d='M4 18l1-5 5 1' />
      </svg>
      {turn === 'half' && (
        <span className='text-cube-green-text absolute right-1 bottom-0 text-xs font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'>
          2
        </span>
      )}
    </span>
  )
}
