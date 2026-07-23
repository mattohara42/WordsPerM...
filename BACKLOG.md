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
- **✅ Junk-word cleanup (done 2026-07-23).** The "sie" bug turned out not to be
  a lookup fix: a re-run against a 370k-word reference list (dwyl/english-words)
  found *zero* missing pool words — the original dict was equally permissive, so
  it was a curation call, not a filter gap. Curated a stop-list of **163
  non-words** now in `data/blocklist.json` — acronyms/initialisms (`usa`, `ibm`,
  `faq`…), abbreviations (`jan`, `dec`, `mon`, `dept`, `univ`…), foreign words
  (`sie`, `eau`, `bon`…), and prefix/junk tokens (`non`, `pre`, `dont`). Pool
  3014 → 2851; stage 1 (home row) untouched at 37 words, all later stages still
  hundreds deep. `generate-words.mjs` now reads the blocklist and a
  `data.test.mjs` guard fails if any blocklisted word reappears. Real words that
  merely *look* like junk were deliberately kept (`don`, `bob`, `jay`, `lee`,
  `ken`, `tom`, `sun`, `wed`, `mar`, `nil`, `gel`, `cod`, `chi`, `phi`, `psi`…).
  - **Still deferred (a bigger, more subjective cut):** proper first names and
    place names (`jim`, `joe`, `dan`, `texas`, `china`, `john`…) are still in the
    pool. They're real and typeable, so removing them is a separate policy call —
    revisit if they read as noise during a kid playtest.

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

## EPIC: Advanced Progression — tiers, phrases, sentences, WPM-as-goal (v2/v3)

*Approved by Matt, July 2026. A multi-milestone epic, NOT a single milestone —
scope it into its own build plan when v1 (M4b Firestore) is closed out. Work one
piece at a time; nothing here expands current work.*

**Why:** three kids, ~3 years apart, will always sit at different capability
levels and need different challenges *at the same time*. The per-kid profile
system (M4) already keeps their state fully separate, so each kid can live in a
different tier simultaneously.

**The one rule that keeps this in keeping with the original intent:** advanced
progression is a **graduation into an opt-in tier, never a retrofit of the cozy
core.** The starting pond stays exactly as-is — error-only tension, no timers,
slow-is-safe. Depth is a door a kid *chooses* to walk through once ready, not a
difficulty ramp applied to a beginner.

### Tiers = a kid's rank; locations = the mode they unlock

| Rank | Location | Fishing style | Content | Typing focus |
|------|----------|---------------|---------|--------------|
| **Minnow** | **Pond** | still-water (current game) | single words | letters, home-row-out — *this is v1, untouched* |
| **Mackerel** | **Stream** | fly fishing | multi-word phrases | capitals + punctuation begin (Shift as the parked "late letter unlock") |
| **Marlin** | **Ocean** | sport fishing | full sentences | fluency, rhythm, personal-best pacing |

Rank is per-profile and permanent (you don't get demoted); a kid can always drop
back to a lower pond for a cozy session. Advancement gate mirrors the existing
letter-unlock model (fish-count / mastery milestone), not a speed test.

### WPM: a goal, not a punishment (Matt's explicit call, July 2026)

- The "no visible WPM / no speed pressure" Non-Goal **still holds for the Minnow
  pond** — the beginner experience never changes.
- WPM surfaces **only in the higher tiers**, and only ever as a **self-paced
  personal-best** a kid is chasing against their *own* past, never a fail bar you
  can drop below and lose the fish. Slow is still always safe; speed is a
  *bonus* to beat, not a floor to clear.
- Data groundwork already exists: SPEC's v2 note has us logging per-word
  timing/accuracy silently since v1 *specifically* so this tier has data on day
  one. This is mostly a "decide how to surface data we already have" problem, not
  a new timing system.

### Per-tier mechanic sketches (brainstorm — not locked)

- **Stream / fly fishing (Mackerel):** casting gets a gentle *rhythm* — type the
  phrase in an even cadence to "lay the fly" well. Rewards flow/consistency, not
  raw speed. Phrases introduce the spacebar and word-to-word transitions.
- **Ocean / sport fishing (Marlin):** landing a big fish is a *fight* — a longer
  sentence reeled in bursts, the fish "runs" (pauses) between clauses. Sentences
  bring capitals, commas, periods. This is where personal-best WPM lives, as the
  "how cleanly did you land the marlin" flourish.

### Graphics

Each biome is a new background scene — reuses the M9 `#scene-frame` scaling
system. This is the existing "more ponds/locations" v2 World item, now given
concrete identities (Pond / Stream / Ocean). Real art scope → `ART.md` (Gemini
prompts + Matt generates). Palette stays the locked ~16-color set.

### Open threads to resolve when this is scoped for real
- Exact advancement gates per tier (catch count? species mastery? never speed).
- Punctuation/capital unlock order — is it its own progression inside Stream, or
  a prerequisite to entering it?
- How personal-best WPM is shown so it reads as an invitation, not a scoreboard
  (and whether it's ever sibling-visible — leans NO, per the no-leaderboard cozy
  stance).
- Sentence content source & schema — the word pool has no phrase/sentence entry
  type today; that's a real data-shape addition.
