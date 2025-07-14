// ===============================
// Flappy Helicopter Game (With Game Start and Game Over Screens)
// ===============================

// ===== Canvas Setup =====
let canvas = document.getElementById("board");
let ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== Game Physics & State =====
let gravity = 0.3;
let lift = -5;
let velocity = 0;
let score = 0;
let gameOver = false;
let gameStarted = false;
let gap = 250;
let musicStarted = false;

// ===== Audio =====
let bgMusic = new Audio("Assets/background.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4;

let jumpSound = new Audio("Assets/Jump.mp3");
jumpSound.volume = 0.05;

let crashSound = new Audio("Assets/crash.wav");

// ===== Images =====
let bgImg = new Image();
bgImg.src = "Assets/Background.png";

let playerImg = new Image();
playerImg.src = "Assets/player.gif";

let pipeUp = new Image();
pipeUp.src = "Assets/pipe_up.png";

let pipeDown = new Image();
pipeDown.src = "Assets/pipe_down.png";

// ===== Game Objects =====
let player = {
  x: 150,
  y: canvas.height / 2,
  width: 150,
  height: 75
};

let pipes = [];

// ===== Drawing Functions =====
function drawBackground() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawPipes() {
  for (let i = 0; i < pipes.length; i++) {
    let pipe = pipes[i];
    let topPipeHeight = pipe.y;
    let bottomPipeY = pipe.y + gap;

    ctx.drawImage(pipeDown, pipe.x, 0, 80, topPipeHeight);
    ctx.drawImage(pipeUp, pipe.x, bottomPipeY, 80, canvas.height - bottomPipeY);
  }
}

function drawStartScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "64px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    "Press SPACE or ↑ to Start",
    canvas.width / 2,
    canvas.height / 2
  );
}

function drawGameOverScreen() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "64px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 40);
  ctx.font = "48px sans-serif";
  ctx.fillText("Score: " + score, canvas.width / 2, canvas.height / 2 + 20);
  ctx.fillText(
    "Press SPACE or ↑ to Restart",
    canvas.width / 2,
    canvas.height / 2 + 80
  );
}

// ===== Main Game Loop =====
function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  if (!gameStarted) {
    drawStartScreen();
    requestAnimationFrame(update);
    return;
  }

  if (gameOver) {
    drawGameOverScreen();
    return;
  }

  // Update player physics
  velocity += gravity;
  player.y += velocity;

  drawPlayer();
  drawPipes();

  for (let i = 0; i < pipes.length; i++) {
    pipes[i].x -= 3;

    if (
      player.x + player.width > pipes[i].x &&
      player.x < pipes[i].x + 80 &&
      (player.y < pipes[i].y || player.y + player.height > pipes[i].y + gap)
    ) {
      crashSound.play();
      bgMusic.pause();
      bgMusic.currentTime = 0;
      gameOver = true;
    }

    if (pipes[i].x + 80 < player.x && !pipes[i].scored) {
      score++;
      pipes[i].scored = true;
    }
  }

  if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 500) {
    pipes.push({
      x: canvas.width,
      y: Math.floor(Math.random() * (canvas.height - gap - 100)) + 50
    });
  }

  if (pipes.length && pipes[0].x < -80) pipes.shift();

  if (player.y + player.height > canvas.height || player.y < 0) {
    crashSound.play();
    bgMusic.pause();
    bgMusic.currentTime = 0;
    gameOver = true;
  }

  ctx.fillStyle = "white";
  ctx.font = "48px sans-serif";
  ctx.textAlign = "start";
  ctx.fillText(`Score: ${score}`, 50, 60);

  requestAnimationFrame(update);
}

// ===== Handle Jumping and Starting Game =====
function jump() {
  if (!gameStarted) {
    startGame();
  } else if (!gameOver) {
    velocity = lift;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
}

// ===== Start or Restart Game =====
function startGame() {
  gameStarted = true;
  gameOver = false;
  velocity = 0;
  score = 0;
  player.y = canvas.height / 2;
  pipes = [
    {
      x: canvas.width,
      y: Math.floor(Math.random() * (canvas.height - gap - 100)) + 50
    }
  ];
  bgMusic.play();
  musicStarted = true;
  update();
}

// ===== Keyboard Input =====
document.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    if (gameOver) {
      startGame();
    } else {
      jump();
    }
  }
});

// ===== Game Start =====
window.onload = function () {
  function drawLoadingScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Loading...", canvas.width / 2, canvas.height / 2);
  }

  drawLoadingScreen();        // Show the loading screen first
  setTimeout(update, 500);    // Then start the game loop after 500ms
};
