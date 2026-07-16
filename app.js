// app.js — Typing Fishing core loop (cast → wait → reel → catch).
// All tuning values come from config.js. Words come from data/words.json,
// filtered to the unlocked letter set.
import { CONFIG } from "./config.js";

let FULL_POOL = [];              // every entry from data/words.json
let WORDS = [];                  // entries typeable with the unlocked letters
let FISH = [];                   // full roster from data/fish.json
let unlockedLetters = new Set();

async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

// ---- Profiles (localStorage mirror; M4b layers Firestore sync on top) ----
// One document per kid, shaped per FIRESTORE.md. localStorage keys:
//   tf:profile:{id} — the save document (which IS the offline save file)
//   tf:profiles     — lightweight index for the picker [{id,name,avatar,updatedAt}]
//   tf:active       — last-picked profile id
// All reads/writes funnel through here so M4b can add Firestore in one place.
const AVATARS = ["🐸", "🐟", "🐠", "🦆", "🐢", "🦖", "🐙", "🦈", "⭐", "🍀", "🐳", "🦑"];
const PROFILE_KEY = id => "tf:profile:" + id;
const INDEX_KEY = "tf:profiles";
const ACTIVE_KEY = "tf:active";
const LEGACY_KEY = "typing-fishing-save";

let save = null;   // the active profile document, or null before one is picked

function blankProfile(name, avatar) {
  const now = Date.now();
  return {
    id: "p" + now.toString(36) + Math.random().toString(36).slice(2, 6),
    name, avatar,
    createdAt: now, updatedAt: now,
    totalCatches: 0, stage: 1, coins: 0,
    // upgrades carries owned lists too (FIRESTORE.md shows equipped only; the
    // shop needs to know what's already bought so it can't be re-purchased)
    upgrades: { rod: "stick", bait: "worm", owned: { rod: ["stick"], bait: ["worm"] } },
    collection: {},                                   // fishId → count
    stats: { letters: {}, wordsTyped: 0, escapes: 0, sessionCount: 0, lastPlayed: now },
    jokesEndured: 0,                                  // reserved (backlog groan counter)
  };
}

function readIndex() { try { return JSON.parse(localStorage.getItem(INDEX_KEY)) ?? []; } catch { return []; } }
function writeIndex(list) { localStorage.setItem(INDEX_KEY, JSON.stringify(list)); }
function readProfile(id) { try { return JSON.parse(localStorage.getItem(PROFILE_KEY(id))); } catch { return null; } }

function persistSave() {
  if (!save) return;
  save.updatedAt = Date.now();
  save.totalCatches = totalCatches();
  save.stage = unlockedStageCount(save.totalCatches);
  save.stats.lastPlayed = save.updatedAt;
  localStorage.setItem(PROFILE_KEY(save.id), JSON.stringify(save));
  const idx = readIndex();
  const row = idx.find(p => p.id === save.id);
  if (row) { row.name = save.name; row.avatar = save.avatar; row.updatedAt = save.updatedAt; writeIndex(idx); }
  syncPush(save);   // M4b: push to Firestore when signed in; no-op otherwise
}

function createProfile(name, avatar) {
  const p = blankProfile(name || "Angler", avatar || pick(AVATARS));
  localStorage.setItem(PROFILE_KEY(p.id), JSON.stringify(p));
  writeIndex([...readIndex(), { id: p.id, name: p.name, avatar: p.avatar, updatedAt: p.updatedAt }]);
  return p;
}

function deleteProfile(id) {
  localStorage.removeItem(PROFILE_KEY(id));
  writeIndex(readIndex().filter(p => p.id !== id));
}

