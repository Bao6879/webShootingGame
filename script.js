//Canvas settings
const canvas = document.getElementById("myCanvas");
canvas.width = window.innerWidth * 0.5;
canvas.height = window.innerHeight;

//Others
document.addEventListener("keydown", (event) => {
  const key = event.key;
  if (key == "D" || key == "d") dPressed = true;
  else if (key == "A" || key == "a") aPressed = true;
  else if (key == "w" || key == "w") wPressed = true;
  else if (key == "S" || key == "s") sPressed = true;
  else if (key == "Enter") shooting = true;
});

document.addEventListener("keyup", (event) => {
  const key = event.key;
  if (key == "D" || key == "d") dPressed = false;
  else if (key == "A" || key == "a") aPressed = false;
  else if (key == "w" || key == "w") wPressed = false;
  else if (key == "S" || key == "s") sPressed = false;
  else if (key == "Enter") shooting = false;
});

let fps = 0,
  lastCalled = performance.now();
function updateFPS() {
  const now = performance.now();
  const delta = (now - lastCalled) / 1000;
  lastCalled = now;
  fps = 1 / delta;
}

const playerShip = new Image(),
  playerBullet = new Image(),
  enemyShip = new Image();
playerShip.src = "images/player01.png";
playerBullet.src = "images/bullet.png";
enemyShip.src = "images/enemy01.png";

//Game variables
let aPressed = false,
  sPressed = false,
  dPressed = false,
  wPressed = false,
  shooting = false,
  playing = true;
let playerMovementSpeed = 3,
  projectileSpeed = 10,
  projectileDamage = 20,
  shootingCounter = 0,
  shootingCooldown = 20,
  enemySpawnCounter = 0,
  enemySpawnDelay = 1000000,
  currentWave = 0,
  currentWaveTotalHealth = 0;
let playerProjectiles = [],
  previousPlayerProjectiles = [],
  enemies = [],
  previousEnemies = [];
const enemyTypes = [
  { id: "tank1", health: 20, weight: 3, width: 50, height: 50 },
];
//Game processing
function process() {
  if (playing) {
    updateFPS();
    playerFunctions();
    enemySpawn();
    collision();
  }
}

function playerFunctions() {
  if (dPressed && playerX <= canvas.width - playerMovementSpeed - 64)
    playerX += playerMovementSpeed;
  if (aPressed && playerX >= playerMovementSpeed)
    playerX -= playerMovementSpeed;
  if (wPressed && playerY >= playerMovementSpeed)
    playerY -= playerMovementSpeed;
  if (sPressed && playerY <= canvas.height - playerMovementSpeed - 64)
    playerY += playerMovementSpeed;
  if (shooting) {
    if (shootingCounter >= shootingCooldown) {
      playerProjectiles.push({
        x: playerX + 20,
        y: playerY,
        width: 10,
        height: 10,
        health: 1,
        damage: projectileDamage,
      });
      shootingCounter = 0;
    } else shootingCounter++;
  }
  for (let i = 0; i < playerProjectiles.length; i++) {
    playerProjectiles[i].y -= projectileSpeed;
  }
  playerProjectiles = playerProjectiles.filter((bullet) => bullet.y >= -50);
}

function enemySpawn() {
  let hpCount = 0;
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].wave == currentWave) hpCount += enemies[i].health;
  }
  console.log(hpCount);
  if (
    hpCount <= currentWaveTotalHealth * 0.5 ||
    enemySpawnCounter >= enemySpawnDelay
  ) {
    currentWave++;
    currentWaveTotalHealth = 20 + 10 * (currentWave * 2);
    console.log(currentWave, currentWaveTotalHealth);
    let temp = currentWaveTotalHealth;
    while (temp > 0) {
      let dice = Math.floor(Math.random() * enemyTypes[0].weight + 1);
      let flag = false;
      for (let i = 0; i < enemyTypes.length; i++) {
        let enemy = enemyTypes[i];
        if (dice < enemy.weight) {
          enemies.push({
            x: Math.random() * (canvas.width - 50),
            y: 0,
            wave: currentWave,
            health: enemy.health,
            width: enemy.width,
            height: enemy.height,
          });
          flag = true;
          temp -= enemy.health;
          break;
        }
      }
    }
    console.log(currentWave, currentWaveTotalHealth);
    enemySpawnCounter = -60;
  } else enemySpawnCounter++;
  for (let i = 0; i < enemies.length; i++) enemies[i].y += 0.2;
  enemies = enemies.filter((enemy) => enemy.y <= canvas.height - enemy.height);
}

function collision() {
  for (let i = 0; i < playerProjectiles.length; i++) {
    let bullet = playerProjectiles[i];
    for (let j = 0; j < enemies.length; j++) {
      if (bullet.health <= 0) break;
      let enemy = enemies[j];
      if (enemy.health <= 0) continue;
      if (
        bullet.x + bullet.width >= enemy.x &&
        bullet.x <= enemy.x + enemy.width &&
        bullet.y + bullet.height >= enemy.y &&
        bullet.y <= enemy.y + enemy.height
      ) {
        enemy.health -= bullet.projectileDamage;
        bullet.health--;
      }
    }
  }
  playerProjectiles = playerProjectiles.filter((bullet) => bullet.health > 0);
  enemies = enemies.filter((enemy) => enemy.health > 0);
  for (let i = 0; i < enemies.length; i++) {
    let enemy = enemies[i];
    if (
      enemy.x + enemy.width >= playerX + 17 &&
      enemy.x <= playerX + 47 &&
      enemy.y + enemy.height >= playerY + 34 &&
      enemy.y <= playerY + 64
    ) {
      playing = false;
    }
  }
}

function endScreen() {
  if (!playing) {
    ctx.strokeStyle = "rgb(255 0 0)";
    ctx.font = "100px Arial";
    ctx.fillText("YOU LOST!", canvas.width / 8, canvas.height / 2);
  }
}

//Drawing
const ctx = canvas.getContext("2d");
let playerX = 0,
  playerY = canvas.height - 100;

window.requestAnimationFrame(draw);

function draw() {
  process();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgb(0 0 0)";
  ctx.strokeStyle = "rgb(255 0 0)";
  ctx.save();

  ctx.drawImage(playerShip, playerX, playerY, 64, 64);
  ctx.beginPath();
  ctx.rect(playerX + 17, playerY + 34, 30, 30);
  ctx.stroke();

  ctx.fillStyle = "yellow";
  for (let i = 0; i < playerProjectiles.length; i++) {
    let bullet = playerProjectiles[i];
    ctx.drawImage(
      playerBullet,
      bullet.x,
      bullet.y,
      bullet.width,
      bullet.height
    );
  }

  ctx.fillStyle = "red";
  for (let i = 0; i < enemies.length; i++) {
    let enemy = enemies[i];
    ctx.drawImage(enemyShip, enemy.x, enemy.y, enemy.width, enemy.height);
  }

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(`FPS: ${fps.toFixed(1)}`, 10, 20);

  endScreen();
  window.requestAnimationFrame(draw);
}
