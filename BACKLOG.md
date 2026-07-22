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

## Fun brainstorm — July 2026 (all approved by Matt, unscoped)

Design guardrail for every item: cozy first, never punish slow typing — only
carelessness (repeated errors). Rewards key off accuracy/collection, never speed.

**Quick wins (cheap + reuse existing assets/data):**
- **Cosmetic shop** — spend coins on hats & boats. Coin sink beyond rods, pure dress-up delight. Needs art (see `ART.md`).
- **Parent progress view** — hidden "grown-ups" screen: per-key heatmap of what each kid nails vs. fumbles, built entirely from `save.stats.letters` (already logged, nothing surfaces it yet). Low effort, high value for Matt.
- **Junk catches** — occasionally hook a boot / tin can / grumpy crab with a groan pun. Fake low tier; comedy; teaches "not every cast is a jackpot." Needs a few junk sprites.
- **Fish size variants** — same species rolls small / average / *lunker*; track personal-best weight per species. One random roll + stored max. No speed pressure.

**Reasons to come back (gentle, not grindy):**
- **Today's special fish** — date-seeded rare that only bites today. Cozy daily return hook, no streak-guilt.
- **Fishing journal / punny badges** — "Home Row Hero" (cleared stage 1), "Hooked on Typing" (100 casts), "The Deep End" (first legendary). Achievement pull without a clock.
- **The one that got away** — the only failure state (escape) becomes a quest: log the escapee as a silhouette + taunt; catching it later clears the grudge.

**Teaching depth (softly — it's a tutor):**
- **Trouble-letter casts** — quietly weight word selection toward each kid's weakest key. Invisible adaptive help; data already exists.
- **Clean-streak encouragement** — "three careful catches in a row!" flavor. Rewards accuracy, the game's one real lever.

**Family & world (cozy, never competitive):**
- **Family trophy wall** — each kid's biggest catch shown together (Firestore is already multi-profile). Sibling delight without a leaderboard.
- **Named nemesis fish** — Muskie Quixote already exists in `data/fish.json` as the legendary; give it recurring lore + a bigger landing celebration.
- **Home aquarium** — caught fish swim in a viewable tank. The ultimate "look what I made" for a kid. Needs art.

**Suggested starting order:** cosmetic shop + junk catches (highest fun-per-hour, on-brand for the dad-joke voice), then the parent progress view.
