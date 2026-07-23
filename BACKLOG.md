# Typing Fishing — Backlog

Ideas captured during design/build. Nothing here expands the current milestone.

## Flavor & fun
- **Groan counter** — after each catch pun, a 🙄 button increments a lifetime "Dad Jokes Endured" stat per profile. Zero gameplay impact, maximum family lore.
- Kids contribute puns: pun pools are one data structure; add a simple way for family to submit new ones.
- Kid-drawn fish as real sprites (scan/photo → pixel-ify).

## Gameplay (v2 candidates — see SPEC.md)
- Adaptive tension meter (accuracy/timing stats already being logged in v1 for this).
- Themed word packs; custom school spelling lists (parent-editable).
- Accuracy-gated letter unlocks as an alternative to fish-count milestones.
- Shift key as a late "letter unlock" (capitals).

## World
- More ponds/locations; weather; real day/night tied to clock.
- Sound design pass beyond ambient loop.

## Word pool
- Stage 1 (home row) is intentionally small (37 words) — keep stage 1 short (few fish to first unlock). Revisit supplements list if kids exhaust it.
- Difficulty scoring is length-based + rare-letter bump; could later weight by bigram awkwardness.
- Junk word "sie" surfaced at stage 2 during M5 testing — cleanup pass on
  generate-words.mjs blocklist (check for other non-words that slipped
  through the dictionary filter).
  - **Investigated 2026-07-23:** a re-run against a large reference wordlist
    (dwyl/english-words, 370k entries) finds *zero* pool words missing — the
    original dict was equally permissive, which is exactly why junk got
    through. So this isn't a lookup fix; it's a curation call. The junk that a
    dictionary won't catch, by category: initialisms (`usa`, `ibm`, `faq`,
    `cpu`, `gps`, `fbi`, `cia`, `lcd`, `rpm`, `mph`), month/day abbreviations
    (`jan`…`dec`, `mon`, `tue`, `wed`, `sat`), and proper-noun fragments
    (`jim`, `joe`, `dan`, `sam`, `rio`, `san`), plus foreign words like `sie`.
    ~100–150 candidates, all length-3. Needs a *decision on how aggressive to
    be* (are abbreviations fair typing practice or not?) before writing a
    curated stoplist — deferred to Matt. Once decided: bake the stoplist into
    `generate-words.mjs` and add a `data.test.mjs` guard so the confirmed junk
    can never reappear.

## Fun brainstorm — July 2026 (all approved by Matt)

Design guardrail for every item: cozy first, never punish slow typing — only
carelessness (repeated errors). Rewards key off accuracy/collection, never speed.

**✅ Shipped (2026-07-22):**
- **Fish size variants** — every catch rolls a weight; "a little one" / "LUNKER" flavor; personal-best-per-species in `save.records`, shown in the collection screen. (`config.size`)
- **Parent GROWN-UPS view** — per-key accuracy heatmap + trouble-key summary, built from `save.stats.letters`. Read-only, no new data collection.
- **Fishing journal + badges** — nine punny milestone badges (First Mate, Home Row Hero, Hooked on Typing, Reel Regular, Landed a Lunker, The Deep End, Tackle Box Tycoon, Sharp Shooter, Alphabet Angler). Gold toast on earn (catch + shop), retroactive backfill on open. (`config.badges`, `save.badges`)
- Also shipped alongside: larger keyboard (palm ovals removed, `GUIDE_SCALE`) and the one-time 25-fish "REEL TALK" rod nudge (`config.economy.rodNudgeAt`).
- **Junk catches** — 8% of bites hook a boot / tin can / pond weed instead of a fish; reels like an easy common, lands with a `PUNS.junk` groan, no coins/collection, bumps `save.jokesEndured`. (`config.junk`; `assets/junk-{boot,can,weed}.png`)
- **Cosmetic boat shop** — buy boat skins (classic free + red/blue/leaf/purple); BOATS section in the shop, `applyBoatSkin()` swaps `#boat` on equip. (`config.shop.boats`; `assets/boat-{red,blue,leaf,purple}.png`). Gemini baked the checkerboard as opaque pixels — salvaged via strip + tight-crop (see `ART.md`).

**⏳ Deferred (post-v1):**
- **Cosmetic hats** — the kid sprite (`assets/kid.png`) has a hat baked in, so hats need alternate kid sprites. Boats shipped; hats wait on that.

**Reasons to come back (gentle, not grindy):**
- **Today's special fish** — date-seeded rare that only bites today. Cozy daily return hook, no streak-guilt.
- **The one that got away** — the only failure state (escape) becomes a quest: log the escapee as a silhouette + taunt; catching it later clears the grudge.

**Teaching depth (softly — it's a tutor):**
- **Trouble-letter casts** — quietly weight word selection toward each kid's weakest key. Invisible adaptive help; data already exists (and the GROWN-UPS view now surfaces which keys those are).
- **Clean-streak encouragement** — "three careful catches in a row!" flavor. Rewards accuracy, the game's one real lever.

**Family & world (cozy, never competitive):**
- **Family trophy wall** — each kid's biggest catch shown together (Firestore is already multi-profile). Sibling delight without a leaderboard.
- **Named nemesis fish** — Muskie Quixote already exists in `data/fish.json` as the legendary; give it recurring lore + a bigger landing celebration.
- **Home aquarium** — caught fish swim in a viewable tank. The ultimate "look what I made" for a kid. Needs art.