// One-time migration of the pre-M4 single save into a first profile.
function migrateLegacySave() {
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (!legacy || readIndex().length) return;
  try {
    const old = JSON.parse(legacy);
    const p = blankProfile("Player 1", "🎣");
    p.coins = old.coins ?? 0;
    p.collection = old.caught ?? {};
    if (old.gear) p.upgrades = {
      rod: old.gear.rod ?? "stick", bait: old.gear.bait ?? "worm",
      owned: old.gear.owned ?? { rod: ["stick"], bait: ["worm"] },
    };
    p.totalCatches = Object.values(p.collection).reduce((a, b) => a + b, 0);
    p.stage = unlockedStageCount(p.totalCatches);
    localStorage.setItem(PROFILE_KEY(p.id), JSON.stringify(p));
    writeIndex([{ id: p.id, name: p.name, avatar: p.avatar, updatedAt: p.updatedAt }]);
    localStorage.removeItem(LEGACY_KEY);
  } catch { /* ignore a malformed legacy save */ }
}

// ---- Firestore sync hooks (filled in by M4b; safe no-ops until then) ----
async function syncInit() { /* M4b: init Firebase, restore session, pull remote profiles */ }
function syncPush(_profile) { /* M4b: write-through to Firestore when signed in */ }

function equippedRod()  { return CONFIG.shop.rods.find(r => r.id === save.upgrades.rod); }
function equippedBait() { return CONFIG.shop.baits.find(b => b.id === save.upgrades.bait); }

// ---- Letter unlocks: total catches decide which stages are open ----
function totalCatches() { return Object.values(save.collection).reduce((a, b) => a + b, 0); }
function unlockedStageCount(total) {
  return CONFIG.unlock.stages.filter(s => total >= s.catchesRequired).length;
}
function recomputeUnlocks() {
  const n = unlockedStageCount(totalCatches());
  unlockedLetters = new Set(CONFIG.unlock.stages.slice(0, n).flatMap(s => [...s.letters]));
  WORDS = FULL_POOL.filter(e => [...e.letters].every(l => unlockedLetters.has(l)));
  renderKeyLocks();
}

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

// ---- State ----
let phase = "cast";        // cast | wait | reel | done
let target = "";
let typed = 0;
let tension = 0;
let fish = null;           // roster entry currently on the line
let reelPool = [];         // words matched to the hooked fish's difficulty
let wordsToLand = 0;
let wordsLeft = 0;
let inputLocked = false;
let pickerOpen = true;     // the profile picker gates play until a kid is chosen
let gameGen = 0;           // bumped on each profile activation; stales old timers

// silent typing stats (feeds the v2 adaptive meter — kids never see these)
let lastKeyTime = 0;                 // 0 = start of a word, don't time the first letter
const MAX_LATENCY_MS = 5000;         // ignore gaps this long (kid stepped away)
function statLetter(l) { return (save.stats.letters[l] ??= { n: 0, errors: 0, msTotal: 0 }); }

// run fn after delay unless the game moved on (profile switched) or picker opened
function later(fn, delay) {
  const g = gameGen;
  setTimeout(() => { if (g === gameGen && !pickerOpen) fn(); }, delay);
}

// ---- DOM ----
const $ = id => document.getElementById(id);
const el = { scene: $("scene"), word: $("word"), status: $("status"), fill: $("meter-fill"),
             caught: $("caught"), escaped: $("escaped"), coins: $("coins"), dist: $("dist"),
             line: $("line"), fish: $("fish"), water: $("water"), bobber: $("bobber") };

const pick = a => a[Math.floor(Math.random() * a.length)];
const rand = (a, b) => a + Math.random() * (b - a);

function pickTier() {
  const odds = CONFIG.bite.tierOddsByRod[equippedRod().rodLevel];
  let r = Math.random();
  for (const [t, p] of Object.entries(odds)) {
    r -= p;
    if (r < 0) return t;
  }
  return "common";
}

