# GEMINI_NOTES.md: how the image generator actually behaves

> **Read this before writing any art prompt.**
>
> **Inherited, 2026-09-07.** This is the distilled carry-over from Hook, Line and
> Sentence, where every rule below was paid for with a real generation across
> roughly seventy deliveries. It has been re-scoped: the fishing-specific
> findings are dropped, the general ones are kept verbatim in substance. The
> original is at `mattohara42/hook-line-and-sentence`, `GEMINI_NOTES.md`, 705
> lines, and is worth reading in full before a hard prompt.
>
> **Append to this file as this project learns things.** Its value is entirely in
> being the accumulated memory rather than the initial guess.

## Who owns what

| doc | owns |
|---|---|
| `ART_DIRECTION.md` | what the art should **look like** |
| `ART.md` | the **pipeline and the open requests** |
| **this file** | how the **generator behaves**, and how to prompt and salvage it |

## The short version

1. **Position by edges and corners, never by percentage.** Percentages are the
   least reliable thing you can ask for.
2. **Name a flat backdrop colour** rather than asking for transparency, and then
   **detect the colour you actually got**, because it will not be the one you
   asked for.
3. **State keep-outs as composition**, not as geometry.
4. **Output format and pixel dimensions are not prompt-controllable.** Ask
   anyway. Get the file from the download UI and expect a different size.
5. **A miss in featureless content is salvageable. A miss in drawn content is a
   reroll.**
6. **Check for backdrop colour bled into the subject first.** That one is never
   fixable downstream and it is the only reroll condition a noisy backdrop
   creates. A merely noisy backdrop is not.
7. **Ask for an edit when there is already a painting to edit.** Attach it, name
   the one thing that changes, and registration comes free.

## What it reliably gets right

**Aspect ratio, stated as a ratio.** Appending `Aspect ratio 16:9` is the single
most dependable instruction available. State the pixel dimensions in the body as
well ("The image is 2560 by 1440 pixels, aspect ratio 16:9"): the pixel count is
routinely ignored, the ratio holds, and it makes the prompt self-contained.

**When the ratio misses, suspect the whole frame.** The one time it failed in
seventy deliveries, the same generation had also ignored the backdrop, added
captions and changed medium. A miss on the most reliable instruction in the set
means a stronger idiom has rewritten your prompt, not that one instruction
slipped.

**Palette, described in words rather than hex.** Prose descriptions landed within
a few hex points of target repeatedly. Hex values in the prompt are not obviously
honoured and are not needed. Put `ART_DIRECTION.md`'s descriptive palette
language in the preamble of every prompt and let it do the work.

**Mood, treatment and outline weight**, from a preamble prefixed to everything.
Keep prefixing it.

**Subject exclusion, for separable objects.** "No lava, no torches" is obeyed.
It is **not** reliable for something the subject implies: a rod came back with
line threaded through it despite an explicit exclusion, because a rod has a line.
When excluding part of an object's own idiom, spend a whole flagged paragraph
naming every form it could take, and **design the downstream cut to tolerate the
violation anyway**, because the paragraph raises the odds without settling the
matter.

## Several subjects on one sheet

**The strongest result the last project had.** Eight sheets, nine generations,
thirty-three subjects, four layouts (2x2, a row of three, 3x2, and one alone).
Seven landed first attempt. Six subjects on one canvas worked as well as four and
the upper bound was never found.

**Put the two subjects hardest to tell apart on the SAME sheet.** Drawn against
each other they separate correctly; described separately in words they do not.
**A sheet is not merely a saving: it is the only way to ask for a difference
rather than describe one.**

**When two subjects cannot share a sheet, invert the pattern rather than
forbidding it.** State the mark positively first and as an inversion, then add
the negation as backup: "DARK bars on a PALE flank, the opposite of X, which has
PALE spots on a DARK flank." Ordering matters, and the general rule under it is
that **a negation needs something positive to attach to.**

**And measurably distinct is not distinct at a glance.** Two hats came back with
genuinely different silhouettes in the same colour family and one was wrongly
rejected as a duplicate. When two items in a set share a palette, give the
inversion clause a colour to work with as well as a shape. **Rejecting a good
generation costs exactly as much as accepting a bad one and is much harder to
notice afterwards.**

## Editing an attached painting

Attach the painting, name the one thing that changes, and the return is a
faithful edit: no redraw, no reframe, no pose change, nine times out of nine.
Agreement below the changed region measured 0.945 to 0.991.

