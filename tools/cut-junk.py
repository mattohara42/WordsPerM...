#!/usr/bin/env python3
"""Cut the junk pulls out of one delivered sheet (T4).

An ART PIPELINE tool, not part of the game: nothing loads it at runtime and it
is not a build step. Fifth of its family after cut-angler.py, cut-vessel.py,
cut-fish.py and cut-gear.py, and the same argument as all four: don't generate
a piece you could cut.

    python3 tools/cut-junk.py <sheet> [source.jpg|png]

Sheets carry several objects on one canvas separated by flat magenta, so they
come apart as connected components. This is cut-fish.py's opening move with the
fish half removed: no caudal peduncle, no tail split, no per-species length,
because a boot has no anatomy and the game draws junk with `background: center /
contain`, which letterboxes whatever aspect it is handed. So the output is one
tight crop per object and nothing is measured into config.

The reason there is a tool here at all, rather than four hand crops: the same
one as everywhere else in this family. If a better sheet ever lands, or the
alpha model changes, the cut is one command instead of an afternoon.

WHAT THIS TOOL HAS THAT cut-fish.py DOES NOT: STRAYS ARE KEPT

cut-fish.py takes the N largest components and DROPS the rest, because the rest
were captions: the Ocean's first sheet came back with species names on it and a
flat size threshold called seventeen word fragments fish.

That rule is wrong here, and sheet A proved it on delivery. The pond weed was
asked for with "a few long fronds straggling out of the clump and a couple of
tiny leaves", and it arrived with exactly that: two of the leaves are detached
from the clump, 597px and 415px against the clump's 69,299. Dropping them
loses art the prompt asked for. So a small component is ATTACHED to a subject
rather than dropped, and the question becomes which subject, and whether the
answer is ever in doubt.

It is not, and the threshold is derived rather than picked. A stray joins the
nearest subject when its bounding box is within HALF THE SMALLEST GAP BETWEEN
ANY TWO SUBJECTS on that sheet. Half, because that is the largest cap for which
no stray can be inside two subjects' caps at once: the attachment is
unambiguous by construction rather than by a number someone liked, and it
rescales itself per sheet instead of assuming sheet A's spacing.

On sheet A the measurement is not close: both strays sit INSIDE the weed's own
bounding box (gap 0.0px), the next nearest subject is 166px and 320px away, the
narrowest subject-to-subject band is 76px, so the cap is 38px. Anything past
the cap stops the tool instead of being quietly dropped, because on this sheet
that can only be a caption or a subject the layout did not name, and both are
worth a human looking at.

ALPHA IS THE UNMIX MODEL, NOT THE DISTANCE RAMP

Same choice as the fish, the gear and the Whaler's glass, and for the same
reason: a JPEG's ringing around a saturated key is not a linear mix, so the
ramp reads a half-magenta edge pixel as nearly opaque and leaves a pink rim.
`gap = min(R,B) - G` is linear in how much key a pixel carries, and it clips to
opaque on every warm or neutral colour in this palette. Sheet A measured 0 px
of residual key inside the subjects, so there is nothing left to despill.
"""
import sys, os
from collections import deque
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Which pieces are on which sheet, in READING ORDER: rows top to bottom, and
# left to right within a row. The prompt's own layout written down, exactly as
# cut-fish.py does it, and deliberately not a grid of quadrant names: sheet A is
# 2x2 and sheet B is 3x2, and a list covers both without the table knowing.
SHEETS = {
    "a": dict(src="assets/Gemini_junk-sheet-a.jpg",
              layout=["boot", "can", "weed", "nugget"]),
    # Registered ahead of the art, the way R6's wave 2 was, so cutting the
    # delivered sheet is one command.
    "b": dict(src="assets/Gemini_junk-sheet-b.jpg",
              layout=["unicorn", "turtle", "cube", "frisbee", "chocolate", "mask"]),
}

TOL = 70.0        # backdrop flood tolerance, cut-fish.py's, unchanged
SOLID = 0.12      # alpha above which a pixel joins a component, likewise

name = sys.argv[1] if len(sys.argv) > 1 else "a"
S = SHEETS[name]
SRC = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, S["src"])

