let flowers = []; // 
let subtitleText = "Welcome to the Garden"; // Prompt text displayed on the screen
let subtitleAlpha = 0; // Subtitle transparency
let targetAlpha = 0; // Subtitle target transparency
let lastWitherTime = 0; // Record the timestamp of the last flower withering

function setup() {
  createCanvas(windowWidth, windowHeight); 
  colorMode(HSB, 360, 100, 100, 100); // Use HSB color mode for easier color manipulation

  // initialize 18 flowers evenly spaced across the width, with random y positions
  //  in the grass area
  for (let i = 0; i < 18; i++) {
    let x = map(i, 0, 18, 60, width - 60); 
    let y = random(height * 0.65, height - 50); 
    flowers.push(new Flower(x, y)); 
  }
  lastWitherTime = millis(); // Record the milliseconds when the program starts
}

function draw() {
  clear(); // Clear the rendering from the previous frame while 
//maintaining a transparent background.

  // This code was generated with help from Gemini to create the cycle of flower growth
  // Every 12 seconds, the flower withers and regrows at a different location.
  if (millis() - lastWitherTime > 12000) {
    witherAndRegrow(); 
    lastWitherTime = millis(); // Reset the timer
    showSubtitle("Cycles of nature..."); // Update the bottom text
  }

  // Rendering all flowers
  for (let f of flowers) {
    f.update(); 
    f.display(); 
  }

  updateSubtitles(); // Update subtitle display and transition effects.
}

// ---------------- Core logic functions ----------------

 // This function was generated with help from Gemini to generate three new flowers at random locations.
function witherAndRegrow() {
  // Randomly select three flowers and swap their positions.
  for (let k = 0; k < 3; k++) {
    let index = floor(random(flowers.length)); // Randomly select an existing flower index
    // Regenerate random coordinates within the canvas grass area.
    let newX = random(60, width - 60); 
    let newY = random(height * 0.65, height - 50);
    // Replace the old Flower object in the array with a brand-new one to achieve a 
    // "disappear and respawn" effect.
    flowers[index] = new Flower(newX, newY); 
  }
}


function mouseMoved() {
  for (let f of flowers) {
    //This function was generated with help from Gemini to create a hover effect that 
    // causes the flowers to sway when the mouse is near them.
    f.checkHover(mouseX, mouseY); // Check for hover effect when mouse moves
  }
}

//This function was generated with help from Gemini to show dynamic subtitles
function showSubtitle(txt) {
  subtitleText = txt;
  targetAlpha = 255;
  setTimeout(() => { targetAlpha = 0; }, 3000);
}

function updateSubtitles() {
  subtitleAlpha = lerp(subtitleAlpha, targetAlpha, 0.05);
  fill(0, 0, 100, subtitleAlpha); // white text
  noStroke();
  textAlign(CENTER);
  textSize(20);
  text(subtitleText, width / 2, height - 40);
}

// ---------------- Define flowers ----------------

class Flower {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    
    // --- Growth parameters ---
    this.baseSize = random(35, 60);       
    this.currentSize = 0;                 
    this.targetSize = this.baseSize;      
    
    this.maxStemHeight = random(70, 110); 
    this.currentStemHeight = 0;           
    this.growthSpeed = random(0.015, 0.035);
    
    // --- Color parameters ---
    //This code was generated with help from Gemini to adjust the initial saturation 
    this.petalCount = floor(map(this.baseSize, 35, 60, 5, 8.5)); 
    let colorOptions = [330, 200, 270, 290]; 
    // Let flowers have a variety of base hues (red, blue, purple, pink)
    this.baseHue = random(colorOptions); 
    
    // --- Saturation parameters ---
    // of the flowers,making them more vibrant and visually appealing from the 
    // moment they start growing.
    this.currentSat = 45; 
    // The initial saturation has been increased from 20 to 45, 
    // making the colors appear deeper and more pronounced.
    this.targetSat = 45;  // Default target saturation
    
