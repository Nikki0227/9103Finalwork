// ==================== Globals ====================
let fft;
// This code was generated with help from Codex to detect loud thunder peaks.
let thunderAmplitude;

let windSound, rainSound, thunderSound, insectSound, birdSound, bgm;

let soundInteraction;

// ==================== Configuration ====================
const CONFIG = {
  cloud: { count: 5, baseSpeed: 0.3, fastSpeed: 1.5 },
  bird: { maxCount: 8 },
  insect: { maxCount: 6 },
  rain: { maxCount: 200 },
  audio: {
    minGap: 1600,
    maxGap: 4200,
    fade: 1400,
    birdSpawnGap: 1200,
    insectSpawnGap: 1000,
    // These settings were generated with help from Codex to tune thunder-triggered lightning.
    thunderPeakThreshold: 0.12,
    thunderPeakRise: 1.18,
    thunderLightningGap: 280
  },
  colors: {
    cloud: [176, 218, 255, 180],
    bird: [
      [255, 183, 77],
      [255, 138, 101],
      [255, 218, 121],
      [135, 206, 250],
      [186, 135, 255],
      [120, 220, 190],
      [255, 145, 190]
    ],
    bee: [255, 193, 7],
    butterfly: [
      { main: [255, 105, 180], accent: [255, 215, 120], spot: [255, 255, 255] },
      { main: [138, 90, 226], accent: [96, 210, 255], spot: [255, 240, 170] },
      { main: [255, 140, 90], accent: [255, 232, 120], spot: [255, 255, 255] },
      { main: [80, 205, 185], accent: [255, 120, 180], spot: [255, 250, 210] }
    ],
    rain: [100, 149, 237, 150]
  },
  rainbow: {
    delay: 3000,
    duration: 5000,
    fade: 1200
  }
};

// ==================== Utilities ====================
function smoothLevel(value) {
  let x = constrain(value, 0, 1);
  return x * x * (3 - 2 * x);
}

function playSound(sound, volume = 0.75) {
  if (!sound || !sound.isLoaded()) return;

  sound.playMode("sustain");
  sound.setVolume(volume);
  sound.play();
}

// This code was generated with help from Codex to loop bgm.mp3 as background music.
function startBackgroundMusic() {
  if (!bgm || !bgm.isLoaded() || bgm.isPlaying()) return;

  bgm.setVolume(0.35);
  bgm.loop();
}

// ==================== Clouds ====================
class Cloud {
  constructor() {
    this.reset();
    this.x = random(-200, width + 200);
    this.speed = CONFIG.cloud.baseSpeed;
    this.targetSpeed = CONFIG.cloud.baseSpeed;
  }

  reset() {
    this.x = -200;
    this.y = random(50, height * 0.4);
    this.size = random(80, 150);
    this.puffs = [];

    let puffCount = floor(random(4, 7));
    for (let i = 0; i < puffCount; i++) {
      this.puffs.push({
        offsetX: random(-this.size * 0.4, this.size * 0.4),
        offsetY: random(-this.size * 0.15, this.size * 0.15),
        size: random(this.size * 0.4, this.size * 0.7)
      });
    }
  }

  setSpeed(fast) {
    this.targetSpeed = fast ? CONFIG.cloud.fastSpeed : CONFIG.cloud.baseSpeed;
  }

  setWindLevel(level) {
    this.targetSpeed = lerp(CONFIG.cloud.baseSpeed, CONFIG.cloud.fastSpeed, level);
  }

  update() {
    this.speed = lerp(this.speed, this.targetSpeed, 0.035);
    this.x += this.speed;
    if (this.x > width + 200) this.reset();
  }

  display() {
    noStroke();
    let c = CONFIG.colors.cloud;

    for (let puff of this.puffs) {
      for (let i = 3; i > 0; i--) {
        fill(c[0], c[1], c[2], c[3] / i);
        ellipse(
          this.x + puff.offsetX,
          this.y + puff.offsetY,
          puff.size * (1 + i * 0.1),
          puff.size * (0.7 + i * 0.1)
        );
      }
    }
  }
}

