let fft;
let windSound, rainSound, thunderSound, insectSound, birdSound, bgm;
let raindrops = [];
let ripples = [];
let nextTriggerTime = 0;

let rainAlpha = 0; let thunderAlpha = 0; let insectAlpha = 0; let birdAlpha = 0; let rainbowAlpha = 0;
let birdX = -100; let insectAngle = 0; let rainbowTimer = 0;

let clouds = [
  { x: -200, y: 120, size: 0.9, speed: 0.4 },
  { x: -500, y: 180, size: 0.7, speed: 0.3 },
  { x: -800, y: 100, size: 1.1, speed: 0.5 },
  { x: -1100, y: 150, size: 0.8, speed: 0.35 },
  { x: -1400, y: 130, size: 0.6, speed: 0.25 }
];

function preloadAudio() {
  windSound = loadSound("asset/wind.mp3");
  rainSound = loadSound("asset/rain.mp3");
  thunderSound = loadSound("asset/thunder.mp3");
  insectSound = loadSound("asset/insect.mp3");
  birdSound = loadSound("asset/bird.mp3");
  bgm = loadSound("asset/keshi - magnolia.mp3");
}

function setupAudio() {
  fft = new p5.FFT(0.8, 1024);
  windSound.connect(fft);
  rainSound.connect(fft);
  thunderSound.connect(fft);
  insectSound.connect(fft);
  birdSound.connect(fft);
  bgm.connect(fft);

  // 用户点击网页时激活音频（现代浏览器安全策略要求）
  userStartAudio().then(() => {
    if (!bgm.isPlaying()) bgm.loop();
  });
}

// 声音随机触发
function randomSoundTrigger() {
  if (millis() > nextTriggerTime) {
    let sounds = [windSound, rainSound, thunderSound, insectSound, birdSound];
    let s = random(sounds);
    for (let snd of sounds) snd.stop();
    s.play();
    nextTriggerTime = millis() + random(6000, 12000);
  }
}

// 渲染层：草地背后的天气（云、彩虹、鸟、虫）
function drawWeatherEffectsBeforeGround() {
  fft.analyze();
  let windEnergy = fft.getEnergy(200, 800);
  let insectEnergy = fft.getEnergy(3000, 6000);
  let birdEnergy = fft.getEnergy(3000, 8000);

  drawClouds(windEnergy);

  let raining = rainSound.isPlaying();
  if (!raining && rainbowTimer === 0) rainbowTimer = millis();
  if (rainbowTimer > 0 && millis() - rainbowTimer < 5000) {
    rainbowAlpha = lerp(rainbowAlpha, 180, 0.02);
  } else {
    rainbowAlpha = lerp(rainbowAlpha, 0, 0.02);
  }
  drawRainbow();

  insectAlpha = lerp(insectAlpha, insectSound.isPlaying() ? 255 : 0, 0.05);
  drawInsects(insectEnergy);

  birdAlpha = lerp(birdAlpha, birdSound.isPlaying() ? 255 : 0, 0.05);
  drawBird(birdEnergy);
}

// 渲染层：草地前方的天气（雨、闪电雷击遮罩）
function drawWeatherEffectsAfterGround() {
  let rainEnergy = fft.getEnergy(500, 2000);
  let thunderEnergy = fft.getEnergy(20, 200);

  let raining = rainSound.isPlaying();
  rainAlpha = lerp(rainAlpha, raining ? 255 : 0, 0.05);
  drawRain(rainEnergy);

  thunderAlpha = lerp(thunderAlpha, thunderSound.isPlaying() ? 255 : 0, 0.1);
  drawLightning(thunderEnergy);
}

// === 以下为原渲染细节，保持不变 ===
function drawClouds(windEnergy) {
  let windBoost = map(windEnergy, 0, 255, 0.2, 2.0);
  for (let c of clouds) {
    c.x += c.speed * windBoost;
    if (c.x > width + 200) c.x = -300;
    let floatY = sin(frameCount * 0.01 + c.x * 0.01) * 4;
    push(); translate(c.x, c.y + floatY); scale(c.size);
    let g = drawingContext.createLinearGradient(-80, -40, 80, 40);
    g.addColorStop(0, "rgba(255,255,255,0.95)"); g.addColorStop(1, "rgba(200,220,255,0.75)");
    drawingContext.fillStyle = g; noStroke();
    ellipse(0, 0, 160, 80); ellipse(-50, 15, 120, 60); ellipse(50, 10, 110, 65);
    pop();
  }
}

function drawBird(energy) {
  if (birdAlpha < 1) return;
  birdX += 1.2; if (birdX > width + 100) birdX = -100;
  let floatY = sin(frameCount * 0.04) * 12 + sin(frameCount * 0.015) * 8;
  push(); translate(birdX, height * 0.25 + floatY); noStroke(); fill(255, 230, 250, birdAlpha); ellipse(0, 0, 35, 25);
  let wingOffset = sin(frameCount * 0.3) * 5; fill(255, 180, 240, birdAlpha * 0.8); ellipse(-12, -6 + wingOffset, 20, 12); ellipse(-12, 6 - wingOffset, 20, 12); pop();
}

function drawInsects(energy) {
  if (insectAlpha < 1) return;
  insectAngle += 0.025;
  let x = width * 0.6 + sin(insectAngle * 1.5) * 30; let y = height * 0.6 + cos(insectAngle * 1.2) * 20;
  let flutter = sin(frameCount * 0.4) * 3;
  push(); translate(x, y + flutter); noStroke(); fill(255, 230, 180, insectAlpha); ellipse(0, 0, 12, 8); fill(255, 200, 240, insectAlpha * 0.7); ellipse(-6, -6, 15, 10); ellipse(6, -6, 15, 10); pop();
}

function drawRain(energy) {
  if (rainAlpha < 1) return;
  let amount = map(energy, 0, 255, 0, 0.8);
  for (let i = 0; i < amount; i++) { raindrops.push({ x: random(width), y: random(-20, 0), speed: random(3, 5) }); }
  push(); stroke(180, 200, 255, rainAlpha);
  for (let drop of raindrops) { point(drop.x, drop.y); drop.y += drop.speed; if (drop.y > height) { ripples.push({ x: drop.x, y: height, r: 0, alpha: 80 }); } }
  pop();
  raindrops = raindrops.filter(d => d.y < height);
  drawRipples();
}

function drawRipples() {
  push(); noFill();
  for (let r of ripples) { stroke(180, 200, 255, r.alpha); ellipse(r.x, r.y, r.r); r.r += 0.5; r.alpha -= 1; }
  pop();
  ripples = ripples.filter(r => r.alpha > 0);
}

function drawRainbow() {
  if (rainbowAlpha < 1) return;
  push(); translate(width * 0.5, height * 0.85); noFill(); strokeWeight(6);
  let colors = ["rgba(255,120,120,0.18)", "rgba(255,180,120,0.18)", "rgba(255,255,120,0.18)", "rgba(120,255,120,0.18)", "rgba(120,180,255,0.18)", "rgba(180,120,255,0.18)"];
  for (let i = 0; i < colors.length; i++) { stroke(colors[i]); arc(0, 0, 900 + i * 10, 450 + i * 10, PI, TWO_PI); }
  pop();
}

function drawLightning(energy) {
  if (thunderAlpha < 1) return;
  let flash = map(energy, 0, 255, 0, 100);
  push(); fill(255, 255, 255, flash * (thunderAlpha / 255)); rect(0, 0, width, height); pop();
}