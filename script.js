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

let playerShip = null,
  playerBullet = null;
function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}
function initImages() {
  enemyTypes[0].image = loadImage("images/tank01.png");
  enemyTypes[1].image = loadImage("images/tank02.png");
  enemyTypes[2].image = loadImage("images/tank03.png");
  enemyTypes[3].image = loadImage("images/tank04.png");
  playerShip = loadImage("images/player01.png");
  playerBullet = loadImage("images/bullet.png");
}

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
  waveSpawnCounter = 0,
  waveSpawnDelay = 1000,
  enemySpawnDelay = 60,
  enemySpawnCounter = 0,
  currentWave = 0,
  currentWaveTotalHealth = 0,
  spawnCounter = 0,
  trueTimeCounter = 0;
let playerProjectiles = [],
  previousPlayerProjectiles = [],
  enemies = [],
  previousEnemies = [],
  temporaryEnemies = [];
const enemyTypes = [
  {
    id: "tank01",
    health: 20,
    weight: 3,
    xSpeed: 2.5,
    ySpeed: 1,
    width: 50,
    height: 50,
    image: null,
    movement: ["straight", "sine", "hold", "bounce"],
  },
  {
    id: "tank02",
    health: 100,
    weight: 2,
    xSpeed: 4,
    ySpeed: 2,
    width: 64,
    height: 64,
    image: null,
    movement: ["straight", "sine", "hold", "bounce", "semiHoming"],
  },
  {
    id: "tank03",
    health: 500,
    weight: 1.5,
    xSpeed: 7,
    ySpeed: 5,
    width: 75,
    height: 75,
    image: null,
    movement: ["loop", "hold", "bounce", "spread3", "semiHoming"],
  },
  {
    id: "tank04",
    health: 5000,
    weight: 1,
    xSpeed: 10,
    ySpeed: 5,
    width: 100,
    height: 100,
    image: null,
    movement: ["spread3", "hold", "loop", "semiHoming"],
  },
];
//Game processing
function process() {
  if (playing) {
    updateFPS();
    playerFunctions();
    waveSpawn();
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

function waveSpawn() {
  let hpCount = 0;
  trueTimeCounter++;
  for (let i = 0; i < enemies.length; i++) {
    if (enemies[i].wave == currentWave) hpCount += enemies[i].health;
  }
  for (let i = 0; i < temporaryEnemies.length; i++) {
    if (temporaryEnemies[i].wave == currentWave)
      hpCount += temporaryEnemies[i].health;
  }
  if (
    hpCount <= currentWaveTotalHealth * 0.5 ||
    waveSpawnCounter >= waveSpawnDelay
  ) {
    currentWave++;
    currentWaveTotalHealth = 20 + 20 * Math.pow(currentWave, 1.5);
    let temp = currentWaveTotalHealth;
    while (temp > 0) {
      let enemy = selectEnemy(temp);
      if (enemy == null) break;
      temporaryEnemies.push(createEnemy(enemy));
      temp -= enemy.health;
    }
    waveSpawnCounter = -60;
  } else waveSpawnCounter++;
  if (enemySpawnCounter >= enemySpawnDelay && temporaryEnemies.length > 0) {
    enemies.push(temporaryEnemies.shift());
    enemySpawnCounter = 0;
  } else enemySpawnCounter++;
  for (let i = 0; i < enemies.length; i++) {
    let enemy = enemies[i];
    enemyMovement(enemy, trueTimeCounter);
  }
  enemies = enemies.filter((enemy) => enemy.y <= canvas.height - enemy.height);
}

function selectEnemy(totalHealth) {
  let sumWeight = 0,
    flag = 0;
  for (let i = 0; i < enemyTypes.length; i++) sumWeight += enemyTypes[i].weight;
  while (true) {
    let number = sumWeight * Math.random();
    let select = 0;
    for (let i = 0; i < enemyTypes.length; i++) {
      select += enemyTypes[i].weight;
      if (number < select) {
        if (enemyTypes[i].health <= totalHealth) return { ...enemyTypes[i] };
        else {
          flag++;
          break;
        }
      }
    }
    if (flag == 3) break;
  }
  return null;
}

function createEnemy(enemy) {
  let newEnemy = {
    x: Math.random() * (canvas.width - enemy.width),
    y: 0,
    ySpeed: Math.random() * enemy.ySpeed,
    isInvincible: false,
    invincibleDuration: 10,
    lastHitTime: 0,
    visible: true,
    image: enemy.image,
    movement: enemy.movement[Math.floor(Math.random() * enemy.movement.length)],
    wave: currentWave,
    health: enemy.health,
    width: enemy.width,
    height: enemy.height,
  };
  switch (newEnemy.movement) {
    case "sine":
      newEnemy.baseX = newEnemy.x;
      newEnemy.amplitude = Math.random() * 100;
      newEnemy.frequency = Math.random() * 0.03;
      break;
    case "bounce":
      newEnemy.xSpeed = enemy.xSpeed * Math.random();
      break;
    case "hold":
      newEnemy.yLimit = (Math.random() + 1) * canvas.height * 0.4;
      break;
    case "semiHoming":
      newEnemy.speed = ((enemy.xSpeed + enemy.ySpeed) / 3) * Math.random();
      break;
    case "spread3":
      newEnemy.yLimit = (Math.random() + 1) * canvas.height * 0.4;
      newEnemy.spreaded = false;
      break;
    case "loop":
      newEnemy.yLimit = (Math.random() + 1) * canvas.height * 0.4;
      newEnemy.increased = false;
      newEnemy.speed = enemy.xSpeed * 2 * Math.random();
      break;
  }
  return newEnemy;
}

function enemyMovement(enemy) {
  switch (enemy.movement) {
    case "straight":
      enemy.y += enemy.ySpeed;
      break;
    case "sine":
      enemy.y += enemy.ySpeed;
      enemy.x =
        enemy.baseX +
        enemy.amplitude * Math.sin(trueTimeCounter * enemy.frequency);
      enemy.x = Math.min(enemy.x, canvas.width - enemy.width);
      enemy.x = Math.max(enemy.x, 0);
      break;
    case "bounce":
      enemy.y += enemy.ySpeed;
      enemy.x += enemy.xSpeed;
      if (
        enemy.x + enemy.xSpeed >= canvas.width - enemy.width ||
        enemy.x + enemy.xSpeed < 0
      )
        enemy.xSpeed = -enemy.xSpeed;
      break;
    case "hold":
      if (enemy.y < enemy.yLimit) enemy.y += enemy.ySpeed;
      break;
    case "semiHoming":
      if (enemy.y >= playerY) enemy.y += enemy.speed;
      else {
        let dx = playerX - enemy.x;
        let dy = playerY - enemy.y;
        let angle = Math.atan2(dy, dx);
        enemy.x += Math.cos(angle) * enemy.speed;
        enemy.y += Math.sin(angle) * enemy.speed;
      }
      break;
    case "spread3":
      if (enemy.y < enemy.yLimit) enemy.y += enemy.ySpeed;
      else if (!enemy.spreaded) {
        enemy.spreaded = true;
        let newEnemyRight = { ...enemy },
          newEnemyLeft = { ...enemy };
        newEnemyRight.x = Math.min(
          enemy.x + enemy.width,
          canvas.width - enemy.width
        );
        newEnemyLeft.x = Math.max(enemy.x - enemy.width, 0);
        temporaryEnemies.push(newEnemyRight);
        temporaryEnemies.push(newEnemyLeft);
      }
      break;
    case "loop":
      if (enemy.y < enemy.yLimit) enemy.y += enemy.ySpeed;
      else if (!enemy.increased) {
        enemy.increased = true;
        enemy.xSpeed = enemy.speed;
      }
      if (enemy.increased) {
        enemy.x += enemy.xSpeed;
        if (
          enemy.x + enemy.xSpeed >= canvas.width - enemy.width ||
          enemy.x + enemy.xSpeed < 0
        )
          enemy.xSpeed = -enemy.xSpeed;
      }
      break;
  }
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
        bullet.y <= enemy.y + enemy.height &&
        !enemy.isInvincible
      ) {
        enemy.health -= bullet.damage;
        enemy.isInvincible = true;
        enemy.lastHitTime = trueTimeCounter;
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
    if (trueTimeCounter - enemy.lastHitTime >= enemy.invincibleDuration) {
      enemy.isInvincible = false;
      enemy.visible = true;
    } else {
      enemy.visible = false;
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
ctx.imageSmoothingEnabled = false;
let playerX = 0,
  playerY = canvas.height - 100;

initImages();
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

  for (let i = 0; i < enemies.length; i++) {
    let enemy = enemies[i];
    if (!enemy.visible) ctx.globalAlpha = 0.5;
    ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
    ctx.globalAlpha = 1.0;
  }

  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.fillText(`FPS: ${fps.toFixed(1)}`, 10, 20);

  endScreen();
  window.requestAnimationFrame(draw);
}
