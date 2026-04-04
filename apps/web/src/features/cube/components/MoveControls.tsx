import type { BaseFace, MoveToken } from '@packages/cube-engine'

interface FaceGroup {
  face: BaseFace
  label: string
  borderClass: string
  moves: readonly [MoveToken, MoveToken, MoveToken]
}

const FACE_GROUPS: readonly FaceGroup[] = [
  { face: 'U', label: 'Up', borderClass: 'border-l-cube-white', moves: ['U', "U'", 'U2'] },
  { face: 'D', label: 'Down', borderClass: 'border-l-cube-yellow', moves: ['D', "D'", 'D2'] },
  { face: 'F', label: 'Front', borderClass: 'border-l-cube-green', moves: ['F', "F'", 'F2'] },
  { face: 'B', label: 'Back', borderClass: 'border-l-cube-blue', moves: ['B', "B'", 'B2'] },
  { face: 'L', label: 'Left', borderClass: 'border-l-cube-orange', moves: ['L', "L'", 'L2'] },
  { face: 'R', label: 'Right', borderClass: 'border-l-cube-red', moves: ['R', "R'", 'R2'] }
]

interface MoveControlsProps {
  onMove: (move: MoveToken) => void
}

export const MoveControls = ({ onMove }: MoveControlsProps) => (
  <section aria-label='Move controls'>
    <ul className='flex flex-col gap-2'>
      {FACE_GROUPS.map(group => (
        <li
          key={group.face}
          className={`bg-base-300 flex gap-2 rounded-lg border-l-4 p-2 md:gap-3 md:p-3 ${group.borderClass}`}
          aria-label={`${group.label} face moves`}
        >
          {group.moves.map(move => (
            <button
              key={move}
              className='btn btn-sm bg-base-100 hover:bg-base-200 md:btn-md flex-1 cursor-pointer font-mono transition-all active:scale-95'
              onClick={() => onMove(move)}
            >
              {move}
            </button>
          ))}
        </li>
      ))}
    </ul>
  </section>
)