// Words at the fish's difficulty; mix in easier ones only when the unlocked
// pool is too thin (e.g. stage 1 has a single difficulty-3 word).
function buildReelPool(difficulty) {
  let floor = difficulty, pool;
  do {
    const f = floor;
    pool = WORDS.filter(e => e.d >= f && e.d <= difficulty);
    floor--;
  } while (pool.length < CONFIG.reel.minReelPoolSize && floor >= 1);
  return pool;
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
// visual-cadence constants (rendering only — gameplay tuning stays in config.js)
const JUICE = { shadowEveryMs: 6000, bobberRippleMs: 1700, ambientRippleMs: 6500, rippleLifeMs: 1700 };

function ripple(x, y) {
  const r = document.createElement("div");
  r.className = "ripple";
  r.style.left = x + "px"; r.style.top = y + "px";
  el.scene.appendChild(r);
  setTimeout(() => r.remove(), JUICE.rippleLifeMs);
}

function coinFloat(x, y, amount) {
  const c = document.createElement("div");
  c.className = "coinfloat";
  c.textContent = "+" + amount;
  c.style.left = x + "px"; c.style.top = y + "px";
  el.scene.appendChild(c);
  setTimeout(() => c.remove(), 1200);
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
}, JUICE.shadowEveryMs);

// ambient ripples: the pond breathes even when nobody's fishing
setInterval(() => {
  if (document.hidden) return;
  ripple(rand(80, 640), rand(230, 330));
}, JUICE.ambientRippleMs);

// bobber ripples while the line waits for a bite
let bobberRippleTimer = null;
function bobberIn() {
  el.bobber.classList.remove("plunge");
  el.bobber.classList.add("on");
  ripple(394, 196); // splash-in ring, then the idle rhythm
  bobberRippleTimer = setInterval(() => ripple(394, 196), JUICE.bobberRippleMs);
}
function bobberOut(plunge) {
  clearInterval(bobberRippleTimer);
  if (plunge) {
    el.bobber.classList.add("plunge");
    ripple(394, 196);
    setTimeout(() => el.bobber.classList.remove("on", "plunge"), 400);
  } else {
    el.bobber.classList.remove("on", "plunge");
  }
}

// ---- Rendering ----
function renderWord() {
  el.word.innerHTML =
    `<span class="done">${target.slice(0, typed)}</span><span class="todo">${target.slice(typed)}</span>`;
  updateGuide(target[typed]);
}
function renderTension() {
  el.fill.style.width = tension + "%";
  el.fill.style.background = tension > 66 ? "var(--ember)" : tension > 33 ? "var(--gold)" : "var(--moss)";
  el.fill.classList.toggle("danger", tension > 66);
}
function fishPosition() {
  const progress = 1 - wordsLeft / wordsToLand;
  el.fish.style.left = (600 - progress * 460) + "px";
}
function setStatus(t) { el.status.textContent = t; }

// ---- Phases ----
function startCast() {
  phase = "cast"; inputLocked = false;
  target = pick(WORDS).w; typed = 0; lastKeyTime = 0;
  tension = 0; renderTension();
  el.dist.textContent = "—";
  el.line.style.width = "0px";
  bobberOut(false);
  el.fish.style.opacity = 0;
  el.fish.className = "";
  el.fish.style.transform = "";
  el.fish.style.removeProperty("--fish-color");
  setStatus(pick(PUNS.cast));
  renderWord();
}

function startWait() {
  phase = "wait"; inputLocked = true;
  el.word.textContent = "";
  updateGuide(null);
  el.line.style.width = "330px";
  burst(400, 195, 5);
  bobberIn();
  setStatus(pick(PUNS.wait));
  later(bite, rand(...CONFIG.bite.delayMsRange) * equippedBait().biteSpeedMult);
}

function bite() {
  phase = "reel"; inputLocked = false;
  bobberOut(true);
  const tier = pickTier();
  fish = pick(FISH.filter(f => f.tier === tier));
  reelPool = buildReelPool(fish.difficulty);
  wordsToLand = CONFIG.reel.wordsToLandByTier[tier];
  wordsLeft = wordsToLand;
  el.fish.classList.add("tier-" + tier);
  el.fish.style.setProperty("--fish-color", fish.color);
  el.fish.style.opacity = 1;
  fishPosition();
  el.dist.textContent = wordsLeft + " words";
  shakeScene();
  burst(410, 200, 10);
  setStatus(pick(PUNS.bite));
  nextReelWord();
}

function nextReelWord() { target = pick(reelPool).w; typed = 0; lastKeyTime = 0; renderWord(); }

