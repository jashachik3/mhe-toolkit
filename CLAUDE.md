# MHE Toolkit — Project Context

A mobile-first PWA of field-reference calculators for conveyor system design,
built for LogistiQ Integration Solutions engineers. Installed to iPhone home
screens via "Add to Home Screen" in Safari — behaves like a native app.

## Tech stack

- Vite + React (no TypeScript, no Tailwind, no CSS framework)
- Single-file app: nearly everything lives in `src/App.jsx`. Keep new
  calculators in this same file unless the file becomes genuinely unwieldy —
  don't split into new files without asking first, since the deploy/edit
  workflow (GitHub web editor, then later Claude Code) has been built around
  one file.
- Icons: `lucide-react`
- Styling: inline style objects using a shared color/font token system (see
  below) — no CSS files, no styled-components, no Tailwind classes
- Persistence: `localStorage` via two custom hooks (see below) — this is a
  real deployed web app, not a sandboxed Claude artifact, so localStorage is
  fine to use here (unlike Claude.ai artifacts, which forbid it)

## Design system

Brand colors (LogistiQ), defined in the `C` token object near the top of
`App.jsx`:
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

Reusable components already built — use these rather than rolling new ones:
- `Plate` — the white bordered/shadowed panel with rivet-corner decoration
  used for every input/result group
- `Field` — labeled numeric input with unit suffix and optional hint text
- `Select` — labeled dropdown with optional hint text
- `Readout` — labeled result display (`big` prop for the primary headline
  number)
- `Header` — back button + screen title
- `ModuleCard` — home screen navigation card
- `DiagramLabel` — small text label used inside SVG diagrams

## App structure

Single-page app, `App()` component holds a `view` state string (plain
`useState`, NOT persisted — always opens to `"home"`). Each calculator is a
sibling component (`SpeedCalc`, `HPCalc`, `CurveCalc`, `AccumCalc`,
`GapCalc`) rendered conditionally based on `view`, with its own
`setView("home")` back button. `Home` lists them as `ModuleCard`s.

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

## Persistence hooks

- `usePersistentState(key, defaultValue)` — for scalar string values, backed
  by `localStorage`, namespaced under `mhe-toolkit:${key}`
- `usePersistentJSON(key, defaultValue)` — same, but JSON-encoded, used for
  arrays (e.g. per-gapper speed lists that resize dynamically)

When adding a new calculator's inputs, use these so values survive closing
and reopening the app (there's a "Reset saved inputs" link on the home
screen that clears everything under the `mhe-toolkit:` prefix).

## Diagrams

Every calculator has a live SVG diagram built from scratch (no charting
library) that updates as inputs change — see `SpeedDiagram`, `HPDiagram`,
`CurveDiagram`, `AccumDiagram`, `GapDiagram`, `Histogram`. Keep this pattern
for new calculators: a simplified, labeled schematic in the same
navy/green/gray palette, not a literal to-scale drawing.

## ⚠️ Critical gotcha: Unicode escape sequences

**Never write `\uXXXX` escape sequences into this file when editing via a
script or file-write tool.** This has caused real, repeated bugs. The
reason: `\u00d7` etc. only gets interpreted as a Unicode escape when it's
inside an actual JS string/template literal. In plain JSX text content
(between tags, not inside quotes or `{}`), it's just literal backslash-u
characters that render as garbage text in the browser.

**Always write the real character directly** — `×` not `\u00d7`, `·` not
`\u00b7`, `μ` not `\u03bc`, `≈` not `\u2248`, `—` not `\u2014`, `⚠` not
`\u26a0`. This applies whether the text is JSX children, a JS string
attribute, or inside a template literal — real characters always work
everywhere, so there's no reason to ever use the escape form in this file.

Before finishing any edit, it's worth a quick
`grep -n '\\\\u[0-9a-fA-F]\{4\}'` (or equivalent) over the diff to catch any
that slipped in.

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
- `vite.config.js`'s `base` path and `public/manifest.json`'s `start_url`/
  `scope` must match the GitHub repo name exactly (currently
  `/mhe-toolkit/`) — if the repo is ever renamed, update both
- `index.html` sets `apple-mobile-web-app-status-bar-style` to `default`
  (NOT `black-translucent`) — that was a real bug (content rendering under
  the iOS status bar/notch, making the back button hard to tap); don't
  revert this without a good reason
- After any change: if the person is running `npm run dev` locally, they
  can preview at `localhost:5173/mhe-toolkit/` before pushing. Otherwise,
  changes go live automatically ~1 minute after `git push` via Actions.
- Standard commit loop: `git add -A && git commit -m "..." && git push`

## Who this is for

Built for a small team of MHE (materials handling equipment) system design
engineers doing field/quoting work on conveyor systems — conversational
tone in commit messages and comments should stay plain and practical, not
overly formal.
