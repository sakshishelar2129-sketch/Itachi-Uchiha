/* =====================================================================
   ITACHI SITE — main.js
   1. image loading   2. scroll scrub   3. mouse-tracked eyes
   4. black flame     5. crow feathers + lightning
   6. thunder sound   7. custom cursor
   ===================================================================== */

// ====== SETTINGS ======
const TOTAL_FRAMES = 150;                     // files in /frames
const EYE_COUNT = 9;                          // files in /eyes
const THUNDER_AT = [34, 70, 74, 108, 136];    // frame numbers where lightning is baked in
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

const scrubSection = document.getElementById("scrub");
const eyesSection = document.getElementById("eyes");
const mainCanvas = document.getElementById("mainCanvas");
const mainCtx = mainCanvas.getContext("2d");
const eyeCanvas = document.getElementById("eyeCanvas");
const eyeCtx = eyeCanvas.getContext("2d");
const captions = document.getElementById("captions");
const phases = document.querySelectorAll(".phase");
const loader = document.getElementById("loader");
const loaderFill = document.getElementById("loaderFill");
const loaderPct = document.getElementById("loaderPct");

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// ====================================================================
// 1. LOAD IMAGES (with progress bar)
// ====================================================================
let loaded = 0;
const totalToLoad = TOTAL_FRAMES + EYE_COUNT;
function onDone() {
  loaded++;
  const pct = Math.round((loaded / totalToLoad) * 100);
  loaderPct.textContent = pct;
  loaderFill.style.width = pct + "%";
  if (loaded === totalToLoad) startSite();
}
function loadImages(pathFn, count) {
  const list = [];

  for (let i = 0; i < count; i++) {

    const img = new Image();

    img.onload = onDone;

    img.onerror = () => {
      console.error("FAILED TO LOAD:", img.src);
      onDone();
    };

    img.src = pathFn(i);

    list.push(img);
  }

  return list;
}
const frames = loadImages(i => `frames/f_${String(i + 1).padStart(4, "0")}.jpg`, TOTAL_FRAMES);
const eyes = loadImages(i => `eyes/eye_${i}.jpg`, EYE_COUNT);

function drawCover(ctx, canvas, img) {
  if (!img || !img.complete || !img.naturalWidth) return;

  const s = Math.max(
    canvas.width / img.naturalWidth,
    canvas.height / img.naturalHeight
  );

  const w = img.naturalWidth * s;
  const h = img.naturalHeight * s;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    img,
    (canvas.width - w) / 2,
    (canvas.height - h) / 2,
    w,
    h
  );
}

// ====================================================================
// 2. SCROLL SCRUB + CAPTIONS
// ====================================================================
let currentFrame = 0, lastIdx = 0, scrollP = 0;
let lastThunderAt = 0;
let lastScrollY = 0, windKick = 0;

function scrubProgress() {
  const rect = scrubSection.getBoundingClientRect();
  return clamp(-rect.top / (scrubSection.offsetHeight - innerHeight), 0, 1);
}

function onScroll() {
  const p = scrubProgress();
  scrollP = p;
  const idx = Math.min(TOTAL_FRAMES - 1, Math.floor(p * TOTAL_FRAMES));
  if (idx !== currentFrame) {
  currentFrame = idx;
}

requestAnimationFrame(() => {
  drawCover(mainCtx, mainCanvas, frames[currentFrame]);
});

  // captions: only while the scroll animation is pinned on screen
  const rect = scrubSection.getBoundingClientRect();
  captions.classList.toggle("show", rect.top <= 0 && rect.bottom >= innerHeight - 60);
  const ph = Math.min(3, Math.floor(p * 4));
  phases.forEach((el, i) => el.classList.toggle("active", i === ph));

  // thunder sound when the scroll passes a lightning frame (moving forward)
  if (idx > lastIdx) {
    for (const ev of THUNDER_AT) {
      if (ev > lastIdx && ev <= idx && performance.now() - lastThunderAt > 500) {
        lastThunderAt = performance.now();
        thunder(false);
      }
    }
  }
  lastIdx = idx;

  // scroll speed -> feather wind
  const dy = scrollY - lastScrollY;
  lastScrollY = scrollY;
  windKick += clamp(dy, -80, 80);
}
addEventListener("scroll", onScroll, { passive: true });

