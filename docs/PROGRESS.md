# CubeMaster — Progress

## Current Feature: 03 — Timer Mode

### Phase 1: Timer Store + Display + Page

- [ ] Create timer store (state, elapsed, scramble, actions, hooks)
- [ ] Tests for timer store
- [ ] Create useTimerLoop hook (rAF loop tied to component lifecycle)
- [ ] Create formatTime utility (ms → M:SS.cc)
- [ ] Tests for formatTime
- [ ] Create ScrambleDisplay component
- [ ] Tests for ScrambleDisplay
- [ ] Create TimerDisplay component (large digits, state-aware styling, flash)
- [ ] Tests for TimerDisplay
- [ ] Replace Timer page placeholder with timer assembly
- [ ] Update Timer page tests

### Phase 2: Timer Interaction

- [ ] Create session store (solves list, recordSolve, toggleDnf, deleteSolve)
- [ ] Tests for session store
- [ ] Wire keyboard interaction (spacebar start/stop + solve recording)
- [ ] Wire touch interaction (tap on timer zone)
- [ ] Update Timer page integration tests

### Phase 3: Session History + DNF/Delete

- [ ] Create SolveHistory component (ordered list, DNF toggle, delete)
- [ ] Tests for SolveHistory
- [ ] Wire SolveHistory into Timer page
- [ ] Update Timer page integration tests

### Phase 4: Statistics Computation

- [ ] Create statistics utility (computeBest, computeWorst, computeAverage)
- [ ] Tests for statistics (edge cases, DNF handling, Ao5/Ao12)

### Phase 5: Statistics Display + Integration

- [ ] Create StatsPanel component (4 stat cards: Best, Worst, Ao5, Ao12)
- [ ] Tests for StatsPanel
- [ ] Wire StatsPanel into Timer page layout

### Phase 6: Persistence + Final Verification

- [ ] Add localStorage persistence to session store
- [ ] Tests for persistence (save, restore, error handling)
- [ ] Full verification (test, typecheck, lint, format)
