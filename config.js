// config.js — every tuning knob in one place. No magic numbers elsewhere.
// Values marked [PROTO] were validated in the feel prototype; others are
// starting guesses to be tuned at M8 against real kid typing.

export const CONFIG = {
  reel: {
    errorTension: 12,       // [PROTO] tension added per wrong key
    correctRelief: 3,       // [PROTO] tension removed per correct key (any speed)
    escapeAt: 100,
    wordPauseMs: 450,       // [PROTO] the reel-crank beat between words
    // bigger fish take more words to land
    wordsToLandByTier: { common: 4, uncommon: 5, rare: 6, legendary: 8 },
    // reel words match the fish's difficulty; if the unlocked pool has fewer
    // candidates than this, easier difficulties are mixed in until it doesn't
    minReelPoolSize: 8,
    recastDelayMs: 1500,    // pause on the catch/escape message before recasting
  },

  bite: {
    delayMsRange: [1200, 3200],
    // odds a bite comes from each tier, by rod level (must sum to 1)
    tierOddsByRod: {
      1: { common: 0.80, uncommon: 0.17, rare: 0.03,  legendary: 0.00  },
      2: { common: 0.62, uncommon: 0.28, rare: 0.09,  legendary: 0.01  },
      3: { common: 0.45, uncommon: 0.35, rare: 0.17,  legendary: 0.03  },
    },
  },

  // Letter unlock: cumulative total catches required to reach each stage.
  // Stage 1 is deliberately short — only 37 home-row words exist (see BUILD_PLAN M2).
  unlock: {
    stages: [
      { letters: "asdfghjkl", catchesRequired: 0  },  // stage 1: home row
      { letters: "ei",        catchesRequired: 3  },  // quick first unlock
      { letters: "ru",        catchesRequired: 8  },
      { letters: "to",        catchesRequired: 15 },
      { letters: "nc",        catchesRequired: 25 },
      { letters: "wmy",       catchesRequired: 40 },
      { letters: "pvb",       catchesRequired: 60 },
      { letters: "qxz",       catchesRequired: 85 },  // legendary letters — Muskie Quixote territory
    ],
    celebrateMs: 2600,      // how long the "new letters!" banner holds the stage
  },

  shop: {
    rods: [
      { id: "stick",  name: "Trusty Stick",     cost: 0,  rodLevel: 1 },
      { id: "bamboo", name: "Bamboo Beauty",    cost: 25, rodLevel: 2 },
      { id: "carbon", name: "The Carp Whisperer", cost: 80, rodLevel: 3 },
    ],
    baits: [
      { id: "worm",    name: "Garden Worm",   cost: 0,  biteSpeedMult: 1.0 },
      { id: "cricket", name: "Lucky Cricket", cost: 15, biteSpeedMult: 0.75 },
      { id: "glow",    name: "Glow Grub",     cost: 50, biteSpeedMult: 0.55 },
    ],
  },

  economy: {
    // coin values live in fish.json per fish; keep any global multipliers here
    firstCatchBonus: 2,     // extra coins the first time a species is caught
  },
};