function wordComplete() {
  wordsLeft--;
  el.dist.textContent = wordsLeft > 0 ? wordsLeft + " words" : "landing…";
  fishPosition();
  burst(parseInt(el.fish.style.left) + 28, 258, 4);
  ripple(parseInt(el.fish.style.left) + 28, 262);
  el.word.classList.remove("pop"); void el.word.offsetWidth; el.word.classList.add("pop");
  if (wordsLeft <= 0) return land(true);
  inputLocked = true;
  el.word.innerHTML = `<span class="done">${target}</span>`;
  updateGuide(null);
  later(() => { inputLocked = false; nextReelWord(); }, CONFIG.reel.wordPauseMs);
}

function land(success) {
  phase = "done"; inputLocked = true;
  el.word.textContent = "";
  updateGuide(null);
  if (success) {
    el.fish.classList.add("landing");
    burst(150, 240, 14);
    const stagesBefore = unlockedStageCount(totalCatches());
    const firstCatch = !save.collection[fish.id];
    const amount = fish.coins + (firstCatch ? CONFIG.economy.firstCatchBonus : 0);
    save.coins += amount;
    save.collection[fish.id] = (save.collection[fish.id] ?? 0) + 1;
    persistSave();                              // the one write per catch
    el.coins.textContent = save.coins;
    el.caught.textContent = totalCatches();
    coinFloat(140, 200, amount);
    const isRare = fish.tier === "rare" || fish.tier === "legendary";
    const pun = isRare ? pick(PUNS.catchRare) : pick(PUNS.catchCommon);
    setStatus((firstCatch ? "NEW! " : "") + pun + " — " + fish.name);
    if (collectionOpen) renderCollection();
    const stagesAfter = unlockedStageCount(totalCatches());
    if (stagesAfter > stagesBefore) {
      const fresh = CONFIG.unlock.stages.slice(stagesBefore, stagesAfter).flatMap(s => [...s.letters]);
      recomputeUnlocks();
      showUnlock(fresh);
      later(startCast, CONFIG.unlock.celebrateMs);
      return;
    }
  } else {
    save.stats.escapes = (save.stats.escapes ?? 0) + 1;
    persistSave();                              // flush accumulated stats on escape
    el.escaped.textContent = save.stats.escapes;
    el.fish.style.left = "760px";
    setStatus(pick(PUNS.escape));
  }
  later(startCast, CONFIG.reel.recastDelayMs);
}

// the "new letter!" moment: banner over the pond, fresh keys pulse on the guide
function showUnlock(letters) {
  const banner = $("unlock-banner");
  banner.querySelector(".letters").textContent = letters.join(" ").toUpperCase();
  banner.classList.add("show");
  burst(360, 150, 16);
  letters.forEach(l => {
    const k = guide.querySelector(`.key[data-ch="${l}"]`);
    if (k) k.classList.add("fresh");
  });
  setTimeout(() => {
    banner.classList.remove("show");
    guide.querySelectorAll(".key.fresh").forEach(k => k.classList.remove("fresh"));
  }, CONFIG.unlock.celebrateMs);
}

// record a processed keystroke for the silent adaptive-meter stats
function recordKey(expected, correct) {
  const s = statLetter(expected);
  if (correct) {
    s.n++;
    const dt = Date.now() - lastKeyTime;
    if (lastKeyTime && dt < MAX_LATENCY_MS) s.msTotal += dt;
  } else {
    s.errors++;
  }
  lastKeyTime = Date.now();
}

