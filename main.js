/* ============================================================
   ITACHI UCHIHA — CINEMATIC WEBSITE
   ============================================================ */

const FRAME_COUNT = 150;
const EYE_COUNT = 9;

const frameImages = [];
const eyeImages = [];

let loadedImages = 0;
const totalImages = FRAME_COUNT + EYE_COUNT;

let currentFrame = 0;
let targetFrame = 0;

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

let eyeX = mouseX;
let eyeY = mouseY;

let blinking = false;
let animationStarted = false;
let musicStarted = false;

let lastTime = 0;
let lightning = 0;
let lightningTimer = 0;


/* ============================================================
   ELEMENTS
   ============================================================ */

const loader = document.getElementById("loader");
const loaderPct = document.getElementById("loaderPct");
const loaderFill = document.getElementById("loaderFill");

const scrubSection = document.getElementById("scrub");

const mainCanvas = document.getElementById("mainCanvas");
const eyeCanvas = document.getElementById("eyeCanvas");

const flameCanvas = document.getElementById("flameCanvas");
const featherCanvas = document.getElementById("featherCanvas");

const bgMusic = document.getElementById("bgMusic");
const soundToggle = document.getElementById("soundToggle");

const cursor = document.getElementById("cursor");
const cursorDot = document.getElementById("cursorDot");

const mainCtx = mainCanvas?.getContext("2d");
const eyeCtx = eyeCanvas?.getContext("2d");
const flameCtx = flameCanvas?.getContext("2d");
const featherCtx = featherCanvas?.getContext("2d");


/* ============================================================
   IMAGE LOADING
   ============================================================ */

function imageLoaded() {

  loadedImages++;

  const percent = Math.round(
    (loadedImages / totalImages) * 100
  );

  if (loaderPct) {
    loaderPct.textContent = percent + "%";
  }

  if (loaderFill) {
    loaderFill.style.width = percent + "%";
  }

  if (
    loadedImages >= totalImages &&
    !animationStarted
  ) {
    startSite();
  }
}


function loadImages() {

  for (let i = 1; i <= FRAME_COUNT; i++) {

    const img = new Image();

    const number =
      String(i).padStart(4, "0");

    img.onload = imageLoaded;

    img.onerror = () => {

      console.warn(
        "Frame unavailable:",
        `frames/f_${number}.jpg`
      );

      imageLoaded();
    };

    img.src =
      `frames/f_${number}.jpg`;

    frameImages.push(img);
  }


  for (let i = 0; i < EYE_COUNT; i++) {

    const img = new Image();

    img.onload = imageLoaded;

    img.onerror = () => {

      console.warn(
        "Eye unavailable:",
        `eyes/eye_${i}.jpg`
      );

      imageLoaded();
    };

    img.src =
      `eyes/eye_${i}.jpg`;

    eyeImages.push(img);
  }
}


/* ============================================================
   RESIZE
   ============================================================ */

function resizeCanvas(canvas) {

  if (!canvas) return;

  const dpr =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );

  canvas.width =
    window.innerWidth * dpr;

  canvas.height =
    window.innerHeight * dpr;

  canvas.style.width =
    window.innerWidth + "px";

  canvas.style.height =
    window.innerHeight + "px";

  const ctx =
    canvas.getContext("2d");

  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );
}


function resizeAll() {

  resizeCanvas(mainCanvas);
  resizeCanvas(eyeCanvas);
  resizeCanvas(flameCanvas);
  resizeCanvas(featherCanvas);
}


window.addEventListener(
  "resize",
  resizeAll
);


/* ============================================================
   COVER IMAGE
   ============================================================ */

function drawCover(ctx, img) {

  if (
    !ctx ||
    !img ||
    !img.naturalWidth
  ) return;

  const w =
    window.innerWidth;

  const h =
    window.innerHeight;

  const imageRatio =
    img.naturalWidth /
    img.naturalHeight;

  const screenRatio =
    w / h;

  let drawW;
  let drawH;
  let x;
  let y;


  if (imageRatio > screenRatio) {

    drawH = h;
    drawW = h * imageRatio;

    x = (w - drawW) / 2;
    y = 0;

  } else {

    drawW = w;
    drawH = w / imageRatio;

    x = 0;
    y = (h - drawH) / 2;
  }


  ctx.drawImage(
    img,
    x,
    y,
    drawW,
    drawH
  );
}


/* ============================================================
   MAIN ITACHI FRAME
   ============================================================ */

