let flowers = [];
let subtitleText = "Welcome to the Garden";
let subtitleAlpha = 0;
let targetAlpha = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);

  // 初始化 15 朵花
  for (let i = 0; i < 15; i++) {
    let x = map(i, 0, 15, 60, width - 60);
    let y = random(height * 0.65, height - 50); 
    flowers.push(new Flower(x, y));
  }
}

function draw() {
  background(200, 20, 95);
  // 使用 clear() 保持背景透明，露出 Timebase 的效果，同时防止残影
  clear(); 

  // 更新并渲染所有花朵
  for (let f of flowers) {
    f.update(); 
    f.display(); 
  }

  updateSubtitles();
}

// ---------------- 交互函数 ----------------

function mouseMoved() {
  for (let f of flowers) {
    f.checkHover(mouseX, mouseY); 
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
    
    // --- 生长参数 ---
    this.baseSize = random(30, 60);       
    this.currentSize = 0;                 // 初始大小为0
    this.targetSize = this.baseSize;      
    
    this.maxStemHeight = random(80, 120); // 略微增加高度，让叶子和花分得更开
    this.currentStemHeight = 0;           // 初始高度为0，实现向上生长
    this.growthSpeed = random(0.01, 0.03);
    
    this.petalCount = floor(map(this.baseSize, 30, 60, 5, 8.9)); 
    this.hue = random(240, 360);          
    
    this.angle = 0;                       
    this.swingForce = 0;                  
    this.isBeingPressed = false;          
  }

  update() {
    // 1. 生长逻辑
    this.currentStemHeight = lerp(this.currentStemHeight, this.maxStemHeight, this.growthSpeed);
    
    // 2. 花头大小同步：随高度生长同步平滑放大
    let sizeProgress = map(this.currentStemHeight, 0, this.maxStemHeight, 0, this.targetSize);
    this.currentSize = lerp(this.currentSize, sizeProgress, 0.1);

    // 3. 摆动恢复逻辑
    this.swingForce = lerp(this.swingForce, 0, 0.05); 
    this.angle = sin(frameCount * 0.1) * this.swingForce;

    // 4. 长按交互
    if (this.currentStemHeight > this.maxStemHeight * 0.8) {
      if (mouseIsPressed && dist(mouseX, mouseY, this.x, this.y - this.currentStemHeight) < this.currentSize) {
        this.targetSize = this.baseSize * 1.5; 
        if (!this.isBeingPressed) {
          showSubtitle("Deeply growing..."); 
          this.isBeingPressed = true;
        }
      } else {
        this.targetSize = this.baseSize;      
        this.isBeingPressed = false;
      }
    }
  }

  display() {
    push(); 
    translate(this.x, this.y); 
    rotate(this.angle); 

    // --- 绘制花茎 ---
    stroke(140, 40, 30); // 深绿色
    strokeWeight(4);
    line(0, 0, 0, -this.currentStemHeight); 

    // --- 绘制叶子 (修改：位置较低且左右对称) ---
    if (this.currentStemHeight > 20) {
      // 将叶子固定在花茎底部向上 20% 的高度处，确保不重叠
      let leafY = -this.currentStemHeight * 0.2; 
      this.drawLeaf(0, leafY, true);  // 左侧叶子
      this.drawLeaf(0, leafY, false); // 右侧叶子
    }

    // 移动坐标到花头
    translate(0, -this.currentStemHeight);

    // --- Draw the petals ---
    if (this.currentStemHeight > 10) {
      noStroke();
      fill(this.hue, 70, 90, 85);
      for (let i = 0; i < this.petalCount; i++) {
        push();
        rotate(TWO_PI * i / this.petalCount); 
        ellipse(this.currentSize * 0.5, 0, this.currentSize * 0.8, this.currentSize * 0.4);
        pop();
      }

      // --- Draw the stamens and pistils. ---
      fill(50, 80, 100);
      circle(0, 0, this.currentSize * 0.3);
    }
    
    pop(); 
  }

  //Leaf rendering function
  drawLeaf(lx, ly, side) {
    push();
    translate(lx, ly);
    // side 为 true 画左边（向上倾斜），false 画右边（向上倾斜）
    if (side) {
      rotate(PI + QUARTER_PI); // 向左上方倾斜
    } else {
      rotate(-QUARTER_PI);     // 向右上方倾斜
    }
    
    fill(140, 60, 35); // 叶子颜色
    noStroke();
    
    // 叶子大小随花茎高度稍微变化，但保持在较小范围
    let leafW = map(this.currentStemHeight, 0, this.maxStemHeight, 5, 18);
    let leafH = leafW * 0.5;
    
    // 绘制叶子，起点设为 0，让它看起来长在杆子上
    ellipse(leafW / 2, 0, leafW, leafH);
    pop();
  }

  checkHover(mx, my) {
    let d = dist(mx, my, this.x, this.y - this.currentStemHeight);
    if (d < 50) {
      this.swingForce = 0.5; 
    }
  }
}