# Typing Fishing — Advanced Progression Build Plan

Companion to `SPEC.md`, `BUILD_PLAN.md` (v1), and the **Advanced Progression**
epic in `BACKLOG.md`. This breaks the epic into sized, ordered, verifiable
milestones — same rules as v1: **one milestone at a time, each ends playable.**

**Status:** planned, not started. **Prerequisite:** close v1 (M4b Firestore
live-verified) first — this epic adds new save fields, so it wants a stable sync
base and a clean migration story.

## Guardrails (inherited, non-negotiable)

1. **Error-only tension in *every* tier.** Speed never feeds tension. Slow +
   careful always lands the fish. WPM is a *bonus to beat*, never a floor.
2. The **Pond (Minnow) experience never changes** — no timers, no WPM, no
   speed pressure. Everything advanced is opt-in graduation.
3. **No canvas/Phaser; no build step.** DOM/CSS, vanilla JS, the existing
   `index.html` / `app.js` / `logic.js` / `style.css` / `config.js` +
   `data/*.json` shape.
4. **All tuning in `config.js`.** New pure logic goes in `logic.js` **with
   tests** (mirrors the existing `logic.js` + `tests/` split).
5. **Firestore stays one-read-per-launch / one-write-per-catch.** New fields
   ride the existing per-kid doc — no subcollections, no per-keystroke writes.

## Architecture decisions (locked — Matt, July 2026)

| # | Decision | Recommendation | Why |
|---|----------|----------------|-----|
| **AD1** | Where phrases/sentences live | New `data/phrases.json` + `data/sentences.json`, **same tag schema** as words (`letters`, `d`, `theme`, + `location`) | Honors SPEC's "just more tagged entries" while being honest that phrases/sentences are **hand-curated**, not frequency-generated from a word list |
| **AD2** | Reel engine content unit | Generalize word-at-a-time → **token-at-a-time** (a catch = a token stream: words, spaces, punctuation). The ~450ms beat becomes the space/clause pause | Phrases already *want* word-at-a-time with a beat; this is an extension, not a rewrite. `buildReelPool` gains a content-type-aware sibling |
| **AD3** | Rank vs. location | Split: `save.rank` (earned, permanent badge), `save.location` (currently fishing), `save.unlockedLocations`. Tier table → `CONFIG.tiers` | A kid *keeps* their rank but can drop back to the Pond for a cozy session |
| **AD4** | Graduation gate | **Rods unlock locations.** Extend `CONFIG.shop.rods` with `unlocksLocation`; rank derives from furthest unlocked location | Rides the existing shop/economy — no parallel system |
| **AD5** | WPM storage | Widen `save.records[fishId]` from a bare weight to `{weight, wpm}` (with migration). New pure `computeWpm()` in `logic.js` + tests. Shown **only** Stream+ | Reuses the personal-best-per-species machinery that already exists for size |
| **AD6** | Caps & punctuation | New earned unlock track (Shift → Stream, punctuation → Ocean), extending the `CONFIG.unlock.stages` idea | Shift-as-late-unlock is already parked in SPEC/BACKLOG |

## Phase 0 — Foundation (shared plumbing)

### A0 — Rank & location model + graduation gate + rank-up ceremony
The skeleton every tier rides on; **no new content yet** (Stream/Ocean
temporarily serve existing words so the plumbing is verifiable in isolation).
- `config.js`: `CONFIG.tiers` (Minnow/Mackerel/Marlin/Muskie → location, rod,
  label, badge); add `unlocksLocation` to `shop.rods`.
- `logic.js`: `rankForState(unlockedLocations)` pure fn + tests.
- `app.js`: save fields `rank` / `location` / `unlockedLocations` + migration
  for existing saves; a location switcher (reuse the nav tray); rank-up
  ceremony reusing the M5 unlock banner + badge-toast.
- **Done when:** earning a location-unlocking rod graduates the profile
  (Minnow→Mackerel), unlocks the Stream, fires the ceremony, and persists; the
  kid can switch back to the Pond; two profiles stay independent.

## Phase 1 — Stream / Mackerel (fly fishing) · *vertical slice, ships whole*

### A1 — Phrase content + reel generalization
- `data/phrases.json`: hand-curated multi-word phrases, starting home-row-easy.
- `logic.js`: tokenizer (`text` → tokens incl. spaces); generalize
  `buildReelPool` → content pool selectable by location/type. Tests.
- `app.js`: reel loop consumes a token stream; **spacebar becomes a real
  (forgiving) key**; tension logic untouched (error-only).
- **Done when:** the Stream reels real multi-word phrases including the
  spacebar; a slow careful typist still always lands; tension reacts to errors
  only.

