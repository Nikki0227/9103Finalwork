let flowers = []; // 存储花朵对象的数组
let subtitleText = "Welcome to the Garden"; // 当前显示的字幕内容
let subtitleAlpha = 0; // 字幕的透明度 (0-255)
let targetAlpha = 0; // 字幕目标透明度 (用于淡入淡出)

function setup() {
  createCanvas(windowWidth, windowHeight); // 创建全屏画布
  colorMode(HSB, 360, 100, 100, 100); // 使用HSB色彩模式，方便色彩过渡

  // 使用 For Loop 初始化花朵
  for (let i = 0; i < 15; i++) {
    let x = map(i, 0, 15, 50, width - 50); // 在横向均匀分布
    let y = random(height * 0.6, height - 50); // 高度限制在页面60%以下
    flowers.push(new Flower(x, y)); // 将新花朵加入数组
  }
  
  showSubtitle("Enjoy the peaceful spring breeze..."); // 初始显示字幕
}

function draw() {
  background(200, 20, 95); // 绘制背景（此处后续可配合时间循环改变颜色）

  // 更新并显示所有花朵
  for (let f of flowers) {
    f.update(); // 处理 mouseMoved 引起的晃动和 lerp 动画
    f.display(); // 渲染花朵
  }

  updateSubtitles(); // 处理字幕淡入淡出逻辑
}

// ---------------- 交互函数 ----------------

function mouseMoved() {
  // 遍历花朵，检查鼠标是否靠近
  for (let f of flowers) {
    f.checkHover(mouseX, mouseY);
  }
}

function mousePressed() {
  // 遍历花朵，检查是否被点击
  for (let f of flowers) {
    if (f.isClicked(mouseX, mouseY)) {
      f.bloom(); // 触发开花效果
      showSubtitle("The flower is blooming beautifully!"); // 触发字幕更新
    }
  }
}

// ---------------- 字幕系统 ----------------

function showSubtitle(txt) {
  subtitleText = txt; // 设置新的文本
  targetAlpha = 255; // 开始淡入
  setTimeout(() => { targetAlpha = 0; }, 3000); // 3秒后自动淡出
}

function updateSubtitles() {
  subtitleAlpha = lerp(subtitleAlpha, targetAlpha, 0.05); // 平滑过渡透明度
  fill(0, 0, 20, subtitleAlpha); // 设置深灰色字体和动态透明度
  noStroke();
  textAlign(CENTER);
  textSize(24);
  text(subtitleText, width / 2, height - 50); // 在底部显示字幕
}

// ---------------- 花朵类定义 ----------------

class Flower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(20, 40); // 初始大小
    this.targetSize = this.size; // 目标大小（用于lerp）
    this.hue = random(0, 360); // 随机赋予花朵颜色
    this.angle = 0; // 用于摆动动画
    this.isBlooming = false;
  }

  update() {
    // 使用 lerp 平滑处理大小变化
    this.size = lerp(this.size, this.targetSize, 0.1);
    
    // 如果不被点击，保持轻微晃动 (模拟风吹)
    this.angle = sin(frameCount * 0.05 + this.x) * 0.1;
  }

  display() {
    push();
    translate(this.x, this.y);
    rotate(this.angle); // 应用晃动效果
    
    // 绘制花茎
    stroke(120, 50, 40);
    strokeWeight(3);
    line(0, 0, 0, 50);

    // 绘制花瓣 (根据 size 变化)
    noStroke();
    fill(this.hue, 60, 90, 80);
    for (let i = 0; i < 6; i++) {
      push();
      rotate(TWO_PI * i / 6);
      ellipse(this.size * 0.6, 0, this.size, this.size * 0.5);
      pop();
    }
    
    // 绘制花芯
    fill(45, 80, 100);
    circle(0, 0, this.size * 0.4);
    pop();
  }

  checkHover(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    if (d < 50) {
      this.angle += 0.2; // 鼠标经过时产生更大的扰动
    }
  }

  isClicked(mx, my) {
    let d = dist(mx, my, this.x, this.y);
    return d < this.size; // 如果点击距离小于花朵半径，返回真
  }

  bloom() {
    this.targetSize = random(60, 80); // 点击后通过 lerp 变大
    this.hue = (this.hue + 40) % 360; // 改变颜色
  }
}