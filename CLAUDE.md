# MHE Toolkit — Project Context

A mobile-first PWA of field-reference calculators for conveyor system design,
built for LogistiQ Integration Solutions engineers. Installed to iPhone home
screens via "Add to Home Screen" in Safari — behaves like a native app.

## Tech stack

- Vite + React + **TypeScript** (`strict: true`, including
  `noUnusedLocals`/`noUnusedParameters`) — migrated from plain JS
  mid-2026. No Tailwind, no CSS framework.
- `npm run build` runs `tsc --noEmit` before `vite build`, so a type error
  fails the build the same as a broken import would. `npm run typecheck`
  runs just the type check on its own (fast, no bundling) — use this while
  iterating instead of a full build.
- Vitest for unit tests, targeting the pure calculator functions (see
  "File layout" and "Calculator math + tests" below). `npm test` runs the
  suite once; `npm run test:watch` for a watch-mode loop while editing.
- Icons: `lucide-react`
- Styling: inline style objects using a shared color/font token system (see
  below) — no CSS files, no styled-components, no Tailwind classes
- Persistence: `localStorage` via two custom hooks (see below) — this is a
  real deployed web app, not a sandboxed Claude artifact, so localStorage is
  fine to use here (unlike Claude.ai artifacts, which forbid it)

## File layout

Was a single ~1,950-line `App.jsx` until it was split into modules for
maintainability, then migrated file-by-file to TypeScript (both mid-2026).
Current layout:

```
src/
  App.tsx              — top-level router only (~30 lines)
  main.tsx
  theme.ts             — color tokens (C), fonts, shared label style
  lib/
    storage.ts         — usePersistentState / usePersistentJSON
    random.ts          — hashSeed (PRNG) / sampleTriangular
    routing.ts         — useHashView (URL-hash-backed screen routing),
                          View and ScreenProps types shared by every screen
    units.ts           — UnitKind/UnitSystem types + conversion helpers
    unitSystem.ts       — the imperial/metric toggle's field registry
  calculators/
    speedThroughput.ts, horsepower.ts, curveGeometry.ts,
    accumulation.ts, gapping.ts  — pure math, no React, each exporting a
    typed `FooInput`/`FooResult` interface pair. Each has a matching
    `*.test.ts` alongside it (plus `testUtils.ts`'s `unwrap()` helper for
    narrowing a calculator's `T | null` return in tests — see "Calculator
    math + tests" below).
  components/
    Plate.tsx, Field.tsx, Select.tsx, Readout.tsx, InfoNote.tsx,
    Header.tsx          — shared UI primitives, each with a typed props
    interface
  diagrams/
    DiagramLabel.tsx, SpeedDiagram.tsx, HPDiagram.tsx, CurveDiagram.tsx,
    AccumDiagram.tsx, Histogram.tsx, GapDiagram.tsx
  screens/
    Home.tsx, SpeedCalc.tsx, HPCalc.tsx, CurveCalc.tsx, AccumCalc.tsx,
    GapCalc.tsx, ReferenceScreen.tsx  — each takes `ScreenProps` (from
    `lib/routing.ts`) rather than redeclaring the `setView` prop shape
```

The team edits this app both through Claude Code and directly via GitHub's
web editor, so keep this structure for new work rather than reverting to
one giant file: put new calculator math in `src/calculators/` (with a
typed input/result interface and a test file), the screen in
`src/screens/`, and register it in `App.tsx`. Editing a single small file
via the GitHub web UI is still easy under this layout — you just need to
know which file, hence this map.

## Design system

Brand colors (LogistiQ), defined in the `C` token object in `src/theme.ts`:
- `C.navy` `#002F6C` — primary text, headlines, primary accent
- `C.green` `#78BE20` — eyebrow labels, secondary accent
- `C.gray` `#888B8D` — muted/secondary text
- Light theme: white panels (`C.panel`) on light gray page background
  (`C.bg`), NOT a dark theme
- `C.yellow` and `C.steel` are legacy aliases from an earlier dark-theme
  iteration, mapped to `C.navy` and `C.green` respectively for backward
  compatibility — don't rely on the names, they're aliases now

Fonts: `displayFont` (Verdana-led stack, for headers/labels/eyebrows),
`bodyFont` (Verdana-led, general text), `monoFont` (system mono, for
numeric readouts and formulas) — LogistiQ's brand guide specifies Azo Sans
with Verdana as the fallback; since Azo Sans isn't loadable here, Verdana is
used directly.

Reusable components already built (`src/components/`) — use these rather
than rolling new ones:
- `Plate` — the white bordered/shadowed panel with rivet-corner decoration
  used for every input/result group
