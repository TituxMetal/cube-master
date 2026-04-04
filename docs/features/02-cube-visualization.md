# Feature Shape: Cube Visualization

## Problem

The cube engine exists with 37+ passing tests — but it's invisible. The CubeDemo component renders a
frozen solved state with zero interactivity. There's no way for the user (or the developer) to
visually confirm the engine works: that moves permute stickers correctly, that scrambles produce
valid states, that reset returns to solved. This is the first feature that **proves** the engine is
real.

It's also the foundation for every mode: Solver needs a cube bound to state with step navigation,
Coach needs a cube that demos algorithms, Timer needs a scramble preview. Without a reactive,
controllable cube visualization, none of those can exist.

## Solution (Broad Strokes)

Replace the static CubeDemo with an interactive cube visualization:

- A reactive cube state managed by a nanostore, derived stickers recompute on every change
- Move controls to apply any of the 18 face moves and see the result immediately on the CubeNet
- A scramble generator that produces a random 20–25 move sequence and applies it
- A reset action that returns to the solved state
- A move history display showing the sequence of applied moves in standard notation

The existing CubeNet and FaceGrid components stay as-is — they already handle rendering. The work is
about **wiring them to reactive state** and building the controls around them.

## User Flow

1. User opens the home page → sees the cube in its solved state (6 solid-color faces)
2. User taps a move button (e.g., **R**) → the CubeNet immediately updates to show the R move effect
3. User taps more moves → each move applies to the current state, CubeNet updates, move history
   grows
4. User taps **Scramble** → a random 20–25 move sequence is generated and applied, the scramble
   notation appears, the cube shows the scrambled state
5. User taps **Reset** → cube returns to solved state, move history clears
6. User explores freely — applying moves to a scrambled cube, resetting, scrambling again

## Dependencies

**Requires:**

- Cube engine package with `createSolvedState`, `applyMove`, `applyMoves`, `toStickers`,
  `FACE_MOVES` (all done)
- CubeNet and FaceGrid components (done)
- Nanostores + @nanostores/react (installed, not used yet)

**Enables:**

- **Solver mode** — the reactive cube state + CubeNet is the base. Solver adds input UI and solution
  navigation on top of the same state system.
- **Coach mode** — algorithm demos apply moves to the cube state and the visualization shows the
  effect step by step.
- **Timer mode** — scramble preview renders the scrambled state in the same CubeNet.

## What Must Exist (Backend)

Nothing. This feature is entirely client-side.

## What Must Exist (Frontend)

**State management (nanostores):**

- A store holding the current `CubeState` — initialized to solved
- A computed store deriving `StickersByFace` from the state via `toStickers`
- A store tracking the move history as a `MoveToken[]`
- Actions: apply a single move, apply a scramble, reset to solved

**Scramble generator:**

- Generates a random sequence of 20–25 moves from the 18 available face moves
- Avoids consecutive moves on the same face (e.g., no R followed by R' or R2 — standard WCA
  practice)
- Avoids consecutive moves on opposite faces in the same order (e.g., no R then L then R — the
  second R could merge with the first)
- Uses an injectable random source (a `Random` contract) so scrambles are deterministic in tests
- Returns both the move sequence and the resulting state

**Move control panel:**

- All 18 face moves accessible: 6 faces × 3 variants (clockwise, counterclockwise, 180°)
- Grouped by face: U group, D group, F group, B group, L group, R group
- Each button shows the move in standard notation using monospace font

**Action buttons:**

- **Scramble** — generates and applies a random scramble
- **Reset** — returns to solved state, clears history

**Move history display:**

- Shows the sequence of applied moves in standard notation
- Each move token displayed as a `kbd` element (monospace)
- Scrollable or wrapping when the sequence gets long
- Clears on reset

**Integration:**

- Replaces the static CubeDemo on the home page
- The cube visualization component is reusable — it lives in `features/cube/` and can be embedded in
  any page (Solver, Coach, Timer will consume it later)

## UI Reference

### Visual Target

Think **speedcuber's cockpit**: dark, focused, precision instrument. The closest real-world analogy
is a synthesizer interface or a mechanical keyboard tester — a tool where you press something and
immediately see/hear the result. Every control has a purpose, nothing is decorative.

### Layout & Structure

**Desktop (md+):**

```text
┌─────────────────────────────────────────────────┐
│              Interactive Cube                     │
│                                                   │
│   ┌─────────────────────┬──────────────────────┐ │
│   │                     │                      │ │
│   │     CubeNet         │   Move Controls      │ │
│   │   (2D cross view)   │   (6 face groups)    │ │
│   │                     │                      │ │
│   └─────────────────────┴──────────────────────┘ │
│                                                   │
│   ┌─────────────────────────────────────────────┐ │
│   │  [Scramble]  [Reset]                        │ │
│   └─────────────────────────────────────────────┘ │
│                                                   │
│   ┌─────────────────────────────────────────────┐ │
│   │  Move history: R  U'  F2  L  B'  ...       │ │
│   └─────────────────────────────────────────────┘ │
│                                                   │
└─────────────────────────────────────────────────┘
```

