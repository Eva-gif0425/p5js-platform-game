let playerImg, bgImg, testpaperImg, menuImg, platformImg; //遊戲內容圖片
let player; //玩家角色
let gravity = 0.6; //重力加速度
let jumpForce = -12; //初始垂直速度
let platforms = [];
let items = [];
let score = 0;
let gameState = "loading"; //載入狀態，依序為: loading 載入中-> mainMenu 主畫面-> playing 遊戲中-> gameOver 遊戲結束
let assetsLoaded = false; //資源是否載入完成

function preload() {
  // 載入圖片、調整圖片尺寸
  playerImg = loadImage("player.png");
  bgImg = loadImage("background.png");
  testpaperImg = loadImage("testpaper.png");
  menuImg = loadImage("menu.png");
  platformImg = loadImage("platform.png");
  playerImg.resize(50, 50);
  testpaperImg.resize(20, 20);
  bgImg.resize(600, 400);
  menuImg.resize(600, 400);
  platformImg.resize(150, 20);
}

function setup() {
  createCanvas(600, 400);
  assetsLoaded = true;
}

function draw() {
  if (gameState === "loading") {
    background(0);
    fill(255);
    textSize(32);
    textAlign(CENTER);
    text("Loading...", width / 2, height / 2);
    if (assetsLoaded) {
      gameState = "mainMenu";
    }
    return;
  }

  if (gameState === "mainMenu") {
    image(menuImg, 0, 0, width, height);
    fill(255);
    textSize(40);
    textAlign(CENTER);
    text("Test Paper Chase", width / 2, height / 3);
    fill(100, 180, 100);
    rect(width / 2 - 100, height / 2, 200, 50, 10);
    fill(255);
    textSize(24);
    text("Start Game", width / 2, height / 2 + 35);
    return;
  }

  if (gameState === "gameOver") {
    background(0);
    fill(255);
    textSize(32);
    textAlign(CENTER);
    text("Congratulations! Score: " + score, width / 2, height / 2);
    fill(100, 180, 100);
    rect(width / 2 - 100, height / 2 + 50, 200, 50, 10);
    fill(255);
    textSize(24);
    text("Restart", width / 2, height / 2 + 85);
    return;
  }

  // 遊行進行中
  background(bgImg);
  for (let plat of platforms) {
    //更新、顯示每個平台
    plat.update();
    plat.display();
  }

  player.update(); //更新、檢查是否有平台碰撞、顯示玩家角色
  player.checkPlatforms(platforms);
  player.display();

  for (let item of items) {
    //顯示、檢查考試卷道具的碰撞
    item.display();
    item.checkCollision(player);
  }

  fill(255);
  textSize(20);
  textAlign(LEFT);
  text("Score: " + score, 10, 30);

  if (score >= 100) {
    //分數=100就結束遊戲
    gameState = "gameOver";
  }
}

function mousePressed() {
  // 處理滑鼠點擊
  if (gameState === "mainMenu") {
    if (
      mouseX > width / 2 - 100 &&
      mouseX < width / 2 + 100 &&
      mouseY > height / 2 &&
      mouseY < height / 2 + 50
    ) {
      gameState = "playing";
      player = new Player();
      platforms = [];
      platforms.push(new Platform(100, 350, 150, 20, 0));
      platforms.push(new Platform(300, 270, 120, 20, 2));
      platforms.push(new Platform(480, 200, 100, 20, -1.5));
      items = [];
      score = 0;
      spawnItem();
    }
  } else if (gameState === "gameOver") {
    if (
      mouseX > width / 2 - 100 &&
      mouseX < width / 2 + 100 &&
      mouseY > height / 2 + 50 &&
      mouseY < height / 2 + 100
    ) {
      gameState = "mainMenu";
    }
  }
}

function keyPressed() {
  // 按下按鍵處理
  if (gameState === "playing") {
    if (keyCode === LEFT_ARROW) {
      player.move(-1);
    } else if (keyCode === RIGHT_ARROW) {
      player.move(1);
    } else if (key === " " || keyCode === UP_ARROW) {
      player.jump();
    }
  }
}

