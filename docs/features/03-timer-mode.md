# Feature Shape: Timer Mode

## Problem

CubeMaster has a working interactive cube, but no way to actually practice speedcubing. A cuber
returning to the hobby needs to track solve times, see their averages, and know if they're
improving. Without a timer, the app is a demo — not a training tool.

## Solution (Broad Strokes)

A full speedcube timer experience on the `/timer` route:

- A scramble is generated and displayed in standard notation before each solve
- The user starts/stops the timer with spacebar (desktop) or screen tap (mobile)
- Each solve is recorded with its time, scramble, and timestamp
- A session history shows all solves with the ability to mark DNF (Did Not Finish)
- Live statistics show Best, Worst, Average of 5, and Average of 12
- Session data persists in localStorage so progress survives page reloads

The scramble generator already exists in `cube-engine` — this feature focuses on the timer
mechanics, session management, and statistics display.

## User Flow

1. User navigates to `/timer` → sees a fresh scramble in notation and a zeroed timer display
2. User inspects the scramble, picks up the cube
3. User presses **spacebar** (or taps the timer zone) → timer starts counting up
4. User solves the cube, presses **spacebar** again → timer stops, solve time is recorded
5. A new scramble is automatically generated for the next solve
6. User can mark a solve as **DNF** or **delete** it from the session history
7. Statistics update live after each solve (Best, Worst, Ao5, Ao12)
8. User closes the tab, comes back later → session history and stats are restored from localStorage

## Dependencies

**Requires:**

- `generateScramble` use-case from cube-engine (done)
- `/timer` route already wired in the router (done, currently shows "Coming soon")
- DaisyUI component classes: `stat`, `badge`, `btn`, `kbd` (available)

**Enables:**

- Scramble preview (optional enhancement: show the scrambled CubeNet)
- Inspection countdown (optional 15-second WCA inspection timer)
- Multi-session management (switching between named sessions)
- Progression graph (visualizing improvement over time)

## What Must Exist (Backend / Engine)

No new engine work needed — `generateScramble` already produces valid scramble sequences.

The timer logic and statistics are **frontend-only** concerns (no server needed):

- **Timer precision:** `performance.now()` for sub-millisecond accuracy, displayed as centiseconds
- **Statistics calculations:**
  - Best: minimum time (excluding DNF)
  - Worst: maximum time (excluding DNF)
  - Average of 5 (Ao5): last 5 solves, drop best and worst, average the remaining 3
  - Average of 12 (Ao12): last 12 solves, drop best and worst, average the remaining 10
  - If any of the remaining solves (after dropping) is DNF, the average is DNF
- **Persistence:** serialize session data to localStorage, deserialize on load

## What Must Exist (Frontend)

### Pages / Routes

- Timer page replacing the "Coming soon" placeholder at `/timer`

### State Management

- Timer store (nanostores): timer state (idle/running/stopped), elapsed time, current scramble
- Session store (nanostores): list of solves, computed statistics
- Persistence layer: sync session store to/from localStorage

### Components

- **Scramble display:** the current scramble sequence in move notation, large and readable
- **Timer display:** large centered digits showing elapsed time (00:00.00 format), state-aware
  styling (idle vs running vs stopped)
- **Timer controls:** spacebar/tap zone to start/stop — the timer zone itself is the control
- **Session history list:** ordered list of solves showing index, time (or DNF), and scramble
- **Solve actions:** DNF toggle and delete per solve
- **Statistics panel:** computed stats displayed as stat cards (Best, Worst, Ao5, Ao12)

### User Interactions

- **Spacebar** starts/stops timer on desktop
- **Tap** on the timer zone starts/stops on mobile
- Clicking a solve's scramble could expand to show the full notation
- DNF toggle on each solve in the history
- Delete button on each solve (with confirmation or undo)

## UI Reference

### Visual Target