- CubeNet takes ~60% width, move controls ~40%
- Action buttons below the cube/controls area
- Move history at the bottom, full width

**Mobile (< md):**

- CubeNet centered, full width
- Move controls below the cube, compact grid
- Action buttons below controls
- Move history at the bottom, horizontally scrollable

### UI Components & Patterns

**Move buttons:**

- Styled as `kbd` elements (DaisyUI) — gives a tactile, keyboard-key feel that matches the
  speedcubing aesthetic where moves ARE keyboard-like actions
- Monospace font for move notation (Fira Code when available, system mono as fallback)
- Each face group has a subtle accent border using the face's cube color:
  - U group → `cube-white` accent
  - D group → `cube-yellow` accent
  - F group → `cube-green` accent
  - B group → `cube-blue` accent
  - L group → `cube-orange` accent
  - R group → `cube-red` accent
- Hover: subtle shadow lift + slight brightness increase
- Active/pressed: brief scale-down for tactile feedback

**Face group layout:**

```text
┌──────────────┐  ┌──────────────┐
│  U  │ U' │ U2│  │  D  │ D' │ D2│
├──────────────┤  ├──────────────┤
│  F  │ F' │ F2│  │  B  │ B' │ B2│
├──────────────┤  ├──────────────┤
│  L  │ L' │ L2│  │  R  │ R' │ R2│
└──────────────┘  └──────────────┘
```

Two columns of 3 face groups — organized so opposite faces are side by side (U/D, F/B, L/R).

**Action buttons:**

- Scramble: `btn btn-primary` (uses the theme primary blue)
- Reset: `btn btn-ghost` or `btn btn-outline` (secondary, less prominent — reset is less common)

**Move history:**

- Horizontal flow of `kbd` elements with `gap-1`
- Wraps naturally on desktop, scrollable on mobile
- When empty, show subtle placeholder text ("No moves yet")
- Subtle `base-200` background card

**States:**

- **Initial (solved):** CubeNet shows 6 solid-color faces, history empty, Reset button disabled
- **After moves:** CubeNet shows modified state, history lists moves, Reset enabled
- **After scramble:** Same as after moves, but history shows the full scramble sequence
- **After reset:** Returns to initial state

### Design Tokens

- Surfaces: `base-100` (page), `base-200` (cards, panels), `base-300` (move control backgrounds)
- Move buttons: `kbd` class with `base-300` background, face-color left border or top accent
- Action buttons: `primary` for Scramble, `ghost` or `outline` for Reset
- Text: `base-content` for labels, `base-content/70` for secondary text
- Move notation: always `font-mono`
- Borders: `base-content/20` for subtle dividers

### Responsiveness

- **Desktop (lg+):** CubeNet + controls side by side, generous spacing
- **Tablet (md):** Same side-by-side but tighter, CubeNet at `size-28`
- **Mobile (< md):** Everything stacks vertically, CubeNet at `size-20`, move controls in a compact
  2-column grid, history scrolls horizontally

## Open Questions

1. Should the move history have an undo button (pop last move, apply inverse)?
2. Should the scramble length be configurable or fixed at 20–25 moves?
3. Should we display a move counter (total moves applied since last reset)?

## Out of Scope

- Cube input (tapping stickers to change colors) — that's Solver mode
- Solution display / step navigation — that's Solver mode
- Algorithm demos — that's Coach mode
- Timer integration — that's Timer mode
- Keyboard shortcuts for moves — deferred to Polish
- Move animation (sticker transition effects) — deferred to Polish
- 3D visualization — explicitly excluded from MVP
- Self-hosting fonts (Sora / Fira Code) — can be added in any feature, system fonts work as fallback

## Risks / Gotchas

- **Scramble quality:** A naive random pick from 18 moves can produce degenerate scrambles (e.g., R
  R' cancels out). The generator must filter consecutive same-face and same-axis moves. WCA
  scrambles use a more sophisticated algorithm, but for MVP a filtered random approach is
  sufficient.
- **Random contract for testing:** The scramble generator must accept an injectable random source.
  Without this, scramble tests become flaky (non-deterministic). The contract should be a simple
  `() => number` matching `Math.random`'s signature.
- **Nanostore reactivity:** The cube state is a deep object (`CubeState` with nested `corners` and
  `edges` records). Nanostores uses reference equality, so `applyMove` returning a new object is
  correct — but the computed `toStickers` derivation must not cause unnecessary re-renders. Profile
  if the 6×9 sticker recomputation is fast enough (it should be — it's pure lookups).
- **CubeNet is already responsive** (size-20 → size-28 → size-36) but the move controls need their
  own responsive design. On small screens, 18 buttons + 2 action buttons must remain usable without
  scrolling the entire page.
- **Existing CubeDemo is used on the Home page** — the interactive visualization replaces it. The
  Home page should show the interactive cube as its hero element, with the mode cards below.
- **The `features/cube/` directory already exists** with components and lib. New stores and the
  scramble generator should live here, keeping the feature self-contained.
