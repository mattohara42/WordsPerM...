# ANIMATION.md: what is rigged, what is painted, and where the line sits

> Companion to `ART_DIRECTION.md`. Together they are the source of truth for
> every moving thing on screen. This file exists because getting this wrong is
> the most expensive mistake available on this project.

## The rule

**Continuous motion is rigged. Discrete acrobatics are painted frames. Nothing
in between.**

A run cycle, an idle, a throw wind-up, a climb: these are a small number of
painted parts moved by an `AnimationPlayer` keying bone transforms. They cost one
generation for the whole character and then cost nothing per animation.

A somersault, a dive, a death: these are four to six hand-picked painted frames,
because a cutout rig cannot sell a full-body rotation. Flat parts seen edge-on
are flat parts.

## Why frame-by-frame generation is off the table

This is settled, and it is settled by measurement rather than preference. From
the previous project's `GEMINI_NOTES.md`:

> A faithful edit agrees with the reference on the untouched linework closely,
> but never to the pixel. The generator repaints the whole canvas rather than
> compositing onto yours, so [features] it was told not to change come back
> within a few px of where they were, in the same ink, visually identical, and a
> 1-3px trace of "changed" in any difference-based cut.

That was measured across nine deliveries with agreement between 0.945 and 0.991,
which is **excellent** for a static hat and **fatal** for animation. A 1 to 3 px
wander that nobody can see in a still is visible on every single frame of a
twelve-frame run cycle, forever. It reads as boiling, and no amount of prompting
fixes it, because it is a property of the round trip and not a defect in it.

So: the generator produces **poses**. Code produces **motion**. That is exactly
what the fishing game did, where every one of its thirty-three animations is a
CSS keyframe on a cut layer and not one is a sprite sheet, and it is the reason
that game's motion holds up.

## The pose sheet, and why the somersault is affordable

The one place we spend generated frames is the few discrete moves, and there is a
trick that makes it cheap. From the fishing project's strongest result:

> Six subjects on one canvas works as well as four. The upper bound has not been
> found. **Put the two subjects hardest to tell apart on the SAME sheet.** A
> sheet is not merely a saving: it is the only way to ask for a difference
> rather than describe one.

**The same character in six poses is a six-subject sheet.** Ask for one canvas,
a 3x2 grid, the hero in six stages of a somersault, and the generator draws them
against each other. Consistency between the frames stops being something to
prompt for and becomes a property of the sheet, in the same way that four fish on
one canvas came back with matched treatment where four separate generations would
have drifted four ways.

Six frames is few enough that any residual wander can be nudged by hand in an
image editor, which is not true of sixty.

**Do not push this past about eight frames.** A pose sheet works because the
frames are far apart and each is a readable pose. Ask for twelve near-identical
frames of a run cycle and the sheet stops separating them, which is the failure
the muskellunge and the northern pike ran into from the other direction.

## What each animation is

| animation | how | note |
|---|---|---|
| idle, breathing | rig | Two bones, almost nothing |
| run | rig | Hips, two legs, two arms, head. The workhorse |
| jump, fall, land | rig | Three poses and the transitions between them |
| throw | rig | The wind-up matters more than the release. Telegraph it |
| catch | rig | Must be readable in one frame. See M15 on the audio |
| climb | rig | |
| **somersault** | **painted, 6 frames** | The signature move of the original. Earn it |
| **dive** | **painted, 4 frames** | A fall past a threshold speed becomes this |
| **death** | **painted, 5 frames** | One per hazard family would be better. One is fine for v1 |
| **enemies** | rig | All six. A bat is two wings and a body |
| **the sword in flight** | **one sprite, rotated** | Never generate rotation frames. It is a transform |

## The somersault is a state, not a costume

The original's somersault was decoration: it looked different and behaved like a
jump. Here it is **a distinct movement state with its own physics**, because a
move that looks that different should behave differently or the animation is
lying.

Proposed, and to be settled by feel in M0 rather than by argument now: the
somersault is what a jump becomes when you are already at run speed. It travels
further, it rises less, and **you cannot throw during it**. That last clause is
the interesting one, because it makes the game's best-looking move also its most
committed, and committing is exactly what the 1984 game was criticised for. The
difference is that here it is a choice you make rather than the only jump you
have.

## Godot specifics

- **Cutout rigging**: `Skeleton2D` with `Bone2D` nodes, cut PNG parts as
  `Sprite2D` children. `AnimationPlayer` keys the bone transforms. This is a
  first-class Godot workflow and needs no plugin, no Spine licence and no export
  step.
- **The painted frames** go in a `SpriteFrames` resource on an
  `AnimatedSprite2D`, sharing the same `AnimationTree` state machine as the rig.
  The switch between a rigged state and a painted state is one node visibility
  toggle, and it has to happen on the same frame the state changes or you get a
  one-frame flash of both.
- **One `AnimationTree` state machine per character**, and the character script
  sets parameters on it. The script must never call `AnimationPlayer.play()`
  directly. Two things deciding what is on screen is how you get a rig stuck in a
  throw pose.

## The rule from the fishing project that transfers unchanged

**An actor and its sound are one event off one tick, never two schedules.** The
catch sound and the catch frame come off the same signal. If the sound is
scheduled by a timer and the animation by the state machine, they will drift, and
a catch that sounds a frame late feels like a catch you did not earn.
