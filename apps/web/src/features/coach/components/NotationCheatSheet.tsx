import type { FaceCode } from '@packages/cube-engine'

const FACES: { code: FaceCode; name: string }[] = [
  { code: 'U', name: 'Haut' },
  { code: 'D', name: 'Bas' },
  { code: 'F', name: 'Avant' },
  { code: 'B', name: 'Arrière' },
  { code: 'L', name: 'Gauche' },
  { code: 'R', name: 'Droite' }
]

// A collapsible notation reminder available in every lesson (D-NOTATION): the six
// face letters and what `'` and `2` mean. Folded by default so it never crowds
// the player; one tap to refresh your memory.
export const NotationCheatSheet = () => (
  <details className='bg-base-200 rounded-box group text-sm'>
    <summary className='text-cube-green-text flex cursor-pointer items-center gap-2 px-3 py-2 font-semibold select-none'>
      <span className='transition-transform group-open:rotate-90' aria-hidden='true'>
        ▸
      </span>
      Aide-mémoire des coups
    </summary>

    <div className='flex flex-col gap-3 px-3 pb-3'>
      <ul className='grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3'>
        {FACES.map(face => (
          <li key={face.code} className='flex items-center gap-2'>
            <kbd className='kbd kbd-sm font-mono'>{face.code}</kbd>
            <span className='text-base-content/80'>{face.name}</span>
          </li>
        ))}
      </ul>

      <ul className='text-base-content/80 flex flex-col gap-1'>
        <li className='flex items-center gap-2'>
          <kbd className='kbd kbd-sm font-mono'>R</kbd>
          <span>un quart de tour horaire de la face</span>
        </li>
        <li className='flex items-center gap-2'>
          <kbd className='kbd kbd-sm font-mono'>R&apos;</kbd>
          <span>le sens inverse (anti-horaire)</span>
        </li>
        <li className='flex items-center gap-2'>
          <kbd className='kbd kbd-sm font-mono'>R2</kbd>
          <span>un demi-tour</span>
        </li>
      </ul>
    </div>
  </details>
)
