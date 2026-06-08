// ==================== Berlin / Perlin Noise Effects ====================
// This file adds soft natural variation to the audio layer using p5 noise().
// This file was generated with help from Codex to add Perlin-noise rain, cloud, and light-particle effects.
// It is loaded both inside the audio iframe and on the main index page.
// In the audio iframe it extends existing rain and cloud classes; on the main page it creates a transparent particle overlay.

const BerlinNoiseEffects = {
  rainZ: 1000,

  // This code was generated with help from Codex to vary rain density with Perlin noise.
  // The rainZ value moves slowly through the noise field, so the target rain count changes smoothly instead of jumping randomly.
  // The returned value scales with the current rain audio level, keeping the visual density connected to the sound effect.
  rainDensity(level) {
    let wave = noise(this.rainZ);
    this.rainZ += 0.006;
    return floor(CONFIG.rain.maxCount * level * map(wave, 0, 1, 0.35, 1.35));
  },

  // This code was generated with help from Codex to update raindrop count from noise.
  // It compares the current number of raindrops with the noise-based target count.
  // New Raindrop objects are added when the target density rises, and extra drops are trimmed when the density falls.
  // This makes rainfall feel like natural waves of heavier and lighter rain.
  applyRainDensity(controller) {
    let rainLevel = controller.effectLevels.rain;
    if (rainLevel <= 0.01 || typeof Raindrop === "undefined") return;

    let targetCount = constrain(this.rainDensity(rainLevel), 30, CONFIG.rain.maxCount * 1.35);

    while (controller.raindrops.length < targetCount) {
      controller.raindrops.push(new Raindrop());
    }

    if (controller.raindrops.length > targetCount) {
      controller.raindrops = controller.raindrops.slice(0, targetCount);
    }
  }
};

// This code was generated with help from Codex to draw a transparent light-particle layer.
// It uses p5 instance mode so this overlay has its own setup() and draw() without replacing the other sketches' global p5 functions.
// The canvas is fixed over the viewport, has pointer-events disabled, and is cleared every frame so it never paints an opaque background.
function createBerlinNoiseParticleLayer() {
  new p5((p) => {
    let particles = [];

    // This setup code was generated with help from Codex to create small, subtle light particles.
    // Each particle stores a position, size, speed, opacity, and noise seed so every particle drifts in its own path.
    p.setup = function() {
      let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
      canvas.elt.classList.add("berlin-noise-canvas");
      canvas.elt.style.position = "fixed";
      canvas.elt.style.inset = "0";
      canvas.elt.style.zIndex = "4";
      canvas.elt.style.pointerEvents = "none";
      canvas.elt.style.background = "transparent";
      p.clear();

      for (let i = 0; i < 42; i++) {
        particles.push({
          x: p.random(p.width),
          y: p.random(p.height),
          size: p.random(1.4, 3.4),
          seed: p.random(1000),
          speed: p.random(0.12, 0.45),
          alpha: p.random(28, 72)
        });
      }
    };

    // This code was generated with help from Codex to make particles drift with Perlin noise.
    // p.clear() keeps the layer transparent, SCREEN blending makes the particles feel like light, and noise controls drift and glow.
    // Particles wrap around the viewport edges so the overlay remains continuous over time.
    p.draw = function() {
      p.clear();
      p.noStroke();
      p.blendMode(p.SCREEN);

      for (let particle of particles) {
        let t = p.frameCount * 0.004;
        let driftX = p.map(p.noise(particle.seed, t), 0, 1, -0.45, 0.45);
        let driftY = p.map(p.noise(particle.seed + 80, t), 0, 1, -0.22, 0.22);
        let glow = p.noise(particle.seed + 160, t * 1.7);

        particle.x += driftX;
        particle.y -= particle.speed + driftY;

        if (particle.y < -20) {
          particle.y = p.height + 20;
          particle.x = p.random(p.width);
        }

        if (particle.x < -20) particle.x = p.width + 20;
        if (particle.x > p.width + 20) particle.x = -20;

        let alpha = particle.alpha * p.map(glow, 0, 1, 0.45, 1);
        let size = particle.size * p.map(glow, 0, 1, 0.75, 1.45);

        p.fill(255, 245, 190, alpha * 0.28);
        p.ellipse(particle.x, particle.y, size * 5.2, size * 5.2);
        p.fill(255, 248, 210, alpha);
        p.ellipse(particle.x, particle.y, size, size);
      }

      p.blendMode(p.BLEND);
    };

    p.windowResized = function() {
      p.resizeCanvas(p.windowWidth, p.windowHeight);
      p.clear();
    };
  });
}

