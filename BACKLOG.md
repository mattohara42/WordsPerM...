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

## Fun brainstorm — July 2026 (all approved by Matt)

Design guardrail for every item: cozy first, never punish slow typing — only
carelessness (repeated errors). Rewards key off accuracy/collection, never speed.

**✅ Shipped (2026-07-22):**
- **Fish size variants** — every catch rolls a weight; "a little one" / "LUNKER" flavor; personal-best-per-species in `save.records`, shown in the collection screen. (`config.size`)
- **Parent GROWN-UPS view** — per-key accuracy heatmap + trouble-key summary, built from `save.stats.letters`. Read-only, no new data collection.
- **Fishing journal + badges** — nine punny milestone badges (First Mate, Home Row Hero, Hooked on Typing, Reel Regular, Landed a Lunker, The Deep End, Tackle Box Tycoon, Sharp Shooter, Alphabet Angler). Gold toast on earn (catch + shop), retroactive backfill on open. (`config.badges`, `save.badges`)
- Also shipped alongside: larger keyboard (palm ovals removed, `GUIDE_SCALE`) and the one-time 25-fish "REEL TALK" rod nudge (`config.economy.rodNudgeAt`).

**⏳ Approved, waiting on art (see `ART.md` — Matt generates in Gemini):**
- **Junk catches** — occasionally hook a boot / tin can / pond weed with a groan pun. Fake low tier; comedy; "not every cast is a jackpot." Needs `assets/junk-{boot,can,weed}.png`.
- **Cosmetic shop (boats)** — spend coins on boat skins (clean sprite swap of `boat.png`). Needs `assets/boat-{red,blue,leaf}.png`; `Gemini_Boat_Purple.png` → `boat-purple.png` is a free fourth. NOTE: originally scoped as "hats & boats," but the kid sprite has a hat baked in, so hats would require alternate kid sprites — boats first, hats later as a kid-sprite variant.

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
