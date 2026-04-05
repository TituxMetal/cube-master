# CubeMaster — Progress

## Current Feature: 04 — Solver Mode

### Phase 1: Interactive CubeNet Input + Engine Validation

- [ ] Create state reconstruction use case (stickers → CubeState + validation)
- [ ] Tests for reconstruction + validation
- [ ] Create move inverse utility (invertMove, invertMoves)
- [ ] Tests for move inverse
- [ ] Create solver store (input part: stickers, selected color, validation)
- [ ] Create ColorPalette component
- [ ] Create InteractiveFaceGrid component (clickable stickers)
- [ ] Create InteractiveCubeNet component
- [ ] Tests for input components
- [ ] Replace Solver page placeholder with input assembly
- [ ] Update Solver page tests

### Phase 2: White Cross Solver

- [ ] Create solver infrastructure (types, helpers)
- [ ] Implement White Cross solver
- [ ] Tests for White Cross solver

### Phase 3: White Corners + Second Layer

- [ ] Implement White Corners solver
- [ ] Tests for White Corners solver
- [ ] Implement Second Layer Edges solver
- [ ] Tests for Second Layer solver

### Phase 4: Yellow Layer Solver

- [ ] Implement Yellow Cross solver
- [ ] Implement Yellow Edges solver
- [ ] Implement Yellow Corners Position solver
- [ ] Implement Yellow Corners Orientation solver
- [ ] Tests for all Yellow Layer solvers

### Phase 5: Full Solver Integration

- [ ] Create solveCube use case (chains all 7 phases)
- [ ] Integration tests (multiple scrambles → verify solved)
- [ ] Export new types and functions from cube-engine

### Phase 6: Solver Store (Solution Part)

- [ ] Extend store with solution state (steps, navigation, computed cube-at-step)
- [ ] Tests for solver store (solution flow)

### Phase 7: Solution View Components

- [ ] Create PhaseList component (phase progress with navigation)
- [ ] Create StepControls component (previous/next + move display)
- [ ] Tests for solution components

### Phase 8: Solution View Page Assembly

- [ ] Wire solution view into Solver page
- [ ] Update Solver page integration tests
- [ ] Full verification (test, typecheck, lint, format)