// ---- Input ----
document.addEventListener("keydown", (e) => {
  if (!save || pickerOpen || collectionOpen || shopOpen || inputLocked) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.key.length !== 1) return;
  const key = e.key.toLowerCase();
  if (!/[a-z]/.test(key)) return;

  const expected = target[typed];
  if (key === expected) {
    recordKey(expected, true);
    typed++;
    if (phase === "reel") { tension = Math.max(0, tension - CONFIG.reel.correctRelief); renderTension(); }
    renderWord();
    if (typed === target.length) {
      save.stats.wordsTyped++;
      if (phase === "cast") startWait();
      else if (phase === "reel") wordComplete();
    }
  } else {
    recordKey(expected, false);
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

// dim keys the player hasn't unlocked yet (the ";" anchor stays ghosted)
function renderKeyLocks() {
  guide.querySelectorAll(".key").forEach(k => {
    const ch = k.dataset.ch;
    if (ch === ";") return;
    k.classList.toggle("locked", !unlockedLetters.has(ch));
  });
}

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

// ---- Collection screen (per-profile once M4 lands; one shared save for now) ----
let collectionOpen = false;
const collectionRoot = $("collection");
const collectionGrid = $("collection-grid");

function renderCollection() {
  collectionGrid.innerHTML = "";
  for (const f of FISH) {
    const count = save.collection[f.id] ?? 0;
    const cell = document.createElement("div");
    cell.className = "cell" + (count ? "" : " unknown");
    const shape = document.createElement("div");
    shape.className = "cfish";
    if (count) shape.style.setProperty("--fish-color", f.color);
    const name = document.createElement("div");
    name.className = "cname";
    name.textContent = count ? f.name : "???";
    const sub = document.createElement("div");
    sub.className = "csub";
    sub.textContent = count ? `${f.species} × ${count}` : f.tier;
    if (count) cell.title = f.blurb;
    cell.append(shape, name, sub);
    collectionGrid.appendChild(cell);
  }
}

function toggleCollection(open) {
  collectionOpen = open ?? !collectionOpen;
  if (collectionOpen) renderCollection();
  collectionRoot.hidden = !collectionOpen;
}
$("collection-btn").addEventListener("click", () => toggleCollection(true));
$("collection-close").addEventListener("click", () => toggleCollection(false));

// ---- Shop: buy once, equip freely; effects apply on the next cast ----
let shopOpen = false;
const shopRoot = $("shop");

// kid-readable effect blurbs derived from the config numbers
function rodHint(rod)   { return "luck " + "★".repeat(rod.rodLevel); }
function baitHint(bait) {
  const pct = Math.round((1 - bait.biteSpeedMult) * 100);
  return pct === 0 ? "a patient wiggle" : pct + "% faster bites";
}

function renderShop() {
  $("shop-coin-count").textContent = save.coins;
  renderShopList(CONFIG.shop.rods, $("shop-rods"), "rod", rodHint);
  renderShopList(CONFIG.shop.baits, $("shop-baits"), "bait", baitHint);
}

function renderShopList(items, container, kind, hint) {
  container.innerHTML = "";
  for (const item of items) {
    const owned = save.upgrades.owned[kind].includes(item.id);
    const equipped = save.upgrades[kind] === item.id;
    const row = document.createElement("div");
    row.className = "shop-row";
    const name = document.createElement("span");
    name.className = "shop-name";
    name.textContent = item.name;
    const hintEl = document.createElement("span");
    hintEl.className = "shop-hint";
    hintEl.textContent = hint(item);
    const btn = document.createElement("button");
    btn.className = "toggle-btn shop-btn" + (equipped ? " equipped" : "");
    if (equipped) {
      btn.textContent = "EQUIPPED";
      btn.disabled = true;
    } else if (owned) {
      btn.textContent = "EQUIP";
      btn.addEventListener("click", () => {
        save.upgrades[kind] = item.id;
        persistSave();
        renderShop();
      });
    } else {
      btn.textContent = "BUY " + item.cost;
      btn.disabled = save.coins < item.cost;
      btn.addEventListener("click", () => {
        if (save.coins < item.cost) return;
        save.coins -= item.cost;
        save.upgrades.owned[kind].push(item.id);
        save.upgrades[kind] = item.id;
        persistSave();
        el.coins.textContent = save.coins;
        renderShop();
      });
    }
    row.append(name, hintEl, btn);
    container.appendChild(row);
  }
}

function toggleShop(open) {
  shopOpen = open ?? !shopOpen;
  if (shopOpen) renderShop();
  shopRoot.hidden = !shopOpen;
}
$("shop-btn").addEventListener("click", () => toggleShop(true));
$("shop-close").addEventListener("click", () => toggleShop(false));

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (collectionOpen) toggleCollection(false);
  if (shopOpen) toggleShop(false);
});

