let flowers = [];
let subtitleText = "Welcome to the Garden";
let subtitleAlpha = 0;
let targetAlpha = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);

  // 使用 For Loop 初始化花朵
  for (let i = 0; i < 15; i++) {
    let x = map(i, 0, 15, 60, width - 60);
    let y = random(height * 0.65, height - 50); // 位置不高于60%高度
    flowers.push(new Flower(x, y));
  }
}

function draw() {
  background(200, 20, 95); 

  // 更新并显示所有花朵
  for (let f of flowers) {
    f.update(); 
    f.display(); 
  }

  updateSubtitles();
}

// ---------------- 交互函数 ----------------

function mouseMoved() {
  for (let f of flowers) {
    f.checkHover(mouseX, mouseY); // 鼠标经过触发摆动
  }
}

// ---------------- 字幕系统 ----------------

function showSubtitle(txt) {
  subtitleText = txt;
  targetAlpha = 255;
  setTimeout(() => { targetAlpha = 0; }, 3000);
}

function updateSubtitles() {
  subtitleAlpha = lerp(subtitleAlpha, targetAlpha, 0.05);
  fill(0, 0, 20, subtitleAlpha);
  noStroke();
  textAlign(CENTER);
  textSize(20);
  text(subtitleText, width / 2, height - 40);
}

// ---------------- 花朵类定义 ----------------

class Flower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    
    // 基础属性随机化
    this.baseSize = random(30, 60);       // 初始随机大小
    this.currentSize = this.baseSize;     // 当前实时大小
    this.targetSize = this.baseSize;      // 目标缩放大小
    
    // 逻辑：越大的花花瓣越多 (5-8片)
    this.petalCount = floor(map(this.baseSize, 30, 60, 5, 8.9)); 
    
    this.hue = random(280, 360);          // 随机花朵颜色
    
    // 摆动相关变量
    this.angle = 0;                       // 当前旋转角度
    this.swingForce = 0;                  // 摆动力度（受鼠标影响）
    this.isBeingPressed = false;          // 记录当前花朵是否被长按
  }

  update() {
    // 1. 处理摆动恢复逻辑：swingForce 会随时间逐渐衰减回归 0
    this.swingForce = lerp(this.swingForce, 0, 0.05); 
    // 使用 sin 函数制造左右往复运动，摆动幅度由 swingForce 决定
    this.angle = sin(frameCount * 0.1) * this.swingForce;

    // 2. 处理长按缩放逻辑
    // 检查鼠标是否在花朵位置并按下
    if (mouseIsPressed && dist(mouseX, mouseY, this.x, this.y) < this.currentSize) {
      this.targetSize = this.baseSize * 1.5; // 长按时目标变大 1.5 倍
      if (!this.isBeingPressed) {
        showSubtitle("Growing..."); // 第一次按下时触发字幕
        this.isBeingPressed = true;
      }
    } else {
      this.targetSize = this.baseSize;      // 松手或离开时恢复初始大小
      this.isBeingPressed = false;
    }

    // 3. 使用 lerp 实现大小平滑过渡
    this.currentSize = lerp(this.currentSize, this.targetSize, 0.1);
  }

  display() {
    push(); // 开始绘制独立的坐标系
    translate(this.x, this.y); // 移动到花朵根部位置
    rotate(this.angle); // 应用左右摆动效果

    // 绘制花茎 (从 0,0 向上绘制到负值方向)
    stroke(140, 40, 30);
    strokeWeight(4);
    line(0, 0, 0, -60); // 固定长度的花茎

    // 移动坐标到花头（花茎顶端）
    translate(0, -60);

    // 绘制花瓣：使用 for loop 和 push/pop
    noStroke();
    fill(this.hue, 70, 90, 85);
    for (let i = 0; i < this.petalCount; i++) {
      push();
      rotate(TWO_PI * i / this.petalCount); // 均匀分布花瓣
      // 花瓣大小随 currentSize 变化
      ellipse(this.currentSize * 0.5, 0, this.currentSize * 0.8, this.currentSize * 0.4);
      pop();
    }

    // 绘制中心花蕊
    fill(50, 80, 100);
    circle(0, 0, this.currentSize * 0.3);
    
    pop(); // 恢复坐标系，不影响其他花朵
  }

  checkHover(mx, my) {
    // 如果鼠标距离花头位置较近
    let d = dist(mx, my, this.x, this.y - 60);
    if (d < 50) {
      this.swingForce = 0.5; // 给一个初始摆动力度，update 里的 lerp 会让它慢慢消失
    }
  }
}