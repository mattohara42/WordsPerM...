# HANDOFF.md

> **Rewrite this file, never append.** State snapshot and pointers only. No
> session narrative, that is what `git log` is for. Keep it under 80 lines.

**Updated:** 2026-09-07 · **Phase:** not started · **Active milestone:** none

## Where this is

The doc set exists. **No code, no repo, no Godot project yet.** These nine files
were written in one session in `mattohara42/hook-line-and-sentence` under
`docs/hall-of-volta/`, staged to be moved to this repo's root.

The first attempt at this project was a faithful remake of the 1984 original and
it was abandoned. This plan exists because a copy was the wrong idea, not because
the execution was wrong.

## Next action

**M0**, in `BUILD_PLAN.md`: Godot 4 project, one grey room, a capsule that runs
and jumps with coyote time, jump buffering, variable height and air control, and
every number in `config/movement.tres`.

Its done-when is a feel criterion and it cannot be discharged by a test. Play it.

## Blocked on Matt

1. **The name, and the IP question.** `SPEC.md` → *Name* argues for not being
   Conan, on design grounds as much as legal ones: nothing in the plan depends on
   the character, and renaming the hero makes it an actual reimagination.
   Repo name assumed to be `hall-of-volta`. **This decides the repo name, so it
   is first.**
2. **What went wrong the first time.** The plan is written against the assumption
   that the failure was scope and fidelity: a faithful copy of a weak game, with
   effort spent on assets before the core felt good. If it was actually the
   engine, or the physics, or something else, the phase ordering in
   `BUILD_PLAN.md` should change and this is the moment to say so.
3. **Hero size.** `ART_DIRECTION.md` puts it at roughly 40 design px tall against
   a 640x360 design resolution. **This is the number most likely to be wrong**
   and it should be settled with a grey capsule in M0, before any art is
   generated against it.

## Open questions the docs already carry

Both in `GEMINI_NOTES.md` → *What this project will have to learn on its own*,
and both are M5 experiments rather than blockers:

- Does the multi-subject sheet trick work for **six poses of the same
  character**, where the sheet's usual job is to differentiate subjects and here
  it needs to unify them? Test with a throwaway sheet before anything depends
  on it.
- Can the generator hold one character's identity across separate sheets, or does
  every sheet after the first have to be an attach-and-edit of the first?

## The two gates worth not walking past

**No art before M5, no level building before M10.** The most common way a project
like this dies is spending its energy on assets for a core that does not yet feel
good.

**G1, after M5.** One room, finished, played for an hour. If it is not fun, the
fault is in `SPEC.md` and that is where the fix goes. Seventeen more rooms will
not fix one room that is not fun.

## Pointers

| for | read |
|---|---|
| what the game is | `SPEC.md` |
| what to build next | `BUILD_PLAN.md` |
| how it looks | `ART_DIRECTION.md` |
| what moves, and how | `ANIMATION.md` |
| getting a picture into the game | `ART.md` |
| before writing any prompt | `GEMINI_NOTES.md` |
| how to work in this repo | `CLAUDE.md` |
