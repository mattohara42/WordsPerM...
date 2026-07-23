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

## M4b live-verification checklist

The sync code (`app.js`) is complete; M4b is "done" once the signed-in
cross-device path is verified live. Sign-in popups need HTTPS, so test on the
production URL **`https://fishtyping.netlify.app`** — not a `deploy-preview-*`
URL (different subdomain won't match the authorized domain).

### One-time setup (Firebase console, `familyhub-5fc43` project — shared with Family Hub)

- [ ] **Authorize the domain.** Auth → Settings → Authorized domains → add
  `fishtyping.netlify.app`. (Sign-in popup is rejected without it.)
- [ ] **Merge the rules.** Firestore Database → Rules → paste *only* the
  `match /typingFishing/{profileId} { … }` block from `firestore.rules`
  *inside* the existing `match /databases/{database}/documents { … }` block —
  **do not** overwrite the Family Hub rules — then Publish.
- [ ] **Confirm HTTPS deploy** at `https://fishtyping.netlify.app`.

### Walkthrough (on the profile picker, watch the sync bar)

- [ ] **SDK loads** — button reads **"SIGN IN TO SYNC"**. (If it says *"playing
  offline"* and the button is hidden, the Firebase SDK failed to load.)
- [ ] **Sign in** — click it, pick the parent Google account → status flips to
  **"☁ synced · your@email"**, button becomes **SIGN OUT**.
- [ ] **Write-on-catch** — land one fish → Firestore console shows a doc per kid
  in the `typingFishing` collection, each with `ownerUid` = your uid and the
  live fields (`totalCatches`, `coins`, `collection`, `stats`, …).
- [ ] **Read-on-launch (the real bar)** — open a *second* browser/device, sign
  in with the *same* account → the kids' profiles appear in the picker, pulled
  from Firestore (not created fresh). Cross-device sync working.
- [ ] **Offline fallback** — sign out (or throttle network offline) → game still
  plays and saves locally with **no errors**. (Verified in-sandbox; sanity-check
  live.)

**Done when:** a catch on one device shows up on another (newest `updatedAt`
wins — reconciled by timestamp, no merge logic), and two profiles keep fully
separate state across reloads.

### Failure signatures (DevTools → Console)

Each setup gap emits a specific breadcrumb, so the error names the fix:

| Console message | Cause | Fix |
|-----------------|-------|-----|
| `Sync unavailable; playing offline on localStorage.` | Firebase SDK didn't load (network/CDN, or `firebase.sdkVersion` in `config.js` 404'd) | not a setup step — check the CDN/version |
| `sign-in failed` + `auth/unauthorized-domain` | domain not authorized | setup step 1 |
| `sync push failed` + *Missing or insufficient permissions* | rules not merged/published | setup step 2 |
| `profile pull failed` | rules or `ownerUid` mismatch on read | setup step 2 |
