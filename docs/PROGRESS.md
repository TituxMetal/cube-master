# CubeMaster — Progress

## Current Feature: 02 — Cube Visualization

### Phase 1: Interactive Cube

- [x] Create cube state store (atoms, computed, applyMoveAction, resetAction, hooks)
- [x] Tests for cube-store
- [x] Create MoveControls component (18 buttons, 6 face groups)
- [x] Tests for MoveControls
- [x] Create CubePlayground assembly (CubeNet + MoveControls wired to store)
- [x] Tests for CubePlayground
- [x] Replace CubeDemo on Home page, delete CubeDemo, update Home tests
- [x] Fix corner orientation rendering (chirality-aware formula in toStickers)
- [x] Fix B face stickerMapping (BL/BR edges swapped)
- [x] After-move sticker tests for R, F, L, B faces

### Phase 2: Action Bar and Move History

- [x] Create ActionBar (Reset + optional Scramble + move counter)
- [x] Create MoveHistory (badge tokens display)
- [x] Tests for both components
- [x] Wire into CubePlayground, update integration tests

### Phase 3: Scramble Generator (cube-engine)

- [ ] Create generateScramble use-case with injectable random source
- [ ] Tests for scramble generation
- [ ] Export from cube-engine barrel

### Phase 4: Wire Scramble and Final Verification

- [ ] Add scrambleAction to store + tests
- [ ] Wire Scramble button into CubePlayground
- [ ] Update integration tests
- [ ] Full verification (test, typecheck, lint, format)
