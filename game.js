const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

const lanes = [0.3, 0.5, 0.7];

function getLaneX(lane) {
  return canvas.width * lanes[lane];
}

const player = {
  lane: 1,
  y: canvas.height - 120,

  width: 60,
  height: 100,

  velocityY: 0,

  gravity: 0.8,
  jumpForce: -18,

  grounded: true,

  sliding: false,
  slideTimer: 0
};

const obstacles = [];
const coins = [];

let score = 0;
let speed = 4;
let frame = 0;
let gameOver = false;

function spawnObstacle() {

  obstacles.push({
    lane: Math.floor(Math.random() * 3),

    y: -150,

    width: 80,
    height: 120
  });
}

function spawnCoin() {

  coins.push({
    lane: Math.floor(Math.random() * 3),

    y: -100,

    radius: 15
  });
}

function drawBackground() {

  const gradient = ctx.createLinearGradient(
    0,
    0,
    0,
    canvas.height
  );

  gradient.addColorStop(0, "#0f172a");
  gradient.addColorStop(0.5, "#111827");
  gradient.addColorStop(1, "#020617");

  ctx.fillStyle = gradient;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // city buildings
  for (let i = 0; i < 40; i++) {

    const x =
      (i * 200 + frame * 2)
      % (canvas.width + 200);

    const h =
      100 + Math.sin(i) * 120;

    ctx.fillStyle =
      "rgba(0,255,255,0.08)";

    ctx.fillRect(
      x,
      canvas.height - h - 100,
      80,
      h
    );
  }

  // road glow
  ctx.fillStyle =
    "rgba(0,200,255,0.08)";

  ctx.fillRect(
    canvas.width * 0.25,
    0,
    canvas.width * 0.5,
    canvas.height
  );

  // lane lines
  for (let i = 0; i < 3; i++) {

    ctx.strokeStyle =
      "rgba(255,255,255,0.25)";

    ctx.lineWidth = 5;

    ctx.beginPath();

    ctx.moveTo(getLaneX(i), 0);

    ctx.lineTo(
      getLaneX(i),
      canvas.height
    );

    ctx.stroke();
  }

  // moving floor streaks
  for (
    let y = 0;
    y < canvas.height;
    y += 60
  ) {

    const moveY =
      (y + frame * speed * 0.8)
      % (canvas.height + 60);

    ctx.fillStyle =
      "rgba(255,255,255,0.08)";

    ctx.fillRect(
      canvas.width * 0.25,
      moveY,
      canvas.width * 0.5,
      8
    );
  }
}

function drawPlayer() {

  const x = getLaneX(player.lane);

  const height =
    player.sliding
      ? player.height * 0.5
      : player.height;

  // shadow
  ctx.fillStyle =
    "rgba(0,0,0,0.3)";

  ctx.beginPath();

  ctx.ellipse(
    x,
    player.y + 10,
    40,
    12,
    0,
    0,
    Math.PI * 2
  );

  ctx.fill();

  // body
  ctx.fillStyle = "#00e5ff";

  ctx.fillRect(
    x - player.width / 2,
    player.y - height,
    player.width,
    height
  );

  // hoodie
  ctx.fillStyle = "#0891b2";

  ctx.fillRect(
    x - player.width / 2,
    player.y - height,
    player.width,
    25
  );

  // eyes
  ctx.fillStyle = "white";

  ctx.fillRect(
    x - 15,
    player.y - height + 35,
    10,
    10
  );

  ctx.fillRect(
    x + 5,
    player.y - height + 35,
    10,
    10
  );

  // shoes
  ctx.fillStyle = "#f43f5e";

  ctx.fillRect(
    x - 25,
    player.y - 10,
    18,
    10
  );

  ctx.fillRect(
    x + 7,
    player.y - 10,
    18,
    10
  );
}

function drawObstacles() {

  obstacles.forEach((obs, index) => {

    obs.y += speed;

    ctx.fillStyle = "#ff1744";

    ctx.fillRect(
      getLaneX(obs.lane)
        - obs.width / 2,

      obs.y,

      obs.width,
      obs.height
    );

    if (obs.y > canvas.height) {
      obstacles.splice(index, 1);
    }

    const px =
      getLaneX(player.lane)
      - player.width / 2;

    const py =
      player.y - player.height;

    const ox =
      getLaneX(obs.lane)
      - obs.width / 2;

    const oy = obs.y;

    if (
      px < ox + obs.width &&
      px + player.width > ox &&
      py < oy + obs.height &&
      py + player.height > oy
    ) {
      gameOver = true;
    }
  });
}