// This code was generated with help from Codex to attach noise effects to existing classes.
// It stores the original update/display functions, then wraps them with extra noise behavior.
// This keeps the original audio-base code working while adding rain-density, cloud, and raindrop movement effects.
function installBerlinNoiseEffects() {
  if (typeof SoundInteractionController !== "undefined") {
    let originalUpdate = SoundInteractionController.prototype.update;
    // This wrapper was generated with help from Codex to run the original controller update first, then adjust rain density afterward.
    SoundInteractionController.prototype.update = function() {
      originalUpdate.call(this);
      BerlinNoiseEffects.applyRainDensity(this);
    };
  }

  if (typeof Cloud !== "undefined") {
    let originalCloudUpdate = Cloud.prototype.update;
    // This code was generated with help from Codex to add noise-based cloud floating.
    // Each cloud gets a stable noise offset, which makes its vertical motion smooth and slightly different from the other clouds.
    // The wind level increases the floating amount so cloudy movement responds more strongly during wind audio events.
    Cloud.prototype.update = function() {
      if (this.noiseOffset === undefined) this.noiseOffset = random(1000);
      if (this.baseNoiseY === undefined || this.x <= -190) this.baseNoiseY = this.y;

      originalCloudUpdate.call(this);

      let windLevel = window.soundInteraction ? window.soundInteraction.effectLevels.wind : 0;
      let floatAmount = map(noise(this.noiseOffset, frameCount * 0.004), 0, 1, -18, 18);
      this.y = this.baseNoiseY + floatAmount * (1 + windLevel * 1.8);
    };

    let originalCloudDisplay = Cloud.prototype.display;
    // This code was generated with help from Codex to add small translucent cloud wisps.
    // The original cloud is drawn first, then several faint ellipses are added using noise-based offsets and sizes.
    // SCREEN blending keeps the wisps soft and light so they do not hide the main garden elements.
    Cloud.prototype.display = function() {
      originalCloudDisplay.call(this);

      push();
      noStroke();
      blendMode(SCREEN);

      let windLevel = window.soundInteraction ? window.soundInteraction.effectLevels.wind : 0;
      for (let i = 0; i < 3; i++) {
        let n = noise(this.noiseOffset + i * 20, frameCount * 0.006);
        let offsetX = map(n, 0, 1, -this.size * 0.55, this.size * 0.55);
        let offsetY = map(noise(this.noiseOffset + i * 40, frameCount * 0.005), 0, 1, -18, 18);
        let alpha = map(n, 0, 1, 16, 42) + windLevel * 22;

        fill(220, 240, 255, alpha);
        ellipse(
          this.x + offsetX,
          this.y + offsetY,
          this.size * map(n, 0, 1, 0.9, 1.65),
          this.size * map(n, 0, 1, 0.28, 0.55)
        );
      }

      blendMode(BLEND);
      pop();
    };
  }

  if (typeof Raindrop !== "undefined") {
    let originalRaindropUpdate = Raindrop.prototype.update;
    // This code was generated with help from Codex to give raindrops noise-based drift.
    // The original falling motion still happens, but each raindrop receives a gentle sideways offset from Perlin noise.
    // Wind audio increases the sideways movement, making the rain feel more affected by the weather.
    Raindrop.prototype.update = function() {
      if (this.noiseOffset === undefined) this.noiseOffset = random(1000);

      let splash = originalRaindropUpdate.call(this);
      let windLevel = window.soundInteraction ? window.soundInteraction.effectLevels.wind : 0;
      let sideways = map(noise(this.noiseOffset, frameCount * 0.025), 0, 1, -1.4, 1.4);
      this.x += sideways * (1 + windLevel * 2.5);

      return splash;
    };
  }

  // This branch was generated with help from Codex for the main index page.
  // If the audio classes are not present, the file creates only the transparent particle layer and does not try to patch audio objects.
  if (typeof SoundInteractionController === "undefined" && typeof p5 !== "undefined") {
    createBerlinNoiseParticleLayer();
  }
}

installBerlinNoiseEffects();