// ====================================================================
// 3. EYES FOLLOW THE MOUSE (cross-fade between neighbours)
// ====================================================================
let eyePos = (EYE_COUNT - 1) / 2, eyeTarget = eyePos;
let mouseX = innerWidth / 2, mouseY = innerHeight / 2;

addEventListener("mousemove", e => {
  mouseX = e.clientX; mouseY = e.clientY;
  eyeTarget = (e.clientX / innerWidth) * (EYE_COUNT - 1);
});
addEventListener("touchmove", e => {
  mouseX = e.touches[0].clientX; mouseY = e.touches[0].clientY;
  eyeTarget = (mouseX / innerWidth) * (EYE_COUNT - 1);
}, { passive: true });

function drawEyes() {
  const a = Math.floor(eyePos), b = Math.min(EYE_COUNT - 1, a + 1), f = eyePos - a;
  eyeCtx.globalAlpha = 1;
  drawCover(eyeCtx, eyeCanvas, eyes[a]);
  if (f > 0.01 && b !== a) {
    eyeCtx.globalAlpha = f;
    drawCover(eyeCtx, eyeCanvas, eyes[b]);
    eyeCtx.globalAlpha = 1;
  }
}

// ====================================================================
// 4. BLACK FLAME (AMATERASU) — particles on the screen edges
//    Two passes: red-purple glow first, black cores on top => the flame
//    is a black mass with a burning red outline.
// ====================================================================
const flameCanvas = document.getElementById("flameCanvas");
const fctx = flameCanvas.getContext("2d");
const FLAME_SCALE = 0.5;                       // half resolution = fast + soft
let flames = [], flameIntensity = 0.4, flameTarget = 0.4, flameT = 0;

function flameResize() {
  flameCanvas.width = Math.ceil(innerWidth * FLAME_SCALE);
  flameCanvas.height = Math.ceil(innerHeight * FLAME_SCALE);
}

function spawnFlame() {
  const w = flameCanvas.width, h = flameCanvas.height, r = Math.random();
  let x, y, vx, vy;
  if (r < 0.62) {                               // bottom edge
    x = Math.random() * w; y = h + 6;
    vx = (Math.random() - 0.5) * 0.5; vy = -(0.7 + Math.random() * 1.5);
  } else if (r < 0.81) {                        // left edge
    x = -6; y = h * (0.35 + Math.random() * 0.65);
    vx = 0.25 + Math.random() * 0.5; vy = -(0.3 + Math.random() * 0.8);
  } else {                                      // right edge
    x = w + 6; y = h * (0.35 + Math.random() * 0.65);
    vx = -(0.25 + Math.random() * 0.5); vy = -(0.3 + Math.random() * 0.8);
  }
  const life = (50 + Math.random() * 70) * (0.5 + 0.42 * flameIntensity);
  return { x, y, vx, vy, life: 0, max: life, size: 5 + Math.random() * 13, seed: Math.random() * 10 };
}