// ---- Profile picker (shown on launch; gates the game until a kid is chosen) ----
const profilesRoot = $("profiles");
const profileGrid = $("profile-grid");
const profileNew = $("profile-new");
let chosenAvatar = AVATARS[0];

function showProfilePicker() {
  pickerOpen = true;
  profileNew.hidden = true;
  renderProfileGrid();
  profilesRoot.hidden = false;
}

function renderProfileGrid() {
  profileGrid.innerHTML = "";
  for (const row of readIndex()) {
    const doc = readProfile(row.id);
    const caught = doc ? Object.values(doc.collection).reduce((a, b) => a + b, 0) : 0;
    const cell = document.createElement("button");
    cell.className = "profile-cell";
    cell.innerHTML =
      `<span class="pavatar">${row.avatar}</span><span class="pname"></span><span class="pmeta">${caught} caught</span>`;
    cell.querySelector(".pname").textContent = row.name;
    cell.addEventListener("click", () => activateProfile(row.id));
    const del = document.createElement("span");
    del.className = "pdelete"; del.textContent = "✕"; del.title = "delete " + row.name;
    del.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm(`Delete ${row.name}'s pond? This can't be undone.`)) { deleteProfile(row.id); renderProfileGrid(); }
    });
    cell.appendChild(del);
    profileGrid.appendChild(cell);
  }
  const add = document.createElement("button");
  add.className = "profile-cell add";
  add.innerHTML = `<span class="pavatar">＋</span><span class="pname">New angler</span>`;
  add.addEventListener("click", openNewProfile);
  profileGrid.appendChild(add);
}

function openNewProfile() {
  profileNew.hidden = false;
  $("profile-name").value = "";
  chosenAvatar = AVATARS[0];
  renderAvatarRow();
  $("profile-name").focus();
}
function renderAvatarRow() {
  const rowEl = $("avatar-row"); rowEl.innerHTML = "";
  for (const a of AVATARS) {
    const b = document.createElement("button");
    b.className = "avatar-opt" + (a === chosenAvatar ? " sel" : "");
    b.textContent = a;
    b.addEventListener("click", () => { chosenAvatar = a; renderAvatarRow(); });
    rowEl.appendChild(b);
  }
}
$("profile-create").addEventListener("click", () => {
  const name = $("profile-name").value.trim().slice(0, 12) || "Angler";
  activateProfile(createProfile(name, chosenAvatar).id);
});
$("profile-name").addEventListener("keydown", (e) => { if (e.key === "Enter") $("profile-create").click(); });
$("profile-cancel").addEventListener("click", () => { profileNew.hidden = true; });
$("switch-btn").addEventListener("click", () => { if (save) persistSave(); showProfilePicker(); });

function activateProfile(id) {
  const doc = readProfile(id);
  if (!doc) return;
  save = doc;
  localStorage.setItem(ACTIVE_KEY, id);
  save.stats.sessionCount = (save.stats.sessionCount ?? 0) + 1;
  gameGen++;
  pickerOpen = false;
  profilesRoot.hidden = true;
  recomputeUnlocks();
  el.coins.textContent = save.coins;
  el.caught.textContent = totalCatches();
  el.escaped.textContent = save.stats.escapes ?? 0;
  $("who").textContent = save.avatar + " " + save.name;
  persistSave();                     // records the new session (sessionCount/lastPlayed)
  startCast();
}

try {
  [FULL_POOL, FISH] = await Promise.all([loadJson("data/words.json"), loadJson("data/fish.json")]);
  migrateLegacySave();
  await syncInit();                  // M4b: may restore a signed-in session + pull profiles
  showProfilePicker();
} catch (err) {
  setStatus("The word pool got away… reload to try again");
  console.error(err);
}
