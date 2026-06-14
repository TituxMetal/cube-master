# D-face stickers rendered in the wrong positions (front/back rows swapped)

**Date:** 2026-04-06 **Area:** cube-engine

_Backfilled 2026-06-14 from commit `ef6b581` — captured retroactively so the next `stickerMapping`
edit is a lookup, not a re-investigation._

## Symptom

The Down face of the rendered cube net did not match the actual cube state. Pieces that belonged on
the front row of D showed on the back row and vice versa — `toStickers` produced a D face that
looked rotated/mirrored versus the real state, even though every other face was correct.

## Root cause

In `packages/cube-engine/src/domain/geometry.ts`, the `stickerMapping.D` index→piece table had the
**front row (indices 0–2) and back row (6–8) swapped**. The D face is viewed from _below_, so its
row order is the reverse of the naive top-down assumption used for U. Indices 0–2 must map to the
front pieces (`DLF` / `DF` / `DFR`), not the back pieces (`DBL` / `DB` / `DRB`). The mapping had
them inverted.

## Fix

Swap the 0–2 and 6–8 entries in `stickerMapping.D` so the front row maps to `DLF / DF / DFR` and the
back row to `DBL / DB / DRB`; update the D-face assertions in `toStickers.spec.ts`. Commit
`ef6b581`.

## Prevention

`toStickers.spec.ts` asserts D-face sticker positions against a known state — any re-swap reddens
it. When adding or editing a face in `stickerMapping`, derive the row order from the **viewing
direction** (U and D are viewed from opposite ends), not by analogy to U.