// ==================== Birds ====================
class Bird {
  constructor() {
    this.reset();
  }

  reset() {
    this.size = random(25, 40);
    this.x = random() > 0.5 ? -50 : width + 50;
    this.direction = this.x < 0 ? 1 : -1;
    this.y = random(80, height * 0.5);
    this.targetY = this.y;
    this.speed = random(2, 4);
    this.wingAngle = 0;
    this.wingSpeed = random(0.15, 0.25);
    this.color = random() > 0.45 ? random(CONFIG.colors.bird) : [
      random(120, 255),
      random(120, 230),
      random(80, 255)
    ];
    this.active = true;
  }

  update() {
    this.x += this.speed * this.direction;
    this.wingAngle += this.wingSpeed;

    this.targetY += sin(frameCount * 0.02 + this.x * 0.01) * 0.5;
    this.y = lerp(this.y, this.targetY, 0.05);

    if ((this.direction > 0 && this.x > width + 50) ||
        (this.direction < 0 && this.x < -50)) {
      this.active = false;
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.direction, 1);
    noStroke();

    fill(this.color[0], this.color[1], this.color[2], 235);
    ellipse(0, 0, this.size, this.size * 0.6);

    fill(this.color[0] * 0.9, this.color[1] * 0.9, this.color[2] * 0.9, 240);
    ellipse(this.size * 0.35, -this.size * 0.1, this.size * 0.4, this.size * 0.35);

    fill(255);
    ellipse(this.size * 0.4, -this.size * 0.15, this.size * 0.12, this.size * 0.12);
    fill(40);
    ellipse(this.size * 0.42, -this.size * 0.15, this.size * 0.06, this.size * 0.06);

    fill(255, 165, 0);
    beginShape();
    vertex(this.size * 0.5, -this.size * 0.1);
    vertex(this.size * 0.72, -this.size * 0.05);
    vertex(this.size * 0.5, 0);
    endShape(CLOSE);

    let wingY = sin(this.wingAngle) * this.size * 0.3;
    fill(this.color[0] * 0.85, this.color[1] * 0.85, this.color[2] * 0.85, 225);
    beginShape();
    vertex(-this.size * 0.1, 0);
    vertex(-this.size * 0.3, -this.size * 0.5 + wingY);
    vertex(-this.size * 0.55, -this.size * 0.38 + wingY);
    vertex(-this.size * 0.42, -this.size * 0.08 + wingY);
    vertex(-this.size * 0.1, -this.size * 0.05);
    endShape(CLOSE);

    fill(this.color[0] * 0.8, this.color[1] * 0.8, this.color[2] * 0.8, 225);
    beginShape();
    vertex(-this.size * 0.4, 0);
    vertex(-this.size * 0.7, -this.size * 0.15);
    vertex(-this.size * 0.65, 0);
    vertex(-this.size * 0.7, this.size * 0.15);
    endShape(CLOSE);

    pop();
  }
}

// ==================== Bees ====================
class Bee {
  constructor() {
    this.reset();
  }

  reset() {
    this.size = random(20, 30);
    this.direction = random() > 0.5 ? 1 : -1;
    this.x = this.direction > 0 ? -30 : width + 30;
    this.y = random(100, height * 0.6);
    this.speed = random(1.5, 3);
    this.wingAngle = 0;
    this.wingSpeed = 0.4;
    this.wobble = random(1000);
    this.active = true;
  }

