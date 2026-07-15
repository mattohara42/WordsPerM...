// app.js — Typing Fishing core loop (M1: cast → wait → reel → catch).
// All tuning values come from config.js. Words are the hardcoded stage-1
// (home row) pool until M2 wires up data/words.json.
import { CONFIG } from "./config.js";

// The 37 stage-1 home-row words from data/words.json (inlined for M1; M2 loads the file)
const WORDS = ["all","has","had","add","ask","half","gas","fall","hall","ads","flag","dad",
               "adds","glad","sad","ash","asks","dash","hash","shall","flash","glass","falls",
               "salad","flask","lash","slash","sag","lag","fads","lads","gall","gala","flags",
               "halls","glads","salads"];

// Dad joke flavor text — one pool per moment, picked at random.
// House rule: cast lines always keep the literal instruction for beginners.
const PUNS = {
  cast: [
    "Type the word to cast — reel easy does it",
    "Type the word to cast. Let's get kraken",
    "Type the word to cast — any fin is possible",
  ],
  wait: [
    "Something's fishy down there…",
    "Waiting… just for the halibut",
    "Any second now. I'm not squidding",
    "Patience… good things come to those with bait",
  ],
  bite: [
    "Fish on! Holy mackerel!",
    "Oh my cod — reel it in!",
    "A bite! Hook, line, and sinker!",
    "Fish on! Don't trout yourself now",
  ],
  catchCommon: [
    "Caught it! Reel-y nice work",
    "Landed! That was off the scale",
    "Caught — and it wasn't even a fluke",
    "Got it! You're quite the catch-er",
  ],
  catchRare: [
    "✨ RARE! Holy carp! ✨",
    "✨ RARE! You're o-fish-ally amazing ✨",
    "✨ RARE! Simply fin-tastic ✨",
  ],
  escape: [
    "It got away… cod it be worse?",
    "Escaped! A missed oppor-tuna-ty",
    "Gone… but the pond is patient",
    "It slipped away — better luck next tide",
  ],
};

const ROD_LEVEL = 1; // rod upgrades arrive with the shop (M7)

// ---- State ----
let phase = "cast";        // cast | wait | reel | done
let target = "";
let typed = 0;
let tension = 0;
let tier = "common";
let wordsToLand = 0;
let wordsLeft = 0;
let caught = 0, escaped = 0;
let inputLocked = false;

// ---- DOM ----
const $ = id => document.getElementById(id);
const el = { scene: $("scene"), word: $("word"), status: $("status"), fill: $("meter-fill"),
             caught: $("caught"), escaped: $("escaped"), dist: $("dist"),
             line: $("line"), fish: $("fish"), water: $("water") };

const pick = a => a[Math.floor(Math.random() * a.length)];
const rand = (a, b) => a + Math.random() * (b - a);

function pickTier() {
  const odds = CONFIG.bite.tierOddsByRod[ROD_LEVEL];
  let r = Math.random();
  for (const [t, p] of Object.entries(odds)) {
    r -= p;
    if (r < 0) return t;
  }
  return "common";
}

// ---- Juice ----
function burst(x, y, n) {
  for (let i = 0; i < n; i++) {
    const p = document.createElement("div");
    p.className = "p";
    p.style.left = x + "px"; p.style.top = y + "px";
    p.style.setProperty("--dx", rand(-46, 46) + "px");
    p.style.setProperty("--dy", rand(-70, -14) + "px");
    el.scene.appendChild(p);
    setTimeout(() => p.remove(), 700);
  }
}
function shakeScene() {
  el.scene.classList.remove("shake"); void el.scene.offsetWidth; el.scene.classList.add("shake");
}
// ambient fish shadows
setInterval(() => {
  if (document.hidden) return;
  const s = document.createElement("div");
  s.className = "fish-shadow";
  s.style.width = rand(30, 70) + "px";
  s.style.top = rand(60, 150) + "px";
  s.style.left = "-90px";
  s.style.animationDuration = rand(16, 30) + "s";
  el.water.appendChild(s);
  setTimeout(() => s.remove(), 31000);
}, 6000);

