let flowers = []; // 存储所有花朵对象的数组
let subtitleText = "Welcome to the Garden"; // 屏幕显示的提示文本
let subtitleAlpha = 0; // 字幕透明度
let targetAlpha = 0; // 字幕目标透明度
let lastWitherTime = 0; // 记录上次花朵凋谢的时间戳

function setup() {
  createCanvas(windowWidth, windowHeight); 
  colorMode(HSB, 360, 100, 100, 100); // 使用 HSB 模式（色相、饱和度、亮度、透明度）

  // 初始化 18 朵花
  for (let i = 0; i < 18; i++) {
    let x = map(i, 0, 18, 60, width - 60); 
    let y = random(height * 0.65, height - 50); 
    flowers.push(new Flower(x, y)); 
  }
  lastWitherTime = millis(); // 记录程序启动时的毫秒数
}

function draw() {
  clear(); // 清除上一帧绘制，保持背景透明

  // --- 改进点 2：凋谢重生频率改为 12 秒 ---
  // millis() 是程序运行的总毫秒数，12000 毫秒即 12 秒
  if (millis() - lastWitherTime > 12000) {
    witherAndRegrow(); 
    lastWitherTime = millis(); // 重置计时器
    showSubtitle("Cycles of nature..."); // 更新底部文字
  }

  // 渲染所有花朵
  for (let f of flowers) {
    f.update(); 
    f.display(); 
  }

  updateSubtitles(); // 刷新字幕状态
}

// ---------------- 核心逻辑函数 ----------------

function witherAndRegrow() {
  // 随机选出 3 朵花进行位置替换
  for (let k = 0; k < 3; k++) {
    let index = floor(random(flowers.length)); // 随机选一个现有的花朵索引
    // 在画布草地范围内重新生成随机坐标
    let newX = random(60, width - 60); 
    let newY = random(height * 0.65, height - 50);
    // 用一个全新的 Flower 对象替换数组中旧的对象，实现消失并重生的效果
    flowers[index] = new Flower(newX, newY); 
  }
}

function mouseMoved() {
  for (let f of flowers) {
    f.checkHover(mouseX, mouseY); // 鼠标移动时检测碰撞触发摆动
  }
}

function showSubtitle(txt) {
  subtitleText = txt;
  targetAlpha = 255;
  setTimeout(() => { targetAlpha = 0; }, 3000);
}

function updateSubtitles() {
  subtitleAlpha = lerp(subtitleAlpha, targetAlpha, 0.05);
  fill(0, 0, 100, subtitleAlpha); // 白色文字
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
    this.baseSize = random(35, 60);       
    this.currentSize = 0;                 
    this.targetSize = this.baseSize;      
    
    this.maxStemHeight = random(70, 110); 
    this.currentStemHeight = 0;           
    this.growthSpeed = random(0.015, 0.035);
    
    // --- 颜色参数 ---
    this.petalCount = floor(map(this.baseSize, 35, 60, 5, 8.5)); 
    let colorOptions = [330, 200, 270, 290]; // 粉色、蓝色、紫色系
    this.baseHue = random(colorOptions); 
    
    // --- 改进点 1：调深未点击状态的颜色 ---
    this.currentSat = 45; // 初始饱和度从 20 提高到 45，让颜色看起来更深更明显
    this.targetSat = 45;  // 默认目标饱和度
    
    this.angle = 0;                       
    this.swingForce = 0;                  
    this.isBeingPressed = false;          
  }

  update() {
    // 平滑生长逻辑
    this.currentStemHeight = lerp(this.currentStemHeight, this.maxStemHeight, this.growthSpeed);
    let sizeProgress = map(this.currentStemHeight, 0, this.maxStemHeight, 0, this.targetSize);
    this.currentSize = lerp(this.currentSize, sizeProgress, 0.1);

    // 饱和度过渡逻辑
    this.currentSat = lerp(this.currentSat, this.targetSat, 0.1);

    // 摇摆物理逻辑
    this.swingForce = lerp(this.swingForce, 0, 0.05); 
    this.angle = sin(frameCount * 0.1) * this.swingForce;

    // 长按交互逻辑
    if (this.currentStemHeight > this.maxStemHeight * 0.8) {
      if (mouseIsPressed && dist(mouseX, mouseY, this.x, this.y - this.currentStemHeight) < this.currentSize) {
        this.targetSize = this.baseSize * 1.6; 
        this.targetSat = 90; // 被点击时变得非常鲜艳
        if (!this.isBeingPressed) {
          showSubtitle("Energy flowing into the petals!"); 
          this.isBeingPressed = true;
        }
      } else {
        this.targetSize = this.baseSize;      
        this.targetSat = 45; // 松开后恢复到稍深但不极端的颜色
        this.isBeingPressed = false;
      }
    }
  }

  display() {
    push(); 
    translate(this.x, this.y); 
    rotate(this.angle); 

    // 绘制花茎
    stroke(140, 40, 30); 
    strokeWeight(4);
    line(0, 0, 0, -this.currentStemHeight); 

    // 绘制叶子
    if (this.currentStemHeight > 20) {
      let leafY = -this.currentStemHeight * 0.25; 
      this.drawLeaf(0, leafY, true);  
      this.drawLeaf(0, leafY, false); 
    }

    translate(0, -this.currentStemHeight); // 移动到花茎顶端绘制花头

    // --- 改进点 1：绘制花瓣，设置不透明度为 90 ---
    if (this.currentStemHeight > 10) {
      noStroke();
      // fill 参数：色相, 饱和度, 亮度, 不透明度(90)
      fill(this.baseHue, this.currentSat, 95, 90); 
      
      for (let i = 0; i < this.petalCount; i++) {
        push();
        rotate(TWO_PI * i / this.petalCount); 
        // 绘制花瓣椭圆
        ellipse(this.currentSize * 0.4, 0, this.currentSize * 0.8, this.currentSize * 0.4);
        pop();
      }

      // 绘制花蕊
      fill(50, 70, 100); 
      circle(0, 0, this.currentSize * 0.25);
    }
    pop(); 
  }

  drawLeaf(lx, ly, side) {
    push();
    translate(lx, ly);
    if (side) { rotate(PI + QUARTER_PI); } 
    else { rotate(-QUARTER_PI); }
    
    fill(140, 55, 35); 
    noStroke();
    
    let leafScale = map(this.baseSize, 35, 60, 0.7, 1.4);
    let leafW = map(this.currentStemHeight, 0, this.maxStemHeight, 5, 20) * leafScale;
    
    ellipse(leafW / 2, 0, leafW, leafW * 0.5);
    pop();
  }

  checkHover(mx, my) {
    let d = dist(mx, my, this.x, this.y - this.currentStemHeight);
    if (d < 45) {
      this.swingForce = 0.45; 
    }
  }
}
   
//AI acknowledgement : I acknowledged that I used ds  AItool Gemini to improve click effect of flowers and subtitles.