function drawFlames() {
  const w = flameCanvas.width, h = flameCanvas.height;
  flameT++;
  flameIntensity += (flameTarget - flameIntensity) * 0.03;

  const target = Math.round((REDUCED ? 70 : 120) + 170 * flameIntensity);
  for (let i = 0; i < 8 && flames.length < target; i++) flames.push(spawnFlame());

  fctx.clearRect(0, 0, w, h);

  // solid dark base along the edges so the fire has something to burn from
  fctx.globalCompositeOperation = "source-over";
  let g = fctx.createLinearGradient(0, h, 0, h - h * 0.09);
  g.addColorStop(0, "rgba(0,0,0,.92)"); g.addColorStop(1, "rgba(0,0,0,0)");
  fctx.fillStyle = g; fctx.fillRect(0, h * 0.9, w, h * 0.1);
  for (const side of [0, 1]) {
    const x0 = side ? w : 0, x1 = side ? w - w * 0.05 : w * 0.05;
    g = fctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, "rgba(0,0,0,.8)"); g.addColorStop(1, "rgba(0,0,0,0)");
    fctx.fillStyle = g; fctx.fillRect(Math.min(x0, x1), h * 0.4, w * 0.05, h * 0.6);
  }

  // update
  for (let i = flames.length - 1; i >= 0; i--) {
    const p = flames[i];
    p.life++;
    p.x += p.vx + Math.sin(flameT * 0.06 + p.seed) * 0.45;
    p.y += p.vy;
    p.vy *= 0.997;
    if (p.life >= p.max) flames.splice(i, 1);
  }

  // pass 1: crimson halo (particles stretched upward into flame tongues)
  fctx.globalCompositeOperation = "lighter";
  for (const p of flames) {
    const k = p.life / p.max, a = Math.sin(Math.PI * k) * (0.45 + 0.55 * flameIntensity);
    const r = p.size * (1 - 0.5 * k) * 2.0;
    const st = 1.5 + 1.4 * (1 - k);
    fctx.save();
    fctx.translate(p.x, p.y); fctx.scale(1, st);
    const gr = fctx.createRadialGradient(0, 0, 0, 0, 0, r);
    gr.addColorStop(0, `rgba(235,38,48,${a * 0.55})`);
    gr.addColorStop(0.5, `rgba(150,12,34,${a * 0.28})`);
    gr.addColorStop(1, "rgba(60,0,20,0)");
    fctx.fillStyle = gr;
    fctx.fillRect(-r, -r, r * 2, r * 2);
    fctx.restore();
  }
  // pass 2: black cores (soft edges) cover the halo => black fire, red outline
  fctx.globalCompositeOperation = "source-over";
  for (const p of flames) {
    const k = p.life / p.max, a = Math.min(1, Math.sin(Math.PI * k) * 1.7);
    const r = p.size * (1 - 0.5 * k);
    const st = 1.5 + 1.4 * (1 - k);
    fctx.save();
    fctx.translate(p.x, p.y); fctx.scale(1, st);
    const gr = fctx.createRadialGradient(0, 0, 0, 0, 0, r);
    gr.addColorStop(0, `rgba(0,0,0,${a})`);
    gr.addColorStop(0.55, `rgba(0,0,0,${a * 0.9})`);
    gr.addColorStop(1, "rgba(0,0,0,0)");
    fctx.fillStyle = gr;
    fctx.fillRect(-r, -r, r * 2, r * 2);
    fctx.restore();
  }
}

// ====================================================================
// 5. CROW FEATHERS + LIGHTNING BOLTS (full-resolution canvas)
// ====================================================================
const featherCanvas = document.getElementById("featherCanvas");
const cctx = featherCanvas.getContext("2d");
let feathers = [], flashLevel = 0, bolt = null;
let FW = innerWidth, FH = innerHeight;

function featherResize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  featherCanvas.width = innerWidth * dpr;
  featherCanvas.height = innerHeight * dpr;
  cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  FW = innerWidth; FH = innerHeight;
}

function newFeather(initial) {
  const z = Math.random();                      // depth: 0 far ... 1 near
  return {
    x: Math.random() * FW, y: initial ? Math.random() * FH : -80 - Math.random() * 200, z,
    size: 12 + z * 34, vy: 0.4 + z * 1.0,
    sway: Math.random() * 6.28, swaySpd: 0.008 + Math.random() * 0.012, swayAmp: 0.4 + z * 1.1,
    rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.024,
    flip: Math.random() * 6.28, flipSpd: 0.015 + Math.random() * 0.03,
    red: Math.random() < 0.14                   // a few blood-tinted feathers
  };
}

