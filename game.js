const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const lanes = [0.3, 0.5, 0.7];

const player = {
  lane: 1,
  y: 0,
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
let gameOver = false;
let speed = 10;
let frame = 0;

function getLaneX(lane) {
  return canvas.width * lanes[lane];
}

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

function updatePlayer() {
  player.velocityY += player.gravity;
  player.y += player.velocityY;

  const ground = canvas.height - 120;

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

function drawBackground() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 3; i++) {
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(getLaneX(i), 0);
    ctx.lineTo(getLaneX(i), canvas.height);
    ctx.stroke();
  }
}

function drawPlayer() {
  const x = getLaneX(player.lane);

  ctx.fillStyle = "#00e5ff";

  const height = player.sliding
    ? player.height * 0.5
    : player.height;

  ctx.fillRect(
    x - player.width / 2,
    player.y - height,
    player.width,
    height
  );
}

function drawObstacles() {
  obstacles.forEach((obs, index) => {

    obs.y += speed;

    ctx.fillStyle = "#ff1744";

    ctx.fillRect(
      getLaneX(obs.lane) - obs.width / 2,
      obs.y,
      obs.width,
      obs.height
    );

    if (obs.y > canvas.height) {
      obstacles.splice(index, 1);
    }

    const px = getLaneX(player.lane) - player.width / 2;
    const py = player.y - player.height;

    const ox = getLaneX(obs.lane) - obs.width / 2;
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

    const dx = getLaneX(player.lane) - getLaneX(coin.lane);
    const dy = player.y - coin.y;

    if (Math.sqrt(dx * dx + dy * dy) < 50) {
      coins.splice(index, 1);
      score += 100;
    }

    if (coin.y > canvas.height) {
      coins.splice(index, 1);
    }
  });
}

function drawUI() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";

  ctx.fillText(`Score: ${score}`, 30, 50);

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "80px Arial";

    ctx.fillText(
      "GAME OVER",
      canvas.width / 2 - 250,
      canvas.height / 2
    );
  }
}

function gameLoop() {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();

  if (!gameOver) {

    frame++;

    if (frame % 80 === 0) {
      spawnObstacle();
    }

    if (frame % 120 === 0) {
      spawnCoin();
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

document.addEventListener("keydown", (e) => {

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
});

function moveLeft() {
  player.lane = Math.max(0, player.lane - 1);
}

function moveRight() {
  player.lane = Math.min(2, player.lane + 1);
}

function jump() {
  if (player.grounded) {
    player.velocityY = player.jumpForce;
    player.grounded = false;
  }
}

function slide() {
  player.sliding = true;
  player.slideTimer = 30;
}

player.y = canvas.height - 120;

gameLoop();