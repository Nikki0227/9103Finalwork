let flowers = [];
let subtitleText = "Welcome to the Garden";
let subtitleAlpha = 0;
let targetAlpha = 0;

function setupInput() {
  // 初始化花朵，位置适应地平线 (height * 0.75)
  for (let i = 0; i < 15; i++) {
    let x = map(i, 0, 15, 60, width - 60);
    let y = random(height * 0.75 + 20, height - 30); 
    flowers.push(new Flower(x, y));
  }
}

function drawFlowers() {
  // 更新并显示所有花朵
  for (let f of flowers) {
    f.update(); 
    f.display(); 
  }
}

// 路由交互函数
function mouseMoved() {
  for (let f of flowers) {
    f.checkHover(mouseX, mouseY);
  }
}

function showSubtitle(txt) {
  subtitleText = txt;
  targetAlpha = 255;
  setTimeout(() => { targetAlpha = 0; }, 3000);
}

function updateSubtitles() {
  subtitleAlpha = lerp(subtitleAlpha, targetAlpha, 0.05);
  push();
  fill(0, 0, 20, subtitleAlpha);
  noStroke();
  textAlign(CENTER);
  textSize(20);
  text(subtitleText, width / 2, height - 40);
  pop();
}

// 花朵类
class Flower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.baseSize = random(30, 60);       
    this.currentSize = this.baseSize;     
    this.targetSize = this.baseSize;      
    this.petalCount = floor(map(this.baseSize, 30, 60, 5, 8.9)); 
    this.hue = random(280, 360);          // HSB 颜色值
    this.angle = 0;                       
    this.swingForce = 0;                  
    this.isBeingPressed = false;          
  }

  update() {
    this.swingForce = lerp(this.swingForce, 0, 0.05); 
    this.angle = sin(frameCount * 0.1) * this.swingForce;

    if (mouseIsPressed && dist(mouseX, mouseY, this.x, this.y - 60) < this.currentSize) {
      this.targetSize = this.baseSize * 1.5; 
      if (!this.isBeingPressed) {
        showSubtitle("Growing..."); 
        this.isBeingPressed = true;
      }
    } else {
      this.targetSize = this.baseSize;      
      this.isBeingPressed = false;
    }
    this.currentSize = lerp(this.currentSize, this.targetSize, 0.1);
  }

  display() {
    push(); 
    translate(this.x, this.y); 
    rotate(this.angle); 

    // 1. 绘制花茎 (使用 RGB 颜色绘制)
    stroke(140, 40, 30);
    strokeWeight(4);
    line(0, 0, 0, -60); 

    translate(0, -60);

    // 2. 临时将模式切换为 HSB 来绘制花头
    colorMode(HSB, 360, 100, 100, 100);
    noStroke();
    fill(this.hue, 70, 90, 85);
    for (let i = 0; i < this.petalCount; i++) {
      push();
      rotate(TWO_PI * i / this.petalCount); 
      ellipse(this.currentSize * 0.5, 0, this.currentSize * 0.8, this.currentSize * 0.4);
      pop();
    }

    // 花蕊
    fill(50, 80, 100);
    circle(0, 0, this.currentSize * 0.3);
    
    pop(); // pop 会自动将 colorMode 还原为默认的 RGB
  }

  checkHover(mx, my) {
    let d = dist(mx, my, this.x, this.y - 60);
    if (d < 50) {
      this.swingForce = 0.5; 
    }
  }
}