function drawFeather(f) {
  const L = f.size * 2.4, w = f.size * 0.5;
  const sx = 0.22 + 0.78 * Math.abs(Math.cos(f.flip));
  const px = (mouseX / FW - 0.5) * -26 * f.z;   // mouse parallax
  cctx.save();
  cctx.translate(f.x + px, f.y);
  cctx.rotate(f.rot);
  cctx.scale(sx, 1);
  cctx.globalAlpha = 0.32 + 0.68 * f.z;

  const g = cctx.createLinearGradient(-w, 0, w, 0);
  if (f.red) { g.addColorStop(0, "#1a0206"); g.addColorStop(0.5, "#3d0611"); g.addColorStop(1, "#12020a"); }
  else       { g.addColorStop(0, "#05050a"); g.addColorStop(0.5, "#1a1a28"); g.addColorStop(1, "#07070e"); }

  cctx.beginPath();
  cctx.moveTo(0, -L / 2);
  cctx.bezierCurveTo(w, -L * 0.28, w * 1.05, L * 0.15, w * 0.06, L * 0.5);
  cctx.bezierCurveTo(-w * 0.9, L * 0.12, -w * 1.1, -L * 0.3, 0, -L / 2);
  cctx.closePath();
  cctx.fillStyle = g;
  cctx.fill();

  const rim = 0.2 + flashLevel * 0.6;          // edges light up in lightning
  cctx.strokeStyle = f.red ? `rgba(255,80,90,${rim})` : `rgba(150,175,255,${rim})`;
  cctx.lineWidth = 1;
  cctx.stroke();

  // quill + barbs
  cctx.beginPath();
  cctx.moveTo(0, -L * 0.5); cctx.lineTo(0, L * 0.62);
  for (let i = 1; i < 8; i++) {
    const y = -L / 2 + (i * L) / 8.6, spread = w * (0.75 - Math.abs(i - 3.5) * 0.09);
    cctx.moveTo(0, y); cctx.lineTo(spread, y + w * 0.4);
    cctx.moveTo(0, y); cctx.lineTo(-spread, y + w * 0.4);
  }
  cctx.strokeStyle = `rgba(190,205,255,${0.1 + flashLevel * 0.3})`;
  cctx.stroke();
  cctx.restore();
}

function makeBolt() {
  const left = Math.random() < 0.5;
  const x0 = left ? FW * (0.04 + Math.random() * 0.18) : FW * (0.78 + Math.random() * 0.18);
  const endY = FH * (0.5 + Math.random() * 0.32);
  const pts = [[x0, -10]];
  let x = x0, y = -10;
  while (y < endY) { y += 12 + Math.random() * 26; x += (Math.random() - 0.5) * 50; pts.push([x, y]); }
  const branches = [];
  for (let b = 0; b < 3; b++) {
    const i = 3 + Math.floor(Math.random() * Math.max(1, pts.length - 6));
    let [bx, by] = pts[Math.min(i, pts.length - 1)]; const dir = Math.random() < 0.5 ? -1 : 1;
    const seg = [[bx, by]];
    for (let s = 0; s < 6; s++) { bx += dir * (8 + Math.random() * 20); by += 10 + Math.random() * 18; seg.push([bx, by]); }
    branches.push(seg);
  }
  bolt = { pts, branches, life: 1 };
}

function strokePoly(pts) {
  cctx.beginPath();
  pts.forEach(([x, y], i) => (i ? cctx.lineTo(x, y) : cctx.moveTo(x, y)));
  cctx.stroke();
}

function drawFeathersAndBolt() {
  cctx.clearRect(0, 0, FW, FH);

  // wind from scroll speed (decays smoothly)
  windKick *= 0.86;
  const kick = clamp(windKick, -60, 60) * 0.10;

  const want = REDUCED ? 8 : 22;
  while (feathers.length < want) feathers.push(newFeather(true));

  for (let i = 0; i < feathers.length; i++) {
    const f = feathers[i];
    f.sway += f.swaySpd; f.rot += f.vr; f.flip += f.flipSpd;
    f.x += Math.sin(f.sway) * f.swayAmp;
    f.y += f.vy - kick * (0.3 + f.z);
    if (f.y > FH + 120 || f.y < -400 || f.x < -120 || f.x > FW + 120) feathers[i] = newFeather(false);
    else drawFeather(f);
  }

  // lightning
  flashLevel *= 0.90;
  if (bolt) {
    bolt.life -= 0.055;
    if (bolt.life <= 0) bolt = null;
    else {
      const a = bolt.life * (0.55 + 0.45 * Math.random());     // flicker
      cctx.save();
      cctx.lineJoin = "round"; cctx.lineCap = "round";
      cctx.shadowColor = "rgba(120,180,255,1)"; cctx.shadowBlur = 28;
      cctx.strokeStyle = `rgba(215,235,255,${a})`; cctx.lineWidth = 3;
      strokePoly(bolt.pts);
      cctx.lineWidth = 1.8;
      bolt.branches.forEach(strokePoly);
      cctx.restore();
    }
  }
  if (flashLevel > 0.02) {                                    // cold white-blue flash over the screen
    cctx.fillStyle = `rgba(150,190,255,${flashLevel * 0.20})`;
    cctx.fillRect(0, 0, FW, FH);
  }
}

