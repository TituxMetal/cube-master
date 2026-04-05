# Feature Shape: Solver Mode

## Problem

CubeMaster has a working cube engine and a timer, but no way to actually solve a cube. A user who's
stuck mid-solve — or just learning — needs to input their cube's current state and get a
step-by-step solution they can follow. Without the solver, the app is a playground and a stopwatch,
not a genuine learning tool.

## Solution (Broad Strokes)

A full solver experience on the `/solver` route:

- The user inputs their cube state by clicking stickers on a 2D net to cycle colors
- The system validates the input in real-time (correct color counts, solvable configuration)
- On "Solve", the engine computes a layer-by-layer solution (beginner method, ~40-100 moves)
- The solution is displayed as labeled phases (White Cross, White Corners, etc.)
- The user navigates through the solution step by step, watching the cube update at each move
- A "Reset" button clears the input back to a solved state

The solver algorithm lives in `cube-engine` as a pure use case — no UI dependencies, fully testable.

## User Flow

1. User navigates to `/solver` → sees an interactive CubeNet in solved state, with a color palette
2. User clicks a color in the palette to select it, then clicks stickers on the net to paint them
3. As the user paints, validation feedback appears (e.g., "Too many red stickers", "Invalid corner")
4. Once all 54 stickers are set and valid, the "Solve" button becomes active
5. User clicks "Solve" → engine computes solution, UI transitions to solution view
6. Solution view shows: the cube net (reflecting current step), a phase list, and move controls
7. User clicks "Next" to advance one move — the cube updates, the current move is highlighted
8. User can click "Previous" to go back, or jump to a phase by clicking its header
9. At the end of the solution, the cube shows the solved state
10. User can click "New solve" to return to the input view

## Dependencies

**Requires:**

- `CubeState`, `applyMove`, `applyMoves`, `toStickers` from cube-engine (done)
- All 18 face moves working correctly with orientation tracking (done)
- `/solver` route already wired in the router (done, currently shows "Coming soon")
- CubeNet and FaceGrid components (done — need interactive variant for input)
- DaisyUI component classes: `steps`, `btn`, `badge`, `kbd` (available)

**Enables:**

- Coach mode practice (reuses solver to verify user solutions)
- Coach mode demos (uses solver steps to demonstrate algorithms)
- Future optimal solver (Kociemba) can replace the algorithm while keeping the same UI

## What Must Exist (Engine)

### Cube state validation

A function that checks whether a given cube state is solvable:

- Exactly 9 stickers of each color
- All corner pieces exist (valid 3-color combinations in correct chirality)
- All edge pieces exist (valid 2-color combinations)
- Corner orientation sum is divisible by 3
- Edge orientation sum is divisible by 2
- Permutation parity of corners equals permutation parity of edges

Returns either "valid" or a list of specific errors the user can understand.

### Layer-by-layer solver algorithm

A function that takes a valid `CubeState` and returns a solution organized by phases:

**Phase 1 — White Cross:** Position and orient 4 white edge pieces on the U face so each edge's side
color matches the adjacent center.

**Phase 2 — White Corners:** Position and orient 4 white corner pieces on the U face using insertion
algorithms (R' D' R D variants).

**Phase 3 — Second Layer Edges:** Insert 4 middle-layer edge pieces using the "URU'R'U'F'UF" and
mirror algorithm, without disturbing the white layer.

**Phase 4 — Yellow Cross:** Orient yellow edge stickers on the D face using F R U R' U' F' (dot → L
→ line → cross progression).

**Phase 5 — Yellow Edges:** Permute yellow edges to match center colors using R U R' U R U2 R'
(cycle 3 edges).

**Phase 6 — Yellow Corners Position:** Place yellow corners in correct positions (not necessarily
oriented) using U R U' L' U R' U' L (corner 3-cycle).

**Phase 7 — Yellow Corners Orientation:** Orient yellow corners in place using R' D' R D repeated,
with D-layer rotation between corners.

Each phase returns its moves as `MoveToken[]`. The full solution is the concatenation of all phases.

### Move inverse utility

A utility to compute the inverse of a move sequence (needed for "previous step" navigation):

- `invertMove(move: MoveToken): MoveToken` — e.g., R → R', U2 → U2
- `invertMoves(moves: MoveToken[]): MoveToken[]` — reverse and invert each

## What Must Exist (Frontend)

### Pages / Routes

- Solver page replacing the "Coming soon" placeholder at `/solver`
- Two views within the page: **Input view** and **Solution view**

### State Management

- Solver store (nanostores): input cube state, validation errors, solution data, current step index
- Derived state: current cube state at step N (solved state + apply first N moves of solution)

### Components

- **Interactive CubeNet:** the existing CubeNet but with clickable stickers — clicking a sticker
  paints it with the currently selected color from the palette
- **Color Palette:** 6 color swatches to select the active painting color, shown alongside the net
- **Validation Feedback:** real-time error messages as the user paints (inline, not modal)
- **Solve Button:** disabled until the state is valid, triggers computation
- **Phase List:** vertical list of the 7 solver phases with move counts, expandable to show moves
- **Step Controls:** Previous / Next buttons to walk through the solution one move at a time
- **Move Indicator:** highlights the current move in the phase list and shows the move notation
  prominently