function drawCoins() {

  coins.forEach((coin, index) => {

    coin.y += speed;

    ctx.fillStyle = "gold";

    ctx.beginPath();

    ctx.arc(
      getLaneX(coin.lane),
      coin.y,
      coin.radius,
      0,
      Math.PI * 2
    );

    ctx.fill();

    const dx =
      getLaneX(player.lane)
      - getLaneX(coin.lane);

    const dy =
      player.y - coin.y;

    if (
      Math.sqrt(dx * dx + dy * dy)
      < 50
    ) {
      coins.splice(index, 1);

      score += 100;
    }
  });
}

function updatePlayer() {

  player.velocityY += player.gravity;

  player.y += player.velocityY;

  const ground =
    canvas.height - 120;

  if (player.y > ground) {

    player.y = ground;

    player.velocityY = 0;

    player.grounded = true;
  }

  if (player.slideTimer > 0) {

    player.slideTimer--;

  } else {

    player.sliding = false;
  }
}

function drawUI() {

  ctx.fillStyle = "white";

  ctx.font = "30px Arial";

  ctx.fillText(
    `Score: ${score}`,
    30,
    50
  );

  ctx.fillText(
    `Speed: ${speed}`,
    30,
    95
  );

  if (gameOver) {

    ctx.fillStyle =
      "rgba(0,0,0,0.7)";

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    ctx.fillStyle = "#ff1744";

    ctx.font = "80px Arial";

    ctx.fillText(
      "GAME OVER",
      canvas.width / 2 - 250,
      canvas.height / 2 - 60
    );

    // restart button
    ctx.fillStyle = "#00e5ff";

    ctx.fillRect(
      canvas.width / 2 - 120,
      canvas.height / 2 + 20,
      240,
      70
    );

    ctx.fillStyle = "black";

    ctx.font = "40px Arial";

    ctx.fillText(
      "RESTART",
      canvas.width / 2 - 100,
      canvas.height / 2 + 68
    );
  }
}

function restartGame() {

  obstacles.length = 0;
  coins.length = 0;

  score = 0;
  speed = 4;
  frame = 0;

  gameOver = false;

  player.lane = 1;

  player.velocityY = 0;

  player.grounded = true;

  player.y =
    canvas.height - 120;
}

document.addEventListener(
  "click",
  (e) => {

    if (gameOver) {

      const btnX =
        canvas.width / 2 - 120;

      const btnY =
        canvas.height / 2 + 20;

      if (
        e.clientX >= btnX &&
        e.clientX <= btnX + 240 &&
        e.clientY >= btnY &&
        e.clientY <= btnY + 70
      ) {
        restartGame();
      }
    }
  }
);

document.addEventListener(
  "keydown",
  (e) => {

    switch (e.key.toLowerCase()) {

      case "a":
      case "arrowleft":
        moveLeft();
        break;

      case "d":
      case "arrowright":
        moveRight();
        break;

      case "w":
      case "arrowup":
        jump();
        break;

      case "s":
      case "arrowdown":
        slide();
        break;
    }
  }
);

function moveLeft() {
  player.lane =
    Math.max(0, player.lane - 1);
}

function moveRight() {
  player.lane =
    Math.min(2, player.lane + 1);
}

function jump() {

  if (player.grounded) {

    player.velocityY =
      player.jumpForce;

    player.grounded = false;
  }
}

function slide() {

  player.sliding = true;

  player.slideTimer = 30;
}

function gameLoop() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  drawBackground();

  if (!gameOver) {

    frame++;

    if (frame % 80 === 0) {
      spawnObstacle();
    }

    if (frame % 120 === 0) {
      spawnCoin();
    }

    // progressively faster
    if (
      frame % 300 === 0 &&
      speed < 35
    ) {
      speed += 1;
    }

    updatePlayer();

    drawObstacles();

    drawCoins();

    drawPlayer();

    score++;
  }

  drawUI();

  requestAnimationFrame(gameLoop);
}

gameLoop();