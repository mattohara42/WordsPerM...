# ART.md: the asset pipeline

> `ART_DIRECTION.md` owns what the art should look like. `ANIMATION.md` owns what
> moves and how. **This file owns how a picture gets from a prompt into the
> game**, and the open requests. `GEMINI_NOTES.md` owns how the generator
> behaves, and is **required reading before writing any prompt**.

## The pipeline, five steps

1. **Claude writes the prompt and the filename.** Matt generates the PNG in the
   Gemini UI and downloads it. This is the round trip and it is the expensive
   step, so a prompt that saves a generation is worth more than a tool that
   saves an hour.
2. **Key it.** Deliveries arrive as an opaque painting on a flat backdrop colour.
   `tools/key.py` floods the backdrop and writes a transparent PNG.
3. **Cut it.** One painting becomes many pieces: a sheet becomes six enemies, a
   character becomes the parts of a rig. `tools/cut-sheet.py` and
   `tools/cut-rig.py`.
4. **Rig it.** Parts become a `Skeleton2D` scene in Godot. Manual, once per
   character, and then every animation is free.
5. **Check it.** `tools/palette-check.py` against `ART_DIRECTION.md`, and a
   screenshot of the thing in the actual game.

## The four rules that came from the last project, and what they cost to learn

These were paid for in real generations on Hook, Line and Sentence. They are not
theory.

**Don't generate a piece you could cut.** A character painted holding a sword
already contains the arm, the body and the sword. Asking for three images that
then have to register with each other invents a problem the one painting does not
have. Pieces cut from one source register by construction. The whole cutting
family of tools exists for this one sentence.

**Several subjects on one canvas works, and it is the only way to ask for a
difference.** Thirty-three fish came out of eight sheets in nine generations
against an opening estimate of ninety-nine pieces. Six subjects on one canvas
worked as reliably as four. **Put the two things hardest to tell apart on the same
sheet**: a rainbow trout and a steelhead were separated correctly first attempt
when drawn against each other, having been unseparable in words.

For this project that means: **the six enemies are one sheet, not six
generations.** The scorpion and the giant ant are the pair that needs to be on it
together.

**Ask for an edit when there is already a painting to edit.** Attach the existing
painting, name the one thing that changes, and registration comes free: the
pixels that did not change are the reference's own. Nine hat deliveries came back
as faithful edits, nine times out of nine, agreement 0.945 to 0.991 below the
neck. This is how the hero gets a second costume, or an enemy gets a variant.

**Art that does not fit is a reroll, not an offset tweak.** If a delivery is
wrong in its drawn content, reroll. Salvage only featureless content: a flat
backdrop, a straight shaft, a gradient.

## The tools to build, and the four to port

The last project ended with fifteen pipeline tools and a rule about not writing a
sixteenth without reading the index. Start this one with **five**, and port what
transfers rather than rewriting it.

| tool | port or new | does |
|---|---|---|
| `key.py` | **port** the flood-fill and despill from `cut-fish.py` | delivery on a flat backdrop, out comes a transparent PNG |
| `palette-check.py` | **port whole** | judges a delivery against `ART_DIRECTION.md`. Its darks rule needs rewriting for the coloured-dark rule, its structure does not |
| `cut-sheet.py` | **port** `cut-fish.py` | one sheet, N connected components, out come N tight crops |
| `cut-rig.py` | new | one character painting, out come the rig parts. The hard one, and the closest analogue is `cut-angler.py` |
| `pose-sheet.py` | new | one 3x2 pose sheet, out come six aligned frames for a `SpriteFrames` resource. Alignment is by the figure's own bounding box, not by the grid |

**In a pipeline tool, the destructive mode is the flag.** The last project got
this backwards on `cut-angler.py` and paid for it three times: the frequent safe
cut needed an argument while the rare cut that overwrote four committed paintings
was what you got by forgetting one. Make the path that destroys work the one you
have to ask for, and let the tool refuse when nobody asked.

## Godot import settings, and the one that will bite

- **Filter: on. Mipmaps: off.** This is painterly art at 4x, downscaled. It is
  not pixel art and nearest-neighbour will make it crunchy.
- **A cut part must keep its source canvas offset**, not be trimmed to its own
  bounding box, or the rig parts will not register when they are parented. Turn
  **off** "trim alpha" in the importer for anything from `cut-rig.py`, and leave
  it on for sheet crops, which are placed by hand anyway.
- Set these in the **import defaults for the folder** (`.godot` presets), not per
  file. Three hundred assets in and a per-file setting is unfixable.

## Budget, from the last project's real numbers

The fishing game's refresh delivered 33 fish in 9 generations, 21 gear pieces in
16, and 10 junk items in 2. Sheets carried all of it.

For this game, the honest estimate:

| what | sheets | generations |
|---|---|---|
| Hero, one painting to cut into a rig | 1 | 1 to 3 (characters reroll more than objects) |
| Hero pose sheets: somersault, dive, death | 3 | 3 to 5 |
| Six enemies | 1 to 2 | 2 to 4 |
| Two bosses | 2 | 2 to 4 |
| Tilesets and props, four acts | 4 to 6 | 6 to 10 |
| Parallax backgrounds, four acts | 4 | 4 to 8 |
| **Total** | | **roughly 20 to 35** |

That is the number to sanity-check M5 against. **If the art spike takes more than
five generations for one room, the estimate is wrong and the plan needs revising
before Phase 2 continues**, not after it.

## Open requests

Nothing yet. The first entry here will be M5's room. Write each request up the
way the last project did: the prompt as sent, what came back, what was measured,
and whether it landed first attempt. That record is what turns thirty-five
generations into a document worth having.
