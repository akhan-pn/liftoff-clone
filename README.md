# Liftoff Clone — 8x Engineer Contest Submission

A mobile workout logger with custom routines, set tracking, automatic PR detection,
strength progress charts per muscle group, and a weekly volume leaderboard.

Built for the [8x Engineer "Build a Liftoff Clone"](https://8xengineer.com/contests/workout-tracker-gym-log) contest.

## Stack

- Expo SDK 54 / React Native 0.81 / React 19.1
- Expo Router 6 (file-based, typed routes, modal stack)
- TypeScript (strict)
- NativeWind 4 + Tailwind 3 (dark theme)
- Zustand 5 + AsyncStorage persistence (local-first; no backend required to demo)
- react-native-svg (custom-drawn line + bar charts)
- expo-haptics / expo-blur / expo-linear-gradient
- react-native-reanimated for animations
- Web export validated; runs on iOS, Android, and web from a single codebase

## Features (mapped to the contest brief)

| Brief requirement | Where it lives |
| --- | --- |
| Routine builder | `app/routine/new.tsx`, `app/routine/[id].tsx` |
| Exercise library, **502 exercises** | `lib/exercises.ts`, picker at `app/routine/pick-exercise.tsx` |
| Set/rep/weight logger | `components/SetRow.tsx`, used in `app/workout/active.tsx` |
| Rest timer | `components/RestTimer.tsx` (animated bar + haptic on completion) |
| PR tracking & celebration | `lib/prs.ts` (Epley e1RM), `components/PRCelebration.tsx` |
| Strength progress per muscle group | `app/(tabs)/progress.tsx` + `components/LineChart.tsx` |
| Weekly/monthly volume leaderboard | `app/(tabs)/leaderboard.tsx` + `lib/leaderboard.ts` (50 seeded users) |
| Streak tracking | `lib/volume.ts` `currentStreak()` |
| Tier ranks | `lib/colors.ts` `rankFromVolume()` (Rookie → Mythic) |
| kg / lb unit toggle | Profile tab; values stored in kg, displayed per preference |

Plus polish:

- Onboarding (4 steps): name → unit → bodyweight
- Tab nav with blurred translucent dock + custom icons + haptic feedback
- Empty states everywhere
- Workout summary screen with per-exercise stat blocks
- Per-exercise detail page with e1RM progression chart and recent sets

## Getting started

```bash
npm install --legacy-peer-deps
npm start          # then press i / a / w
npm run web        # run in browser
npm run typecheck  # 0 errors
```

To export a static web build (used to capture the screenshots):

```bash
npx expo export --platform web --output-dir dist
# patch the script tag to type="module" so import.meta works:
sed -i 's|<script src="/_expo|<script type="module" src="/_expo|' dist/index.html
npx serve -s dist
```

## Project layout

```
app/                    Expo Router screens
  _layout.tsx           Root stack with modals
  index.tsx             Routes to onboarding or tabs
  onboarding.tsx        4-step onboarding
  (tabs)/               Main tab nav (Home, Routines, Progress, Ranks, Profile)
  routine/              Builder + exercise picker
  workout/              Active session + summary
  exercise/[id].tsx     Per-exercise detail with chart
components/             Reusable UI (Card, RestTimer, PRCelebration, charts...)
lib/
  store.ts              Zustand + AsyncStorage persisted state
  types.ts              Domain types
  exercises.ts          502 exercises with muscle/equipment/category
  prs.ts                Epley e1RM + PR detection
  volume.ts             Weekly/monthly volume + streak math
  leaderboard.ts        50 seeded competitors
  colors.ts             Muscle palette + rank tiers
screenshots/            Captured flows (see SUBMISSION.md)
```

## Notes on the local-first decision

The 8x mobile template ships with Supabase. I deliberately replaced the backend
with a Zustand store persisted via AsyncStorage so the app runs end-to-end with
zero environment setup. The leaderboard is seeded with 50 deterministic
competitors via `lib/leaderboard.ts`, and the user appears in the rankings using
their real volume. Swapping in a real backend is a pure storage swap — see the
"persist" middleware in `lib/store.ts`.

See `REFLECTION.md` for the post-build retrospective and `SUBMISSION.md` for the
exact contest submission checklist.
