/* ============================================================
   ITACHI UCHIHA WEBSITE
   ============================================================

   FEATURES
   - 150 frame scroll animation
   - No zoom while scrolling
   - Sharingan follows mouse
   - Natural automatic blinking
   - Itachi audio
   - Black flames
   - Crow feathers
   - Lightning effects
   - Custom Sharingan cursor
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

let eyeX = window.innerWidth / 2;
let eyeY = window.innerHeight / 2;

let blinkTimer = null;
let blinking = false;

let windForce = 0;
let animationStarted = false;


/* ============================================================
   HTML ELEMENTS
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

const mainCtx = mainCanvas ? mainCanvas.getContext("2d") : null;
const eyeCtx = eyeCanvas ? eyeCanvas.getContext("2d") : null;

const flameCtx = flameCanvas ? flameCanvas.getContext("2d") : null;
const featherCtx = featherCanvas
  ? featherCanvas.getContext("2d")
  : null;


/* ============================================================
   IMAGE LOADING
   ============================================================ */

function imageLoaded() {

  loadedImages++;

  const percentage = Math.round(
    (loadedImages / totalImages) * 100
  );

  if (loaderPct) {
    loaderPct.textContent = percentage + "%";
  }

  if (loaderFill) {
    loaderFill.style.width = percentage + "%";
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

    const number = String(i).padStart(4, "0");

    img.onload = imageLoaded;

    img.onerror = function () {
      console.error(
        "Could not load frame:",
        `frames/f_${number}.jpg`
      );

      imageLoaded();
    };

    img.src = `frames/f_${number}.jpg`;

    frameImages.push(img);
  }


  for (let i = 0; i < EYE_COUNT; i++) {

    const img = new Image();

    img.onload = imageLoaded;

    img.onerror = function () {
      console.error(
        "Could not load eye:",
        `eyes/eye_${i}.jpg`
      );

      imageLoaded();
    };

    img.src = `eyes/eye_${i}.jpg`;

    eyeImages.push(img);
  }
}


/* ============================================================
   CANVAS RESIZE
   ============================================================ */

function resizeCanvas(canvas) {

  if (!canvas) return;

  const dpr = Math.min(
    window.devicePixelRatio || 1,
    2
  );

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;

  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  const ctx = canvas.getContext("2d");

  if (ctx) {
    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );
  }
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
   COVER DRAW
   ============================================================ */

function drawCover(
  ctx,
  img,
  canvas
) {

  if (!ctx || !img || !canvas) return;

  const width = window.innerWidth;
  const height = window.innerHeight;

  const imgRatio =
    img.naturalWidth / img.naturalHeight;

  const screenRatio =
    width / height;

  let drawWidth;
  let drawHeight;
  let x;
  let y;


  if (imgRatio > screenRatio) {

    drawHeight = height;
    drawWidth = height * imgRatio;

    x = (width - drawWidth) / 2;
    y = 0;

  } else {

    drawWidth = width;
    drawHeight = width / imgRatio;

    x = 0;
    y = (height - drawHeight) / 2;
  }


  ctx.drawImage(
    img,
    x,
    y,
    drawWidth,
    drawHeight
  );
}


/* ============================================================
   MAIN FRAME DRAWING
   ============================================================ */

function drawMainFrame() {

  if (
    !mainCtx ||
    !frameImages.length
  ) {
    return;
  }

  const img =
    frameImages[currentFrame];

  if (
    !img ||
    !img.complete ||
    !img.naturalWidth
  ) {
    return;
  }


  mainCtx.clearRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );


  /*
     IMPORTANT:
     There is intentionally NO zoom here.
     The image always fills the viewport normally.
  */

  drawCover(
    mainCtx,
    img,
    mainCanvas
  );
}


/* ============================================================
   SCROLL ANIMATION
   ============================================================ */

function updateScroll() {

  if (!scrubSection) return;

  const rect =
    scrubSection.getBoundingClientRect();

  const sectionHeight =
    scrubSection.offsetHeight;

  const scrollable =
    sectionHeight - window.innerHeight;

  if (scrollable <= 0) return;


  let progress =
    -rect.top / scrollable;


  progress =
    Math.max(
      0,
      Math.min(1, progress)
    );


  targetFrame =
    Math.round(
      progress * (FRAME_COUNT - 1)
    );


  /*
     Small smoothing so the frame movement
     does not look harsh.
  */

  currentFrame +=
    (targetFrame - currentFrame) * 0.18;


  currentFrame =
    Math.max(
      0,
      Math.min(
        FRAME_COUNT - 1,
        Math.round(currentFrame)
      )
    );
}