- **Progress indicator:** shows which phase the user is in and how far along (e.g., "Phase 3 — Move
  4/12")

### User Interactions

- Click color swatch → select active color
- Click sticker on net → paint with active color
- Right-click sticker → cycle to previous color (convenience)
- "Solve" button → compute and display solution
- "Reset" button → clear to solved state
- Next/Previous buttons → step through solution
- Click phase header → jump to start of that phase
- "New solve" → return to input view

## UI Reference

### Visual Target

Similar to [cube-solver.com](https://rubiks-cube-solver.com/) in concept — 2D net input with color
palette, then step-by-step solution display. But with CubeMaster's dark rubiks theme, colored
section accents, and geometric precision aesthetic.

### Layout & Structure

**Input View:**

```text
┌─────────────────────────────────────┐
│  Color Palette (6 swatches, row)    │
├─────────────────────────────────────┤
│                                     │
│         Interactive CubeNet         │
│         (click to paint)            │
│                                     │
├─────────────────────────────────────┤
│  Validation Feedback (if errors)    │
├─────────────────────────────────────┤
│  [Reset]              [Solve ▶]     │
└─────────────────────────────────────┘
```

**Solution View:**

```text
┌─────────────────────────────────────┐
│  Progress: Phase 3 — Move 4/12     │
├──────────────────┬──────────────────┤
│                  │  Phase List      │
│   CubeNet        │  ┌ 1. White ✓  │
│   (current step) │  ├ 2. White ✓  │
│                  │  ├ 3. Second ◀ │
│                  │  ├ 4. Yellow    │
│                  │  ├ 5. Yellow    │
│                  │  ├ 6. Yellow    │
│                  │  └ 7. Yellow    │
├──────────────────┴──────────────────┤
│  Current Move: R U R' U'           │
│  [◀ Previous]  Step 14/67  [Next ▶]│
├─────────────────────────────────────┤
│  [New Solve]                        │
└─────────────────────────────────────┘
```

### UI Components & Patterns

- **Color Palette:** row of 6 circular swatches using `bg-cube-*` colors, selected swatch has a
  ring/border indicator
- **Interactive stickers:** same square style as FaceGrid but with `cursor-pointer` and hover
  effect, onClick paints color
- **Validation:** inline text below the net, using `text-error` for errors, `text-success` when
  valid
- **Phase List:** vertical `steps` or styled list with checkmarks for completed phases, arrow for
  current phase
- **Step Controls:** `btn` group with Previous/Next, disabled at boundaries
- **Move display:** large `kbd` badge showing current move notation
- **Progress:** `badge` or text showing "Phase N — Move X/Y"

### States

- **Input — Empty:** solved cube, no colors changed yet, "Paint your cube" hint
- **Input — Painting:** some stickers changed, validation feedback visible
- **Input — Valid:** all stickers set correctly, Solve button enabled, success indicator
- **Input — Invalid:** validation errors shown, Solve button disabled
- **Solution — Viewing:** cube at step N, phase list with progress, step controls active
- **Solution — Complete:** cube is solved, "Solved!" message, "New Solve" button prominent

### Design Tokens

- Solver mode signature color: `cube-blue` / `cube-blue-text` for accents (matches nav tab)
- Input view surfaces: `bg-cube-blue/30` for the net area (consistent with timer's colored sections)
- Solution view: `bg-cube-blue/30` for phase list, `bg-cube-red/30` for cube display area
- Validation errors: `text-error`
- Validation success: `text-success`
- Step controls: `btn-primary` for Next (primary action), `btn-soft` for Previous
- Phase complete: `text-success` with checkmark
- Current phase: `text-cube-blue-text` with arrow indicator
- Move notation: `kbd` styling, large font

### Responsiveness

- **Desktop (lg+):** CubeNet and Phase List side by side in solution view
- **Tablet (md):** same layout, tighter spacing
- **Mobile (sm):** everything stacks vertically — CubeNet on top, phase list below, step controls
  fixed at bottom for easy thumb access. Color palette wraps to 2 rows if needed.

## Open Questions

1. Should the input start as a solved cube or as an empty/grey state that the user must fill in?
2. Should there be a "Scramble" button in the solver input to quickly test with a random state?
3. Should completed phases auto-collapse in the solution view to save vertical space?
4. Should the solution view show the total move count in the header?
5. How should the cube orientation be handled — should U always be white, or should the solver
   detect the orientation from the input?

## Out of Scope

- Kociemba two-phase optimal solver — far more complex, v2 feature
- 3D cube visualization — defer, 2D net is sufficient for MVP
- Move animation (smooth rotation transitions) — defer to polish phase
- Alternative solving methods (CFOP, Roux) — only beginner layer-by-layer for MVP
- Solution optimization (removing redundant moves) — nice-to-have, not MVP
- Cube state OCR (scanning a photo of the cube) — future feature
- Undo/redo in the input view — simple reset is sufficient

## Risks / Gotchas

- **Solver algorithm complexity:** The layer-by-layer solver has many case-specific algorithms
  (especially white cross edge insertion has ~12 cases). Each phase needs careful implementation and
  extensive testing. This is the single largest piece of logic in the entire MVP.
- **Cube state validation:** Detecting truly unsolvable states requires checking permutation parity
  and orientation sums — not just color counts. An invalid state that passes basic checks would
  cause the solver to loop infinitely.
- **Orientation conventions:** The engine uses specific orientation numbering (0/1/2 for corners,
  0/1 for edges). The solver must use the same conventions or solutions will be wrong.
- **Performance:** Layer-by-layer is O(n) per phase (finite case matching), so performance should
  not be an issue. But an infinite loop from a bug in case detection would freeze the browser.
  Consider a move-count safety limit.
- **CubeNet input UX:** Painting 54 stickers is tedious. The color palette selection + click to
  paint pattern must be responsive and feel fast. Centers should be pre-filled (they define face
  orientation) and non-editable.
- **Phase interdependence:** Each solver phase assumes previous phases are complete. If a phase
  produces incorrect results, all subsequent phases will fail. Extensive testing of each phase in
  isolation AND in sequence is critical.
