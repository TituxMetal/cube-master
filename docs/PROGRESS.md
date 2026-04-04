# CubeMaster — Progress

## Current Feature: 02 — Cube Visualization

### Phase 1: Interactive Cube

- [ ] Create cube state store (atoms, computed, applyMoveAction, resetAction, hooks)
- [ ] Tests for cube-store
- [ ] Create MoveControls component (18 buttons, 6 face groups)
- [ ] Tests for MoveControls
- [ ] Create CubePlayground assembly (CubeNet + MoveControls wired to store)
- [ ] Tests for CubePlayground
- [ ] Replace CubeDemo on Home page, delete CubeDemo, update Home tests

### Phase 2: Action Bar and Move History

- [ ] Create ActionBar (Reset + optional Scramble + move counter)
- [ ] Create MoveHistory (kbd tokens display)
- [ ] Tests for both components
- [ ] Wire into CubePlayground, update integration tests

### Phase 3: Scramble Generator (cube-engine)

- [ ] Create generateScramble use-case with injectable random source
- [ ] Tests for scramble generation
- [ ] Export from cube-engine barrel

### Phase 4: Wire Scramble and Final Verification

- [ ] Add scrambleAction to store + tests
- [ ] Wire Scramble button into CubePlayground
- [ ] Update integration tests
- [ ] Full verification (test, typecheck, lint, format)