/* ============================================================
   MOUSE
   ============================================================ */

window.addEventListener(
  "mousemove",
  function (event) {

    mouseX = event.clientX;
    mouseY = event.clientY;

    /*
       Cursor follows mouse.
       This does NOT control blinking.
    */

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
   SHARINGAN EYE MOVEMENT
   ============================================================ */

function updateEyeMovement() {

  const centerX =
    window.innerWidth / 2;

  const centerY =
    window.innerHeight / 2;


  const dx =
    mouseX - centerX;

  const dy =
    mouseY - centerY;


  /*
     Limit movement so the eye remains natural.
  */

  const maxMovement = 18;

  const targetX =
    centerX +
    Math.max(
      -maxMovement,
      Math.min(
        maxMovement,
        dx * 0.035
      )
    );


  const targetY =
    centerY +
    Math.max(
      -maxMovement,
      Math.min(
        maxMovement,
        dy * 0.035
      )
    );


  eyeX +=
    (targetX - eyeX) * 0.08;

  eyeY +=
    (targetY - eyeY) * 0.08;
}


/* ============================================================
   NATURAL BLINKING
   ============================================================ */

function scheduleBlink() {

  const delay =
    2800 +
    Math.random() * 3500;


  blinkTimer =
    setTimeout(
      function () {

        blinking = true;


        /*
           Blink duration.
        */

        setTimeout(
          function () {

            blinking = false;

            scheduleBlink();

          },
          180
        );

      },
      delay
    );
}


/* ============================================================
   EYE DRAWING
   ============================================================ */

function drawEyes() {

  if (
    !eyeCtx ||
    !eyeImages.length
  ) {
    return;
  }


  eyeCtx.clearRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );


  /*
     Choose eye image based on mouse direction.
  */

  const dx =
    mouseX - window.innerWidth / 2;

  const dy =
    mouseY - window.innerHeight / 2;


  let eyeIndex = 4;


  if (dx < -250) {
    eyeIndex -= 2;
  } else if (dx < -80) {
    eyeIndex -= 1;
  } else if (dx > 250) {
    eyeIndex += 2;
  } else if (dx > 80) {
    eyeIndex += 1;
  }


  if (dy < -180) {
    eyeIndex -= 1;
  }

  if (dy > 180) {
    eyeIndex += 1;
  }


  eyeIndex =
    Math.max(
      0,
      Math.min(
        EYE_COUNT - 1,
        eyeIndex
      )
    );


  const img =
    eyeImages[eyeIndex];


  if (
    !img ||
    !img.complete ||
    !img.naturalWidth
  ) {
    return;
  }


  /*
     Natural blink effect.
     Cursor movement does NOT trigger it.
  */

  if (blinking) {

    eyeCtx.save();

    eyeCtx.globalAlpha = 0.2;

    drawCover(
      eyeCtx,
      img,
      eyeCanvas
    );

    eyeCtx.restore();

  } else {

    drawCover(
      eyeCtx,
      img,
      eyeCanvas
    );
  }
}


/* ============================================================
   BLACK FLAMES
   ============================================================ */

const flames = [];


function createFlame() {

  return {
    x: Math.random() * window.innerWidth,

    y:
      window.innerHeight +
      Math.random() * 100,

    size:
      8 +
      Math.random() * 25,

    speed:
      0.5 +
      Math.random() * 1.4,

    opacity:
      0.1 +
      Math.random() * 0.35
  };
}


function initializeFlames() {

  flames.length = 0;

  for (let i = 0; i < 35; i++) {
    flames.push(createFlame());
  }
}


function drawFlames() {

  if (!flameCtx) return;

  flameCtx.clearRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );


  flameCtx.fillStyle =
    "rgba(0,0,0,0.35)";


  for (const flame of flames) {

    flame.y -= flame.speed;

    flame.x +=
      Math.sin(
        flame.y * 0.025
      ) * 0.35;


    if (
      flame.y <
      window.innerHeight * 0.45
    ) {
      flame.y =
        window.innerHeight +
        Math.random() * 50;
    }


    flameCtx.globalAlpha =
      flame.opacity;


    flameCtx.beginPath();

    flameCtx.ellipse(
      flame.x,
      flame.y,
      flame.size * 0.5,
      flame.size,
      0,
      0,
      Math.PI * 2
    );

    flameCtx.fill();
  }


  flameCtx.globalAlpha = 1;
}