im = Image.open(SRC).convert("RGB")
W, H = im.size
a = np.asarray(im, dtype=np.float64)

border = np.concatenate([a[0:3].reshape(-1, 3), a[-3:].reshape(-1, 3),
                         a[:, 0:3].reshape(-1, 3), a[:, -3:].reshape(-1, 3)])
KEY = np.median(border, axis=0)
dist = np.sqrt(((a - KEY) ** 2).sum(axis=2))
print("sheet %s  %dx%d  key %s (stdev %s)"
      % (name, W, H, KEY.round(1), border.std(axis=0).round(1)))

# 1. flood the backdrop in from the border, then take the enclosed pockets too:
#    the hole through a boot's lace loop and the gaps in a weed tangle are
#    backdrop the border cannot reach.
bg = np.zeros((H, W), dtype=bool)
q = deque()
for x in range(W):
    for y in (0, H - 1):
        if dist[y, x] <= TOL and not bg[y, x]:
            bg[y, x] = True; q.append((x, y))
for y in range(H):
    for x in (0, W - 1):
        if dist[y, x] <= TOL and not bg[y, x]:
            bg[y, x] = True; q.append((x, y))
while q:
    x, y = q.popleft()
    for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
        if 0 <= nx < W and 0 <= ny < H and not bg[ny, nx] and dist[ny, nx] <= TOL:
            bg[ny, nx] = True; q.append((nx, ny))
pockets = (dist <= TOL) & ~bg
bg |= pockets

# 2. alpha, by unmixing the key out (see the docstring)
gap = np.minimum(a[..., 0], a[..., 2]) - a[..., 1]
alpha = np.clip(1.0 - gap / (min(KEY[0], KEY[2]) - KEY[1]), 0.0, 1.0)
alpha[bg] = 0.0
t = np.clip(alpha, 1e-3, 1.0)[..., None]
fg = np.clip((a - (1.0 - t) * KEY) / t, 0, 255)
keyed = np.dstack([fg, alpha * 255])
interior = alpha > 0.9
violet = interior & (np.minimum(fg[..., 0], fg[..., 2]) - fg[..., 1] > 25)
print("backdrop %.2f%% (%d px of it enclosed); residual key inside the subjects "
      "%d px (%.4f%% of interior)"
      % (100 * bg.mean(), pockets.sum(), violet.sum(),
         100 * violet.sum() / max(interior.sum(), 1)))

# 3. connected components
solid = alpha > SOLID
lab = np.zeros((H, W), dtype=np.int32)
comps = []
for sy in range(H):
    for sx in range(W):
        if solid[sy, sx] and lab[sy, sx] == 0:
            n = len(comps) + 1
            lab[sy, sx] = n
            stack = [(sx, sy)]
            xs, ys = [], []
            while stack:
                x, y = stack.pop()
                xs.append(x); ys.append(y)
                for nx, ny in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
                    if 0 <= nx < W and 0 <= ny < H and solid[ny, nx] and lab[ny, nx] == 0:
                        lab[ny, nx] = n; stack.append((nx, ny))
            comps.append(dict(id=n, px=len(xs), x0=min(xs), y0=min(ys),
                              x1=max(xs), y1=max(ys)))
want = len(S["layout"])
if len(comps) < want:
    sys.exit("  ✗ only %d components for %d objects: two subjects have merged" %
             (len(comps), want))
comps.sort(key=lambda c: -c["px"])
seeds, strays = comps[:want], comps[want:]
print("found %d components; %d subjects (%d..%d px), %d stray"
      % (len(comps), want, seeds[-1]["px"], seeds[0]["px"], len(strays)))


