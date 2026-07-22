# Art Pipeline

How art gets made for Typing Fishing. It's a family project — a kid-drawn
sprite outranks a professional one (see `CLAUDE.md`). This doc is the workflow
for the *generated* art that fills the gaps.

## Who does what

- **Claude** decides when a feature needs new art, writes the **Gemini prompt**,
  and specifies the exact **filename + path** and any size/format constraints.
- **Matt** runs the prompt in **Gemini**, then drops the resulting PNG at the
  path Claude named. Matt is the only one who generates images.

Claude cannot generate images and must not block a feature on art — build the
feature so it works with a placeholder (e.g. a solid `--fish-color` shape),
then hand Matt the art request separately.

## The handoff format (Claude → Matt)

When art is needed, Claude gives all of this in one block:

```
ART NEEDED: <what it's for>
Prompt:   <the full Gemini prompt>
Save as:  assets/<filename>.png
Size:     <e.g. 64×64, transparent background>
Wired in: <where the code expects it — CSS selector / file:line, or "not yet">
```

Matt generates it, saves it, and the feature lights up (or Claude wires it in
once the file exists).

## Naming & placement

- All art lives flat in **`assets/`** (no subfolders currently).
- **Final** assets use lowercase, semantic, hyphenated names that match how the
  code references them: `background.png`, `boat.png`, `kid.png`,
  `fish-common.png`, `fish-rare.png`, `fish-legendary.png`. New art follows the
  same style: `hat-straw.png`, `boat-canoe.png`, `junk-boot.png`.
- **Raw** Gemini generations may be kept as `Gemini_*.png` for reference/reroll,
  but the code never points at those — only at the clean final name.

## How art is wired into the game

- Almost everything is a CSS `background: url("assets/…png")` with
  **`image-rendering: pixelated`** (see `style.css`). No sprite atlas, no build
  step — one PNG per thing.
- **Fish share one sprite per tier**, not per species: `fish-common.png`,
  `fish-rare.png`, `fish-legendary.png`. Each species in `data/fish.json` has a
  `color`, and the code tints the shared shape via the `--fish-color` CSS var.
  So a *new fish species usually needs no new art* — just a `color`. Only make a
  distinct sprite when a fish should look genuinely different (e.g. legendary).

## Style guardrails (put these in every prompt)

- **Cozy pixel art**, chunky pixels, clean readable silhouette (it renders small).
- **Palette:** warm dawn/dusk lake — teal water, muted purple hills, warm sky,
  gold accents. Match the existing sprites' mood, not a neon/high-contrast look.
- **Framing:** single subject, centered, **transparent background** for anything
  that isn't a full scene (sprites, hats, boats, fish, junk items).
- **No text, no UI, no watermark, no drop shadow baked in.**
- Square-ish canvas sized to how it's used (small sprites ~64×64; scenes wider).

## Prompt template Claude should reuse

> Pixel art <subject>, cozy retro game asset, chunky clean pixels, warm dawn
> lake palette (teal water, muted purple hills, warm sky, gold accents), single
> centered subject, transparent background, no text, no shadow. <extra detail>.
