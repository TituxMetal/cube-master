import type { Lesson } from './types'

// White Corners — the second chapter and the first to use a real algorithm: the
// sexy move (R′ D′ R D). It is the foundational trigger reused across the whole
// journey, so this chapter also introduces notation. Demo plays sexy forward
// from solved; practice scrambles one corner case back to solved (D6 / D4).
export const whiteCorners: Lesson = {
  id: 'white-corners',
  title: 'White Corners',
  method: 'beginner',
  order: 2,
  steps: [
    {
      kind: 'understand',
      title: 'Finish the first layer',
      body: 'Your white cross is done. Now you drop in the four white corners to complete the entire first layer. Each corner has three colours, and it belongs in the spot where those three colours meet. Unlike the cross, you have one short algorithm to lean on here — and it is the most important one in the whole method.'
    },
    {
      kind: 'understand',
      title: 'Meet the sexy move',
      body: 'This sequence is called the sexy move: R′ D′ R D. You will reuse it constantly, so it is worth getting comfortable now. Position a white corner in the bottom layer directly below where it needs to go, then run the sexy move once, twice, or three times — until that corner pops up into place with white on top. That is the entire idea.'
    },
    {
      kind: 'understand',
      title: 'Why our moves look different',
      body: 'A quick heads-up about notation, since this is your first algorithm. Most YouTube tutorials keep white on top and turn the U (up) face. We keep the solved white face on top and turn D (down) instead. The hand shapes are identical — only the letter changes — so just follow the moves shown here and you will stay in sync.'
    },
    {
      kind: 'demo',
      title: 'Watch the sexy move work',
      body: 'Here is the sexy move on a solved cube so you can see exactly what it does to the bottom-right corner. Watch how the piece gets lifted out and cycled back. Run it three times in a row and the cube returns to where it started — proof that it only shuffles, never breaks, the layer.',
      algorithmId: 'sexy-move'
    },
    {
      kind: 'practice',
      title: 'Your turn — seat the corner',
      body: 'Here is a cube with one white corner waiting in the bottom layer. Step through the sexy move and watch the corner drop home as the cube returns to solved. When it clicks back together, you have got your foundational move down.',
      algorithmId: 'sexy-move'
    }
  ]
}