# 4. reading order: rows found rather than assumed, so a 2x2 and a 3x2 both come
#    out in the order the prompt listed them. cut-fish.py's function, unchanged.
#    It runs BEFORE the strays are attached, only so a stray can be reported
#    against the name the layout gives its subject. `seeds` is sorted by SIZE,
#    and the first draft printed layout[size_index], which named the weed's two
#    leaves as the can's: the grouping was right and the line about it was
#    wrong, which is the whole reason this repo prints what it measured.
def reading_order(cs):
    heights = sorted(c["y1"] - c["y0"] + 1 for c in cs)
    gap = heights[len(heights) // 2] / 2
    rows, rest = [], sorted(cs, key=lambda c: (c["y0"] + c["y1"]) / 2)
    for c in rest:
        cy = (c["y0"] + c["y1"]) / 2
        if rows and cy - (rows[-1][-1]["y0"] + rows[-1][-1]["y1"]) / 2 <= gap:
            rows[-1].append(c)
        else:
            rows.append([c])
    return [c for row in rows for c in sorted(row, key=lambda c: (c["x0"] + c["x1"]) / 2)]


ordered = reading_order(seeds)
name_of = {s["id"]: jid for s, jid in zip(ordered, S["layout"])}


def boxgap(A, B):
    dx = max(B["x0"] - A["x1"], A["x0"] - B["x1"], 0)
    dy = max(B["y0"] - A["y1"], A["y0"] - B["y1"], 0)
    return (dx * dx + dy * dy) ** 0.5


# 5. attach the strays. The cap is half the narrowest subject-to-subject gap on
#    THIS sheet, which is the largest cap that cannot put one stray inside two
#    subjects at once. Nothing is dropped silently: a stray past the cap stops
#    the tool, because it is a caption or an unnamed subject and both want eyes.
pairs = [boxgap(seeds[i], seeds[j]) for i in range(want) for j in range(i + 1, want)]
cap = min(pairs) / 2
print("subject spacing: narrowest band %.1f px, so a stray attaches within %.1f px"
      % (min(pairs), cap))
for s in strays:
    near = sorted((boxgap(s, k), i) for i, k in enumerate(seeds))
    if near[0][0] > cap:
        sys.exit("  ✗ a %d px component at %d,%d is %.1f px from the nearest subject, "
                 "past the %.1f px cap: caption, watermark or an unnamed subject"
                 % (s["px"], s["x0"], s["y0"], near[0][0], cap))
    s["owner"] = near[0][1]
    print("  stray %5d px at %4d,%-4d joins %-9s (%.1f px away; next subject %.1f px)"
          % (s["px"], s["x0"], s["y0"], name_of[seeds[near[0][1]]["id"]],
             near[0][0], near[1][0]))

# 6. one tight crop per object, its strays included. Tight and not square: all
#    three places the game draws junk (the catch card, the journal shelf, the
#    #fish box in the scene) use `background: center / contain`, which fits any
#    aspect and centres it, and every sprite these overwrite is tight already.
block = []
for seed, jid in zip(ordered, S["layout"]):
    ids = [seed["id"]] + [s["id"] for s in strays
                          if seeds[s["owner"]]["id"] == seed["id"]]
    m = np.isin(lab, ids)
    ys, xs = np.where(m)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    out = np.zeros_like(keyed)
    out[m] = keyed[m]
    img = Image.fromarray(out.astype(np.uint8), "RGBA").crop((x0, y0, x1 + 1, y1 + 1))
    path = os.path.join(ROOT, "assets", "junk-%s.png" % jid)
    img.save(path, optimize=True)
    print("  %-20s %-11s %6.1f KB  %d px painted in %d component(s)"
          % (os.path.basename(path), "%dx%d" % img.size,
             os.path.getsize(path) / 1024, int(m.sum()), len(ids)))
    block.append('      { id: "%s", name: "…", file: "junk-%s" },' % (jid, jid))

# 7. the contact strip, at the size that actually decides this milestone. An
#    assertion proves the code ran; only a picture says whether a frisbee still
#    reads as a frisbee at 34px, which is what the journal shelf shows.
CELL = 34
strip = Image.new("RGBA", (CELL * len(S["layout"]), CELL), (0, 0, 0, 0))
for i, jid in enumerate(S["layout"]):
    piece = Image.open(os.path.join(ROOT, "assets", "junk-%s.png" % jid))
    piece.thumbnail((CELL, CELL), Image.LANCZOS)
    strip.alpha_composite(piece, (i * CELL + (CELL - piece.width) // 2,
                                  (CELL - piece.height) // 2))
strip.save("/tmp/junk-%s-34px.png" % name)
print("\n  shelf-size contact strip: /tmp/junk-%s-34px.png  (LOOK AT IT)" % name)
print("\n  CONFIG.junk.items, names still to write:\n")
print("\n".join(block))