function drawMainFrame() {

  if (!mainCtx) return;

  mainCtx.clearRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );


  const img =
    frameImages[currentFrame];

  if (
    img &&
    img.complete &&
    img.naturalWidth
  ) {

    drawCover(
      mainCtx,
      img
    );
  }


  /*
     DARK RED CINEMATIC GRADING
  */

  const gradient =
    mainCtx.createLinearGradient(
      0,
      0,
      0,
      window.innerHeight
    );

  gradient.addColorStop(
    0,
    "rgba(0,0,0,0.18)"
  );

  gradient.addColorStop(
    0.5,
    "rgba(30,0,0,0.04)"
  );

  gradient.addColorStop(
    1,
    "rgba(0,0,0,0.45)"
  );

  mainCtx.fillStyle =
    gradient;

  mainCtx.fillRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );
}


/* ============================================================
   SCROLL
   ============================================================ */

function updateScroll() {

  if (!scrubSection) return;

  const rect =
    scrubSection.getBoundingClientRect();

  const scrollable =
    scrubSection.offsetHeight -
    window.innerHeight;

  if (scrollable <= 0) return;

  let progress =
    -rect.top /
    scrollable;

  progress =
    Math.max(
      0,
      Math.min(1, progress)
    );


  targetFrame =
    Math.round(
      progress *
      (FRAME_COUNT - 1)
    );


  currentFrame +=
    (targetFrame - currentFrame) *
    0.2;


  currentFrame =
    Math.max(
      0,
      Math.min(
        FRAME_COUNT - 1,
        Math.round(currentFrame)
      )
    );
}


window.addEventListener(
  "scroll",
  updateScroll,
  { passive: true }
);


/* ============================================================
   MOUSE
   ============================================================ */

window.addEventListener(
  "mousemove",
  event => {

    mouseX = event.clientX;
    mouseY = event.clientY;


    if (cursor) {

      cursor.style.left =
        mouseX + "px";

      cursor.style.top =
        mouseY + "px";
    }


    if (cursorDot) {

      cursorDot.style.left =
        mouseX + "px";

      cursorDot.style.top =
        mouseY + "px";
    }
  }
);


/* ============================================================
   SHARINGAN EYE FOLLOW
   ============================================================ */

function updateEyeMovement() {

  const cx =
    window.innerWidth / 2;

  const cy =
    window.innerHeight / 2;


  const dx =
    mouseX - cx;

  const dy =
    mouseY - cy;


  const maxMove = 20;


  const tx =
    cx +
    Math.max(
      -maxMove,
      Math.min(
        maxMove,
        dx * 0.035
      )
    );


  const ty =
    cy +
    Math.max(
      -maxMove,
      Math.min(
        maxMove,
        dy * 0.035
      )
    );


  eyeX +=
    (tx - eyeX) * 0.08;

  eyeY +=
    (ty - eyeY) * 0.08;
}


/* ============================================================
   NATURAL BLINK
   ============================================================ */

function blink() {

  if (blinking) return;

  blinking = true;

  setTimeout(
    () => {
      blinking = false;
    },
    140
  );
}


function scheduleBlink() {

  const delay =
    2500 +
    Math.random() * 4500;

  setTimeout(
    () => {

      blink();

      scheduleBlink();

    },
    delay
  );
}


/* ============================================================
   EYE DRAW
   ============================================================ */

function drawEyes() {

  if (!eyeCtx) return;

  eyeCtx.clearRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );


  /*
     Eye direction.
  */

  const dx =
    mouseX -
    window.innerWidth / 2;

  const dy =
    mouseY -
    window.innerHeight / 2;


  let index = 4;


  if (dx < -250) index -= 2;
  else if (dx < -80) index -= 1;
  else if (dx > 250) index += 2;
  else if (dx > 80) index += 1;


  if (dy < -180) index -= 1;
  if (dy > 180) index += 1;


  index =
    Math.max(
      0,
      Math.min(
        EYE_COUNT - 1,
        index
      )
    );


  const img =
    eyeImages[index];


  if (
    !img ||
    !img.naturalWidth
  ) return;


  /*
     Natural blink.
  */

  if (blinking) {

    eyeCtx.save();

    eyeCtx.globalAlpha = 0.25;

    drawCover(
      eyeCtx,
      img
    );

    eyeCtx.restore();

  } else {

    drawCover(
      eyeCtx,
      img
    );
  }
}


/* ============================================================
   RED FOG / AURA
   ============================================================ */

const fogParticles = [];


function createFogParticle() {

  return {

    x:
      Math.random() *
      window.innerWidth,

    y:
      Math.random() *
      window.innerHeight,

    radius:
      80 +
      Math.random() * 180,

    speed:
      0.15 +
      Math.random() * 0.4,

    opacity:
      0.015 +
      Math.random() * 0.035,

    phase:
      Math.random() *
      Math.PI * 2
  };
}


function initializeFog() {

  fogParticles.length = 0;

  for (let i = 0; i < 18; i++) {

    fogParticles.push(
      createFogParticle()
    );
  }
}


