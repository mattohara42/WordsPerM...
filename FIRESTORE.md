# Firestore Schema — Typing Fishing v1

Design goal: **one document read per app launch, one write per catch.** Same
Firestore + localStorage-fallback pattern as Family Hub.

## Structure

```
typingFishing/
└── profiles/{profileId}          ← one doc per kid; everything embedded
```

One collection, one doc per kid. No subcollections in v1 — profile data is
small (a few KB even after months of play), and embedded maps keep reads
cheap and the offline/localStorage fallback trivial (the doc IS the save file).

## Profile document

```js
{
  name: "Kid Name",
  avatar: "🐸",                    // emoji picker, keep it simple
  createdAt: <timestamp>,
  updatedAt: <timestamp>,

  // progression
  totalCatches: 42,
  stage: 3,                        // derived from totalCatches + config, but
                                   // stored so the UI never recomputes wrong
  coins: 37,
  // equipped + everything bought (owned gates re-purchase in the shop)
  upgrades: { rod: "bamboo", bait: "worm",
              owned: { rod: ["stick", "bamboo"], bait: ["worm"] } },

  // collection: fishId → count (silhouette = key absent)
  collection: { bluegill: 12, carp: 3, walleye: 1 },

  // records: fishId → best catch weight in lb (fish size variants)
  records: { bluegill: 0.9, walleye: 7.4 },

  // badges: earned journal badge ids (see BADGES in app.js)
  badges: ["firstmate", "homerow", "hooked"],

  // silent stats — feeds the v2 adaptive meter; kids never see these
  stats: {
    letters: {                     // per-letter aggregates, max 26 entries
      a: { n: 310, errors: 12, msTotal: 148000 },   // avg ms = msTotal / n
      s: { n: 290, errors: 31, msTotal: 177000 },
      // ...
    },
    wordsTyped: 480,
    escapes: 3,
    sessionCount: 14,
    lastPlayed: <timestamp>,
  },

  jokesEndured: 0                  // reserved for the groan counter (backlog)
}
```

## Write strategy

- **On catch (the only hot path):** one `update()` with increments — 
  `totalCatches`, `coins`, `collection.{fishId}`, merged letter stats 
  accumulated locally during the fight. Firestore `increment()` for counters.
- **On shop purchase / stage unlock:** one update each. Rare events.
- **Letter stats batching:** accumulate in memory during reeling; flush with
  the catch write. Never write per-keystroke.
- **Escape:** increment `stats.escapes` only — piggyback on next write if
  offline.

## Fallback & conflicts

- localStorage mirror keyed `tf:profile:{id}`, written on every Firestore
  write. On launch: Firestore wins if reachable; localStorage otherwise;
  reconcile by `updatedAt` (newest wins — kids play one device at a time,
  so last-write-wins is fine; don't build merge logic).

## Auth

- Reuse Family Hub's Google OAuth (GIS token client). One parent login;
  profiles are app-level, not Firebase-auth-level. Known consideration from
  Family Hub: silent token refresh needed for long-lived sessions.

## Explicitly not in v1

- Per-session history docs (aggregates only)
- Multi-device merge logic
- Firebase Auth per kid
