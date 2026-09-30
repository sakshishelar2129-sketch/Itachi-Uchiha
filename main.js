```javascript
/* ============================================================
   ITACHI UCHIHA WEBSITE
   ============================================================

   FEATURES:
   - 150 frame scroll animation
   - No zoom while scrolling
   - Sharingan follows mouse
   - Automatic blinking
   - Itachi music
   - Black flames
   - Crow feathers
   - Lightning effects
   - Custom Sharingan cursor
   ============================================================ */


/* ============================================================
   SETTINGS
   ============================================================ */

const TOTAL_FRAMES = 150;
const EYE_COUNT = 9;

const REDUCED_MOTION =
  window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;


/* ============================================================
   HTML ELEMENTS
   ============================================================ */

const scrubSection =
  document.getElementById("scrub");

const mainCanvas =
  document.getElementById("mainCanvas");

const mainCtx =
  mainCanvas.getContext("2d");

const eyeCanvas =
  document.getElementById("eyeCanvas");

const eyeCtx =
  eyeCanvas.getContext("2d");

const captions =
  document.getElementById("captions");

const phases =
  document.querySelectorAll(".phase");

const loader =
  document.getElementById("loader");

const loaderPct =
  document.getElementById("loaderPct");

const loaderFill =
  document.getElementById("loaderFill");

const bgMusic =
  document.getElementById("bgMusic");

const soundToggle =
  document.getElementById("soundToggle");

const soundState =
  document.getElementById("soundState");

const flameCanvas =
  document.getElementById("flameCanvas");

const featherCanvas =
  document.getElementById("featherCanvas");

const flameCtx =
  flameCanvas.getContext("2d");

const featherCtx =
  featherCanvas.getContext("2d");

const cursor =
  document.getElementById("cursor");

const cursorDot =
  document.getElementById("cursorDot");


/* ============================================================
   BASIC HELPERS
   ============================================================ */

function clamp(value, min, max) {

  return Math.min(
    max,
    Math.max(min, value)
  );

}


/* ============================================================
   IMAGE LOADING
   ============================================================ */

let loadedImages = 0;

const totalImages =
  TOTAL_FRAMES + EYE_COUNT;


function updateLoader() {

  loadedImages++;

  const percent =
    Math.round(
      (loadedImages / totalImages) * 100
    );

  if (loaderPct) {
    loaderPct.textContent = percent;
  }

  if (loaderFill) {
    loaderFill.style.width =
      percent + "%";
  }

  if (
    loadedImages >= totalImages
  ) {

    startSite();

  }

}


function loadImages(
  pathFunction,
  count
) {

  const images = [];

  for (
    let i = 0;
    i < count;
    i++
  ) {

    const image =
      new Image();

    image.onload =
      updateLoader;

    image.onerror =
      function () {

        console.error(
          "Could not load:",
          image.src
        );

        updateLoader();

      };

    image.src =
      pathFunction(i);

    images.push(image);

  }

  return images;

}


/* ============================================================
   LOAD ITACHI FRAMES
   ============================================================ */

const frames =
  loadImages(
    function (i) {

      const number =
        String(i + 1)
          .padStart(4, "0");

      return (
        "frames/f_" +
        number +
        ".jpg"
      );

    },
    TOTAL_FRAMES
  );


/* ============================================================
   LOAD SHARINGAN EYE IMAGES
   ============================================================ */

const eyes =
  loadImages(
    function (i) {

      return (
        "eyes/eye_" +
        i +
        ".jpg"
      );

    },
    EYE_COUNT
  );


/* ============================================================
   DRAW IMAGE WITHOUT ZOOMING
   ============================================================ */

function drawImageCover(
  context,
  canvas,
  image
) {

  if (
    !image ||
    !image.complete ||
    !image.naturalWidth
  ) {

    return;

  }


  context.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );


  const scale =
    Math.max(
      canvas.width /
        image.naturalWidth,

      canvas.height /
        image.naturalHeight
    );


  const width =
    image.naturalWidth *
    scale;

  const height =
    image.naturalHeight *
    scale;


  const x =
    (canvas.width - width) /
    2;

  const y =
    (canvas.height - height) /
    2;


  context.drawImage(
    image,
    x,
    y,
    width,
    height
  );

}


/* ============================================================
   SCROLL ANIMATION
   ============================================================ */

let currentFrame = 0;

let scrollProgress = 0;

let lastScrollY =
  window.scrollY;


function getScrollProgress() {

  const rect =
    scrubSection.getBoundingClientRect();

  const totalScroll =
    scrubSection.offsetHeight -
    window.innerHeight;


  if (totalScroll <= 0) {

    return 0;

  }


  return clamp(
    -rect.top / totalScroll,
    0,
    1
  );

}


function updateScroll() {

  scrollProgress =
    getScrollProgress();


  /*
     IMPORTANT:

     Scroll changes ONLY the frame.

     There is no:
     scale()
     zoom
     translate
     camera movement
  */

  currentFrame =
    Math.min(
      TOTAL_FRAMES - 1,
      Math.floor(
        scrollProgress *
        TOTAL_FRAMES
      )
    );


  drawImageCover(
    mainCtx,
    mainCanvas,
    frames[currentFrame]
  );


  /* ----------------------------------------------------------
     Captions
     ---------------------------------------------------------- */

  const rect =
    scrubSection.getBoundingClientRect();


  if (captions) {

    captions.classList.toggle(
      "show",
      rect.top <= 0 &&
      rect.bottom >=
        window.innerHeight - 60
    );

  }


  const phaseNumber =
    Math.min(
      3,
      Math.floor(
        scrollProgress * 4
      )
    );


  phases.forEach(
    function (phase, index) {

      phase.classList.toggle(
        "active",
        index === phaseNumber
      );

    }
  );


  /* ----------------------------------------------------------
     Feather wind from scrolling
     ---------------------------------------------------------- */

  const movement =
    window.scrollY -
    lastScrollY;


  lastScrollY =
    window.scrollY;


  windForce +=
    clamp(
      movement,
      -80,
      80
    );

}


window.addEventListener(
  "scroll",
  updateScroll,
  {
    passive: true
  }
);


/* ============================================================
   MOUSE POSITION
   ============================================================ */

let mouseX =
  window.innerWidth / 2;

let mouseY =
  window.innerHeight / 2;


/* ============================================================
   SHARINGAN EYE POSITION
   ============================================================ */

let eyePosition =
  (EYE_COUNT - 1) / 2;

let eyeTarget =
  eyePosition;


window.addEventListener(
  "mousemove",
  function (event) {

    mouseX =
      event.clientX;

    mouseY =
      event.clientY;


    /*
       Cursor LEFT:
       eye 0

       Cursor CENTER:
       eye 4

       Cursor RIGHT:
       eye 8
    */

    const horizontal =
      clamp(
        event.clientX /
          window.innerWidth,
        0,
        1
      );


    eyeTarget =
      horizontal *
      (EYE_COUNT - 1);

  }
);


/* ============================================================
   TOUCH SUPPORT
   ============================================================ */

window.addEventListener(
  "touchmove",
  function (event) {

    if (
      !event.touches ||
      !event.touches.length
    ) {

      return;

    }


    mouseX =
      event.touches[0].clientX;

    mouseY =
      event.touches[0].clientY;


    const horizontal =
      clamp(
        mouseX /
          window.innerWidth,
        0,
        1
      );


    eyeTarget =
      horizontal *
      (EYE_COUNT - 1);

  },
  {
    passive: true
  }
);


/* ============================================================
   BLINK SYSTEM
   ============================================================ */

let isBlinking = false;

let blinkAmount = 0;

let blinkStart = 0;

let nextBlink =
  performance.now() +
  3000 +
  Math.random() * 4000;


const BLINK_TIME = 160;


function startBlink() {

  if (isBlinking) {

    return;

  }


  isBlinking = true;

  blinkAmount = 0;

  blinkStart =
    performance.now();

}


function updateBlink(time) {

  /*
     Blink happens automatically.

     It has NOTHING to do with
     mouse movement.
  */

  if (
    !isBlinking &&
    time >= nextBlink
  ) {

    startBlink();

  }


  if (!isBlinking) {

    return;

  }


  blinkAmount =
    (time - blinkStart) /
    BLINK_TIME;


  if (
    blinkAmount >= 1
  ) {

    isBlinking = false;

    blinkAmount = 0;


    /*
       Random next blink.

       Approximately every
       3–7 seconds.
    */

    nextBlink =
      time +
      2800 +
      Math.random() * 4500;

  }

}


/* ============================================================
   DRAW SHARINGAN EYES
   ============================================================ */

function drawEyes() {

  eyeCtx.clearRect(
    0,
    0,
    eyeCanvas.width,
    eyeCanvas.height
  );


  /*
     Find the closest eye image.
  */

  const index =
    clamp(
      Math.round(eyePosition),
      0,
      EYE_COUNT - 1
    );


  const image =
    eyes[index];


  if (
    !image ||
    !image.complete ||
    !image.naturalWidth
  ) {

    return;

  }


  /*
     Draw the eye normally.
  */

  const scale =
    Math.max(
      eyeCanvas.width /
        image.naturalWidth,

      eyeCanvas.height /
        image.naturalHeight
    );


  const width =
    image.naturalWidth *
    scale;

  const height =
    image.naturalHeight *
    scale;


  const x =
    (eyeCanvas.width - width) /
    2;

  const y =
    (eyeCanvas.height - height) /
    2;


  /*
     Blink animation.

     The eye becomes darker in the
     middle of the blink and returns
     immediately afterward.
  */

  let eyeAlpha = 1;


  if (isBlinking) {

    const closing =
      Math.sin(
        blinkAmount *
        Math.PI
      );


    eyeAlpha =
      1 -
      closing;

  }


  eyeCtx.globalAlpha =
    eyeAlpha;


  eyeCtx.drawImage(
    image,
    x,
    y,
    width,
    height
  );


  eyeCtx.globalAlpha = 1;


  /*
     Small dark eyelid effect.
  */

  if (isBlinking) {

    const closing =
      Math.sin(
        blinkAmount *
        Math.PI
      );


    const eyelidHeight =
      eyeCanvas.height *
      0.18 *
      closing;


    eyeCtx.fillStyle =
      "rgba(0,0,0,0.95)";


    eyeCtx.fillRect(
      0,
      0,
      eyeCanvas.width,
      eyelidHeight
    );


    eyeCtx.fillRect(
      0,
      eyeCanvas.height -
        eyelidHeight,
      eyeCanvas.width,
      eyelidHeight
    );

  }

}


/* ============================================================
   BLACK FLAMES
   ============================================================ */

let flames = [];

let flameTime = 0;

let flameStrength = 0;


function resizeFlameCanvas() {

  flameCanvas.width =
    Math.ceil(
      window.innerWidth * 0.5
    );

  flameCanvas.height =
    Math.ceil(
      window.innerHeight * 0.5
    );

}


function createFlame() {

  const width =
    flameCanvas.width;

  const height =
    flameCanvas.height;


  const side =
    Math.random();


  let x;
  let y;
  let velocityX;
  let velocityY;


  if (side < 0.6) {

    x =
      Math.random() *
      width;

    y =
      height + 10;

    velocityX =
      (Math.random() - 0.5) *
      0.5;

    velocityY =
      -(0.7 +
        Math.random() * 1.5);

  }
  else if (side < 0.8) {

    x = -5;

    y =
      height *
      (0.4 +
        Math.random() * 0.6);

    velocityX =
      0.2 +
      Math.random() * 0.5;

    velocityY =
      -(0.3 +
        Math.random() * 0.7);

  }
  else {

    x =
      width + 5;

    y =
      height *
      (0.4 +
        Math.random() * 0.6);

    velocityX =
      -(0.2 +
        Math.random() * 0.5);

    velocityY =
      -(0.3 +
        Math.random() * 0.7);

  }


  return {

    x: x,

    y: y,

    vx: velocityX,

    vy: velocityY,

    life: 0,

    maxLife:
      50 +
      Math.random() * 70,

    size:
      5 +
      Math.random() * 14,

    seed:
      Math.random() * 10

  };

}


function updateFlames() {

  flameTime++;


  flameStrength =
    0.25 +
    scrollProgress * 0.75;


  const wanted =
    REDUCED_MOTION
      ? 50
      : 100 +
        Math.floor(
          flameStrength * 100
        );


  while (
    flames.length < wanted
  ) {

    flames.push(
      createFlame()
    );

  }


  flameCtx.clearRect(
    0,
    0,
    flameCanvas.width,
    flameCanvas.height
  );


  /*
     Dark edge at bottom.
  */

  const bottomGradient =
    flameCtx.createLinearGradient(
      0,
      flameCanvas.height,
      0,
      flameCanvas.height * 0.82
    );


  bottomGradient.addColorStop(
    0,
    "rgba(0,0,0,0.9)"
  );

  bottomGradient.addColorStop(
    1,
    "rgba(0,0,0,0)"
  );


  flameCtx.fillStyle =
    bottomGradient;


  flameCtx.fillRect(
    0,
    flameCanvas.height * 0.8,
    flameCanvas.width,
    flameCanvas.height * 0.2
  );


  /*
     Update flames.
  */

  for (
    let i = flames.length - 1;
    i >= 0;
    i--
  ) {

    const flame =
      flames[i];


    flame.life++;

    flame.x +=
      flame.vx +
      Math.sin(
        flameTime * 0.06 +
        flame.seed
      ) * 0.4;

    flame.y +=
      flame.vy;


    if (
      flame.life >=
      flame.maxLife
    ) {

      flames.splice(
        i,
        1
      );

    }

  }


  /*
     Draw flames.
  */

  for (
    const flame of flames
  ) {

    const progress =
      flame.life /
      flame.maxLife;


    const alpha =
      Math.sin(
        progress * Math.PI
      );


    const radius =
      flame.size *
      (1 - progress * 0.5);


    flameCtx.save();


    flameCtx.translate(
      flame.x,
      flame.y
    );


    flameCtx.scale(
      1,
      1.7
    );


    /*
       Red glow.
    */

    const glow =
      flameCtx.createRadialGradient(
        0,
        0,
        0,
        0,
        0,
        radius * 2
      );


    glow.addColorStop(
      0,
      "rgba(220,20,45," +
        alpha * 0.5 +
        ")"
    );


    glow.addColorStop(
      0.5,
      "rgba(120,0,25," +
        alpha * 0.25 +
        ")"
    );


    glow.addColorStop(
      1,
      "rgba(0,0,0,0)"
    );


    flameCtx.fillStyle =
      glow;


    flameCtx.fillRect(
      -radius * 2,
      -radius * 2,
      radius * 4,
      radius * 4
    );


    /*
       Black center.
    */

    flameCtx.fillStyle =
      "rgba(0,0,0," +
      alpha +
      ")";


    flameCtx.beginPath();


    flameCtx.arc(
      0,
      0,
      radius,
      0,
      Math.PI * 2
    );


    flameCtx.fill();


    flameCtx.restore();

  }

}


/* ============================================================
   CROW FEATHERS
   ============================================================ */

let feathers = [];

let windForce = 0;


function resizeFeatherCanvas() {

  const dpr =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );


  featherCanvas.width =
    window.innerWidth * dpr;

  featherCanvas.height =
    window.innerHeight * dpr;


  featherCtx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

}


function createFeather(
  startInside
) {

  const depth =
    Math.random();


  return {

    x:
      Math.random() *
      window.innerWidth,

    y:
      startInside
        ? Math.random() *
          window.innerHeight
        : -100,

    size:
      12 +
      depth * 30,

    speed:
      0.4 +
      depth * 1.2,

    depth:
      depth,

    rotation:
      Math.random() *
      Math.PI *
      2,

    rotationSpeed:
      (Math.random() - 0.5) *
      0.02,

    wave:
      Math.random() *
      Math.PI *
      2,

    waveSpeed:
      0.01 +
      Math.random() *
      0.02

  };

}


function drawFeather(
  feather
) {

  const length =
    feather.size * 2.4;

  const width =
    feather.size * 0.5;


  featherCtx.save();


  featherCtx.translate(
    feather.x,
    feather.y
  );


  featherCtx.rotate(
    feather.rotation
  );


  featherCtx.globalAlpha =
    0.3 +
    feather.depth * 0.7;


  /*
     Feather body.
  */

  featherCtx.fillStyle =
    "#090910";


  featherCtx.beginPath();


  featherCtx.moveTo(
    0,
    -length / 2
  );


  featherCtx.bezierCurveTo(
    width,
    -length * 0.2,
    width,
    length * 0.25,
    0,
    length / 2
  );


  featherCtx.bezierCurveTo(
    -width,
    length * 0.25,
    -width,
    -length * 0.2,
    0,
    -length / 2
  );


  featherCtx.closePath();


  featherCtx.fill();


  /*
     Feather center line.
  */

  featherCtx.strokeStyle =
    "rgba(160,160,190,0.3)";


  featherCtx.lineWidth = 1;


  featherCtx.beginPath();


  featherCtx.moveTo(
    0,
    -length / 2
  );


  featherCtx.lineTo(
    0,
    length / 2
  );


  featherCtx.stroke();


  featherCtx.restore();

}


function updateFeathers() {

  featherCtx.clearRect(
    0,
    0,
    window.innerWidth,
    window.innerHeight
  );


  windForce *= 0.86;


  const wanted =
    REDUCED_MOTION
      ? 8
      : 20;


  while (
    feathers.length < wanted
  ) {

    feathers.push(
      createFeather(true)
    );

  }


  for (
    let i = 0;
    i < feathers.length;
    i++
  ) {

    const feather =
      feathers[i];


    feather.wave +=
      feather.waveSpeed;


    feather.rotation +=
      feather.rotationSpeed;


    feather.x +=
      Math.sin(
        feather.wave
      ) *
      0.7;


    feather.y +=
      feather.speed -
      windForce * 0.05;


    if (
      feather.y >
        window.innerHeight + 100
    ) {

      feathers[i] =
        createFeather(false);

    }
    else {

      drawFeather(
        feather
      );

    }

  }

}


/* ============================================================
   LIGHTNING
   ============================================================ */

let lightningTimer = 0;

let lightningAlpha = 0;


function updateLightning() {

  lightningTimer++;


  if (
    !REDUCED_MOTION &&
    lightningTimer >
      300 +
      Math.random() * 500
  ) {

    lightningTimer = 0;

    lightningAlpha = 1;

  }


  if (
    lightningAlpha > 0
  ) {

    lightningAlpha *= 0.88;


    featherCtx.fillStyle =
      "rgba(180,210,255," +
      lightningAlpha * 0.08 +
      ")";


    featherCtx.fillRect(
      0,
      0,
      window.innerWidth,
      window.innerHeight
    );

  }

}


/* ============================================================
   MUSIC
   ============================================================ */

let musicPlaying = false;


function toggleMusic() {

  if (!bgMusic) {

    return;

  }


  if (!musicPlaying) {

    bgMusic.volume = 0.7;


    const promise =
      bgMusic.play();


    if (
      promise &&
      typeof promise.catch ===
        "function"
    ) {

      promise.catch(
        function (error) {

          console.error(
            "Music could not play:",
            error
          );

        }
      );

    }


    musicPlaying = true;


    if (soundState) {

      soundState.textContent =
        "MUSIC ON";

    }


    soundToggle.setAttribute(
      "aria-pressed",
      "true"
    );

  }
  else {

    bgMusic.pause();

    musicPlaying = false;


    if (soundState) {

      soundState.textContent =
        "MUSIC OFF";

    }


    soundToggle.setAttribute(
      "aria-pressed",
      "false"
    );

  }

}


if (soundToggle) {

  soundToggle.addEventListener(
    "click",
    toggleMusic
  );

}


/* ============================================================
   CUSTOM SHARINGAN CURSOR
   ============================================================ */

let cursorX =
  window.innerWidth / 2;

let cursorY =
  window.innerHeight / 2;


function updateCursor() {

  cursorX +=
    (mouseX - cursorX) *
    0.18;


  cursorY +=
    (mouseY - cursorY) *
    0.18;


  if (cursor) {

    cursor.style.transform =
      "translate3d(" +
      cursorX +
      "px, " +
      cursorY +
      "px, 0)";

  }


  if (cursorDot) {

    cursorDot.style.transform =
      "translate3d(" +
      mouseX +
      "px, " +
      mouseY +
      "px, 0)";

  }

}


/* ============================================================
   RESIZE
   ============================================================ */

function resizeAll() {

  const dpr =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );


  /*
     Main Itachi canvas.
  */

  mainCanvas.width =
    window.innerWidth * dpr;

  mainCanvas.height =
    window.innerHeight * dpr;


  /*
     Eye canvas.
  */

  eyeCanvas.width =
    window.innerWidth * dpr;

  eyeCanvas.height =
    window.innerHeight * dpr;


  /*
     Effect canvases.
  */

  resizeFlameCanvas();

  resizeFeatherCanvas();


  /*
     Redraw current Itachi frame.
  */

  drawImageCover(
    mainCtx,
    mainCanvas,
    frames[currentFrame]
  );

}


window.addEventListener(
  "resize",
  resizeAll
);


/* ============================================================
   MAIN ANIMATION LOOP
   ============================================================ */

function animationLoop(
  time
) {

  /*
     Smooth Sharingan movement.
  */

  eyePosition +=
    (eyeTarget - eyePosition) *
    0.12;


  /*
     Automatic blink.
  */

  updateBlink(time);


  /*
     Draw eyes.
  */

  drawEyes();


  /*
     Black flames.
  */

  updateFlames();


  /*
     Feathers.
  */

  updateFeathers();


  /*
     Lightning.
  */

  updateLightning();


  /*
     Custom cursor.
  */

  updateCursor();


  requestAnimationFrame(
    animationLoop
  );

}


/* ============================================================
   START WEBSITE
   ============================================================ */

function startSite() {

  resizeAll();

  updateScroll();

  if (loader) {

    loader.classList.add(
      "hide"
    );

  }


  requestAnimationFrame(
    animationLoop
  );

}


/* ============================================================
   INITIAL SAFETY CHECK
   ============================================================ */

if (
  !scrubSection ||
  !mainCanvas ||
  !eyeCanvas ||
  !loader
) {

  console.error(
    "Itachi website: required HTML element is missing."
  );

}
```
