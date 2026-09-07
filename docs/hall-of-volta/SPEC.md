# SPEC.md: the reimagination

> **Source of truth.** Every other doc in this repo is downstream of this one.
> If a build plan and this file disagree, this file wins and the plan gets
> corrected.

## What this is

A 2D puzzle platformer, reimagining **Conan: Hall of Volta** (Datasoft, 1984,
designed by Eric Robinson and Eric Parker, Apple II original with C64 and Atari
8-bit ports). It is not a port, a demake or a faithful remake. The first attempt
at this project was a faithful copy and it failed, because the 1984 game is not
good enough to be worth copying: seven one-screen levels solved by memorising a
fixed sequence, with jumps you cannot steer and hazards that kill on contact.

What it **is** worth taking is one mechanic that nobody has built a whole game
around, and a setting that hands you a puzzle vocabulary for free.

## What the original actually did

Established from research, and worth having written down so nobody re-derives it:

- **Seven one-screen levels**, each modelled as a real place: the outer castle
  wall, a moat, a lava pit, interior halls, and the Hall of Volta itself.
- **Per level**: collect gems, place them in gem holders, find the key, unlock
  the door. In a fixed sequence.
- **The weapon is a boomerang sword.** You carry ten. Thrown, it travels a set
  distance and then returns to you. **Catch it and you keep it. Hit a wall or an
  enemy and it is destroyed.** Restock points are scattered through the levels.
- **Conan somersaults rather than jumps**, and a fall becomes a dive. The
  animation was a selling point of the original.
- **Enemies**: bats, scorpions, giant ants, fire-breathing dragons, floating
  eyeballs, and a huge electrical generator gone haywire.
- **Hazards**: lava pits, geysers that hurl you into the air, spike pits,
  floating platforms. Lava, water, spikes and animals all kill instantly.
- **The ending**: place three gems in three holders, which frees the caged
  **avian ally**. It drops Volta into a pool of fire, then carries you out
  through the open door.
- **The contemporary and retrospective complaint** is consistent: stopping
  precisely is hard, jumping is unreliable, and once you are airborne there is
  nothing to do but hope the angle was right. It is remembered as an early
  forerunner of the puzzle platformer, which is a compliment about ambition and
  not about execution.

**One thing is unresolved.** Sources disagree on the throwable: most say
"boomerang swords", one walkthrough says you need "three axes" for the final
level. Probably the same object described differently across ports. It does not
change anything below, but do not treat "ten swords" as a settled number.

## The sword is the game

The boomerang sword is the whole reason to build this. **A throwable that
returns to you, that you can catch to reuse, and that is consumed when it hits
something, is a risk and reward economy sitting inside a single button.** Every
throw is a decision: spend the sword to kill the thing, or place the throw so it
comes home.

The reimagination makes that the core verb and builds the puzzles, the enemies
and the level geometry to serve it. Concretely, the sword does five things:

1. **Throw and catch.** It flies out along a flat arc to a maximum range, then
   turns and returns to where you are *now*, not to where you threw from. Stand
   in its path and it is back in your hand. Miss the catch and it lands on the
   floor, retrievable, but you have lost your position and your tempo.
2. **Kill.** It hits an enemy and both die. The sword is gone.
3. **Embed.** It hits **wood** and sticks, and a stuck sword is **a one-tile
   ledge you can stand on**. This is the move that turns a weapon into a
   traversal tool, and it is where the puzzles live.
4. **Recall.** Hold the throw button and an embedded sword flies back to you,
   taking its ledge with it. Standing on the ledge you are recalling is a
   legitimate and bad idea.
5. **Conduct.** A sword embedded in a conductive surface carries current. This
   is the Act 3 vocabulary and it is not invented: the original's boss hazard was
   already an electrical generator gone haywire, and Volta's name is a unit of
   electric potential.

**The sword count is the difficulty dial and it is small.** Start with three,
cap at five. Ten was too many to make any single throw matter.

## What changes from 1984, and why

| the original | here | because |
|---|---|---|
| Seven one-screen levels | **~18 rooms in four acts**, rooms that scroll | "bigger boards" means a room you move through, not a screen you memorise |
| Committed, unsteerable jumps | Coyote time, jump buffering, variable height, real air control | The single most-cited complaint, and it is a solved problem |
| Insta-death everywhere, few lives | **Insta-death everywhere, instant respawn** | The lethality is the good part. The punishment was the bad part |
| Puzzles are fixed sequences to memorise | Puzzles are **uses of the sword** | A puzzle you solve by understanding a verb replays well. A sequence you memorise does not |
| Ten swords | Three, cap five | Scarcity is what makes the catch matter |
| Somersault as decoration | Somersault as **a state with different physics** | See `ANIMATION.md`. A move that looks different should behave differently |
| Avian ally appears in the last scene | Caged and **visible from Act 1** | The ending lands if you have been walking past it for an hour |