  update() {
    this.x += this.speed * this.direction;
    this.wingAngle += this.wingSpeed;
    this.y += sin(frameCount * 0.05 + this.wobble) * 1.5;

    if ((this.direction > 0 && this.x > width + 30) ||
        (this.direction < 0 && this.x < -30)) {
      this.active = false;
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.direction, 1);
    noStroke();

    let wingFlap = sin(this.wingAngle) * 0.5;
    fill(255, 255, 255, 150);

    push();
    rotate(-0.3 + wingFlap);
    ellipse(0, -this.size * 0.4, this.size * 0.6, this.size * 0.35);
    pop();

    push();
    rotate(0.3 - wingFlap);
    ellipse(0, this.size * 0.4, this.size * 0.6, this.size * 0.35);
    pop();

    let bodyColor = CONFIG.colors.bee;
    for (let i = 0; i < 4; i++) {
      fill(i % 2 === 0 ? bodyColor : [30, 30, 30]);
      ellipse(
        -this.size * 0.15 + i * this.size * 0.12,
        0,
        this.size * 0.25,
        this.size * 0.35
      );
    }

    fill(bodyColor);
    ellipse(this.size * 0.35, 0, this.size * 0.3, this.size * 0.3);

    fill(0);
    ellipse(this.size * 0.4, -this.size * 0.05, this.size * 0.08, this.size * 0.08);
    ellipse(this.size * 0.4, this.size * 0.05, this.size * 0.08, this.size * 0.08);

    pop();
  }
}

// ==================== Butterflies ====================
class Butterfly {
  constructor() {
    this.reset();
  }

  reset() {
    this.size = random(34, 56);
    this.direction = random() > 0.5 ? 1 : -1;
    this.x = this.direction > 0 ? -40 : width + 40;
    this.y = random(100, height * 0.62);
    this.baseY = this.y;
    this.speed = random(1, 2.4);
    this.wingAngle = random(TWO_PI);
    this.wingSpeed = random(0.16, 0.24);
    this.palette = random(CONFIG.colors.butterfly);
    this.wobble = random(1000);
    this.tilt = 0;
    this.active = true;
  }

  update() {
    this.x += this.speed * this.direction;
    this.wingAngle += this.wingSpeed;
    this.baseY += sin(frameCount * 0.018 + this.wobble) * 0.15;
    this.y = this.baseY + sin(frameCount * 0.05 + this.wobble) * 12;
    this.tilt = sin(frameCount * 0.04 + this.wobble) * 0.14;

    if ((this.direction > 0 && this.x > width + 45) ||
        (this.direction < 0 && this.x < -45)) {
      this.active = false;
    }
  }

  sideWing(layer, flap) {
    let s = this.size;
    let main = this.palette.main;
    let accent = this.palette.accent;
    let spot = this.palette.spot;
    let depth = layer === "back" ? 0.72 : 1;
    let alpha = layer === "back" ? 95 : 185;

    push();
    translate(-s * 0.08, layer === "back" ? s * 0.03 : -s * 0.02);
    rotate(-0.18 + flap * 0.5);
    scale(depth, map(cos(this.wingAngle * 8), -1, 1, 0.55, 1.08));

    fill(main[0], main[1], main[2], alpha);
    beginShape();
    vertex(0, 0);
    bezierVertex(-s * 0.16, -s * 0.34, s * 0.1, -s * 0.72, s * 0.42, -s * 0.54);
    bezierVertex(s * 0.78, -s * 0.34, s * 0.72, s * 0.08, s * 0.22, s * 0.16);
    bezierVertex(s * 0.02, s * 0.2, -s * 0.08, s * 0.1, 0, 0);
    endShape(CLOSE);

    fill(accent[0], accent[1], accent[2], alpha * 0.65);
    beginShape();
    vertex(s * 0.08, -s * 0.02);
    bezierVertex(s * 0.18, -s * 0.28, s * 0.42, -s * 0.42, s * 0.58, -s * 0.22);
    bezierVertex(s * 0.42, -s * 0.08, s * 0.28, s * 0.02, s * 0.08, -s * 0.02);
    endShape(CLOSE);

    fill(spot[0], spot[1], spot[2], alpha * 0.72);
    ellipse(s * 0.42, -s * 0.3, s * 0.1, s * 0.07);
    ellipse(s * 0.56, -s * 0.14, s * 0.08, s * 0.055);

    stroke(255, 255, 255, alpha * 0.22);
    strokeWeight(1);
    line(0, 0, s * 0.54, -s * 0.22);
    line(s * 0.08, -s * 0.04, s * 0.38, -s * 0.42);
    noStroke();

    pop();
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.direction, 1);
    rotate(this.tilt);
    noStroke();

