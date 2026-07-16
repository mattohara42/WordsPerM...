# Typing Fishing — v1 Build Plan

Companion to `SPEC.md`. Each milestone is sized for roughly one Claude Code session and ends in a playable/verifiable state. Build in order — each milestone depends on the previous.

## Repo setup (before first session)

```
typing-fishing/
├── SPEC.md                  ← the design spec (source of truth)
├── BUILD_PLAN.md            ← this file; check off milestones
├── prototype/
│   └── feel-prototype.html  ← Phase 2 prototype (reference for game feel, not code reuse)
├── index.html
├── app.js
├── style.css
└── data/
    └── words.json           ← generated word pool (M2)
```

Same 3-file vanilla JS pattern as Family Hub, no build step, `python3 -m http.server 8080` locally, Netlify for deploy. Firestore config can follow Family Hub's setup.

**Tech decision to make in M1, not before:** plain DOM/CSS (like the prototype) vs. canvas vs. Phaser 3. Recommendation: start DOM/CSS since the prototype proved it handles this game's needs; escalate only if pixel-art animation demands it.

## Milestones

### ✅ M1 — Core loop, ported and polished (done 2026-07-15)
Port the prototype's cast → wait → reel → catch loop into the real app structure. Word-at-a-time pacing (~450ms pause), error-only tension meter, ghost-hands finger guide. Hardcoded word list is fine here.
**Done when:** the full loop plays in the repo app at parity with the prototype.

### ✅ M2 — Word pool (done 2026-07-15)
**Head start: `generate-words.mjs` and a generated `words.json` (3,014 words) already exist — built and validated during design.** Filters a frequency list against a real dictionary, blocklists junk, supplements home row, tags each word with `letters`/`difficulty`/`theme`. Stage coverage verified: 37 home-row words at stage 1, growing to 167 by stage 2 — so keep stage 1 short (few fish to first unlock). This milestone is now just: wire the game to load `words.json` and filter by an unlocked-letter set (hardcode home row for now).
**Done when:** the game only ever serves words typeable with the configured letter set.

### ✅ M3 — Fish, rarity, coins (done 2026-07-15 — CSS placeholder fish, sprite sourcing deferred)
Define ~8–10 fish across 3 rarity tiers. Rarity maps to word difficulty. Catches award coins. Pixel-art placeholder sprites — source from Kenney.nl (CC0) or itch.io cozy fishing packs; prefer packs sharing one palette. Kid-drawn fish are a legitimate asset pipeline.
**Done when:** rare fish demand harder words and the coin balance persists across a session.

### 🟡 M4 — Profiles (Firestore) — M4a done 2026-07-16, M4b (Firestore sync) pending
Profile picker on launch. Per-kid: unlocked letters, coins, collection, upgrades, accuracy/timing stats (logged silently — feeds v2 adaptive meter). Reuse Family Hub Firestore patterns.
**Done when:** two profiles maintain fully separate state across reloads.
- **M4a (done):** profile picker + emoji avatars, per-kid localStorage save shaped
  per FIRESTORE.md, legacy-save migration, silent per-letter/word/session stats,
  switch-kid. Meets the done-when on localStorage alone.
- **M4b (code complete, awaiting live verification):** Firestore
  read-on-launch / write-on-catch + localStorage mirror, one parent Google
  sign-in (Firebase signInWithPopup) for cross-device sync, ownerUid-scoped
  docs, firestore.rules to add. Offline fallback verified in-sandbox (Firebase
  unreachable → game plays on localStorage, no errors). The signed-in path
  needs live HTTPS (Netlify) + Firebase console setup to verify — see the
  session handoff. Parent must: add fishtyping.netlify.app to Firebase Auth
  authorized domains, and merge firestore.rules into the shared ruleset.

### ✅ M5 — Letter unlock progression (done 2026-07-15)
Fish-count milestones unlock new letters in a configured order. Celebration moment on unlock ("new letter!"). Word pool filter updates live.
**Done when:** a fresh profile starts home-row-only and visibly expands its letter set through play.

### ✅ M6 — Collection screen (done 2026-07-15 — M4 pending, single shared save until then)
Grid of all fish; uncaught ones as silhouettes. Per-profile.
**Done when:** catching a new species flips its silhouette.

