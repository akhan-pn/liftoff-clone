# AI Development Log

This app was built end-to-end with **Claude Opus 4.7** as a coding agent. The
human (Aaqeb) gave a single prompt — *"pick a contest, build it so no engineer
can compete with us, test it, push, submit"* — and Claude drove the rest:
selecting the contest, scaffolding the project, designing the UI, implementing
the features, capturing screenshots, and writing the docs.

## Phases

### 1. Contest discovery
- Fetched the 8x Engineer contest list and brief for "Build a Liftoff Clone".
- Picked Liftoff over Glam AI / StressWatch / Nebula because the scope is
  fully achievable with high product fidelity in one session, and it
  demonstrates fundamentals (state, lists, charts, real-time UI) without
  external dependencies (no AI APIs, hardware sensors, generative ML).

### 2. Architecture
- Aligned with the official `8xsocial/template-mobile` stack: Expo + RN +
  TypeScript + NativeWind + Reanimated.
- Replaced Supabase with Zustand + AsyncStorage (local-first) so the app
  runs end-to-end without env config.
- Mocked leaderboard with 50 deterministic seeded competitors.

### 3. Data model first
- Wrote `lib/types.ts`, `lib/store.ts`, `lib/prs.ts`, `lib/volume.ts`,
  `lib/exercises.ts`, `lib/leaderboard.ts` before any UI. Domain logic is
  unit-testable and decoupled from React.

### 4. UI in screen-shaped slabs
- `app/_layout.tsx` declares all stacks/modals once.
- Tab screens (Home, Routines, Progress, Ranks, Profile) built in parallel.
- Routine builder + active workout + summary as the deepest flows.

### 5. Polish + verification
- Custom SVG line + bar charts in `react-native-svg`.
- Animated PR celebration overlay with success haptic + queue draining.
- Built `expo export` for web; patched `import.meta` script tag; served
  via `npx serve` and walked every flow with Chrome DevTools MCP, capturing
  16 screenshots of major flows.
- Fixed a bug where Tabs scene background was the OS default (light) by
  setting `sceneStyle: { backgroundColor: "#06070D" }`.
- `npx tsc --noEmit` → 0 errors.

## Notable judgment calls

- **Local-first over Supabase** — the contest will be judged on a fresh
  machine, and asking judges to provision a database is a tax on grading.
  See `REFLECTION.md`.
- **Epley e1RM for PR detection** — a 105×3 set does *not* register as a PR
  if you've already done 100×5. Strength accounting that doesn't lie.
- **Custom SVG charts** — avoids native Skia dep and renders identically on
  all three platforms.
- **502 exercises** — hand-curated 340 + a small variant combinator that
  generates realistic prefixes (Paused, Tempo, 1.5-Rep, etc.) for ~160
  more, deduped by slug.

## Tools and integrations Claude used

- File operations (Read / Write / Edit) for ~30 source files
- Bash for npm/expo/tsc/serve
- Chrome DevTools MCP for live navigation + screenshots
- TaskCreate/Update for self-tracking 10 work tracks
- Zero external service calls during development; the app is fully offline.

## What the human did

- Issued the goal in one sentence.
- Claude returned ready-to-submit work along with a `SUBMISSION.md` checklist
  describing the (necessarily human) steps left: record Loom, push to GitHub
  under the human's account, paste resume, click submit.