    let flap = map(sin(this.wingAngle * 8), -1, 1, -0.45, 0.55);
    this.sideWing("back", flap * 0.8);
    this.sideWing("front", flap);

    fill(64, 47, 45, 225);
    ellipse(this.size * 0.02, 0, this.size * 0.22, this.size * 0.065);
    ellipse(this.size * 0.16, -this.size * 0.005, this.size * 0.065, this.size * 0.06);

    stroke(64, 47, 45, 210);
    strokeWeight(1);
    noFill();
    beginShape();
    vertex(this.size * 0.19, -this.size * 0.01);
    quadraticVertex(this.size * 0.32, -this.size * 0.12, this.size * 0.43, -this.size * 0.05);
    endShape();
    beginShape();
    vertex(this.size * 0.19, this.size * 0.01);
    quadraticVertex(this.size * 0.32, this.size * 0.12, this.size * 0.43, this.size * 0.05);
    endShape();

    fill(64, 47, 45, 220);
    noStroke();
    ellipse(this.size * 0.43, -this.size * 0.05, this.size * 0.022, this.size * 0.022);
    ellipse(this.size * 0.43, this.size * 0.05, this.size * 0.022, this.size * 0.022);

    pop();
  }
}

// ==================== Raindrops ====================
class Raindrop {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(width);
    this.y = random(-100, -10);
    this.speed = random(6, 12);
    this.length = random(15, 30);
    this.thickness = random(1, 2.5);
    this.active = true;
  }

  update() {
    this.y += this.speed;
    this.x += random(-0.5, 0.5);
    if (this.y > height + 8) {
      let splash = { x: this.x, y: height - random(8, 18) };
      this.reset();
      return splash;
    }
    return null;
  }

  display() {
    noStroke();
    let c = CONFIG.colors.rain;

    for (let i = 0; i < this.length; i++) {
      let alpha = map(i, 0, this.length, c[3], c[3] * 0.3);
      fill(c[0], c[1], c[2], alpha);
      ellipse(this.x, this.y - i, this.thickness, this.thickness * 1.5);
    }
  }
}

// ==================== Rain Ripples ====================
class Ripple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.age = 0;
    this.life = random(28, 44);
    this.maxWidth = random(26, 54);
    this.maxHeight = random(5, 10);
  }

  update() {
    this.age++;
  }

  get active() {
    return this.age < this.life;
  }

  display() {
    let progress = this.age / this.life;
    let alpha = 120 * (1 - progress);

    noFill();
    stroke(120, 180, 255, alpha);
    strokeWeight(1);
    ellipse(
      this.x,
      this.y,
      this.maxWidth * progress,
      this.maxHeight * progress
    );
  }
}

// ==================== Rainbow ====================
class Rainbow {
  constructor() {
    this.colors = [
      [255, 92, 92],
      [255, 164, 74],
      [255, 231, 92],
      [118, 220, 113],
      [92, 182, 255],
      [128, 116, 255],
      [190, 116, 255]
    ];
  }

  display(startTime, alphaScale = 1) {
    if (!startTime) return;

    let elapsed = millis() - startTime - CONFIG.rainbow.delay;
    if (elapsed < 0 || elapsed > CONFIG.rainbow.duration) return;

    let fadeIn = constrain(elapsed / CONFIG.rainbow.fade, 0, 1);
    let fadeOut = constrain((CONFIG.rainbow.duration - elapsed) / CONFIG.rainbow.fade, 0, 1);
    let alpha = 48 * min(fadeIn, fadeOut) * alphaScale;

    push();
    noFill();
    strokeCap(ROUND);

    let centerX = width * 0.5;
    let centerY = height * 0.78;
    let base = width * 1.08;

    for (let i = 0; i < this.colors.length; i++) {
      let c = this.colors[i];
      stroke(c[0], c[1], c[2], alpha);
      strokeWeight(max(8, width * 0.009));
      arc(centerX, centerY, base + i * 22, base * 0.52 + i * 12, PI + 0.04, TWO_PI - 0.04);
    }

    pop();
  }
}

