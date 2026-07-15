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
