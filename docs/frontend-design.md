# CubeMaster — Frontend Design

## Design Philosophy

CubeMaster is a **precision instrument**, not a toy. The interface should feel like a speedcuber's
cockpit: **dark, focused, sharp**. Every element serves a purpose. The cube's own 6 colors are the
natural accent palette — they've been iconic since 1974.

**Core principles:**

- **Intentional darkness** — dark theme only, reduces eye strain during long sessions
- **Geometric clarity** — the cube is math; the UI reflects that precision
- **Color as identity** — each mode has a signature color from the cube palette
- **Tool-first** — no decorative clutter, every pixel earns its place

## Mode Identity

Each mode draws its visual identity from a cube face color:

| Mode       | Signature Color      | Rationale                                 |
| ---------- | -------------------- | ----------------------------------------- |
| **Solver** | Blue (`cube-blue`)   | Analysis, reflection, methodical thinking |
| **Coach**  | Green (`cube-green`) | Learning, growth, progression             |
| **Timer**  | Red (`cube-red`)     | Speed, urgency, competition               |

The signature color appears in:

- Active nav indicator
- Section headings and accents
- Primary action buttons within the mode
- Subtle background tint (very low opacity)

## Color System

### Theme: "rubiks" (daisyUI v5)

Custom dark theme using **OKLch** color space for perceptual uniformity.

```css
@plugin 'daisyui/theme' {
  name: 'rubiks';
  default: true;
  color-scheme: dark;

  /* Base surfaces — cool dark with subtle blue undertone */
  --color-base-100: oklch(30% 0.015 260);
  --color-base-200: oklch(25% 0.015 260);
  --color-base-300: oklch(20% 0.015 260);
  --color-base-content: oklch(92% 0.01 260);

  /* Semantic colors */
  --color-primary: oklch(65% 0.22 250);
  --color-secondary: oklch(65% 0.19 160);
  --color-accent: oklch(80% 0.16 85);
  --color-neutral: oklch(38% 0.015 260);

  /* ... (full theme in globals.css) */
}
```

### Cube Face Colors

Defined as CSS custom properties, decoupled from Tailwind's default palette:

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

Used via Tailwind utilities: `bg-cube-red`, `text-cube-blue`, etc.

**Rules:**

- Never use pure white (`#fff`) or pure black (`#000`)
- Never use raw Tailwind color classes (`bg-red-500`) for cube faces
- Always reference cube colors via the `cube-*` custom properties

## Typography

### Font Stack