// ====================================================================
// 6. THUNDER + RAIN SOUND (synthesised in the browser — no audio files)
// ====================================================================
const soundBtn = document.getElementById("soundToggle");
const soundState = document.getElementById("soundState");
let actx = null, master = null, rainGain = null, whiteBuf = null, brownBuf = null, soundOn = false;

function makeNoise(ctx, seconds, brown) {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    else d[i] = w;
  }
  return buf;
}

function initAudio() {
  if (actx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  actx = new AC();
  master = actx.createGain();
  master.gain.value = 0.9;
  master.connect(actx.destination);
  whiteBuf = makeNoise(actx, 3, false);
  brownBuf = makeNoise(actx, 4, true);

  // steady rain bed
  const src = actx.createBufferSource(); src.buffer = whiteBuf; src.loop = true;
  const bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 3200; bp.Q.value = 0.5;
  const hp = actx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 900;
  rainGain = actx.createGain(); rainGain.gain.value = 0;
  src.connect(bp); bp.connect(hp); hp.connect(rainGain); rainGain.connect(master);
  src.start();
}

function playThunder() {
  if (!actx || !soundOn) return;
  const t = actx.currentTime;
  const pan = actx.createStereoPanner ? actx.createStereoPanner() : null;
  if (pan) { pan.pan.value = Math.random() * 1.2 - 0.6; pan.connect(master); }
  const out = pan || master;

  // 1) CRACK: short bright noise burst with a crackling tail
  const crack = actx.createBufferSource(); crack.buffer = whiteBuf;
  const chp = actx.createBiquadFilter(); chp.type = "highpass"; chp.frequency.value = 1400;
  const cg = actx.createGain();
  cg.gain.setValueAtTime(0.0001, t);
  cg.gain.exponentialRampToValueAtTime(0.9, t + 0.004);
  cg.gain.exponentialRampToValueAtTime(0.05, t + 0.22);
  for (let i = 0; i < 6; i++) {                                // crackle
    const tt = t + 0.2 + i * 0.07 + Math.random() * 0.05;
    cg.gain.setValueAtTime(0.02, tt);
    cg.gain.linearRampToValueAtTime(0.12 * (1 - i / 7), tt + 0.012);
    cg.gain.exponentialRampToValueAtTime(0.005, tt + 0.06);
  }
  cg.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
  crack.connect(chp); chp.connect(cg); cg.connect(out);
  crack.start(t, Math.random() * 1.5);
  crack.stop(t + 1.3);

  // 2) RUMBLE: low brown noise that rolls in waves
  const rum = actx.createBufferSource(); rum.buffer = brownBuf;
  const lp = actx.createBiquadFilter(); lp.type = "lowpass";
  lp.frequency.setValueAtTime(420, t + 0.1);
  lp.frequency.exponentialRampToValueAtTime(70, t + 3.6);
  const rg = actx.createGain();
  rg.gain.setValueAtTime(0.0001, t + 0.08);
  rg.gain.linearRampToValueAtTime(1.5, t + 0.35);
  rg.gain.linearRampToValueAtTime(0.7, t + 0.9);
  rg.gain.linearRampToValueAtTime(1.15, t + 1.4);              // second roll
  rg.gain.linearRampToValueAtTime(0.35, t + 2.2);
  rg.gain.linearRampToValueAtTime(0.6, t + 2.6);               // distant echo
  rg.gain.exponentialRampToValueAtTime(0.0001, t + 3.9);
  rum.connect(lp); lp.connect(rg); rg.connect(out);
  rum.start(t + 0.05, Math.random() * 0.5);
  rum.stop(t + 4.0);

  // 3) THUMP: sub-bass sine drop
  const osc = actx.createOscillator(); osc.type = "sine";
  osc.frequency.setValueAtTime(70, t + 0.05);
  osc.frequency.exponentialRampToValueAtTime(30, t + 1.1);
  const og = actx.createGain();
  og.gain.setValueAtTime(0.0001, t + 0.05);
  og.gain.linearRampToValueAtTime(0.65, t + 0.12);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
  osc.connect(og); og.connect(out);
  osc.start(t + 0.05); osc.stop(t + 1.4);
}

function setSound(on) {
  soundOn = on;
  soundBtn.setAttribute("aria-pressed", String(on));
  soundState.textContent = on ? "SOUND ON" : "SOUND OFF";
  if (on) {
    initAudio();
    if (!actx) { soundOn = false; soundBtn.setAttribute("aria-pressed", "false"); soundState.textContent = "NO AUDIO"; return; }
    actx.resume();
    rainGain.gain.cancelScheduledValues(actx.currentTime);
    rainGain.gain.linearRampToValueAtTime(0.07, actx.currentTime + 1.5);
    setTimeout(() => thunder(true), 250);      // instant feedback: one strike when you turn it on
  } else if (actx) {
    rainGain.gain.cancelScheduledValues(actx.currentTime);
    rainGain.gain.linearRampToValueAtTime(0, actx.currentTime + 0.4);
  }
}
soundBtn.addEventListener("click", () => setSound(!soundOn));

// One place that fires a strike. withBolt = draw a live lightning bolt too
// (scroll frames already have lightning baked into the images).
function thunder(withBolt) {
  flashLevel = 1;
  if (withBolt) makeBolt();
  playThunder();
}

// random storm while the eye section is on screen
function eyesInView() {
  const r = eyesSection.getBoundingClientRect();
  return r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5;
}
function scheduleStorm() {
  setTimeout(() => { if (eyesInView() && !REDUCED) thunder(true); scheduleStorm(); }, 5500 + Math.random() * 7000);
}

// ====================================================================
// 7. CUSTOM CURSOR: dot follows instantly, Sharingan ring follows smoothly
// ====================================================================
const cursorEl = document.getElementById("cursor");
const dotEl = document.getElementById("cursorDot");
let cx = innerWidth / 2, cy = innerHeight / 2;

addEventListener("mousemove", () => document.body.classList.add("cursor-on"), { once: true });
document.addEventListener("mouseleave", () => document.body.classList.remove("cursor-on"));
document.addEventListener("mouseenter", () => document.body.classList.add("cursor-on"));
addEventListener("mousedown", () => { cursorEl.style.scale = "0.7"; });
addEventListener("mouseup", () => { cursorEl.style.scale = "1"; });
document.addEventListener("mouseover", e => {
  cursorEl.classList.toggle("big", !!(e.target.closest && e.target.closest("a, button")));
});

function moveCursor() {
  cx += (mouseX - cx) * 0.18;
  cy += (mouseY - cy) * 0.18;
  cursorEl.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
  dotEl.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
}

// ====================================================================
// MAIN LOOP + START
// ====================================================================
function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  for (const c of [mainCanvas, eyeCanvas]) { c.width = innerWidth * dpr; c.height = innerHeight * dpr; }
  drawCover(mainCtx, mainCanvas, frames[currentFrame]);
  flameResize();
  featherResize();
}
addEventListener("resize", resize);

function loop() {
  eyePos += (eyeTarget - eyePos) * 0.10;
  drawEyes();

  // flames grow as you scroll deeper into the story
  flameTarget = REDUCED ? 0.4 : 0.35 + 0.65 * smooth(0.1, 0.85, scrollP);
  drawFlames();
  drawFeathersAndBolt();
  moveCursor();
  requestAnimationFrame(loop);
}

function startSite() {
  resize();
  lastScrollY = scrollY;
  onScroll();
  lastIdx = currentFrame;          // don't fire thunder for frames we start on
  scheduleStorm();
  loop();
  loader.classList.add("hide");
}