// ==================== Lightning ====================
class Lightning {
  constructor() {
    this.active = false;
    this.duration = 0;
    this.maxDuration = 18;
    this.branches = [];
  }

  trigger() {
    this.active = true;
    this.duration = 0;
    this.generateBranches();
  }

  generateBranches() {
    this.branches = [];
    let startX = random(width * 0.2, width * 0.8);
    let y = 0;

    while (y < height * 0.7) {
      let nextY = y + random(20, 50);
      let nextX = startX + random(-30, 30);
      this.branches.push({ x1: startX, y1: y, x2: nextX, y2: nextY, isMain: true });

      if (random() > 0.6) {
        this.branches.push({
          x1: nextX,
          y1: nextY,
          x2: nextX + random(-50, 50),
          y2: nextY + random(30, 80),
          isMain: false
        });
      }

      startX = nextX;
      y = nextY;
    }
  }

  update() {
    if (this.active) {
      this.duration++;
      if (this.duration > this.maxDuration) this.active = false;
    }
  }

  display(alphaScale = 1) {
    if (!this.active) return;

    let alpha = map(this.duration, 0, this.maxDuration, 255, 0) * alphaScale;

    for (let branch of this.branches) {
      strokeWeight(branch.isMain ? 12 : 6);
      stroke(190, 210, 255, alpha * 0.42);
      line(branch.x1, branch.y1, branch.x2, branch.y2);

      strokeWeight(branch.isMain ? 4 : 2);
      stroke(255, 255, 255, alpha);
      line(branch.x1, branch.y1, branch.x2, branch.y2);
    }

    noStroke();
    fill(255, 255, 255, map(this.duration, 0, this.maxDuration, 105, 0) * alphaScale);
    rect(0, 0, width, height);
  }
}

// ==================== Main Controller ====================
class SoundInteractionController {
  constructor() {
    this.clouds = [];
    this.birds = [];
    this.bees = [];
    this.butterflies = [];
    this.raindrops = [];
    this.ripples = [];
    this.lightning = new Lightning();
    this.rainbow = new Rainbow();

    this.isRaining = false;
    this.isWindy = false;
    this.rainStartedAt = null;
    this.audioStarted = false;
    this.nextSoundAt = 0;
    this.audioEvents = [];
    this.effectLevels = { bird: 0, insect: 0, rain: 0, thunder: 0, wind: 0 };
    this.lastBirdSpawnAt = 0;
    this.lastInsectSpawnAt = 0;
    this.lastThunderLightningAt = 0;
    this.lastThunderLevel = 0;
    this.initialized = false;
  }

  init() {
    for (let i = 0; i < CONFIG.cloud.count; i++) {
      this.clouds.push(new Cloud());
    }
    this.initialized = true;
  }

  startAudioInteraction() {
    this.audioStarted = true;
    this.nextSoundAt = millis() + 200;
  }

  playRandomSound() {
    let options = [
      { type: "bird", sound: birdSound, volume: 0.65 },
      { type: "insect", sound: insectSound, volume: 0.7 },
      { type: "rain", sound: rainSound, volume: 0.55 },
      { type: "thunder", sound: thunderSound, volume: 0.65 },
      { type: "wind", sound: windSound, volume: 0.58 }
    ].filter(item => item.sound && item.sound.isLoaded());

    if (options.length === 0) return;

    let item = random(options);
    this.triggerSoundEvent(item.type, item.sound, item.volume);
  }

  triggerSoundEvent(type, sound, volume = 0.7) {
    if (!sound || !sound.isLoaded()) return;

    playSound(sound, volume);

    let duration = sound.duration();
    if (!duration || !isFinite(duration)) duration = 4;

    this.audioEvents.push({
      type,
      start: millis(),
      duration: duration * 1000,
      fade: min(CONFIG.audio.fade, duration * 500)
    });

    if (type === "bird") this.spawnBird();
    if (type === "insect") this.spawnInsect();
    if (type === "rain" && !this.rainStartedAt) this.rainStartedAt = millis();
    // This code was generated with help from Codex to reset thunder peak tracking.
    if (type === "thunder") {
      this.lastThunderLevel = 0;
      this.lastThunderLightningAt = 0;
    }
  }