/* ============================================================
   CROW FEATHERS
   ============================================================ */

const feathers = [];


function createFeather() {

  return {
    x: Math.random() * window.innerWidth,

    y:
      -50 -
      Math.random() * window.innerHeight,

    size:
      5 +
      Math.random() * 12,

    speed:
      0.4 +
      Math.random() * 1,

    rotation:
      Math.random() * Math.PI,

    rotationSpeed:
      (Math.random() - 0.5) * 0.02,

    opacity:
      0.15 +
      Math.random() * 0.35
  };
}


function initializeFeathers() {

  feathers.length = 0;

  for (let i = 0; i < 18; i++) {
    feathers.push(createFeather());
  }
}


function drawFeathers() {

  if (!featherCtx) return;

  featherCtx.clearRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );


  for (const feather of feathers) {

    feather.y += feather.speed;

    feather.x +=
      Math.sin(
        feather.y * 0.01
      ) * 0.25;

    feather.rotation +=
      feather.rotationSpeed;


    if (
      feather.y >
      window.innerHeight + 50
    ) {

      feather.y = -50;

      feather.x =
        Math.random() *
        window.innerWidth;
    }


    featherCtx.save();

    featherCtx.translate(
      feather.x,
      feather.y
    );

    featherCtx.rotate(
      feather.rotation
    );

    featherCtx.globalAlpha =
      feather.opacity;

    featherCtx.fillStyle =
      "rgba(0,0,0,0.8)";


    featherCtx.beginPath();

    featherCtx.ellipse(
      0,
      0,
      feather.size * 0.35,
      feather.size,
      0,
      0,
      Math.PI * 2
    );

    featherCtx.fill();

    featherCtx.restore();
  }
}


/* ============================================================
   MUSIC
   ============================================================ */

let musicStarted = false;


function startMusic() {

  if (!bgMusic) return;

  bgMusic.volume = 0.55;

  const promise =
    bgMusic.play();


  if (promise) {

    promise
      .then(function () {

        musicStarted = true;

        if (soundToggle) {
          soundToggle.textContent =
            "SOUND ON";
        }

      })
      .catch(function () {

        musicStarted = false;

        if (soundToggle) {
          soundToggle.textContent =
            "SOUND";
        }
      });
  }
}


if (soundToggle) {

  soundToggle.addEventListener(
    "click",
    function () {

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


/*
   Browsers often block autoplay.
   Start music on the first user interaction.
*/

function unlockAudio() {

  if (!musicStarted) {
    startMusic();
  }

  window.removeEventListener(
    "click",
    unlockAudio
  );

  window.removeEventListener(
    "touchstart",
    unlockAudio
  );

  window.removeEventListener(
    "keydown",
    unlockAudio
  );
}


window.addEventListener(
  "click",
  unlockAudio
);

window.addEventListener(
  "touchstart",
  unlockAudio
);

window.addEventListener(
  "keydown",
  unlockAudio
);


/* ============================================================
   MAIN ANIMATION LOOP
   ============================================================ */

function animationLoop() {

  updateScroll();

  updateEyeMovement();

  drawMainFrame();

  drawEyes();

  drawFlames();

  drawFeathers();

  requestAnimationFrame(
    animationLoop
  );
}


/* ============================================================
   START WEBSITE
   ============================================================ */

function startSite() {

  if (animationStarted) {
    return;
  }

  animationStarted = true;

  resizeAll();

  currentFrame = 0;
  targetFrame = 0;

  drawMainFrame();
  drawEyes();

  initializeFlames();
  initializeFeathers();

  scheduleBlink();

  /*
     Hide loader.
  */

  if (loader) {
    loader.classList.add("hide");

    /*
       Extra protection in case CSS
       does not hide the loader.
    */

    loader.style.display = "none";
  }


  animationLoop();
}


/* ============================================================
   SCROLL LISTENER
   ============================================================ */

window.addEventListener(
  "scroll",
  updateScroll,
  { passive: true }
);


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