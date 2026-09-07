# Staged docs for the next game

**None of this belongs to Hook, Line and Sentence.** These nine files are the
starting doc set for a separate game, written here only because this repo is
where the session ran. They are staged, not adopted.

## What to do with them

1. Create the new repo (`mattohara42/<name>`, see `SPEC.md` → *Name*).
2. Copy every file in this directory to that repo's **root**, except this one.
3. Delete `docs/hall-of-volta/` from this repo in a separate commit.

Nothing in here is referenced by the fishing game's code, tests or docs, so
step 3 is a clean delete whenever you get to it.

## What each file is

| file | owns |
|---|---|
| `SPEC.md` | **the source of truth.** What the game is, the core verb, the rooms, the enemies. Read first |
| `BUILD_PLAN.md` | milestone order, M0 to M16, each with a done-when |
| `CLAUDE.md` | the new project's instructions, in the shape that worked here |
| `ART_DIRECTION.md` | palette, light, treatment. Governs every visual choice |
| `ANIMATION.md` | what is rigged, what is a painted frame, and where the line sits |
| `ART.md` | the asset pipeline: generate, cut, rig, import |
| `GEMINI_NOTES.md` | the generator's behaviour, carried over from this repo and re-scoped |
| `HANDOFF.md` | the state snapshot. First thing a session reads |
| `BACKLOG.md` | everything deliberately not in v1, and why |

## The one thing to read if you read nothing else

`SPEC.md` → *The sword is the game*. Everything else in the plan is downstream
of that one decision, and if you disagree with it, disagree before M0 rather
than at M10.
