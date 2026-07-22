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

// Words matched to a fish's difficulty, mixing in easier ones only when the
// unlocked pool is too thin to fill minSize (e.g. stage 1's lone hard word).
export function buildReelPool(words, difficulty, minSize) {
  let floor = difficulty, pool;
  do {
    const f = floor;
    pool = words.filter(e => e.d >= f && e.d <= difficulty);
    floor--;
  } while (pool.length < minSize && floor >= 1);
  return pool;
}
