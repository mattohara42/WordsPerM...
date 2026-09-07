# CLAUDE.md: Hall of Volta

A 2D puzzle platformer in Godot 4, reimagining Datasoft's *Conan: Hall of Volta*
(1984). **Read `SPEC.md` first**: it is the source of truth for every design
decision, and its section *The sword is the game* is the one thing the whole
project hangs off. `BUILD_PLAN.md` defines milestone order, M0 to M16 in four
phases. `HANDOFF.md` is the state snapshot and is the first thing to read at the
start of a session.

This is a second attempt. **The first was a faithful remake and it failed**,
because the 1984 game is not good enough to copy. `SPEC.md` → *What changes from
1984, and why* is the table that matters.

## Architecture rules

- **Godot 4, GDScript.** Not C#, not GDExtension, not a plugin-heavy setup. If a
  change seems to need a new addon, stop and discuss it first.
- **All tuning values live in `.tres` resources under `config/`.** Movement,
  the sword, hazards, each enemy. No magic numbers in a script, and no number
  that decides how the game feels living anywhere except one of those files.
  This is the rule that makes M14, the tuning pass, possible at all.
- **Pure functions go in `scripts/logic/`, which is where the tests reach
  them.** Anything that is really a rule (a trajectory, a threshold, a state
  transition table) belongs there rather than inside a node that a headless test
  cannot instantiate.
- **One `AnimationTree` state machine per character**, and the character script
  sets parameters on it. Never call `AnimationPlayer.play()` from gameplay code.
  Two things deciding what is on screen is how a rig gets stuck mid-throw.
- **The sword is one scene and one script.** Every behaviour it has (fly, return,
  catch, embed, recall, conduct) is a state in that one machine. The moment a
  second script starts special-casing sword behaviour for one room, the design
  has drifted.
- **Rooms are scenes, and a room never reaches into another room.** Act state
  lives in an autoload. A room that knows what room comes next cannot be tested
  or reordered.
- **Continuous motion is rigged, discrete acrobatics are painted frames**
  (`ANIMATION.md`). Frame-by-frame generated animation is off the table and the
  reasons are measured, not aesthetic.
- **`ART_DIRECTION.md` governs every visual choice**, including shaders,
  particles and UI. Coloured darks only, no neutral black or grey anywhere.
  Automate the check the way the last project did.
- **Atmosphere is code, not art.** Bubbling lava, arcs, sparks, heat haze: these
  are shaders and particle emitters. If one of them is being drawn as a PNG
  loop, that is a bug in the approach.

## Design decisions already made (don't relitigate)

- **Three swords, cap five.** Ten was the original's number and it is why no
  single throw mattered there.
- **The sword returns to where you are now**, not to where you threw from. This
  is what makes moving during a throw a decision.
- **Insta-death stays. The punishment for it goes.** Under one second from death
  to moving again, swords restored, at the last brazier.
- **No health bar, no difficulty modes, no mobile controls** in v1. See
  `SPEC.md` → *Non-goals*.
- **The two bosses cannot be beaten by throwing.** A game with one verb needs its
  bosses to ask what else that verb does.
- **The caged bird is visible from Act 1.** The ending only lands if you have
  been walking past it.

## Workflow

- **Read `HANDOFF.md` first.** It is a state snapshot and a set of pointers:
  active milestone, its done-when, the next action, and what is blocked on a
  human. Update it at the end of every session and **keep it cheap**: rewrite it,
  never append; a resolved thread becomes one line or disappears; never restate
  another doc, link it; no session narrative, which is what `git log` is for.
- **State which milestone is active and its done-when at the start of every
  session.** Work exactly one at a time.
- Mid-build ideas go to `BACKLOG.md`, never into the current milestone.
- **`git fetch` before branching**, and branch from `origin/main` rather than
  local `main`. Re-branch after every squash-merge.
- **`GEMINI_NOTES.md` is required reading before writing any art prompt.**
- **An assertion proves the code ran, not that the picture is right, so draw the
  thing you measured.** The last project shipped four bugs past green assertions
  and every one was obvious the moment something was rendered. When a number
  describes a position, a colour or a shape, render it before believing it. In
  Godot that means a screenshot from a real running build, not the editor
  viewport.
- **Verify feel by playing, not by reasoning about it.** Every done-when in
  Phase 1 of `BUILD_PLAN.md` is a feel criterion, and feel criteria cannot be
  discharged by a passing test.
- **In a pipeline tool, the destructive mode is the flag.** Make the path that
  destroys work the one you have to ask for, and let the tool refuse when nobody
  asked.
- Surface code smells as separate issues. Don't refactor unrelated code.
- If a requirement is ambiguous: for structural questions, ask. For small
  reversible details, pick the most reasonable option and record the assumption
  in the commit or PR.
- **Open PRs ready for review, not as drafts**, and squash-merge them right away
  rather than waiting to watch CI.

## House style

**No em-dashes, anywhere.** Use a period, a comma, a colon or parentheses, or
restructure the sentence. Docs, code comments, commit messages, PR bodies and
any string a player reads. Put a test on it early; it is much cheaper than the
1,619-replacement pass the last project needed.

## The user

Prefers the simplest solution that fits, explicit uncertainty flagging, and being
offered better long-term alternatives when they exist. Ask before assuming, on
anything structural. This is a personal project and the point is that it is good,
not that it is finished.
