# CubeMaster — Frontend Design

CubeMaster is a **precision instrument, not a toy**. The interface should feel like a speedcuber's
cockpit: dark, focused, sharp. Every element serves a purpose. The cube's own 6 colors — iconic
since 1974 — are the natural accent palette.

**Core principles:**

- **Intentional darkness** — dark theme only, reduces eye strain during long sessions
- **Geometric clarity** — the cube is math; the UI reflects that precision
- **Color as identity** — each mode has a signature color from the cube palette
- **Tool-first** — no decorative clutter, every pixel earns its place

## Mode identity

| Mode   | Signature color      | Rationale                                 |
| ------ | -------------------- | ----------------------------------------- |
| Solver | Blue (`cube-blue`)   | Analysis, reflection, methodical thinking |
| Coach  | Green (`cube-green`) | Learning, growth, progression             |
| Timer  | Red (`cube-red`)     | Speed, urgency, competition               |

The signature color appears in the active nav indicator, section accents, primary action buttons
within the mode, and a subtle low-opacity background tint.

## Color system

Custom dark daisyUI v5 theme **"rubiks"**, built in the **OKLch** color space for perceptual
uniformity. Base surfaces are cool dark with a subtle blue undertone (`base-100/200/300`).

Cube face colors are CSS custom properties, decoupled from Tailwind's default palette:

```css
@theme {
  --color-cube-white: oklch(93% 0.01 90);
  --color-cube-yellow: oklch(88% 0.19 95);
  --color-cube-red: oklch(55% 0.27 27);
  --color-cube-orange: oklch(72% 0.19 55);
  --color-cube-blue: oklch(52% 0.24 260);
  --color-cube-green: oklch(60% 0.21 150);
}
```

**Rules:**

- Never pure white (`#fff`) or pure black (`#000`)
- Never raw Tailwind color classes (`bg-red-500`) for cube faces
- Always reference cube colors via the `cube-*` custom properties (`bg-cube-red`, `text-cube-blue`)

## Typography

| Role    | Font          | Usage                                               |
| ------- | ------------- | --------------------------------------------------- |
| Display | **Sora**      | Headings, mode titles, nav labels (600/700)         |
| Body    | **Sora**      | Body text, descriptions, UI labels (400/500)        |
| Mono    | **Fira Code** | Move notation (R, U', F2), algorithms, timer digits |

Self-hosted via `@font-face` with `font-display: swap` (no Google Fonts CDN). Move notation
**always** uses `font-mono`. Sora is geometric and readable on dark; Fira Code's monospace keeps
notation aligned and timer digits fixed-width.

## Iconography

**lucide-react** — stroke-based, lightweight, tree-shakeable, first-class React components. Default
size `18` inline / `24` standalone, stroke width `2`. Always pair with a text label or `aria-label`.

## Animation

No external animation library. Animations are `@keyframes` in `globals.css` exposed as Tailwind
utilities (zero dependency, zero bundle cost). Use DaisyUI/Tailwind built-in transitions for
interactive states; reserve custom keyframes for orchestrated entrances and mode-specific effects.

Inventory: `fade-in-up`, `fade-in`, `scale-in`, `slide-in-left/right` (step navigation),
`pulse-subtle` (timer running), `sticker-flip` (solution playback). Respect
`prefers-reduced-motion`.

## Component strategy — daisyUI + Radix

```text
Radix UI (behavior + accessibility)
    ↓ styled with
daisyUI classes (visual appearance)
    ↓ built on
Tailwind CSS v4 (utility layer)
```

- **daisyUI** for semantic classes: `btn`, `card`, `kbd`, `badge`, `tooltip`, `navbar`, `tab`,
  `stat`, `steps`
- **Radix** for accessible headless primitives: Dialog, Tooltip, Tabs, ToggleGroup, Select
- **Tailwind utilities** for layout, spacing, one-offs

Shared wrappers live in `src/components/ui/` (e.g. `DialogShell`, `TooltipShell`, `TabsShell`).

## Layout

Mobile-first, Tailwind default breakpoints, `max-w-5xl` content container, persistent top navbar
with mode tabs. Home shows three mode cards in a responsive grid. Per-mode layouts:

- **Solver** — cube net + controls, solution steps below (input view ↔ solution view)
- **Coach** — lesson browser sidebar, lesson content + cube demo, algorithm display
- **Timer** — scramble on top, large centered timer, history + stats split below

## Cube-specific UI

- **CubeNet** — the centerpiece across all modes: 4×3 cross layout of the 6 faces, each a 3×3 grid
  of sticker cells using `cube-*` colors, responsive `size-20` → `size-28` → `size-36`
- **Move notation** — each token a `kbd` element in Fira Code
- **Timer display** — large mono digits (`text-6xl`+), centisecond precision, red accent + pulse
  when running

## Accessibility

Radix gives keyboard nav, focus management, and ARIA. Color is never the only indicator (stickers
carry an `aria-label` with the color name). Visible focus rings everywhere. OKLch makes contrast
ratios easy to verify. Custom animations respect `prefers-reduced-motion`.