Similar to [csTimer](https://cstimer.net/) or
[Twisty Timer](https://play.google.com/store/apps/details?id=com.aricneto.twistytimer) in concept,
but with CubeMaster's dark rubiks theme and geometric precision aesthetic.

### Layout & Structure

```text
┌─────────────────────────────────────┐
│  Scramble Notation (full width)     │
│  R U' F2 L B' D R2 U F' ...        │
├─────────────────────────────────────┤
│                                     │
│           00:12.34                  │
│       (large, centered)            │
│                                     │
│    [tap/spacebar to start/stop]     │
│                                     │
├────────────────┬────────────────────┤
│  Session       │  Statistics        │
│  History       │                    │
│  1. 12.34      │  Best:   8.92     │
│  2. 15.67      │  Worst: 23.41     │
│  3. DNF        │  Ao5:   14.23     │
│  4. 11.23      │  Ao12:  15.67     │
│  5. 09.87      │                    │
│  ...           │                    │
└────────────────┴────────────────────┘
```

- Scramble at the top: full width, prominent, monospace font
- Timer display: dominant center area — the largest visual element on the page
- History + Stats: split below the timer, side by side on desktop, stacked on mobile

### UI Components & Patterns

- **Scramble:** `kbd` badges or plain monospace text, wrapped in a card or surface
- **Timer digits:** `font-mono text-6xl` or larger, centered, red accent when running
- **History:** ordered list with `badge` for time, subtle striping for readability
- **Stats:** DaisyUI `stat` component cards in a responsive grid
- **DNF:** `badge badge-error` for DNF solves, togglable
- **Empty state:** "Press spacebar to start your first solve" centered message

### States

- **Idle:** timer shows 00:00.00, scramble visible, "Press spacebar" hint
- **Running:** timer counting up, red accent pulse, scramble dimmed
- **Stopped:** timer shows final time, solve recorded, new scramble appears
- **Empty session:** no history, stats show dashes, encouraging message

### Design Tokens

- Timer mode signature color: `cube-red` / `cube-red-text` for accents
- Timer display: `text-base-content` when idle, `text-cube-red-text` when running
- Surfaces: `base-100` page, `base-200` cards/panels, `base-300` list items
- Stats labels: `text-base-content/60`, stat values: `text-base-content`
- DNF badge: `badge-error`

### Responsiveness

- **Desktop (lg+):** history and stats side by side below the timer
- **Tablet (md):** same layout but tighter spacing
- **Mobile (sm):** scramble wraps naturally, history and stats stack vertically, timer touch zone
  fills width for easy tapping

## Open Questions

1. Should there be a visual/audio cue when the timer starts (brief flash, subtle sound)?
2. Should the scramble preview (2D CubeNet of scrambled state) be included in MVP or deferred?
3. Should the Ao5/Ao12 show "—" when not enough solves, or hide entirely?
4. Should delete require confirmation, or use an undo pattern (less disruptive)?
5. Should the timer format be MM:SS.cc or just SS.cc for sub-minute solves?

## Out of Scope

- Inspection countdown (15-second WCA inspection timer) — defer to enhancement
- Multiple named sessions — defer, single session for MVP
- Progression graph / charts — defer to enhancement
- Scramble preview (CubeNet showing scrambled state) — defer, text-only for MVP
- Penalty system (+2 seconds for misalignment) — defer
- Export/import session data — defer
- Sound effects — defer

## Risks / Gotchas

- **Timer precision:** `setInterval` is unreliable for display updates — use `requestAnimationFrame`
  with `performance.now()` delta for smooth, accurate counting
- **Spacebar conflicts:** spacebar also scrolls the page — need `preventDefault` on the timer zone
- **localStorage limits:** unlikely to hit with timer data, but should handle gracefully if storage
  is full or unavailable (private browsing)
- **DNF in averages:** WCA rules say if any non-dropped solve in an average is DNF, the entire
  average is DNF — must implement this correctly
- **Tab visibility:** timer should pause or warn if the tab loses focus during a solve (the user
  might accidentally switch tabs)
- **Touch vs click:** mobile tap must not trigger zoom or scroll — needs touch event handling with
  appropriate CSS (`touch-action: manipulation`)