### A2 — Capitals via Shift (+ finger guide)
- `config.js`: capitals unlock (Shift) as a Stream-entry requirement.
- `app.js`: Shift handling in keystroke processing + `statLetter`; ghost-hands
  overlay shows the Shift reach.
- **Done when:** a phrase containing a capital reels correctly and the guide
  animates the Shift press.

### A3 — Stream fish set + biome scene
- `data/fish.json`: add `location:"stream"` fish (trout, salmon, grayling…)
  across the existing 3 rarity tiers.
- `ART.md`: Stream background + stream-fish sprites (Gemini prompts → Matt).
- `app.js`: scene swap by `save.location` (reuse the M9 `#scene-frame` scaler);
  collection screen groups silhouettes by location.
- **Done when:** entering the Stream shows the stream scene and its own fish
  silhouettes; catching a stream species flips its silhouette.

### A4 — Fly-cast rhythm mechanic + WPM personal-best (intro)
- `logic.js`: `computeWpm()`, `isPersonalBestWpm()` + tests; migrate `records`
  to `{weight, wpm}`.
- `app.js`: gentle cast-rhythm feedback (even cadence → "nice cast" flavor —
  cozy, never a penalty); personal-best WPM shown on the Stream catch card only.
- **Done when:** landing a Stream fish shows a self-paced personal-best WPM; the
  Pond is unaffected; missing your best is never a fail state.

**→ Stream ships:** a Mackerel kid fly-fishes real phrases, learns spacebar +
capitals, and chases their own best time.

## Phase 2 — Ocean / Marlin + Muskie (sport fishing) · *vertical slice*

### A5 — Sentence content + punctuation
- `data/sentences.json`: curated, kid-appropriate sentences that teach `. , ! ?`.
- `config.js`: punctuation unlock track (Ocean-entry requirement).
- `app.js`: reel handles punctuation tokens + mid-sentence capitals; detect
  clause boundaries (for A7's runs).
- **Done when:** the Ocean reels a full sentence with punctuation, correctly.

### A6 — Ocean fish set + biome scene + deep-sea rod gate
- `data/fish.json`: `location:"ocean"` sport fish (marlin, tuna, mahi…), with
  **Muskie Quixote** as the ocean legendary.
- `config.js`: deep-sea rod (`unlocksLocation:"ocean"`).
- `ART.md`: Ocean scene + ocean-fish sprites.
- **Done when:** the deep-sea rod gates the Ocean; ocean fish + scene present.

### A7 — Sport-fish "fight" mechanic
- `app.js`: sentence reeled in clauses; the fish "runs" (a beat) between
  clauses; bigger fish take more segments to land (extend
  `wordsToLandByTier` → segments).
- **Done when:** an Ocean landing has clause-runs; tension is still error-only.

### A8 — Muskie prestige capstone
- `logic.js`/`app.js`: landing **Muskie Quixote** awards the **Muskie** rank +
  a bigger-than-usual capstone celebration; a journal badge.
- **Done when:** catching the legendary awards the Muskie rank with its own
  ceremony.

**→ Ocean ships:** Marlin kids fight full sentences; Muskie is the endgame.

## Data-shape additions (summary)

- **Save (per kid):** `+ rank`, `+ location`, `+ unlockedLocations`;
  `records[fishId]` widens `weight → {weight, wpm}` (migrated).
- **`config.js`:** `+ CONFIG.tiers`; `shop.rods[].unlocksLocation`; a
  caps/punctuation unlock track; clause-run + rhythm-window tuning.
- **`data/`:** `+ phrases.json`, `+ sentences.json`; `fish.json` entries gain
  `location`.

## Art dependency (the long pole — flag to Matt early, see `ART.md`)

Stream background · Ocean background · ~8–10 stream fish · ~8–10 ocean fish ·
Muskie Quixote hero sprite · fly-rod + deep-sea-rod shop icons. All within the
locked ~16-color palette. This is the slowest, most serial dependency
(Gemini-generated, Matt-in-the-loop) — start it the moment Phase 1 is greenlit.

## Decisions (locked — Matt, July 2026)

All five confirmed as the recommended defaults:

1. **Content schema** — ✅ separate `data/phrases.json` + `data/sentences.json`,
   sharing the word tag-schema (AD1). Not one pool with a `type` field.
2. **Spacebar & punctuation** — ✅ real typed keys (they *are* the skill),
   forgiving. Not auto-inserted beats.
3. **Sequence** — ✅ vertical slices per tier: ship all of Stream (Phase 1)
   before starting Ocean (Phase 2). Not horizontal (all content, then all art).
4. **Sentence sourcing** — ✅ hand/family-curated (small set; quality +
   kid-appropriateness matter). Not generated.
5. **WPM visibility** — ✅ per-species personal best on the catch card, Stream+
   only; **never sibling-visible** (upholds the no-leaderboard cozy stance).
