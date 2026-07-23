// logic.js — pure game math. No DOM, no module globals, no implicit RNG:
// everything a function needs comes in as an argument, so app.js can wire in
// its live CONFIG/save/word pool while tests can pass fixtures and a seeded
// roll. This is the layer worth unit-testing; app.js keeps thin wrappers.

// How many unlock stages a lifetime catch count has opened.
export function unlockedStageCount(stages, totalCatches) {
  return stages.filter(s => totalCatches >= s.catchesRequired).length;
}

// The cumulative set of letters unlocked across the first `count` stages.
export function lettersForStages(stages, count) {
  return new Set(stages.slice(0, count).flatMap(s => [...s.letters]));
}

// Which tier a bite is, given a tier→probability map and a roll r in [0,1).
// Walks the cumulative distribution; falls back to "common" if odds under-sum.
export function pickTier(odds, r = Math.random()) {
  for (const [tier, p] of Object.entries(odds)) {
    r -= p;
    if (r < 0) return tier;
  }
  return "common";
}

// Classify a weight within its tier's range: "lunker" | "little" | "".
// Unknown tiers fall back to the common range (matches the roll below).
export function weightClass(sizeCfg, tier, weight) {
  const [min, max] = sizeCfg.weightRangeByTier[tier] ?? sizeCfg.weightRangeByTier.common;
  const frac = (weight - min) / (max - min);
  return frac >= sizeCfg.lunkerFrac ? "lunker"
       : frac <= sizeCfg.littleFrac ? "little" : "";
}

// Roll a catch weight (lb, rounded to 0.1) for a tier plus its class.
// rnd() defaults to Math.random; class is taken from the unrounded weight.
export function rollWeight(sizeCfg, tier, rnd = Math.random) {
  const [min, max] = sizeCfg.weightRangeByTier[tier] ?? sizeCfg.weightRangeByTier.common;
  const w = min + rnd() * (max - min);
  return { weight: Math.round(w * 10) / 10, cls: weightClass(sizeCfg, tier, w) };
}

// Tension after one processed keystroke while reeling. The SPEC's core rule:
// tension reacts to errors only, never speed. A correct key relieves tension
// (at any typing speed — slow-but-careful is always safe); a wrong key adds.
// Result is clamped to [0, escapeAt]; `escaped` is the game's one fail state,
// true only when a wrong key pushes tension to the escape ceiling.
export function applyTension(current, correct, reelCfg) {
  if (correct) {
    return { tension: Math.max(0, current - reelCfg.correctRelief), escaped: false };
  }
  const tension = Math.min(reelCfg.escapeAt, current + reelCfg.errorTension);
  return { tension, escaped: tension >= reelCfg.escapeAt };
}

// Coins awarded for a catch: the fish's base value plus a one-time bonus the
// first time a species is landed.
export function catchReward(fishCoins, firstCatch, firstCatchBonus) {
  return fishCoins + (firstCatch ? firstCatchBonus : 0);
}

// A caught weight is a new personal best when it beats the stored record — or
// when there is no record yet (previousBest undefined → treated as 0).
export function isPersonalBest(previousBest, weight) {
  return weight > (previousBest ?? 0);
}

// Whether a correct keystroke's latency counts toward timing stats: it needs a
// prior keystroke this word (lastKeyTime set) and a gap under the "kid stepped
// away" ceiling, so idle pauses don't pollute the silent timing data.
export function countsTowardTiming(lastKeyTime, now, maxLatencyMs) {
  return lastKeyTime > 0 && (now - lastKeyTime) < maxLatencyMs;
}

// Overall accuracy across a per-letter stats map ({ letter: { n, errors } }):
// the fraction of keystrokes that were correct, plus the total keys seen.
// Empty map → 0% over 0 keys (badge thresholds gate on a key minimum).
export function overallAccuracy(letters) {
  let n = 0, e = 0;
  for (const k in letters) { n += letters[k].n; e += letters[k].errors; }
  return { pct: n + e ? n / (n + e) : 0, keys: n + e };
}

// Which locations a profile has unlocked, derived from the rods it owns (like
// letters derive from catches). tiers[0].location is the always-open home spot;
// each owned rod with `unlocksLocation` adds that spot. Order-preserving, deduped.
export function locationsForRods(tiers, rods, ownedRodIds) {
  const fromRods = rods.filter(r => r.unlocksLocation && ownedRodIds.includes(r.id))
                       .map(r => r.unlocksLocation);
  return [...new Set([tiers[0].location, ...fromRods])];
}

// The earned rank: the furthest tier whose location the profile has unlocked.
// tiers are ordered easiest→hardest; pond is always unlocked so this is never
// below tiers[0].rank. (Muskie is a prestige rank awarded on the legendary
// catch, not location-derived — see BUILD_PLAN_ADVANCED A8.)
export function rankForState(tiers, locations) {
  let rank = tiers[0].rank;
  for (const t of tiers) if (locations.includes(t.location)) rank = t.rank;
  return rank;
}

// Words (or phrases) matched to a fish's difficulty, mixing in easier ones only
// when the pool is too thin to fill minSize (e.g. stage 1's lone hard word).
// Content-agnostic: works on any entry with a numeric `d`, so the phrase reel
// (AD2) draws from data/phrases.json through the same difficulty machinery.
export function buildReelPool(entries, difficulty, minSize) {
  let floor = difficulty, pool;
  do {
    const f = floor;
    pool = entries.filter(e => e.d >= f && e.d <= difficulty);
    floor--;
  } while (pool.length < minSize && floor >= 1);
  return pool;
}

// Split a reel string into ordered tokens for the token-at-a-time reel (AD2):
//   { type:"word",  text } — a run of letters; the unit you type
//   { type:"space", text } — the gap between words; a real (forgiving) key and
//                            the reel-crank beat (replaces word-mode's auto pause)
//   { type:"punct", text } — punctuation runs (A5 sentences), kept as their own
//                            token so the reel can pause on clause boundaries
// A1 phrases are letters + single spaces only; punct is here for forward reach.
export function tokenize(text) {
  const tokens = [];
  for (const m of text.matchAll(/[a-z]+|\s+|[^a-z\s]+/gi)) {
    const seg = m[0];
    const type = /[a-z]/i.test(seg[0]) ? "word" : /\s/.test(seg[0]) ? "space" : "punct";
    tokens.push({ type, text: seg });
  }
  return tokens;
}

// How many typeable words a reel string holds — the number of reel segments a
// phrase takes to land (its spaces are the beats between them).
export function wordCount(text) {
  return tokenize(text).filter(t => t.type === "word").length;
}

// The tier to actually serve when a rolled tier has no fish at the current spot
// (A3): step down the rarity order (hardest→easiest) to the first present tier,
// then up if still none. e.g. the Stream has no legendary yet, so a legendary
// roll there lands a rare. Returns `desired` untouched if nothing is present
// (the caller then handles an empty pick).
export function tierWithFallback(tiersPresent, desired, order) {
  const start = order.indexOf(desired);
  if (start < 0) return desired;
  for (let i = start; i < order.length; i++) if (tiersPresent.has(order[i])) return order[i];
  for (let i = start - 1; i >= 0; i--) if (tiersPresent.has(order[i])) return order[i];
  return desired;
}