  updateAudioScheduler() {
    if (!this.audioStarted) return;

    let now = millis();
    if (now >= this.nextSoundAt) {
      this.playRandomSound();
      this.nextSoundAt = now + random(CONFIG.audio.minGap, CONFIG.audio.maxGap);
    }
  }

  eventLevel(event, now) {
    let age = now - event.start;
    let remaining = event.duration - age;
    if (age < 0 || remaining <= 0) return 0;

    let fade = max(1, event.fade);
    return min(smoothLevel(age / fade), smoothLevel(remaining / fade));
  }

  updateEffectLevels() {
    let now = millis();
    let nextLevels = { bird: 0, insect: 0, rain: 0, thunder: 0, wind: 0 };

    for (let event of this.audioEvents) {
      nextLevels[event.type] = max(nextLevels[event.type], this.eventLevel(event, now));
    }

    this.effectLevels = nextLevels;
    this.audioEvents = this.audioEvents.filter(event => now - event.start < event.duration);
  }

  // This code was generated with help from Codex to trigger lightning from thunder audio peaks.
  updateThunderLightning() {
    if (!thunderAmplitude || !thunderSound || !thunderSound.isPlaying()) {
      this.lastThunderLevel = 0;
      return;
    }

    let now = millis();
    let level = thunderAmplitude.getLevel();
    let isStrongPeak = level > CONFIG.audio.thunderPeakThreshold;
    let isRisingPeak = level > max(this.lastThunderLevel * CONFIG.audio.thunderPeakRise, CONFIG.audio.thunderPeakThreshold);
    let hasCooledDown = now - this.lastThunderLightningAt > CONFIG.audio.thunderLightningGap;

    if (isStrongPeak && isRisingPeak && hasCooledDown) {
      this.lightning.trigger();
      this.lastThunderLightningAt = now;
    }

    this.lastThunderLevel = level;
  }

  spawnBird() {
    this.birds.push(new Bird());
    if (this.birds.length > CONFIG.bird.maxCount) {
      this.birds = this.birds.filter(b => b.active).slice(-CONFIG.bird.maxCount);
    }
  }

  spawnInsect() {
    if (random() > 0.5) {
      this.bees.push(new Bee());
      if (this.bees.length > CONFIG.insect.maxCount) {
        this.bees = this.bees.filter(b => b.active).slice(-CONFIG.insect.maxCount);
      }
    } else {
      this.butterflies.push(new Butterfly());
      if (this.butterflies.length > CONFIG.insect.maxCount) {
        this.butterflies = this.butterflies.filter(b => b.active).slice(-CONFIG.insect.maxCount);
      }
    }
  }

  onBirdSound() {
    this.spawnBird();
  }

  onInsectSound() {
    this.spawnInsect();
  }

  onRainStart() {
    this.isRaining = true;
    this.rainStartedAt = millis();
    if (this.raindrops.length === 0) {
      for (let i = 0; i < CONFIG.rain.maxCount; i++) {
        this.raindrops.push(new Raindrop());
      }
    }
  }

  onRainStop() {
    this.isRaining = false;
    this.rainStartedAt = null;
    this.raindrops = [];
    this.ripples = [];
  }

  onThunderSound() {
    this.lightning.trigger();
  }

  onWindStart() {
    this.isWindy = true;
    this.clouds.forEach(cloud => cloud.setSpeed(true));
  }

  onWindStop() {
    this.isWindy = false;
    this.clouds.forEach(cloud => cloud.setSpeed(false));
  }

