# CubeNet looks different in Brave vs Firefox — mobile horizontal scroll and a "zoomed" cube

**Date:** 2026-06-18 **Area:** web

## Symptom

Coach (and the shared `CubeNet`) looked broken in Brave but fine in Firefox: a **horizontal**
scrollbar on mobile widths, and on desktop the whole page looked **bigger/"zoomed" in Brave even at
100% zoom**. It read like a Chromium-vs-Gecko rendering bug and cost hours chasing the wrong thing.

Three independent causes were tangled together, plus a misleading diagnostic.

## Root cause

1. **Mobile horizontal scroll = flex rows with no `flex-wrap`.** The navbar (`nav` + mode `ul`) and
   footer rows in `layouts/Layout.tsx`, and the White Cross "Le secret" step's two side-by-side
   CubeNets (`grid grid-cols-2` in `LessonPlayer`'s `UnderstandVisualPane`), sat right at the
   320–375px edge. With no `flex-wrap`/`grid-cols-1` fallback they overflowed. Chromium tipped over
   the edge where Firefox stayed just under (sub-pixel font/gap metrics), so it looked
   **Brave-only**. Measured: the compare grid was `scrollWidth=353 > clientWidth=320`.

2. **"Everything bigger in Brave at 100% zoom" = the browser's font-size setting, not the code.**
   Brave's Appearance → Font size was a notch above Firefox's. Once the cube was `rem`-based it
   scaled with that root font like the text. Proven by measuring: at the default 16px root, the code
   renders a face of **exactly 112px (7rem)** in both engines — identical at equal settings.

3. **The cube sizing was fragile by construction.** `FaceGrid` used `clamp(3.5rem, 8vw, 7rem)`. `vw`
   ties the cube to the viewport width (so it changed with window size) and interacts with the
   forced `html { overflow-y: scroll }` scrollbar gutter differently across engines. The earlier
   attempt — `container-type: size` + `cqw/cqh` (commit `612df81`) — **collapsed to ~0** inside flex
   `items-center` parents with no determinate width (the "April bug"), which is why it had been
   swapped for `vw` in the first place.

**Misleading diagnostic (the real time sink):** the "Brave-broken" screenshots were taken in Chrome
**DevTools device mode with the panel open**, which shifts/clips the rendering — that artifact
looked like a real horizontal overflow/offset that headless measurement could not reproduce.
Trusting those screenshots sent the investigation down a dead end (vertical-scroll, then phantom
horizontal-overflow).

## Fix

Two commits:

- `f579649` — `flex-wrap` (+ `gap-y`) on the navbar `nav`/`ul` and both footer rows; brand shortened
  to **"CM"** under `sm` (full "CubeMaster" from `sm`, home link kept); compare step
  `grid-cols-1 sm:grid-cols-2` so the two nets stack on mobile.
- `1804f04` — `FaceGrid` faces sized in **fixed rem per breakpoint**
  (`size-14 sm:size-20 md:size-24 lg:size-28`), mirroring the Solver's `InteractiveFaceGrid` (which
  already used fixed px and never had this problem); `html { overflow-y: scroll }` →
  `scrollbar-gutter: stable`. Fixed rem renders identically across engines at equal settings and
  never collapses; vertical scroll absorbs the height (acceptable — the requirement was no
  _horizontal_ scroll, not no vertical).

The "zoomed in Brave" part is **not** a code fix: align Brave's Appearance → Font size with Firefox.

## Prevention

- **Don't size components with `vw`.** Use fixed `rem`/`px` or a container-driven grid. Never put
  `container-type: size` on a flex/grid child without a determinate height — it collapses.
- **Any flex row that can reach the viewport edge needs `flex-wrap`** (+ `min-w-0` on shrinkable
  children). The navbar/footer are the usual offenders at 320–375px.
- **Compare browsers by measuring in real engines headless, never DevTools device-mode
  screenshots.** Chromium: launch `brave --headless=new --remote-debugging-port=N`, drive CDP, read
  `documentElement.scrollWidth` vs `clientWidth`, `scrollHeight`, and
  `getComputedStyle(html).fontSize`. Firefox:
  `firefox-esr --headless --window-size=<W> --screenshot=out.png <url>` — the PNG height is the full
  content height. Equal numbers ⇒ the difference is browser config, not code.
- **"Everything is bigger at 100% zoom" → check the browser's font-size setting**, not the CSS.

## Related

- `docs/solutions/2026-06-13-lesson-player-shows-cube-but-not-notation.md`
- Plan `docs/plans/2026-06-15-coach-design-wording-plan.md` (F4 fluid CubeNet, S2 captured here)