### ✅ M7 — Shop: rods & bait (done 2026-07-15)
2–3 rods (bite rate / rare odds), 2–3 baits. Simple shop screen, coin spend, effects actually applied.
**Done when:** an upgraded rod measurably changes bite behavior.

### ✅ M7.5 — Juice pass (visual polish) (done 2026-07-15)
One dedicated milestone, done against real gameplay rather than sprinkled through earlier work:
- Locked ~16-color palette (pick from lospec.com) applied to all assets **and** UI
- Layered parallax water (3–4 translucent layers, different drift speeds) + ripples
- Catch/bite juice: splash particles, fish arc on landing, floating "+coins" text, subtle screen shake on bite
- Idle life: boat bobbing, occasional fish shadows, day/night tint cycle (CSS filter)
**Done when:** a stranger watching 10 seconds of idle gameplay says it looks cozy.

### M8 — Ship it
Netlify deploy, kid playtest, tune `CFG` values (words-per-fish, tension penalties, pause length) based on real beginner typing.
**Done when:** a kid lands a fish unassisted and asks to play again.

### M9 — Visual overhaul (proposed, after M8)
UI-only pass, no new game logic:
- `#scene` fills the viewport (`100dvh`/`100dvw`) instead of a fixed 720×360 box; `#hud`/`#controls` become small corner overlays so the scene never gets squeezed.
- Boat waterline fix (done ahead of this milestone — `#rig` was floating in the sky layer at `top: 88px`, moved to `top: 178px` to sit at `#water`'s start).
- Ghost-hands `#guide` moves from below-the-fold flow into a `position: fixed` bar pinned to the bottom of the viewport, `rgba` background so the scene shows through; already-built finger animation logic is unchanged, only its container/positioning.
- Real sprite pass replacing CSS placeholder shapes (fish, boat, kid) — Kenney.nl/itch.io cozy fishing packs sharing the locked M7.5 palette, or kid-drawn art per CLAUDE.md's asset guidance.
**Done when:** the game reads as full-screen with no fixed-size scene box, the finger guide overlays the bottom of the viewport without displacing gameplay, and placeholder CSS shapes are replaced with real sprites.

**Explicitly out of scope for M9:** multiple background scenes / levels — that's the existing "more ponds/locations" v2 item (see BACKLOG.md → World), a bigger scope decision (new backgrounds only, vs. new fish/mechanics per level) to be scoped on its own once M9 ships.

### ✅ M10 — Audio (done 2026-07-16)
Pulled forward from the SPEC.md v2 parking lot ("sound design beyond basic ambient loop") at the user's request, ahead of M9. Procedural Web Audio synth — no external asset files, so no licensing/sourcing needed and no new build step:
- Water-drone ambient bed (two low sines + slow LFO detune through a lowpass filter), starts on the profile-pick click (the user gesture that unlocks AudioContext autoplay).
- SFX: cast splash, bite chime, per-word tick while reeling, wrong-key buzz, catch/rare-catch fanfare, escape descent, letter-unlock fanfare.
- `Sound: ON/OFF` toggle next to the finger-guide toggle; preference persisted in localStorage (global, not per-profile — not game state, so not synced to Firestore).
- Ambient bed ducks to silent on tab-hidden, restores on return.
- Volume levels + ambient base pitches live in `CONFIG.audio`; note/melody content lives in app.js next to `PUNS`, matching the existing tuning-vs-content split.
**Done when:** sound plays after the first profile-pick click, the mute toggle silences everything, and no console errors surface across cast → wait → reel → catch/escape → unlock.

## Session tips (learned from Family Hub)

- Start each Claude Code session by pointing it at `SPEC.md` and the current milestone.
- Keep a `BACKLOG.md` for ideas that come up mid-build — don't let them expand the current milestone.
- Test locally via ngrok only when OAuth/HTTPS matters (M4 onward); plain http.server before that.
- Tuning values stay in one `CFG` object, same as the prototype.

## Explicitly deferred (see SPEC.md v2 list)

Adaptive tension meter · themed word packs · custom word lists · more ponds · sound design beyond ambient loop