function keyReleased() {
  //放開按鍵處理
  if (gameState === "playing") {
    if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
      player.stop();
    }
  }
}

class Player {
  //角色
  constructor() {
    //初始化玩家位置
    this.x = 100;
    this.y = 0;
    this.w = 50;
    this.h = 50;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.platformVx = 0;
  }

  move(dir) {
    this.vx = dir * 5;
  }

  stop() {
    this.vx = 0;
  }

  jump() {
    if (this.onGround) {
      this.vy = jumpForce;
      this.onGround = false;
      this.platformVx = 0;
    }
  }

  update() {
    this.x += this.vx + this.platformVx;
    this.vy += gravity;
    this.y += this.vy;

    this.x = constrain(this.x, 0, width - this.w);

    if (this.y + this.h >= height) {
      // 如果角色站在地面上，且沒有按左右鍵，就慢慢滑停
      this.y = height - this.h;
      this.vy = 0;
      this.onGround = true;
      this.platformVx = 0;
    }

    if (
      this.onGround &&
      keyIsDown(LEFT_ARROW) === false &&
      keyIsDown(RIGHT_ARROW) === false
    ) {
      this.vx *= 0.6;
      if (abs(this.vx) < 0.1) this.vx = 0;
    }
  }

  display() {
    image(playerImg, this.x, this.y, this.w, this.h);
  }

  checkPlatforms(platforms) {
    // 檢查角色是否站在平台上
    this.platformVx = 0;

    if (this.y + this.h < height - 1) {
      for (let plat of platforms) {
        // 判斷有無進入平台範圍
        if (
          this.x + this.w > plat.x &&
          this.x < plat.x + plat.w &&
          this.y + this.h > plat.y &&
          this.y < plat.y + plat.h
        ) {
          if (this.vy >= 0 && this.y + this.h - this.vy <= plat.y) {
            // 如果角色正在下落，並接觸到平台上面
            this.y = plat.y - this.h;
            this.vy = 0;
            this.onGround = true;
            this.platformVx = plat.vx;
          } else if (this.vy < 0 && this.y - this.vy >= plat.y + plat.h) {
            // 如果角色是往上跳，撞到平台下方
            this.y = plat.y + plat.h;
            this.vy = 0;
          }
        }
      }
    }

    if (!this.onGround) {
      // 如果沒站在任何平台，取消平台速度
      this.platformVx = 0;
    }
  }
}

class Platform {
  constructor(x, y, w, h, vx = 0) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = vx;
  }

  update() {
    if (this.vx !== 0) {
      this.x += this.vx;
      if (this.x <= 0 || this.x + this.w >= width) {
        this.vx *= -1;
      }
    }
  }

  display() {
    image(platformImg, this.x, this.y, this.w, this.h);
  }
}

class Item {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 20;
    this.h = 20;
    this.collected = false;
  }

  display() {
    if (!this.collected) {
      image(testpaperImg, this.x, this.y, this.w, this.h);
    }
  }

  checkCollision(player) {
    //考卷與角色碰撞檢查
    let offset = 2;
    if (
      !this.collected && // 判斷有沒有撿起了
      player.x + player.w - offset > this.x + offset &&
      player.x + offset < this.x + this.w - offset &&
      player.y + player.h - offset > this.y + offset &&
      player.y + offset < this.y + this.h - offset
    ) {
      this.collected = true; // 撿起
      score += 10;
      spawnItem(); // 產生新的考卷
    }
  }
}

function spawnItem() {
  //生成考卷

  items = items.filter((item) => !item.collected); // 隨機挑一個平台
  let plat = platforms[floor(random(platforms.length))];
  let x = plat.x + random(10, plat.w - 30);
  let y = plat.y - 20;

  let tooClose = false; // 檢查有沒有靠近角色太近，避免太近
  for (let item of items) {
    if (abs(x - player.x) < player.w && abs(y - player.y) < player.h) {
      tooClose = true;
      break;
    }
  }
  if (!tooClose) {
    // 如果沒太靠近，放上去；否則稍後再試
    items.push(new Item(x, y));
  } else {
    setTimeout(spawnItem, 100);
  }
}