  update() {
    if (!this.initialized) return;

    this.updateAudioScheduler();
    this.updateEffectLevels();
    this.updateThunderLightning();

    let now = millis();
    let birdLevel = this.effectLevels.bird;
    let insectLevel = this.effectLevels.insect;
    let rainLevel = this.effectLevels.rain;
    let windLevel = this.effectLevels.wind;

    this.isRaining = rainLevel > 0.01;
    this.isWindy = windLevel > 0.01;

    if (birdLevel > 0.55 && now - this.lastBirdSpawnAt > CONFIG.audio.birdSpawnGap) {
      this.spawnBird();
      this.lastBirdSpawnAt = now;
    }

    if (insectLevel > 0.5 && now - this.lastInsectSpawnAt > CONFIG.audio.insectSpawnGap) {
      this.spawnInsect();
      this.lastInsectSpawnAt = now;
    }

    this.clouds.forEach(cloud => cloud.setWindLevel(windLevel));

    if (rainLevel > 0.01 && this.raindrops.length === 0) {
      this.rainStartedAt = now;
      for (let i = 0; i < CONFIG.rain.maxCount; i++) {
        this.raindrops.push(new Raindrop());
      }
    }

    if (rainLevel <= 0.01 && this.raindrops.length > 0) {
      this.raindrops = [];
      this.ripples = [];
      this.rainStartedAt = null;
    }

    this.clouds.forEach(cloud => cloud.update());
    this.birds.forEach(bird => bird.update());
    this.bees.forEach(bee => bee.update());
    this.butterflies.forEach(butterfly => butterfly.update());
    if (rainLevel > 0.01) {
      this.raindrops.forEach(drop => {
        let splash = drop.update();
        if (splash && random() > 0.35) {
          this.ripples.push(new Ripple(splash.x, splash.y));
        }
      });
    }
    this.ripples.forEach(ripple => ripple.update());
    this.lightning.update();

    this.birds = this.birds.filter(bird => bird.active);
    this.bees = this.bees.filter(bee => bee.active);
    this.butterflies = this.butterflies.filter(butterfly => butterfly.active);
    this.ripples = this.ripples.filter(ripple => ripple.active).slice(-80);

    if (birdLevel <= 0.01) this.birds = [];
    if (insectLevel <= 0.01) {
      this.bees = [];
      this.butterflies = [];
    }
  }

  display() {
    if (!this.initialized) return;

    this.clouds.forEach(cloud => cloud.display());
    this.rainbow.display(this.rainStartedAt, this.effectLevels.rain);
    this.displayList(this.raindrops, this.effectLevels.rain);
    this.displayList(this.ripples, this.effectLevels.rain);
    this.displayList(this.birds, this.effectLevels.bird);
    this.displayList(this.bees, this.effectLevels.insect);
    this.displayList(this.butterflies, this.effectLevels.insect);
    this.lightning.display(this.effectLevels.thunder);
  }

  displayList(list, alpha) {
    if (alpha <= 0.01 || list.length === 0) return;

    drawingContext.save();
    drawingContext.globalAlpha = alpha;
    list.forEach(item => item.display());
    drawingContext.restore();
  }
}

// ==================== p5 Main Program ====================
function preload() {
  windSound = loadSound("asset/wind.mp3");
  rainSound = loadSound("asset/rain.mp3");
  thunderSound = loadSound("asset/thunder.mp3");
  insectSound = loadSound("asset/insect.mp3");
  birdSound = loadSound("asset/bird.mp3");
  // This code was generated with help from Codex to load bgm.mp3.
  bgm = loadSound("asset/bgm.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  clear();

  fft = new p5.FFT();
  // This code was generated with help from Codex to analyse thunderSound volume.
  thunderAmplitude = new p5.Amplitude(0.75);
  thunderAmplitude.setInput(thunderSound);
  soundInteraction = new SoundInteractionController();
  soundInteraction.init();
  soundInteraction.startAudioInteraction();
  // This code was generated with help from Codex to start background music.
  startBackgroundMusic();

  window.soundInteraction = soundInteraction;
}

function draw() {
  clear();
  soundInteraction.update();
  soundInteraction.display();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// This code was generated with help from Codex to start bgm.mp3 after a click.
function mousePressed() {
  startBackgroundMusic();
}

// This code was generated with help from Codex to start bgm.mp3 after a touch.
function touchStarted() {
  startBackgroundMusic();
}
