import { ColorPalette } from '~/features/solver/components/ColorPalette'
import { InteractiveCubeNet } from '~/features/solver/components/InteractiveCubeNet'
import {
  paintSticker,
  resetInput,
  scrambleInput,
  selectColor,
  useInputStickers,
  useSelectedColor,
  useValidationResult
} from '~/features/solver/stores'

export const Solver = () => {
  const stickers = useInputStickers()
  const selectedColor = useSelectedColor()
  const validation = useValidationResult()

  const isSolved =
    validation.ok && Object.values(stickers).every(face => face.every(c => c === face[4]))

  const canSolve = validation.ok && !isSolved

  return (
    <section className='flex flex-col gap-6' aria-label='Solver'>
      <header>
        <h1 className='text-cube-blue-text text-2xl font-bold'>Solver</h1>
        <p className='text-base-content/60 mt-1 text-sm'>
          Paint your cube state, then solve it step by step
        </p>
      </header>

      <ColorPalette selectedColor={selectedColor} onSelectColor={selectColor} />

      <InteractiveCubeNet
        stickers={stickers}
        onPaintSticker={(face, index) => paintSticker(face, index, selectedColor)}
      />

      <div className='min-h-8' aria-live='polite'>
        {validation.ok ? (
          isSolved ? (
            <p className='text-base-content/60 text-sm'>Cube is already solved</p>
          ) : (
            <p className='text-success text-sm'>Valid cube state</p>
          )
        ) : (
          <ul className='text-error list-disc pl-5 text-sm'>
            {validation.errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        )}
      </div>

      <nav className='flex items-center gap-4' aria-label='Solver actions'>
        <button type='button' className='btn btn-soft cursor-pointer' onClick={resetInput}>
          Reset
        </button>
        <button type='button' className='btn btn-soft cursor-pointer' onClick={scrambleInput}>
          Scramble
        </button>
        <button
          type='button'
          className='btn btn-primary ml-auto cursor-pointer'
          disabled={!canSolve}
        >
          Solve
        </button>
      </nav>
    </section>
  )
}
