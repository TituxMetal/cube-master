import type { Lesson } from './types'

// White Cross — the first chapter. The cross is solved intuitively, with no
// algorithm to memorize, so this lesson is understand-only: it teaches the goal
// and the way of thinking, then hands the learner off to the first real
// algorithm in White Corners. (No catalog id — there is no named white-cross
// sequence; never inline moves, per NFR-004.)
export const whiteCross: Lesson = {
  id: 'white-cross',
  title: 'White Cross',
  method: 'beginner',
  order: 1,
  steps: [
    {
      kind: 'understand',
      title: 'Where every solve begins',
      body: 'Welcome — this is your very first step. You are going to build a white cross on the top face: the four white edge pieces, each lined up with its matching centre. Good news to start with: there is no algorithm to memorize here. You solve the cross by looking at the cube and thinking, and that is a skill that pays off for the rest of the solve.'
    },
    {
      kind: 'understand',
      title: 'Find a white edge',
      body: 'Look around the cube for a piece with white on it that is an edge — an edge has exactly two colours. Ignore the corners for now. Pick any white edge you can see; you will bring them home one at a time, in any order you like.'
    },
    {
      kind: 'understand',
      title: 'Match the side colour first',
      body: 'Each white edge has a second colour. That second colour tells the piece where it belongs: under the centre of the same colour. So a white-and-red edge lives next to the red centre. Line the piece up with its centre on the side, then fold it up onto the top so the white sits next to the white centre. Matching the side colour first is the whole trick — do that and the cross is correct, not just white.'
    },
    {
      kind: 'understand',
      title: 'Repeat for all four',
      body: 'Do the same for the other three white edges. Take your time and check each one: white on top, side colour matched to its centre. When all four are home you will see a clean white cross with a matching band of colour around the top edge. That is your foundation — now you are ready for your first algorithm.'
    }
  ]
}
