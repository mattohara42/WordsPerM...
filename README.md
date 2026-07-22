# Typing Fishing 🎣

A cozy pixel-art fishing game that teaches kids to type. Casting, reeling,
and catching all happen through the keyboard — practice that never feels
like practice.

**Status:** built and playable. The core game (milestones M1–M10) is done;
now shipping post-v1 features (see `BACKLOG.md`). Hosted on Netlify — pushes to
`main` are promoted to production manually.

## Start here

| File | What it is |
|------|-----------|
| `SPEC.md` | Design source of truth — all decisions and v1 scope |
| `BUILD_PLAN.md` | Milestone order (M1–M8) with done-criteria |
| `CLAUDE.md` | Instructions for Claude Code sessions |
| `FIRESTORE.md` | Profile/save data schema |
| `BACKLOG.md` | Ideas parked to protect milestone scope, plus shipped post-v1 features |
| `ART.md` | Art pipeline — Claude writes Gemini prompts, Matt generates the PNGs |
| `config.js` | Every tuning knob, one file |
| `data/words.json` | 3,014 words tagged by letters/difficulty (generated) |
| `data/fish.json` | The roster — say hi to Muskie Quixote |
| `prototype/` | Playable design artifacts: feel test + visual mockup |
| `tools/generate-words.mjs` | Regenerates `data/words.json` |

## Play the prototypes

Open `prototype/visual-mockup.html` in a browser. No server needed.

## Dev

```
python3 -m http.server 8000
```

Then open http://localhost:8000. No build step. That's the whole point.