function drawRedFog(time) {

  if (!flameCtx) return;


  flameCtx.clearRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );


  /*
     Large red atmospheric glow.
  */

  const cx =
    window.innerWidth * 0.5;

  const cy =
    window.innerHeight * 0.55;


  const aura =
    flameCtx.createRadialGradient(
      cx,
      cy,
      0,
      cx,
      cy,
      Math.max(
        window.innerWidth,
        window.innerHeight
      ) * 0.7
    );


  aura.addColorStop(
    0,
    "rgba(150,0,0,0.18)"
  );

  aura.addColorStop(
    0.35,
    "rgba(90,0,0,0.08)"
  );

  aura.addColorStop(
    1,
    "rgba(0,0,0,0)"
  );


  flameCtx.fillStyle =
    aura;

  flameCtx.fillRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );


  /*
     Moving fog.
  */

  for (const p of fogParticles) {

    p.x +=
      Math.sin(
        time * 0.0003 +
        p.phase
      ) * 0.25;

    p.y -= p.speed;


    if (p.y < -p.radius) {

      p.y =
        window.innerHeight +
        p.radius;

    }


    const fog =
      flameCtx.createRadialGradient(
        p.x,
        p.y,
        0,
        p.x,
        p.y,
        p.radius
      );


    fog.addColorStop(
      0,
      `rgba(180,0,0,${p.opacity})`
    );

    fog.addColorStop(
      1,
      "rgba(80,0,0,0)"
    );


    flameCtx.fillStyle =
      fog;


    flameCtx.beginPath();

    flameCtx.arc(
      p.x,
      p.y,
      p.radius,
      0,
      Math.PI * 2
    );

    flameCtx.fill();
  }


  /*
     Black flame silhouettes.
  */

  flameCtx.fillStyle =
    "rgba(0,0,0,0.28)";


  for (let i = 0; i < 12; i++) {

    const x =
      i *
      (window.innerWidth / 11);

    const h =
      30 +
      Math.sin(
        time * 0.002 + i
      ) * 20;


    flameCtx.beginPath();

    flameCtx.moveTo(
      x - 25,
      window.innerHeight
    );

    flameCtx.quadraticCurveTo(
      x - 5,
      window.innerHeight - h,
      x + 5,
      window.innerHeight
    );

    flameCtx.fill();
  }
}


/* ============================================================
   CROWS
   ============================================================ */

const crows = [];


function createCrow() {

  return {

    x:
      -100 -
      Math.random() * 300,

    y:
      80 +
      Math.random() *
      window.innerHeight * 0.65,

    scale:
      0.5 +
      Math.random() * 0.7,

    speed:
      0.5 +
      Math.random() * 1.1,

    flap:
      Math.random() * Math.PI * 2,

    opacity:
      0.45 +
      Math.random() * 0.4
  };
}


function initializeCrows() {

  crows.length = 0;

  for (let i = 0; i < 7; i++) {

    const crow =
      createCrow();

    crow.x =
      Math.random() *
      window.innerWidth;

    crows.push(crow);
  }
}


function drawCrow(
  ctx,
  crow,
  time
) {

  const wing =
    Math.sin(
      time * 0.012 +
      crow.flap
    ) * 8;


  ctx.save();

  ctx.translate(
    crow.x,
    crow.y
  );

  ctx.scale(
    crow.scale,
    crow.scale
  );

  ctx.globalAlpha =
    crow.opacity;

  ctx.fillStyle =
    "rgba(0,0,0,0.9)";


  /*
     Body.
  */

  ctx.beginPath();

  ctx.ellipse(
    0,
    0,
    16,
    7,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();


  /*
     Left wing.
  */

  ctx.beginPath();

  ctx.moveTo(
    -5,
    0
  );

  ctx.quadraticCurveTo(
    -30,
    -20 - wing,
    -48,
    2
  );

  ctx.quadraticCurveTo(
    -25,
    -4,
    -5,
    4
  );

  ctx.fill();


  /*
     Right wing.
  */

  ctx.beginPath();

  ctx.moveTo(
    5,
    0
  );

  ctx.quadraticCurveTo(
    30,
    -20 + wing,
    48,
    2
  );

  ctx.quadraticCurveTo(
    25,
    -4,
    5,
    4
  );

  ctx.fill();


  /*
     Head + beak.
  */

  ctx.beginPath();

  ctx.arc(
    14,
    -4,
    6,
    0,
    Math.PI * 2
  );

  ctx.fill();


  ctx.beginPath();

  ctx.moveTo(
    19,
    -4
  );

  ctx.lineTo(
    28,
    0
  );

  ctx.lineTo(
    19,
    2
  );

  ctx.fill();


  ctx.restore();
}


function updateCrows(time) {

  if (!featherCtx) return;


  featherCtx.clearRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );


  for (const crow of crows) {

    crow.x +=
      crow.speed;


    crow.y +=
      Math.sin(
        time * 0.001 +
        crow.flap
      ) * 0.25;


    if (
      crow.x >
      window.innerWidth + 120
    ) {

      crow.x = -120;

      crow.y =
        60 +
        Math.random() *
        window.innerHeight *
        0.7;
    }


    drawCrow(
      featherCtx,
      crow,
      time
    );
  }
}