// ---- Rendering ----
function renderWord() {
  el.word.innerHTML =
    `<span class="done">${target.slice(0, typed)}</span><span class="todo">${target.slice(typed)}</span>`;
  updateGuide(target[typed]);
}
function renderTension() {
  el.fill.style.width = tension + "%";
  el.fill.style.background = tension > 66 ? "var(--ember)" : tension > 33 ? "var(--gold)" : "var(--moss)";
}
function fishPosition() {
  const progress = 1 - wordsLeft / wordsToLand;
  el.fish.style.left = (600 - progress * 460) + "px";
}
function setStatus(t) { el.status.textContent = t; }

// ---- Phases ----
function startCast() {
  phase = "cast"; inputLocked = false;
  target = pick(WORDS); typed = 0;
  tension = 0; renderTension();
  el.dist.textContent = "—";
  el.line.style.width = "0px";
  el.fish.style.opacity = 0;
  el.fish.className = "";
  el.fish.style.transform = "";
  setStatus(pick(PUNS.cast));
  renderWord();
}

function startWait() {
  phase = "wait"; inputLocked = true;
  el.word.textContent = "";
  updateGuide(null);
  el.line.style.width = "330px";
  burst(400, 195, 5);
  setStatus(pick(PUNS.wait));
  setTimeout(bite, rand(...CONFIG.bite.delayMsRange));
}

function bite() {
  phase = "reel"; inputLocked = false;
  tier = pickTier();
  wordsToLand = CONFIG.reel.wordsToLandByTier[tier];
  wordsLeft = wordsToLand;
  el.fish.classList.add("tier-" + tier);
  el.fish.style.opacity = 1;
  fishPosition();
  el.dist.textContent = wordsLeft + " words";
  shakeScene();
  burst(410, 200, 10);
  setStatus(pick(PUNS.bite));
  nextReelWord();
}

function nextReelWord() { target = pick(WORDS); typed = 0; renderWord(); }

function wordComplete() {
  wordsLeft--;
  el.dist.textContent = wordsLeft > 0 ? wordsLeft + " words" : "landing…";
  fishPosition();
  burst(parseInt(el.fish.style.left) + 28, 258, 4);
  if (wordsLeft <= 0) return land(true);
  inputLocked = true;
  el.word.innerHTML = `<span class="done">${target}</span>`;
  updateGuide(null);
  setTimeout(() => { inputLocked = false; nextReelWord(); }, CONFIG.reel.wordPauseMs);
}

function land(success) {
  phase = "done"; inputLocked = true;
  el.word.textContent = "";
  updateGuide(null);
  if (success) {
    caught++; el.caught.textContent = caught;
    el.fish.classList.add("landing");
    burst(150, 240, 14);
    const isRare = tier === "rare" || tier === "legendary";
    setStatus(isRare ? pick(PUNS.catchRare) : pick(PUNS.catchCommon));
  } else {
    escaped++; el.escaped.textContent = escaped;
    el.fish.style.left = "760px";
    setStatus(pick(PUNS.escape));
  }
  setTimeout(startCast, 1500);
}

// ---- Input ----
document.addEventListener("keydown", (e) => {
  if (inputLocked || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key.length !== 1) return;
  const key = e.key.toLowerCase();
  if (!/[a-z]/.test(key)) return;

  if (key === target[typed]) {
    typed++;
    if (phase === "reel") { tension = Math.max(0, tension - CONFIG.reel.correctRelief); renderTension(); }
    renderWord();
    if (typed === target.length) {
      if (phase === "cast") startWait();
      else if (phase === "reel") wordComplete();
    }
  } else {
    el.word.classList.remove("shakeword"); void el.word.offsetWidth; el.word.classList.add("shakeword");
    if (phase === "reel") {
      tension = Math.min(CONFIG.reel.escapeAt, tension + CONFIG.reel.errorTension);
      renderTension();
      if (tension >= CONFIG.reel.escapeAt) land(false);
    }
  }
});

