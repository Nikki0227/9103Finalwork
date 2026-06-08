let seasons = ["spring", "summer", "autumn", "winter"];
let seasonIndex = 0;

// TIMING (5秒过渡)
let dayDuration = 20000;         // 白天：20秒
let sunsetTransition = 5000;     // 黄昏过渡：5秒
let nightDuration = 15000;       // 黑夜总长：15秒
let sunriseTransition = 5000;    // 黎明过渡：5秒
let seasonChangeDelayInNight = 7000; 

let cycleStart;
let seasonChanged = false; 

// OBJECTS
let leaves = [];
let snowflakes = [];
let stars = [];
let meteor;

function preload() {
  // 接入音频预加载
  preloadAudio();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  cycleStart = millis();

  // 初始化时间轴元素
  for (let i = 0; i < 40; i++) leaves.push(createLeaf());
  for (let i = 0; i < 80; i++) snowflakes.push(createSnowflake());
  for (let i = 0; i < 200; i++) {
    stars.push({ x: random(width), y: random(height * 0.75), size: random(1, 3) });
  }
  meteor = createMeteor();

  // 调用其他文件的初始化
  setupInput();
  setupAudio();
}

function draw() {
  let elapsed = millis() - cycleStart;
  let totalCycle = dayDuration + sunsetTransition + nightDuration + sunriseTransition;

  // 检查是否到达黑夜的第 7 秒切换季节
  let triggerTime = dayDuration + sunsetTransition + seasonChangeDelayInNight;
  if (elapsed >= triggerTime && !seasonChanged) {
    seasonIndex = (seasonIndex + 1) % seasons.length;
    seasonChanged = true; 
  }

  if (elapsed > totalCycle) {
    cycleStart = millis();
    elapsed = 0;
    seasonChanged = false; 
  }

  // 计算过渡值
  let transitionAmount = 0;
  if (elapsed < dayDuration) {
    transitionAmount = 0;
  } else if (elapsed < dayDuration + sunsetTransition) {
    transitionAmount = map(elapsed, dayDuration, dayDuration + sunsetTransition, 0, 1);
  } else if (elapsed < dayDuration + sunsetTransition + nightDuration) {
    transitionAmount = 1;
  } else {
    transitionAmount = map(elapsed, dayDuration + sunsetTransition + nightDuration, totalCycle, 1, 0);
  }

  // --- 【图层渲染顺序】 ---
  
  // 1. 天空背景
  drawSky(transitionAmount);

  // 2. 星空与流星（夜间）
  if (transitionAmount > 0) {
    drawStars(transitionAmount);
    drawMeteor(transitionAmount);
  }

  // 3. 太阳和月亮轨迹
  drawSunMoon(elapsed, totalCycle);

  // 4. 天气特效 - 云朵、鸟、虫、彩虹（来自 audiobase）
  drawWeatherEffectsBeforeGround();

  // 5. 地面
  drawGround(transitionAmount);

  // 6. 交互花朵（来自 userinput，种在地面上）
  drawFlowers();

  // 7. 天气特效 - 下雨、打雷（来自 audiobase，需盖在植物和地面上方）
  drawWeatherEffectsAfterGround();

  // 8. 季节特效（落叶/下雪）
  if (transitionAmount < 1) {
    if (seasons[seasonIndex] === "autumn") drawLeaves();
    if (seasons[seasonIndex] === "winter") drawSnowflakes();
  }

  // 9. 最后的字幕层
  updateSubtitles();

  // 10. 音频随机触发器
  randomSoundTrigger();
}

// === 以下为原 timebase.js 的独立绘制函数，保持不便 ===
function drawSunMoon(elapsed, totalCycle) {
  let cx = width / 2; let cy = height * 0.75; 
  let radiusX = width * 0.45; let radiusY = height * 0.45; 
  let dayEnd = dayDuration; let sunsetEnd = dayDuration + sunsetTransition;

  if (elapsed < sunsetEnd) {
    let sunAngle = map(elapsed, 0, sunsetEnd, PI, 0);
    let sunX = cx + cos(sunAngle) * radiusX; let sunY = cy - sin(sunAngle) * radiusY; 
    noStroke(); fill(255, 220, 80); ellipse(sunX, sunY, 60);
  }
  if (elapsed >= dayEnd) {
    let moonAngle = map(elapsed, dayEnd, totalCycle, PI, 0);
    let moonX = cx + cos(moonAngle) * radiusX; let moonY = cy - sin(moonAngle) * radiusY; 
    noStroke(); fill(220); ellipse(moonX, moonY, 50);
  }
}

function drawSky(t) {
  let season = seasons[seasonIndex];
  let dayTop, dayBottom;
  if (season === "spring") { dayTop = color(135, 206, 235); dayBottom = color(255, 200, 220); }
  if (season === "summer") { dayTop = color(80, 180, 255); dayBottom = color(255, 240, 150); }
  if (season === "autumn") { dayTop = color(255, 170, 100); dayBottom = color(255, 220, 180); }
  if (season === "winter") { dayTop = color(180, 220, 255); dayBottom = color(230, 240, 255); }

  let nightTop = color(10, 15, 30); let nightBottom = color(25, 30, 50);
  let topColor = lerpColor(dayTop, nightTop, t);
  let bottomColor = lerpColor(dayBottom, nightBottom, t);

  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(topColor, bottomColor, inter);
    stroke(c); line(0, y, width, y);
  }
}

function drawGround(t) {
  let season = seasons[seasonIndex];
  let grass;
  if (season === "spring") grass = color(120, 220, 120);
  if (season === "summer") grass = color(80, 200, 90);
  if (season === "autumn") grass = color(170, 140, 70);
  if (season === "winter") grass = color(230);

  let night = color(15, 25, 15); 
  grass = lerpColor(grass, night, t);
  noStroke(); fill(grass); rect(0, height * 0.75, width, height * 0.25);
}

function drawStars(t) {
  noStroke();
  for (let s of stars) {
    let a = random(100, 255);
    fill(255, a * t); ellipse(s.x, s.y, s.size);
  }
}

function createMeteor() {
  return { x: random(-300, width), y: random(0, height / 2), vx: random(8, 14), vy: random(4, 7), len: random(80, 140) };
}

function drawMeteor(t) {
  let m = meteor; stroke(255, 255 * t); strokeWeight(2);
  line(m.x, m.y, m.x - m.len, m.y - m.len * 0.5);
  m.x += m.vx; m.y += m.vy;
  if (m.x > width + 200 || m.y > height + 200) { m.x = random(-300, -100); m.y = random(0, height / 2); }
}

function createLeaf() { return { x: random(width), y: random(-height, height), speed: random(1, 3), drift: random(-1, 1), size: random(8, 15) }; }
function drawLeaves() {
  fill(255, 120, 50); noStroke();
  for (let l of leaves) {
    ellipse(l.x, l.y, l.size); l.y += l.speed; l.x += l.drift;
    if (l.y > height) { l.y = random(-100, 0); l.x = random(width); }
  }
}

function createSnowflake() { return { x: random(width), y: random(-height, height), speed: random(1, 2), size: random(2, 6) }; }
function drawSnowflakes() {
  fill(255); noStroke();
  for (let s of snowflakes) {
    ellipse(s.x, s.y, s.size); s.y += s.speed;
    if (s.y > height) { s.y = random(-100, 0); s.x = random(width); }
  }
}

function windowResized() { resizeCanvas(windowWidth, windowHeight); }