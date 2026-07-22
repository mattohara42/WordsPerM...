# CLAUDE.md — Typing Fishing

Cozy pixel-art fishing game that teaches kids to type. Read `SPEC.md` first —
it is the source of truth for all design decisions. `BUILD_PLAN.md` defines
milestone order; work on exactly one milestone at a time. `ART.md` is the
art pipeline: Claude writes Gemini prompts + filenames, Matt generates the PNGs.

## Architecture rules

- **Vanilla JS, no build step.** Three files: `index.html`, `app.js`,
  `style.css`, plus `config.js` and `data/*.json`. If a change seems to need
  a bundler or framework, stop and discuss instead.
- **All tuning values live in `config.js`.** No magic numbers in game logic.
- **Firestore per `FIRESTORE.md`** — one read per launch, one write per
  catch, localStorage mirror. Do not add subcollections or per-keystroke
  writes.
- Rendering is DOM/CSS (validated by `prototype/visual-mockup.html`). Do not
  introduce canvas or Phaser without discussing first.

## Design decisions already made (don't relitigate)

- Word-at-a-time reeling with ~450ms pause (prototype-tested)
- Tension reacts to errors only, never speed — slow typing is always safe
- Lowercase only; no visible timers/WPM for kids; stats logged silently
- Game voice is dad jokes/puns from per-moment pools; cast prompts always
  keep the literal instruction
- Stage 1 (home row) is short by design — 37 words available, first unlock
  at 3 catches

## Workflow

- Start each session by stating which milestone from `BUILD_PLAN.md` is
  active and its "done when" criterion.
- Mid-build ideas go to `BACKLOG.md`, never into the current milestone.
- Local dev: `python3 -m http.server 8080`. Firestore/OAuth work (M4+) needs
  HTTPS — deploy previews on Netlify or ngrok.
- Surface code smells as separate issues; don't refactor unrelated code.
- If a requirement is ambiguous: for structural/architectural questions, ask;
  for small reversible details, pick the most reasonable option and record
  the assumption in the PR/commit message.

## The user

Prefers simplest-solution-first, explicit uncertainty flagging, and being
offered better long-term alternatives when they exist. This is a family
project — a kid-drawn fish sprite outranks a professional one.