- `Field` — labeled numeric input with unit suffix and optional hint text.
  For physical quantities, pass `kind` (e.g. `"length_in"`) instead of a
  static `unit` string — see "Unit system: imperial/metric toggle" below
- `Select` — labeled dropdown with optional hint text
- `Readout` — labeled result display (`big` prop for the primary headline
  number)
- `InfoNote` — the muted icon+text callout used for the disclosure box at
  the bottom of every calculator (see "Honesty / disclosure convention")
- `Header` — back button + screen title
- `DiagramLabel` (`src/diagrams/DiagramLabel.tsx`) — small text label used
  inside SVG diagrams
- `ModuleCard` — home screen navigation card (lives in `screens/Home.tsx`
  since it's only used there, not shared across screens)

## App structure

Single-page app. `App.tsx` holds a `view` string via `useHashView()`
(`src/lib/routing.ts`) — this mirrors the view into `window.location.hash`
rather than plain `useState`, so the browser back/forward buttons work and
a specific calculator can be linked/bookmarked directly (e.g. `#gap`). It
is NOT persisted to `localStorage` — a fresh page load with no hash always
opens to `"home"`. Each calculator is a screen component in `src/screens/`
(`SpeedCalc`, `HPCalc`, `CurveCalc`, `AccumCalc`, `GapCalc`) rendered
conditionally based on `view`, with its own `setView("home")` back button.
`Home` lists them as `ModuleCard`s.

Current calculators:
1. **Conveyor Speed / Throughput** — belt speed ↔ parcel throughput
2. **Horsepower** — derives belt weight and load from width/length inputs
3. **Belt Curve Geometry** — minimum curve width, with a user-adjustable
   clearance/safety margin (explicitly NOT tied to a verified CEMA figure —
   be careful not to imply it is)
4. **Accumulation Buffer / Time** — buffer time before inbound must stop,
   from zone count/length/speed
5. **Static Gapping** — gap created by a series of speed-up "gapper"
   conveyors, plus a Monte Carlo simulation (triangular distribution over
   min/most-likely/max parcel length) rendered as a histogram

Plus a **Formula Reference** page listing every formula/variable/assumption
in one place — when adding a calculator, add a matching `ReferenceCard` here
too.

### Static Gapping model history (read before touching this one)

This calculator went through several real design iterations worth knowing
before changing it again:
1. Started as an "instant speed change" model (gap depends only on parcel
   length and input/output speed ratio — a genuine closed-form result,
   provably independent of gapper count/length).
2. Was rebuilt into a full friction-limited-acceleration physics simulation
   (`a = μg` per gapper) per a specific request.
3. That was reverted — at realistic friction coefficients and belt speed
   differentials, friction-driven acceleration is fast enough that it makes
   no visible difference (ramp-up completes within an inch or two of a
   36"+ gapper), so the complexity wasn't worth it. Confirmed removed:
   per-gapper friction selectors, the `simulateGapperPackage` step
   integrator, and the "Find Required Speed" reverse-solve tab.
4. Current state: back to the clean closed-form model, `Gap = ParcelLength
   × (GapperSpeed / InputSpeed − 1)`, computed per-gapper for the
   "Gap After Each Gapper" breakdown, plus the Monte Carlo distribution
   layered on top.

Don't reintroduce per-gapper friction or a physics simulation here without
being asked — it was a deliberate simplification, not an oversight.

## Persistence hooks (`src/lib/storage.ts`)

- `usePersistentState(key, defaultValue)` — for scalar string values, backed
  by `localStorage`, namespaced under `mhe-toolkit:${key}`
- `usePersistentJSON(key, defaultValue)` — same, but JSON-encoded, used for
  arrays (e.g. per-gapper speed lists that resize dynamically)

When adding a new calculator's inputs, use these so values survive closing
and reopening the app (there's a "Reset saved inputs" link on the home
screen that clears everything under the `mhe-toolkit:` prefix).

## Unit system: imperial/metric toggle (`src/lib/units.ts`, `src/lib/unitSystem.ts`)

There's a global Imperial/Metric switch on the Home screen. Design, in
short: **values are stored directly in whichever system is currently
active** (not always-imperial internally) — flipping the toggle bulk-
converts every persisted field in `localStorage` once, then does a full
`window.location.reload()` (same pattern as "Reset saved inputs"). This
was a deliberate choice over live per-keystroke conversion, which fights
the user's typing in a controlled numeric input (type "1", it silently
becomes "2.54", next keystroke lands in the wrong place). A toggle is a
rare, deliberate action, so a reload is an acceptable cost for correctness
and simplicity.

Because state is stored in-system, not always-imperial:
- Every physical-quantity `Field` needs a `kind` prop (`"length_in"`,
  `"length_ft"`, `"speed_ftmin"`, `"load_lbft"`, `"unitweight_lbft2"`) —
  `Field` reads the current system via `useUnitSystem()` internally and
  picks the right label. Dimensionless fields (counts, %, friction factor,
  angle in degrees) skip `kind` and just pass a static `unit` string, since
  they don't change between systems.
- Each calculator's `useMemo` must convert its current-system field values
  to imperial with `toImperial(value, kind, system)` before calling the
  (imperial-only) pure calculator function — the formulas themselves were
  never rewritten for metric, only the inputs/outputs around them.
- Computed outputs shown in a `Readout` get converted back for display with
  `displayResult(value, kind, system, decimals)`; raw numbers that feed
  further internal math (e.g. the Monte Carlo histogram's bin array, or a
  diagram's pixel-scaling) use `convertNumber(n, kind, system)` instead,
  which skips the string-formatting step.
- **Every new unit-bearing field must be added to the `SCALAR_FIELDS` (or
  `ARRAY_FIELDS`) registry in `unitSystem.ts`, including its default
  value.** This is not optional bookkeeping — `usePersistentState` doesn't
  write to `localStorage` until its component actually mounts, so toggling
  units before ever opening a given calculator would silently skip
  converting its fields unless the registry knows the default to fall back
  on. This exact bug shipped once already; `unitSystem.test.ts` has a
  regression test for it (`computeConvertedFields` with an empty
  snapshot) — keep it passing when adding new fields.
- `kind` is typed as `UnitKind` (a string union, `units.ts`) everywhere it
  matters for catching mistakes — `Field`'s prop, the `SCALAR_FIELDS`/
  `ARRAY_FIELDS` registries — so a typo'd kind string (e.g. `"lenght_in"`)
  fails `tsc` instead of silently no-op'ing at runtime. The conversion
  *functions themselves* (`unitLabel`, `convertValue`, etc.) intentionally
  keep `kind` typed as a loose `string`, not `UnitKind` — they're meant to
  degrade gracefully for whatever shows up at runtime, and the typo-safety
  already comes from the typed call sites, not from these utilities.
- HP and buffer time/percent/degree-style outputs are intentionally left
  unconverted (HP stays HP even in metric-using shops; time and
  dimensionless values don't have a metric equivalent to convert to).
- The Formula Reference screen's formulas/variable descriptions are left
  in imperial terms on purpose — they document the actual underlying
  computation (which is always imperial internally), not a live per-system
  display.

## Diagrams (`src/diagrams/`)

Every calculator has a live SVG diagram built from scratch (no charting
library) that updates as inputs change — see `SpeedDiagram`, `HPDiagram`,
`CurveDiagram`, `AccumDiagram`, `GapDiagram`, `Histogram`. Keep this pattern
for new calculators: a simplified, labeled schematic in the same
navy/green/gray palette, not a literal to-scale drawing.

Diagrams take unit-label strings as props (`lengthUnit`, `speedUnit`,
etc., passed by the screen via `unitLabel(kind, system)`) rather than
hardcoding `in`/`ft/min`/a bare `"` mark — needed for the metric toggle
above. Watch out for **dimension-label collisions**: metric labels like
"45.72 cm" are much wider than the old imperial shorthand ("18\""), so two
labels that used to fit side-by-side on the same row (e.g. `SpeedDiagram`'s
parcel-length vs. gap label, `CurveDiagram`'s `L =` vs. `R1 =`) can
overlap once the unit string is longer. Fix is to stack them on separate
rows (a real drafting convention — stacked dimension lines), not to
shorten the text.

`HPDiagram`'s `L` dimension is drawn **parallel to the belt itself**
(offset to the side, see the `dimOffset` comment in the component), not
flat along the ground — this was a real reported bug. `L` is the
conveyor's length along the incline (the belt's actual length, per the
horsepower formula), not the horizontal run. A flat ground-level dimension
under an inclined belt visually claims the horizontal distance equals `L`,
which is only true at 0°; at any real incline the horizontal run is
`L·cos(angle)`, a bit less than `L`. Don't revert this to a flat dimension
line without accounting for that.

## Calculator math + tests (`src/calculators/`)

Each calculator's formula lives in a pure function with no React/DOM
dependency — e.g. `calcHorsepower({ conveyorLength, beltWidth, ... })` — so
it can be unit-tested directly and called from the screen's `useMemo`. Each
exports a typed `FooInput`/`FooResult` interface pair; the function returns
`FooResult | null`. The screen component owns parsing display strings
into/out of these functions; the calculator function itself takes the raw
string inputs (it does its own `parseFloat`/validation, matching what the
UI passed in) and returns either a result object or `null` when inputs are
incomplete/invalid.

Every calculator has a matching `*.test.ts` covering: the documented
default values (so the test doubles as a worked example), at least one
edge/invalid-input case that should return `null`, and any
formula-specific invariant worth locking in (e.g. Static Gapping's Monte
Carlo sample determinism — same inputs must always produce the same
histogram, since it's seeded from a hash of the inputs, not `Math.random`).
When a test needs to access properties on a result that's known to be
non-null in that case, use `unwrap()` from `testUtils.ts` rather than a
bare `!` assertion — it throws a clear error instead of `undefined` access
if a calculator's behavior ever regresses to unexpectedly returning `null`.
When adding a calculator, add its pure function + tests here before wiring
up the screen.

## ⚠️ Critical gotcha: Unicode escape sequences

**Never write `\uXXXX` escape sequences into any `src/` file when editing
via a script or file-write tool.** This has caused real, repeated bugs —
the diagrams and screens are the most text-heavy and most likely to hit
this. The reason: `\u00d7` etc. only gets interpreted as a Unicode escape when it's
inside an actual JS string/template literal. In plain JSX text content
(between tags, not inside quotes or `{}`), it's just literal backslash-u
characters that render as garbage text in the browser.

**Always write the real character directly** — `×` not `\u00d7`, `·` not
`\u00b7`, `μ` not `\u03bc`, `≈` not `\u2248`, `—` not `\u2014`, `⚠` not
`\u26a0`. This applies whether the text is JSX children, a JS string
attribute, or inside a template literal — real characters always work
everywhere, so there's no reason to ever use the escape form.

Before finishing any edit, it's worth a quick
`grep -rn '\\\\u[0-9a-fA-F]\{4\}' src/` (or equivalent) over the diff to
catch any that slipped in.

## Honesty / disclosure convention

Every calculator ends with a muted info callout (gray background, `Info`
icon) explaining the formula and its assumptions in plain terms, and
explicitly flagging anything that's a simplification, a rule-of-thumb, or
not verified against a cited standard (e.g. the curve clearance margin, the
gapper friction removal rationale above). Keep this pattern for new
calculators — the whole point of this tool is that engineers can trust the
numbers or know exactly why they might not.

## Deployment

- Hosted on **GitHub Pages**, built via **GitHub Actions**
  (`.github/workflows/deploy.yml`) — every push to `main` triggers an
  automatic build and deploy, no manual steps needed beyond `git push`
- `vite.config.ts`'s `base` path and `public/manifest.json`'s `start_url`/
  `scope` must match the GitHub repo name exactly (currently
  `/mhe-toolkit/`) — if the repo is ever renamed, update both
- `index.html` sets `apple-mobile-web-app-status-bar-style` to `default`
  (NOT `black-translucent`) — that was a real bug (content rendering under
  the iOS status bar/notch, making the back button hard to tap); don't
  revert this without a good reason
- Offline support: `vite-plugin-pwa` (configured in `vite.config.ts`,
  `manifest: false` since `public/manifest.json` is still the hand-written
  source of truth) generates a Workbox service worker at build time that
  precaches the JS bundle, `index.html`, `manifest.json`, and the icons.
  Registration is auto-injected into `index.html`'s `<head>` — no code in
  `main.tsx`. `registerType: "autoUpdate"` means a new deploy's SW takes
  over silently on next load rather than prompting the user. The SW is
  disabled in `npm run dev` (Workbox default); to test offline behavior
  locally, use `npm run build && npm run preview`.
- After any change: if the person is running `npm run dev` locally, they
  can preview at `localhost:5173/mhe-toolkit/` before pushing. Otherwise,
  changes go live automatically ~1 minute after `git push` via Actions.
- Before pushing a change, run `npm test` (Vitest) and `npm run build` —
  the pure functions in `src/calculators/` are covered by tests, and
  `npm run build` runs `tsc --noEmit` before bundling, so both a type error
  and a broken import anywhere in the module graph fail the build
  immediately, even though `npm run dev`'s HMR can sometimes paper over
  either in the moment. `npm run typecheck` runs just the `tsc` step
  on its own when you want a faster loop than a full build.
- Standard commit loop: `git add -A && git commit -m "..." && git push`

## Who this is for

Built for a small team of MHE (materials handling equipment) system design
engineers doing field/quoting work on conveyor systems — conversational
tone in commit messages and comments should stay plain and practical, not
overly formal.
