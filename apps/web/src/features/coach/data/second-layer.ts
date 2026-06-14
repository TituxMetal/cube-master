import type { Lesson } from './types'

// Second Layer — the proof-slice chapter. Demos reference the catalog inserts by
// id (second-layer-insert-{right,left}); practice scrambles one case to solve.
export const secondLayer: Lesson = {
  id: 'second-layer',
  title: 'Second Layer',
  method: 'beginner',
  order: 3,
  steps: [
    {
      kind: 'understand',
      title: 'Meet the middle layer',
      body: 'Nice work — your white face is done and the corners are home. Now you fill the middle layer: the four edge pieces that sit between the top and bottom rows. You already have everything you need; this chapter is really just two mirror-image moves.'
    },
    {
      kind: 'understand',
      title: 'Why our moves look different',
      body: 'One heads-up before we start. Most YouTube tutorials solve with white on top and turn the U (up) face. We keep the solved white face on the top and turn D (down) instead. The shapes are identical — only the letter changes — so follow the moves shown here on the cube and you will not get lost.'
    },
    {
      kind: 'demo',
      title: 'Send an edge to the right',
      body: 'When the edge you want belongs in the slot to your lower-right, line it up under its matching centre and run this sequence. Watch it drop into place without disturbing the white face.',
      algorithmId: 'second-layer-insert-right'
    },
    {
      kind: 'understand',
      title: 'The mirror for the left',
      body: 'The left slot works exactly the same way, just mirrored. Where the right insert reached out with R, the left insert reaches out with F. If you can do one, you already know the other.'
    },
    {
      kind: 'demo',
      title: 'Send an edge to the left',
      body: 'Same idea, mirrored. Line the edge up under its centre and run the left insert. Notice how it mirrors the move you just learned.',
      algorithmId: 'second-layer-insert-left'
    },
    {
      kind: 'practice',
      title: 'Your turn — insert the edge',
      body: 'Here is a cube with one middle-layer edge waiting in the bottom row. Step through the right insert and watch the cube return to solved. When it clicks back together, you have got it.',
      algorithmId: 'second-layer-insert-right'
    }
  ]
}