// ---- Finger guide (ghost hands over a mini keyboard) ----
const KB = { pitch: 42, rows: [
  { keys: "qwertyuiop", off: 0 },
  { keys: "asdfghjkl;", off: 12 },
  { keys: "zxcvbnm",    off: 34 },
]};
// Standard touch-typing zones. lp = left pinky ... rp = right pinky.
const FINGER_HOMES = { lp:"a", lr:"s", lm:"d", li:"f", ri:"j", rm:"k", rr:"l", rp:";" };
const FINGER_LEN   = { lp:50, lr:68, lm:78, li:70, ri:70, rm:78, rr:68, rp:50 };
const LETTER_FINGER = {};
[["lp","qaz"],["lr","wsx"],["lm","edc"],["li","rfvtgb"],
 ["ri","yhnujm"],["rm","ik"],["rr","ol"],["rp","p;"]]
  .forEach(([f, ls]) => [...ls].forEach(l => LETTER_FINGER[l] = f));

const guide = $("guide");
const keyPos = {}, fingerEls = {};
let guideOn = true;

KB.rows.forEach((row, r) => {
  [...row.keys].forEach((ch, i) => {
    const x = row.off + i * KB.pitch, y = r * KB.pitch;
    keyPos[ch] = { x: x + 19, y: y + 19 };
    const k = document.createElement("div");
    k.className = "key" + (ch === ";" ? " ghost-key" : "");
    k.textContent = ch;
    k.style.left = x + "px"; k.style.top = y + "px";
    k.dataset.ch = ch;
    guide.appendChild(k);
  });
});

// palms: one ghost oval per hand, below the keyboard
[["s","d"],["k","l"]].forEach(([a, b]) => {
  const cx = (keyPos[a].x + keyPos[b].x) / 2;
  const p = document.createElement("div");
  p.className = "palm";
  p.style.width = "96px"; p.style.height = "64px";
  p.style.left = (cx - 48) + "px"; p.style.top = "138px";
  guide.appendChild(p);
});

// fingers: capsules with tips resting on their home keys
Object.entries(FINGER_HOMES).forEach(([f, home]) => {
  const fin = document.createElement("div");
  fin.className = "finger";
  fin.style.height = FINGER_LEN[f] + "px";
  fin.style.left = (keyPos[home].x - 9) + "px";
  fin.style.top = (keyPos[home].y - 12) + "px";
  guide.appendChild(fin);
  fingerEls[f] = { el: fin, home };
});

function updateGuide(letter) {
  guide.querySelectorAll(".key.target").forEach(k => k.classList.remove("target"));
  Object.values(fingerEls).forEach(({ el }) => { el.style.transform = ""; el.classList.remove("active"); });
  if (!guideOn || !letter || !LETTER_FINGER[letter]) return;
  const keyEl = guide.querySelector(`.key[data-ch="${letter}"]`);
  if (keyEl) keyEl.classList.add("target");
  const { el: fin, home } = fingerEls[LETTER_FINGER[letter]];
  const dx = keyPos[letter].x - keyPos[home].x;
  const dy = keyPos[letter].y - keyPos[home].y;
  fin.style.transform = `translate(${dx}px, ${dy}px)`;  // finger reaches from home to target
  fin.classList.add("active");
}

const guideBtn = $("guide-toggle");
guideBtn.addEventListener("click", () => {
  guideOn = !guideOn;
  guideBtn.textContent = guideOn ? "ON" : "OFF";
  guideBtn.classList.toggle("active", guideOn);
  guide.style.display = guideOn ? "block" : "none";
  updateGuide(guideOn && !inputLocked ? target[typed] : null);
});

startCast();