/* ============================================================
   LIGHTNING
   ============================================================ */

function drawLightning() {

  if (!mainCtx) return;

  if (lightning <= 0) return;


  mainCtx.save();

  mainCtx.globalAlpha =
    lightning * 0.55;

  mainCtx.fillStyle =
    "rgba(255,255,255,0.18)";

  mainCtx.fillRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );


  /*
     Red lightning streak.
  */

  mainCtx.strokeStyle =
    "rgba(180,0,0,0.9)";

  mainCtx.lineWidth = 2;

  mainCtx.beginPath();


  let x =
    window.innerWidth *
    (0.25 +
     Math.random() * 0.5);

  let y = 0;


  mainCtx.moveTo(
    x,
    y
  );


  for (let i = 0; i < 7; i++) {

    x +=
      (Math.random() - 0.5) *
      80;

    y +=
      window.innerHeight / 7;

    mainCtx.lineTo(
      x,
      y
    );
  }


  mainCtx.stroke();

  mainCtx.restore();


  lightning *= 0.82;
}


/* ============================================================
   RANDOM THUNDER
   ============================================================ */

function updateLightning(time) {

  if (
    time - lightningTimer >
    5000 +
    Math.random() * 7000
  ) {

    lightning = 1;

    lightningTimer =
      time;
  }
}


/* ============================================================
   VIGNETTE
   ============================================================ */

function drawVignette() {

  if (!mainCtx) return;


  const gradient =
    mainCtx.createRadialGradient(
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight * 0.2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      Math.max(
        window.innerWidth,
        window.innerHeight
      ) * 0.75
    );


  gradient.addColorStop(
    0,
    "rgba(0,0,0,0)"
  );

  gradient.addColorStop(
    0.65,
    "rgba(0,0,0,0.05)"
  );

  gradient.addColorStop(
    1,
    "rgba(0,0,0,0.7)"
  );


  mainCtx.fillStyle =
    gradient;

  mainCtx.fillRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );
}


/* ============================================================
   MUSIC
   ============================================================ */

function startMusic() {

  if (!bgMusic) return;

  bgMusic.volume = 0.55;


  const promise =
    bgMusic.play();


  if (promise) {

    promise
      .then(() => {

        musicStarted = true;

        if (soundToggle) {
          soundToggle.textContent =
            "SOUND ON";
        }

      })
      .catch(() => {

        musicStarted = false;

      });
  }
}


if (soundToggle) {

  soundToggle.addEventListener(
    "click",
    () => {

      if (!bgMusic) return;


      if (bgMusic.paused) {

        startMusic();

      } else {

        bgMusic.pause();

        musicStarted = false;

        soundToggle.textContent =
          "SOUND OFF";
      }
    }
  );
}


function unlockAudio() {

  if (!musicStarted) {
    startMusic();
  }

  window.removeEventListener(
    "click",
    unlockAudio
  );

  window.removeEventListener(
    "keydown",
    unlockAudio
  );

  window.removeEventListener(
    "touchstart",
    unlockAudio
  );
}


window.addEventListener(
  "click",
  unlockAudio
);

window.addEventListener(
  "keydown",
  unlockAudio
);

window.addEventListener(
  "touchstart",
  unlockAudio
);


/* ============================================================
   ANIMATION LOOP
   ============================================================ */

function animationLoop(time) {

  if (!lastTime) {
    lastTime = time;
  }


  updateScroll();

  updateEyeMovement();

  drawMainFrame();

  drawEyes();

  drawRedFog(time);

  updateCrows(time);

  updateLightning(time);

  drawLightning();

  drawVignette();


  lastTime = time;

  requestAnimationFrame(
    animationLoop
  );
}


/* ============================================================
   START
   ============================================================ */

function startSite() {

  if (animationStarted) return;

  animationStarted = true;

  resizeAll();

  initializeFog();

  initializeCrows();

  scheduleBlink();

  drawMainFrame();


  if (loader) {

    loader.classList.add("hide");

    loader.style.display =
      "none";
  }


  requestAnimationFrame(
    animationLoop
  );
}


/* ============================================================
   INITIALIZATION
   ============================================================ */

function initialize() {

  resizeAll();

  loadImages();
}


if (
  !scrubSection ||
  !mainCanvas ||
  !eyeCanvas ||
  !loader
) {

  console.error(
    "Itachi website: required HTML element is missing."
  );

} else {

  initialize();
}