| Role    | Font          | Weight   | Usage                                                |
| ------- | ------------- | -------- | ---------------------------------------------------- |
| Display | **Sora**      | 600, 700 | Headings, mode titles, nav labels                    |
| Body    | **Sora**      | 400, 500 | Body text, descriptions, UI labels                   |
| Mono    | **Fira Code** | 400, 500 | Move notation (R, U', F2), algorithms, timer display |

### Why Sora

- Geometric sans-serif with distinctive character (not generic like Inter/Roboto)
- Excellent readability at small sizes on dark backgrounds
- Wide weight range (100–800) for hierarchy flexibility
- Free on Google Fonts

### Why Fira Code

- Designed for code readability with programming ligatures
- Monospaced: critical for move notation alignment (R U' F2 looks clean)
- Distinctive but not distracting
- Perfect for the timer display (fixed-width digits)

### Loading Strategy

Fonts loaded via `@font-face` in `globals.css` with `font-display: swap`. Self-hosted (no Google
Fonts CDN) for performance and privacy.

### Type Scale

Using Tailwind's default scale with Sora applied:

- `text-xs` — Sticker labels, subtle metadata
- `text-sm` — Secondary text, descriptions
- `text-base` ��� Body text, controls
- `text-lg` — Section titles, card headings
- `text-xl` — Mode titles
- `text-2xl`+ — Timer display, hero elements

Move notation always uses `font-mono` for Fira Code.

## Iconography

### Library: lucide-react

- **Consistent stroke-based style** that matches the geometric/precision aesthetic
- **Lightweight** (~5MB installed, tree-shakeable per icon)
- **First-class React components** with `strokeWidth`, `size` props
- **Already used** with Radix + DaisyUI in other projects (proven combination)

### Usage Pattern

```tsx
import { RotateCcw, Play, Pause } from 'lucide-react'
;<button className='btn btn-primary'>
  <Play size={18} />
  Start
</button>
```

### Guidelines

- Default size: `18` for inline, `24` for standalone
- Default stroke width: `2` (lucide default)
- Always pair with text label or `aria-label` for accessibility
- Use cube colors for mode-specific icon accents

## Animation Strategy

### Approach: Custom @keyframes + Tailwind Utilities

No external animation library (no Motion/framer-motion). Animations are defined as `@keyframes` in
`globals.css` and exposed as Tailwind utility classes.

**Why:**

- Zero dependency, zero bundle cost
- Works with Tailwind's class-based approach
- DaisyUI already provides transitions on its components (hover, focus, etc.)
- Simple, maintainable, predictable

### Custom Animations

Defined in `globals.css`:

```css
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out both;
}
```

Or via Tailwind v4 `@theme`:

```css
@theme {
  --animate-fade-in-up: fade-in-up 0.3s ease-out both;
}
```

### Animation Inventory

| Animation        | Usage                                         | Duration |
| ---------------- | --------------------------------------------- | -------- |
| `fade-in-up`     | Page/section entry, card appearance           | 0.3s     |
| `fade-in`        | Overlay appearance, subtle reveals            | 0.2s     |
| `scale-in`       | Modal/dialog entry                            | 0.2s     |
| `slide-in-right` | Step navigation (next step)                   | 0.25s    |
| `slide-in-left`  | Step navigation (previous step)               | 0.25s    |
| `pulse-subtle`   | Timer running indicator                       | 1s       |
| `sticker-flip`   | Sticker color change during solution playback | 0.15s    |

### Built-in Transitions

DaisyUI and Tailwind already handle:

- Button hover/active states (`btn` has built-in transitions)
- Focus ring transitions
- `transition-colors`, `transition-shadow`, `transition-transform` utilities

**Rule:** Use DaisyUI/Tailwind built-in transitions for interactive states. Reserve custom
`@keyframes` for orchestrated entrances and mode-specific effects.

## Component Strategy

### Layer Model: DaisyUI + Radix

```text
Radix UI (behavior + accessibility)
    ↓ styled with
DaisyUI classes (visual appearance)
    ↓ built on
Tailwind CSS v4 (utility layer)
```

- **DaisyUI** provides semantic component classes: `btn`, `card`, `kbd`, `badge`, `tooltip`,
  `navbar`, `tab`, `stat`, etc.
- **Radix UI** provides accessible headless primitives for complex interactions: Dialog, Tooltip,
  ToggleGroup, Select, Tabs, etc.
- **Tailwind utilities** fill the gaps for layout, spacing, and one-off adjustments.

### When to Use What

| Need                    | Use                                              |
| ----------------------- | ------------------------------------------------ |
| Simple button           | `<button className="btn btn-primary">` (DaisyUI) |
| Card layout             | `card`, `card-body` (DaisyUI)                    |
| Move notation key       | `kbd` (DaisyUI)                                  |
| Modal dialog            | Radix Dialog + DaisyUI classes                   |
| Tooltip                 | Radix Tooltip + DaisyUI classes                  |
| Tab navigation (modes)  | Radix Tabs + DaisyUI `tab` classes               |
| Stats display (timer)   | `stat` (DaisyUI)                                 |
| Badge (lesson progress) | `badge` (DaisyUI)                                |
| Custom cube-specific UI | Tailwind utilities directly                      |

### Shared Components (src/components/ui/)

Wrappers around Radix primitives styled with DaisyUI:

- `DialogShell` — Radix Dialog + DaisyUI modal styling (already exists)
- `TooltipShell` — Radix Tooltip + DaisyUI tooltip styling
- `TabsShell` — Radix Tabs + DaisyUI tab styling
- More as needed per feature requirements

## Layout

### Responsive Strategy

- **Mobile-first**: designed for phone, enhanced for tablet and desktop
- **Breakpoints**: Tailwind defaults (`sm`, `md`, `lg`, `xl`)
- **Max width**: `max-w-5xl` for content container
- **Navigation**: persistent top navbar with mode tabs

### Page Structure

```text
┌─────────────────────────────────────────┐
│  Navbar: Logo + Mode Tabs (Solver/Coach/Timer) │
├───��─────────────────────────��───────────┤
│                                         │
│           Page Content                  │
│     (varies by mode, scrollable)        │
│                                         │
└─────────────────────────────────────────┘
```

### Home Page

Three mode cards in a responsive grid. Each card:

- Mode icon + name
- Brief description
- Signature color accent
- Click navigates to mode

### Mode Layouts

**Solver:**

```text
┌──────────────┬──────────────┐
│  Cube Net    │  Controls    │
│  (2D view)   │  (move btns) │
├──────────────┴────��─────────┤
│  Solution Steps             │
│  (step-by-step display)     │
└──────────��──────────────────���
```

**Coach:**

```text
┌─────────────────────────────┐
│  Lesson Browser (sidebar)   │
├──────────────┬────────���─────┤
│  Lesson      │  Cube Net    │
│  Content     │  (demo view) │
├─────────��────┴──────────────┤
│  Algorithm Display          │
│  (notation + practice)      │
└────────────────────���────────┘
```

**Timer:**

```text
┌─────────────────────────────┐
│  Scramble (notation)        │
├─────────────────────────────┤
│        TIMER DISPLAY        │
│        (large, centered)    │
├──────���───────┬──────────────┤
│  History     │  Statistics  │
│  (times)     │  (Ao5, Ao12) │
└──────────────┴───���──────────┘
```

## Cube-Specific UI

### CubeNet (2D Unfolded View)

The centerpiece component, used across all modes:

- 4×3 grid layout representing the 6 faces in cross pattern
- Each face is a 3×3 grid of sticker cells
- Sticker cells use `cube-*` colors with subtle ring and hover shadow
- Face labels (U, D, F, B, L, R) in monospace above each face
- Responsive sizing: `size-20` → `size-28` → `size-36`

### Move Notation

Displayed using `kbd` (DaisyUI) for a tactile keyboard-key aesthetic:

```text
  R   U'  F2  L'  B   D2
```

Each move token is a `kbd` element with monospace font (Fira Code).

### Timer Display

- Large monospace digits: `font-mono text-6xl` or larger
- Centisecond precision: `12.34`
- Pulse animation when running
- Signature red accent from Timer mode

## Accessibility

- All interactive elements use Radix primitives (keyboard navigation, focus management, ARIA)
- Color is never the only indicator (cube stickers have `aria-label` with color name)
- Focus rings visible on all interactive elements (DaisyUI default)
- Minimum contrast ratios maintained (OKLch makes this easier to verify)
- Reduced motion: respect `prefers-reduced-motion` media query for custom animations

## Open Questions

1. Should mode cards on home use illustrations/icons or keep it text-only?
2. Should the timer support keyboard-only operation (spacebar start/stop) from the start?
3. Should lesson progress badges use a specific color scheme or follow mode signature?
