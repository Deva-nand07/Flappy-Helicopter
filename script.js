// =======================================================
// Flappy Helicopter Game
// Features:
// - Start screen
// - Restart after game over
// - Touch + keyboard controls
// - Pause / Play system
// =======================================================

// ===============================
// Canvas Setup
// ===============================
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===============================
// Game Physics & State
// ===============================
let gravity = 0.3; // downward force
let lift = -6; // upward jump force
let velocity = 0; // player vertical speed

let score = 0;
let gap = 250;

let gameStarted = false;
let gameOver = false;
let isPaused = false;

// ===============================
// Audio
// ===============================
const bgMusic = new Audio("Assets/background.mp3");
bgMusic.loop = true;
bgMusic.volume = 0.4;

const jumpSound = new Audio("Assets/Jump.mp3");
jumpSound.volume = 0.05;

const crashSound = new Audio("Assets/crash.wav");

// ===============================
// Images
// ===============================
const bgImg = new Image();
bgImg.src = "Assets/Background.png";

const playerImg = new Image();
playerImg.src = "Assets/player.gif";

const pipeUp = new Image();
pipeUp.src = "Assets/pipe_up.png";

const pipeDown = new Image();
pipeDown.src = "Assets/pipe_down.png";

// ===============================
// Game Objects
// ===============================
const player = {
  x: 150,
  y: canvas.height / 2,
  width: 150,
  height: 75,
};

let pipes = [];

// ===============================
// Drawing Functions
// ===============================
function drawBackground() {
  ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
  ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

function drawPipes() {
  pipes.forEach((pipe) => {
    const topHeight = pipe.y;
    const bottomY = pipe.y + gap;

    ctx.drawImage(pipeDown, pipe.x, 0, 80, topHeight);
    ctx.drawImage(pipeUp, pipe.x, bottomY, 80, canvas.height - bottomY);
  });
}

function drawStartScreen() {
  ctx.fillStyle = "rgba(0,0,0,0.5)";
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
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "64px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 40);

  ctx.font = "48px sans-serif";
  ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
  ctx.fillText(
    "Press SPACE or ↑ to Restart",
    canvas.width / 2,
    canvas.height / 2 + 80
  );
}

function drawPauseScreen() {
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.font = "64px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);
}

// ===============================
// Main Game Loop
// ===============================
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
    requestAnimationFrame(update);
    return;
  }

  if (isPaused) {
    drawPauseScreen();
    requestAnimationFrame(update);
    return;
  }

  // Player physics
  velocity += gravity;
  player.y += velocity;

  drawPlayer();
  drawPipes();

  // Pipe logic
  pipes.forEach((pipe) => {
    pipe.x -= 3;

    if (
      player.x + player.width > pipe.x &&
      player.x < pipe.x + 80 &&
      (player.y < pipe.y || player.y + player.height > pipe.y + gap)
    ) {
      crashSound.play();
      bgMusic.pause();
      bgMusic.currentTime = 0;
      gameOver = true;
    }

    if (pipe.x + 80 < player.x && !pipe.scored) {
      score++;
      pipe.scored = true;
    }
  });

  if (!pipes.length || pipes[pipes.length - 1].x < canvas.width - 500) {
    pipes.push({
      x: canvas.width,
      y: Math.floor(Math.random() * (canvas.height - gap - 100)) + 50,
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

// ===============================
// Controls
// ===============================
function jump() {
  if (isPaused) return;

  if (!gameStarted) {
    startGame();
  } else if (!gameOver) {
    velocity = lift;
    jumpSound.currentTime = 0;
    jumpSound.play();
  }
}

function startGame() {
  gameStarted = true;
  gameOver = false;
  isPaused = false;

  velocity = 0;
  score = 0;
  player.y = canvas.height / 2;

  pipes = [
    {
      x: canvas.width,
      y: Math.floor(Math.random() * (canvas.height - gap - 100)) + 50,
    },
  ];

  bgMusic.play();
}

// Keyboard
document.addEventListener("keydown", (e) => {
  // Jump
  if (e.code === "Space" || e.code === "ArrowUp") {
    gameOver ? startGame() : jump();
  }

  // Pause with P key
  if (e.code === "KeyP") {
    if (!gameStarted || gameOver) return;

    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "▶" : "⏸";
    isPaused ? bgMusic.pause() : bgMusic.play();
  }
});

// Jump Button
const jumpBtn = document.getElementById("jumpBtn");

jumpBtn.addEventListener("mousedown", () => {
  gameOver ? startGame() : jump();
});

jumpBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  gameOver ? startGame() : jump();
});

// Pause Button
const pauseBtn = document.getElementById("pauseBtn");

pauseBtn.addEventListener("click", () => {
  if (!gameStarted || gameOver) return;

  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "▶" : "⏸";
  isPaused ? bgMusic.pause() : bgMusic.play();
});

// ===============================
// Initial Start
// ===============================
window.onload = () => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "48px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Loading...", canvas.width / 2, canvas.height / 2);
  setTimeout(update, 500);
};