Three cautions that come with it:

- **The canvas comes back its own size and the aspect drifts too.** Asked
  1344x1391, got 1008x1056. A single uniform scale will not register the return.
  **Fit per axis**, on a part of the figure the edit cannot touch.
- **The drift is repeatable per reference, not random per generation.** The same
  attachment produced the same drift three and four times running. So the fit is
  correcting a stable property, and **there is no trend to read into one tighter
  or looser return.** Do not tune a prompt on a single aspect reading.
- **A faithful edit is never pixel-identical.** The generator repaints the whole
  canvas rather than compositing onto yours, so untouched linework comes back
  within a few px, visually identical, and leaves a 1 to 3 px trace of "changed"
  in any difference-based cut. **Anything reading the diff has to expect that.**
  It cost a real bug last time: a morphological close bridged the trace into a
  ring and the hole-fill painted its inside solid.

## Things it does when you do not ask

- **It fakes transparency.** Asked for a transparent background, it paints the
  editor's checkerboard as opaque pixels. Tells: a corner pixel reads alpha 255,
  and the file is much bigger than a tight sprite. Every generation picks a
  different grey pair. This is why the flat-backdrop convention exists.
- **It flattens gradients you did not insist on.** A water layer came back
  essentially one tone. Rewriting the prompt to say the gradient **is the point
  of this layer** and "do not paint it as one flat tone" took the luminance drop
  from 12 to 83. **Emphatic, named-as-the-goal phrasing works where plain
  description does not.** Relevant here for every lava surface.
- **It obeys your own preamble against you.** A `#FF00FF` backdrop came back
  `#c642b0` because the same prompt's style preamble forbade saturated colours.
  That is a prompt conflict rather than a generator failure, and it does not
  matter as long as nothing downstream assumes the exact value.
- **A shared frame can contradict the item it wraps.** Boilerplate written for
  one item in a set reads as permission when applied to another. When a template
  is filled per item, re-read the boilerplate against each item, not only the
  block that changed.

## Characters

Unlike composition, **subject description does move.** Know which kind of problem
you have before deciding what a reroll is worth.

- **A hand gripping nothing will not come back gripping.** Two rerolls went into
  describing a grip. What worked was **drawing the object in the hand** and then
  cutting the pieces apart locally. **Give it the object, then cut.** Directly
  relevant: the hero is generated holding the sword.
- **Vague age and build default to a stereotype.** "A young child" reliably came
  back as a toddler. What fixed it was all three of an age in years, the
  proportions spelled out, and the negative. Expect the same for "a barbarian",
  which has a very strong default.
- **Don't spend a reroll on placement inside the canvas.** For a rig every piece
  shares one canvas, so they can only be wrong together and a shared offset is
  absorbed once when the box is measured. Spend rerolls on the pose and the
  character.
- **A held object cropped by the frame should be extended, not tapered in.** Read
  a rod exiting the corner as a defect once and tapered it, which cost 51% of its
  length. Decide the length the object should be, then walk it out along its own
  axis, resampling the real cross-section, and **seed the taper from the measured
  width at the seam, never from a nominal constant.**
- **Scale comes from a body part, never from the figure.** The generator draws
  every pose to fill its frame, so figure height carries no world scale between
  generations: a standing figure arrived 2% taller than a seated one. Match the
  **head**.
- **Measure a complaint before you spend a reroll on it.** Of three faults called
  on one delivery, two did not survive testing: "gone flat vector" measured
  *more* tonal variation than the accepted piece. A generation costs a round
  trip, and eyes are worse than a five-line script at judging flatness, evenness
  and saturation.

## What this project will have to learn on its own

Everything above came from a game with no animation and no sheets of the same
subject. Two open questions, to be answered by the first deliveries and written
up here:

1. **Does the pose-sheet trick hold?** Six poses of one character on one canvas
   is a six-subject sheet in every respect except that the six subjects are meant
   to be the *same*. The sheet finding says consistency comes free. The
   competing prior says the generator differentiates subjects it puts on one
   canvas, which is the opposite of what a pose sheet needs. **Test this in M5
   with a throwaway sheet before anything depends on it.**
2. **How well does it hold a character across separate generations?** The last
   project never needed this: each angler was one painting. Here the hero appears
   on a rig sheet, three pose sheets and possibly a portrait. If attach-and-edit
   is the answer, every sheet after the first is an edit of the first.