## Difficulty

**Faithful and hard, for an adult who wants it hard.** Lava kills on contact,
spikes kill on contact, a scorpion kills on contact. There is no health bar and
no regenerating shield.

The modernisation is entirely in **the cost of dying**, not in the chance of it.
Death restores your swords, respawns you at the last lit brazier, and takes
under a second end to end. Checkpoint braziers are frequent and you light them
by walking past. The model is Celeste and Super Meat Boy: lethal, instant,
retried before you have finished being annoyed.

**Nothing is a difficulty option in v1.** One ruleset. A kid-forgiving mode is
in `BACKLOG.md` and stays there until the game exists.

## Structure

Four acts, roughly 18 rooms. Each act introduces one new thing the sword does
and then asks a hard question about it.

**Act 1: the moat and the outer wall** (4 rooms). Teaches throw, catch, and
embed. The last room cannot be crossed without standing on your own sword. Ends
at the gate.

**Act 2: the lava caverns** (5 rooms). Geysers that launch you, floating
platforms, rising and falling lava. Teaches the sword under time pressure: a
throw you have to catch before the platform you are standing on drops. The
dragon mini-boss closes the act.

**Act 3: the generator** (6 rooms). Conductive floors, insulated wood, switches
that need current and not impact. Teaches the sword as wiring. The haywire
generator is the act boss and the fight is a circuit, not a damage race.

**Act 4: the Hall of Volta** (3 rooms). Three gems, three holders, kept from the
original because it is a good ending. Volta himself, then the cage opens and the
bird finishes it exactly as it did in 1984.

**Gems and keys survive**, but they change meaning. A gem sits behind a distinct
use of the sword rather than behind a memorised route, and the key is the exit.
Three gems in the final room, as in the original.

## Enemies

Six types, all from the original, each punishing a **different** mistake with the
sword. This is the design constraint that keeps a roster from being decoration.

| enemy | behaviour | the mistake it punishes |
|---|---|---|
| **Bat** | erratic flight, fast, no ground contact | Throwing at a moving target. Costs you the sword nine times in ten |
| **Scorpion** | ground patrol, armoured front | Throwing from the front. Must be hit from behind or above |
| **Giant ant** | walks walls and ceilings, ignores gravity | Assuming the floor is where danger is |
| **Floating eyeball** | tracks you slowly, at your height | Standing in your own catch line. It is the anti-catch enemy and it exists to eat returning swords |
| **Fire-breathing dragon** | Act 2 mini-boss, telegraphed cone, immobile | Panic throwing. It has to be beaten with recall, not ammunition |
| **The generator** | Act 3 boss, arena, cannot be hit by a sword at all | Believing every problem is a throw |

**The two bosses are both anti-sword**, on purpose. A game whose verb is one
button needs its bosses to ask what else the verb can do.

## Name, and a real thing to decide before the repo is public

Conan the Barbarian is licensed IP (Conan Properties International). A public
repo that remakes it under that name, with art of that character, is a
trademark and copyright exposure, whatever the intent.

**The recommendation is to not be Conan**, and it is a design recommendation
before it is a legal one. Nothing above depends on the character. The sword, the
castle, the electricity, the caged bird and the wizard are all yours the moment
the hero has a different name, and the game becomes an actual reimagination
rather than a remake wearing a hat. **Volta can stay**: it is a unit of
electrical potential and a real surname, not an owned character.

Working titles, none of them precious: **Hall of Volta**, **Boomerang**,
**Recall**, **The Wizard's Circuit**. Repo name `hall-of-volta` unless Matt
prefers otherwise. Keeping the repo private and calling the hero Conan is also a
consistent answer; it just closes off ever showing it to anyone.

## Non-goals for v1

- Multiplayer, of any kind.
- A level editor, or user-made levels.
- Procedural generation. Every room is authored.
- Difficulty modes.
- Mobile or touch controls. Keyboard and gamepad, desktop and web.
- A story told in cutscenes. The bird in the cage is the story.
