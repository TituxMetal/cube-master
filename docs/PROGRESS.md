# CubeMaster — Progress

## Current Feature: 03 — Timer Mode

### Phase 1: Timer Store + Display + Page

- [x] Create timer store (state, elapsed, scramble, actions, hooks)
- [x] Tests for timer store
- [x] Create useTimerLoop hook (rAF loop tied to component lifecycle)
- [x] Create formatTime utility (ms → M:SS.cc)
- [x] Tests for formatTime
- [x] Create ScrambleDisplay component
- [x] Tests for ScrambleDisplay
- [x] Create TimerDisplay component (large digits, state-aware styling, flash)
- [x] Tests for TimerDisplay
- [x] Replace Timer page placeholder with timer assembly
- [x] Update Timer page tests

### Phase 2: Timer Interaction

- [x] Create session store (solves list, recordSolve, toggleDnf, deleteSolve)
- [x] Tests for session store
- [x] Wire keyboard interaction (spacebar start/stop + solve recording)
- [x] Wire touch interaction (tap on timer zone)
- [x] Update Timer page integration tests

### Phase 3: Session History + DNF/Delete

- [x] Create SolveHistory component (ordered list, DNF toggle, delete)
- [x] Tests for SolveHistory
- [x] Wire SolveHistory into Timer page
- [x] Update Timer page integration tests

### Phase 4: Statistics Computation

- [x] Create statistics utility (computeBest, computeWorst, computeAverage)
- [x] Tests for statistics (edge cases, DNF handling, Ao5/Ao12)

### Phase 5: Statistics Display + Integration

- [x] Create StatsPanel component (4 stat cards: Best, Worst, Ao5, Ao12)
- [x] Tests for StatsPanel
- [x] Wire StatsPanel into Timer page layout

### Phase 6: Persistence + Final Verification

- [x] Add localStorage persistence to session store
- [x] Tests for persistence (save, restore, error handling)
- [x] Full verification (test, typecheck, lint, format)
