let seasons = ["spring", "summer", "autumn", "winter"];
let seasonIndex = 0;

// =====================================================
// TIMING
// =====================================================

let dayDuration = 20000;        // 20s daytime
let sunsetTransition = 2000;   // 2s sunset

let nightDuration = 15000;     // 15s night
let sunriseTransition = 2000;  // 2s sunrise

let cycleStart;

// =====================================================
// OBJECTS
// =====================================================

let leaves = [];
let snowflakes = [];
let stars = [];
let meteors = [];

// Global transition amount
let transitionAmount = 0;

function setup() {

  createCanvas(windowWidth, windowHeight);

  cycleStart = millis();

  // Leaves
  for (let i = 0; i < 40; i++) {

    leaves.push(createLeaf());
  }

  // Snow
  for (let i = 0; i < 80; i++) {

    snowflakes.push(createSnowflake());
  }

  // Stars
  for (let i = 0; i < 200; i++) {

    stars.push({
      x: random(width),
      y: random(height * 0.75),
      size: random(1, 3)
    });
  }

  // Only 1 meteor
  meteors.push(createMeteor());
}

function draw() {

  let elapsed = millis() - cycleStart;

  let totalCycle =
    dayDuration +
    sunsetTransition +
    nightDuration +
    sunriseTransition;

  // Restart cycle
  if (elapsed > totalCycle) {

    cycleStart = millis();

    seasonIndex =
      (seasonIndex + 1) % seasons.length;

    elapsed = 0;
  }

  // =====================================================
  // DAY
  // =====================================================

  if (elapsed < dayDuration) {

    transitionAmount = 0;
  }

  // =====================================================
  // SUNSET
  // =====================================================

  else if (
    elapsed <
    dayDuration + sunsetTransition
  ) {

    transitionAmount = map(
      elapsed,
      dayDuration,
      dayDuration + sunsetTransition,
      0,
      1
    );
  }

  // =====================================================
  // NIGHT
  // =====================================================

  else if (
    elapsed <
    dayDuration +
      sunsetTransition +
      nightDuration
  ) {

    transitionAmount = 1;
  }

  // =====================================================
  // SUNRISE
  // =====================================================

  else {

    transitionAmount = map(
      elapsed,
      dayDuration +
        sunsetTransition +
        nightDuration,
      totalCycle,
      1,
      0
    );
  }

  // =====================================================
  // DRAW ENVIRONMENT
  // =====================================================

  drawSky(transitionAmount);

  // Stars
  if (transitionAmount > 0) {

    drawStars(transitionAmount);

    drawMeteor(transitionAmount);
  }

  // Leaves and snow only during daytime
  if (transitionAmount < 1) {

    if (seasons[seasonIndex] === "autumn") {

      drawLeaves();
    }

    if (seasons[seasonIndex] === "winter") {

      drawSnowflakes();
    }
  }

  // Ground LAST
  drawGround(transitionAmount);
}

// =====================================================
// SKY
// =====================================================

function drawSky(t) {

  let season = seasons[seasonIndex];

  let dayTop;
  let dayBottom;

  // Spring
  if (season === "spring") {

    dayTop = color(135, 206, 235);
    dayBottom = color(255, 200, 220);
  }

  // Summer
  if (season === "summer") {

    dayTop = color(80, 180, 255);
    dayBottom = color(255, 240, 150);
  }

  // Autumn
  if (season === "autumn") {

    dayTop = color(255, 170, 100);
    dayBottom = color(255, 220, 180);
  }

  // Winter
  if (season === "winter") {

    dayTop = color(180, 220, 255);
    dayBottom = color(230, 240, 255);
  }

  // Night sky
  let nightTop = color(0);
  let nightBottom = color(0);

  // Smooth transition
  let topColor =
    lerpColor(dayTop, nightTop, t);

  let bottomColor =
    lerpColor(dayBottom, nightBottom, t);

  // Gradient sky
  for (let y = 0; y < height; y++) {

    let inter = map(
      y,
      0,
      height,
      0,
      1
    );

    let c = lerpColor(
      topColor,
      bottomColor,
      inter
    );

    stroke(c);

    line(0, y, width, y);
  }
}

// =====================================================
// GROUND
// =====================================================

function drawGround(t) {

  let season = seasons[seasonIndex];

  let grassColor;

  // Spring
  if (season === "spring") {

    grassColor = color(120, 220, 120);
  }

  // Summer
  if (season === "summer") {

    grassColor = color(80, 200, 90);
  }

  // Autumn
  if (season === "autumn") {

    grassColor = color(170, 140, 70);
  }

  // Winter
  if (season === "winter") {

    grassColor = color(230);
  }

  // Fade to black at night
  let nightGrass = color(0);

  grassColor =
    lerpColor(
      grassColor,
      nightGrass,
      t
    );

  noStroke();

  fill(grassColor);

  rect(
    0,
    height * 0.75,
    width,
    height * 0.25
  );
}

// =====================================================
// LEAVES
// =====================================================

function createLeaf() {

  return {

    x: random(width),

    y: random(-height, height),

    speed: random(1, 3),

    drift: random(-1, 1),

    size: random(8, 15)
  };
}

function drawLeaves() {

  fill(255, 120, 50);

  noStroke();

  for (let leaf of leaves) {

    ellipse(
      leaf.x,
      leaf.y,
      leaf.size
    );

    leaf.y += leaf.speed;

    leaf.x += leaf.drift;

    if (leaf.y > height) {

      leaf.y = random(-100, 0);

      leaf.x = random(width);
    }
  }
}

// =====================================================
// SNOW
// =====================================================

function createSnowflake() {

  return {

    x: random(width),

    y: random(-height, height),

    speed: random(1, 2),

    size: random(2, 6)
  };
}

function drawSnowflakes() {

  fill(255);

  noStroke();

  for (let s of snowflakes) {

    ellipse(
      s.x,
      s.y,
      s.size
    );

    s.y += s.speed;

    if (s.y > height) {

      s.y = random(-100, 0);

      s.x = random(width);
    }
  }
}

// =====================================================
// STARS
// =====================================================

function drawStars(t) {

  noStroke();

  for (let star of stars) {

    let twinkle =
      random(100, 255);

    fill(
      255,
      twinkle * t
    );

    ellipse(
      star.x,
      star.y,
      star.size
    );
  }
}

// =====================================================
// METEOR
// =====================================================

function createMeteor() {

  return {

    x: random(-500, width),

    y: random(0, height / 2),

    speedX: random(8, 14),

    speedY: random(4, 7),

    length: random(80, 140)
  };
}

function drawMeteor(t) {

  let m = meteors[0];

  stroke(
    255,
    255 * t
  );

  strokeWeight(2);

  line(
    m.x,
    m.y,
    m.x - m.length,
    m.y - m.length * 0.5
  );

  m.x += m.speedX;

  m.y += m.speedY;

  // Reset meteor
  if (
    m.x > width + 200 ||
    m.y > height + 200
  ) {

    m.x = random(-300, -100);

    m.y = random(0, height / 2);
  }
}

// =====================================================
// WINDOW RESIZE
// =====================================================

function windowResized() {

  resizeCanvas(
    windowWidth,
    windowHeight
  );
}