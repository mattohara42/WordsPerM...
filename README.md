# Typing Fishing 🎣

A cozy pixel-art fishing game that teaches kids to type. Casting, reeling,
and catching all happen through the keyboard — practice that never feels
like practice.

**Status:** design complete, build not started. `index.html` / `app.js` /
`style.css` arrive at milestone M1.

## Start here

| File | What it is |
|------|-----------|
| `SPEC.md` | Design source of truth — all decisions and v1 scope |
| `BUILD_PLAN.md` | Milestone order (M1–M8) with done-criteria |
| `CLAUDE.md` | Instructions for Claude Code sessions |
| `FIRESTORE.md` | Profile/save data schema |
| `BACKLOG.md` | Ideas parked to protect milestone scope |
| `config.js` | Every tuning knob, one file |
| `data/words.json` | 3,014 words tagged by letters/difficulty (generated) |
| `data/fish.json` | The roster — say hi to Muskie Quixote |
| `prototype/` | Playable design artifacts: feel test + visual mockup |
| `tools/generate-words.mjs` | Regenerates `data/words.json` |

## Play the prototypes

Open `prototype/visual-mockup.html` in a browser. No server needed.

## Dev (once M1 exists)

```
python3 -m http.server 8080
```

No build step. That's the whole point.
