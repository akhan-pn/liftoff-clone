# Submission Checklist — 8x Engineer Liftoff Clone

The contest at <https://8xengineer.com/contests/workout-tracker-gym-log>
asks for:

1. ✅ **Public GitHub repo (or ZIP)** — code is in this directory, committed.
2. ⚠️ **Loom walkthrough video** — must be recorded by you (see below).
3. ✅ **AI conversation logs** — see [`AI_LOGS.md`](./AI_LOGS.md).
4. ⚠️ **Resume / CV** — attach yours at submission time.
5. ✅ **Screenshots of all major flows** — see [`screenshots/`](./screenshots/).
6. ✅ **Reflection essay** — see [`REFLECTION.md`](./REFLECTION.md).

## What's left for you (Aaqeb) to do

These steps require your accounts/identity and cannot be done autonomously:

### 1. Push to GitHub
```bash
cd ~/liftoff-clone
gh repo create liftoff-clone --public --source=. --remote=origin --push
# OR if you don't have gh:
# 1) create empty repo "liftoff-clone" on github.com (public)
# 2) git remote add origin git@github.com:<you>/liftoff-clone.git
# 3) git push -u origin main
```

### 2. Record the Loom walkthrough (3–5 minutes)
Suggested script — this matches the 16 captured screenshots so judges can
follow visually:

1. **Onboarding** (15s) — name, unit, bodyweight.
2. **Home** (15s) — point out streak / weekly volume / Iron tier / 3 seeded
   routines / quick workout button.
3. **Routine detail** (20s) — open Push Day, show sets / reps / rest controls.
4. **Pick exercise** (20s) — open the modal, highlight the **502+ exercise**
   library with muscle + equipment filters; type "press" to demonstrate search.
5. **Active workout** (45s) — log a working set on Bench, hit a PR, show the
   gold celebration banner + active rest timer counting down + per-set PR
   badges.
6. **Workout summary** (15s) — volume / time / sets / PR count.
7. **Progress** (30s) — weekly volume bar chart, switch muscle group filter,
   show e1RM line per muscle, scroll PR list.
8. **Exercise detail** (15s) — Bench Press page with e1RM line + history.
9. **Leaderboard** (20s) — switch Volume/Wk → Volume/Mo → Streak; point out
   tier-colored badges (Diamond, Platinum, Gold...) and your highlighted row.
10. **Profile** (10s) — lifetime stats, kg/lb toggle, bodyweight edit.

### 3. Attach your resume
At the submission form, attach your existing CV.

### 4. Submit
Go to <https://8xengineer.com/contests/workout-tracker-gym-log> while logged
into your 8x Engineer account and click Submit. Include:
- GitHub URL
- Loom URL
- Resume attachment
- A note pointing judges at `REFLECTION.md` and `AI_LOGS.md` in the repo.

## Verifying the build before submitting

```bash
npm install --legacy-peer-deps
npm run typecheck   # 0 errors
npx expo export --platform web --output-dir dist
sed -i 's|<script src="/_expo|<script type="module" src="/_expo|' dist/index.html
npx serve -s dist   # open http://localhost:3000 to verify
```

Or for native:
```bash
npm start
# scan QR with Expo Go on iOS/Android
```
