// Unit tests for the pure game math in logic.js. Deterministic — RNG is
// injected, so no browser and no flakiness. Run with `node --test`.

import { test } from "node:test";
import assert from "node:assert/strict";
import { CONFIG } from "../config.js";
import {
  unlockedStageCount, lettersForStages, pickTier, weightClass, rollWeight, buildReelPool,
} from "../logic.js";

const stages = [
  { letters: "asdf", catchesRequired: 0 },
  { letters: "ei",   catchesRequired: 3 },
  { letters: "ru",   catchesRequired: 8 },
];

test("unlockedStageCount gates on cumulative catches", () => {
  assert.equal(unlockedStageCount(stages, 0), 1);   // stage 1 is always open
  assert.equal(unlockedStageCount(stages, 2), 1);
  assert.equal(unlockedStageCount(stages, 3), 2);   // exactly at the threshold
  assert.equal(unlockedStageCount(stages, 7), 2);
  assert.equal(unlockedStageCount(stages, 99), 3);  // never exceeds stage count
});

test("lettersForStages accumulates letters across opened stages", () => {
  assert.deepEqual([...lettersForStages(stages, 1)].sort(), ["a", "d", "f", "s"]);
  assert.deepEqual([...lettersForStages(stages, 2)].sort(), ["a", "d", "e", "f", "i", "s"]);
  assert.equal(lettersForStages(stages, 0).size, 0);
});

test("pickTier walks the cumulative distribution", () => {
  const odds = { common: 0.6, uncommon: 0.3, rare: 0.1 };
  assert.equal(pickTier(odds, 0),    "common");   // bottom of the range
  assert.equal(pickTier(odds, 0.59), "common");
  assert.equal(pickTier(odds, 0.6),  "uncommon"); // boundary lands in the next bucket
  assert.equal(pickTier(odds, 0.89), "uncommon");
  assert.equal(pickTier(odds, 0.9),  "rare");
  assert.equal(pickTier(odds, 0.999),"rare");
});

test("pickTier falls back to common when odds under-sum (e.g. rounding, r≈1)", () => {
  assert.equal(pickTier({ common: 0.5, rare: 0.4 }, 0.95), "common");
});

test("weightClass flags lunkers, little ones, and the middle", () => {
  const size = CONFIG.size;
  const [min, max] = size.weightRangeByTier.rare;      // [4, 12]
  const at = frac => min + frac * (max - min);
  // assert just inside each boundary (exact-boundary reconstruction is float-fragile)
  assert.equal(weightClass(size, "rare", at(0.5)), "");
  assert.equal(weightClass(size, "rare", at(size.lunkerFrac + 0.01)), "lunker");
  assert.equal(weightClass(size, "rare", at(size.lunkerFrac - 0.01)), "");     // just below → middle
  assert.equal(weightClass(size, "rare", at(size.littleFrac - 0.01)), "little");
  assert.equal(weightClass(size, "rare", at(size.littleFrac + 0.01)), "");     // just above → middle
});

test("weightClass falls back to the common range for an unknown tier", () => {
  const size = CONFIG.size;
  // an unknown tier should classify against the common range, not throw
  const [cmin, cmax] = size.weightRangeByTier.common;
  const mid = cmin + 0.5 * (cmax - cmin);
  assert.equal(weightClass(size, "mystery", mid), "");
});

test("rollWeight stays in range, rounds to 0.1, and agrees with weightClass", () => {
  const size = CONFIG.size;
  const [min, max] = size.weightRangeByTier.legendary;
  for (const r of [0, 0.001, 0.25, 0.5, 0.849, 0.851, 0.999]) {
    const { weight, cls } = rollWeight(size, "legendary", () => r);
    assert.ok(weight >= min && weight <= max, `weight ${weight} out of [${min},${max}]`);
    assert.equal(Math.round(weight * 10), weight * 10, "weight not rounded to 0.1");
    // class is derived from the unrounded roll, so recompute from the same r
    assert.equal(cls, weightClass(size, "legendary", min + r * (max - min)));
  }
});

test("buildReelPool keeps to the exact difficulty when the pool is deep enough", () => {
  const words = Array.from({ length: 10 }, (_, i) => ({ w: "w" + i, d: 2 }));
  const pool = buildReelPool(words, 2, 8);
  assert.equal(pool.length, 10);
  assert.ok(pool.every(e => e.d === 2));
});

test("buildReelPool mixes in easier words only when the pool is too thin", () => {
  // one hard word, several easy — minSize forces the easier tier in
  const words = [{ w: "hard", d: 3 }, ...Array.from({ length: 8 }, (_, i) => ({ w: "e" + i, d: 1 }))];
  const thin = buildReelPool(words, 3, 8);
  assert.ok(thin.length >= 8, "should have widened to reach minSize");
  assert.ok(thin.some(e => e.d < 3), "should have pulled in easier words");
  // if minSize is satisfiable at the exact difficulty, it stays strict
  const strict = buildReelPool([{ w: "hard", d: 3 }], 3, 1);
  assert.deepEqual(strict.map(e => e.w), ["hard"]);
});