    this.angle = 0;                       
    this.swingForce = 0;                  
    this.isBeingPressed = false;          
  }


  update() {
    // Growth logic: smoothly transition current stem height and size towards 
    // their targets
    this.currentStemHeight = lerp(this.currentStemHeight, this.maxStemHeight, this.growthSpeed);
    let sizeProgress = map(this.currentStemHeight, 0, this.maxStemHeight, 0, this.targetSize);
    this.currentSize = lerp(this.currentSize, sizeProgress, 0.1);

    // Saturation transition logic
    this.currentSat = lerp(this.currentSat, this.targetSat, 0.1);

    // Swinging physics logic
    this.swingForce = lerp(this.swingForce, 0, 0.05); 
    this.angle = sin(frameCount * 0.1) * this.swingForce;

    // Long press interaction logic
    if (this.currentStemHeight > this.maxStemHeight * 0.8) {
      if (mouseIsPressed && dist(mouseX, mouseY, this.x, this.y - this.currentStemHeight) < this.currentSize) {
        this.targetSize = this.baseSize * 1.6; 
        this.targetSat = 90; 
        // Increase saturation to make the flower more vibrant when pressed
        if (!this.isBeingPressed) {
          showSubtitle("Energy flowing into the petals!"); 
          this.isBeingPressed = true;
        }
      } else {
        this.targetSize = this.baseSize;      
        this.targetSat = 45; 
        // Reset saturation back to normal when not pressed
        this.isBeingPressed = false;
      }
    }
  }

  display() {
    push(); 
    translate(this.x, this.y); 
    rotate(this.angle); 

    // Draw the stem
    stroke(140, 40, 30); 
    strokeWeight(4);
    line(0, 0, 0, -this.currentStemHeight); 

    // Draw the leaves
    if (this.currentStemHeight > 20) {
      let leafY = -this.currentStemHeight * 0.25; 
      this.drawLeaf(0, leafY, true);  
      this.drawLeaf(0, leafY, false); 
    }

    translate(0, -this.currentStemHeight); // Move to the top of the stem to draw the flower head

    // --- Draw petals ---
    if (this.currentStemHeight > 10) {
      noStroke();
      // This code was generated with help from Gemini to enhance the visual 
      // appeal of the flowers by increasing their saturation when they are 
      // fully bloomed or being pressed, making them more vibrant and eye-catching.
      fill(this.baseHue, this.currentSat, 95, 90); 
      
      for (let i = 0; i < this.petalCount; i++) {
        push();
        rotate(TWO_PI * i / this.petalCount); 
        // Draw petal ellipse
        ellipse(this.currentSize * 0.4, 0, this.currentSize * 0.8, this.currentSize * 0.4);
        pop();
      }

      // Draw the pistil
      fill(50, 70, 100); 
      circle(0, 0, this.currentSize * 0.25);
    }
    pop(); 
  }

  drawLeaf(lx, ly, side) {
    push();
    translate(lx, ly);

    // This code was generated with help from Gemini to enhance the visual appeal of 
    // the leaves by adjusting their size based on the growth stage of the flower, 
    // making them more prominent as the flower grows taller, which adds to the 
    // overall aesthetic and realism of the plant.
    if (side) { rotate(PI + QUARTER_PI); } 
    else { rotate(-QUARTER_PI); }
    
    fill(140, 55, 35); 
    noStroke();
    
    let leafScale = map(this.baseSize, 35, 60, 0.7, 1.4);
    let leafW = map(this.currentStemHeight, 0, this.maxStemHeight, 5, 20) * leafScale;
    
    ellipse(leafW / 2, 0, leafW, leafW * 0.5);
    pop();
  }


  // This function was generated with help from Gemini to create an interactive hover
  //  effect that causes the flowers to sway when the mouse is near them, 
  // adding a dynamic and responsive
  checkHover(mx, my) {
    let d = dist(mx, my, this.x, this.y - this.currentStemHeight);
    if (d < 45) {
      this.swingForce = 0.45; 
    }
  }
}
   
//AI acknowledgement : I acknowledged that I used ds  AItool Gemini to improve click effect of flowers and subtitles.