# Coach lesson player animates the cube but never shows the algorithm notation

**Date:** 2026-06-13 **Area:** web

_Backfilled 2026-06-14 from commit `13a2d29`._

## Symptom

In the Coach lesson player, demo and practice steps animated the CubeNet but never displayed the
move sequence (`R`, `D`, `R′` …). The learner watched the cube move but never saw the algorithm the
chapter is teaching — the core lesson content was absent from the view.

## Root cause

The player rendered the demo frame (CubeNet) but had no component surfacing the step's moves as
notation. Animating the cube is not the same as teaching the algorithm: the textual sequence is the
lesson, and the view layer simply omitted it. The data was available in the store
(`$currentStepMoves`); nothing rendered it.

## Fix

Add a `MoveSequence` component (kbd-styled tokens, current move highlighted in the signature green,
mirroring the Solver's move display), wire it into `LessonPlayer`, and expose `useCurrentStepMoves`
from the store. Commit `13a2d29`.

## Prevention

`LessonPlayer.spec.tsx` asserts the algorithm notation renders
(`getByLabelText('Algorithm notation')`), not only that a cube is drawn. Any step kind that teaches
a sequence must show it as notation — a demoable cube alone does not satisfy the "every algorithm is
shown" contract.
