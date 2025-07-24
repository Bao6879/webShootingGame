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
let score = 0,
    streak = 0,
    previousKill = 0,
    streakTimeReq = 300,
    streakAlpha = 0,
    streakCounter = 0,
    currentMultiplier = 1;
let playerProjectiles = [],
    previousPlayerProjectiles = [],
    enemies = [],
    previousEnemies = [],
    temporaryEnemies = [];
const streakDisplayTime = 300,
    streakFadeSpeed = 0.02;
const streakNames = [
    "Double Kill",
    "Triple Kill",
    "Quadra Kill",
    "Penta Kill",
    "Hexa Kill",
    "Hepta Kill",
    "Octo Kill",
    "Nona Kill",
    "Deca Kill",
    "Super Combo",
    "Hyper Combo",
    "Ultra Combo",
    "Mega Combo",
    "Giga Combo",
    "Tera Combo",
    "Peta Combo",
    "Exa Combo",
    "Zetta Combo",
    "Yotta Combo",
    "Bronto Combo",
    "Overkill",
    "Unstoppable",
    "Annhilating",
    "Godlike",
    "Ungodly",
];
const enemyTypes = [
    {
        id: "tank01",
        health: 50,
        weight: 2.75,
        xSpeed: 2.5,
        ySpeed: 1,
        width: 50,
        height: 50,
        image: null,
        point: 10,
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
        point: 30,
        movement: ["straight", "sine", "zigzag", "hold", "bounce", "semiHoming"],
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
        point: 70,
        movement: ["loop", "hold", "bounce", "zigzag", "spread3", "semiHoming", "random"],
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
        point: 100,
        movement: ["spread3", "hold", "loop", "random", "semiHoming"],
    },
    {
        id: "charge01",
        health: 20,
        weight: 3,
        xSpeed: 10,
        ySpeed: 5,
        width: 100,
        height: 100,
        image: null,
        point: 100,
        movement: ["straight", "jitter", "accel", "zigzag", "semiHoming", "charge"],
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
    if (dPressed && playerX <= canvas.width - playerMovementSpeed - 64) playerX += playerMovementSpeed;
    if (aPressed && playerX >= playerMovementSpeed) playerX -= playerMovementSpeed;
    if (wPressed && playerY >= playerMovementSpeed) playerY -= playerMovementSpeed;
    if (sPressed && playerY <= canvas.height - playerMovementSpeed - 64) playerY += playerMovementSpeed;
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
        if (temporaryEnemies[i].wave == currentWave) hpCount += temporaryEnemies[i].health;
    }
    if (hpCount <= currentWaveTotalHealth * 0.5 || waveSpawnCounter >= waveSpawnDelay) {
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
        point: enemy.point,
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
            newEnemy.maxTurn = Math.random() * 2;
            newEnemy.speed = ((enemy.xSpeed + enemy.ySpeed) / 3) * Math.random();
            break;
        case "spread3":
            newEnemy.yLimit = (Math.random() + 1) * canvas.height * 0.4;
            let temp = Math.floor(Math.random() * 101),
                count = 3;
            if (temp <= 70) count = 3;
            else if (temp <= 95) count = 5;
            else count = Math.floor(canvas.width / newEnemy.width);
            newEnemy.spreadCount = 3;
            newEnemy.spreaded = false;
            break;
        case "loop":
            newEnemy.yLimit = (Math.random() + 1) * canvas.height * 0.4;
            newEnemy.increased = false;
            newEnemy.speed = enemy.xSpeed * Math.random();
            break;
        case "accel":
            newEnemy.lastCall = 0;
            newEnemy.acceleration = Math.random() * 0.1;
            newEnemy.delay = Math.floor(Math.random() * 20 + 50);
            break;
        case "random":
            newEnemy.lastCall = 0;
            newEnemy.originYSpeed = enemy.ySpeed;
            newEnemy.originXSpeed = enemy.xSpeed;
            newEnemy.xSpeed = enemy.xSpeed;
            newEnemy.delay = Math.floor(Math.random() * 20 + 50);
            break;
        case "jitter":
            newEnemy.amplitude = enemy.xSpeed * Math.random() * 3;
            newEnemy.lastCall = 0;
            newEnemy.delay = Math.floor(Math.random() * 20 + 50);
            break;
        case "zigzag":
            newEnemy.amplitude = canvas.width * Math.random();
            newEnemy.originX = newEnemy.x;
            newEnemy.xSpeed = enemy.xSpeed;
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
            enemy.x = enemy.baseX + enemy.amplitude * Math.sin(trueTimeCounter * enemy.frequency);
            enemy.x = Math.min(enemy.x, canvas.width - enemy.width);
            enemy.x = Math.max(enemy.x, 0);
            break;
        case "bounce":
            enemy.y += enemy.ySpeed;
            enemy.x += enemy.xSpeed;
            if (enemy.x + enemy.xSpeed >= canvas.width - enemy.width || enemy.x + enemy.xSpeed < 0) enemy.xSpeed = -enemy.xSpeed;
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
                angle = Math.max(angle, enemy.maxTurn);
                enemy.x += Math.cos(angle) * enemy.speed;
                enemy.y += Math.sin(angle) * enemy.speed;
            }
            break;
        case "spread3":
            if (enemy.y < enemy.yLimit) enemy.y += enemy.ySpeed;
            else if (!enemy.spreaded) {
                enemy.spreaded = true;
                let additional = enemy.width;
                for (let i = 0; i < Math.floor(enemy.spreadCount / 2); i++) {
                    let newEnemyRight = { ...enemy },
                        newEnemyLeft = { ...enemy };
                    newEnemyRight.x = Math.min(enemy.x + enemy.width + additional, canvas.width - enemy.width);
                    newEnemyLeft.x = Math.max(enemy.x - enemy.width - additional, 0);
                    temporaryEnemies.push(newEnemyRight);
                    temporaryEnemies.push(newEnemyLeft);
                    additional += enemy.width;
                }
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
                if (enemy.x + enemy.xSpeed >= canvas.width - enemy.width || enemy.x + enemy.xSpeed < 0) enemy.xSpeed = -enemy.xSpeed;
            }
            break;
        case "accel":
            if (trueTimeCounter - enemy.lastCall >= enemy.delay) {
                enemy.ySpeed += enemy.acceleration;
                enemy.lastCall = trueTimeCounter;
            }
            enemy.y += enemy.ySpeed;
            break;
        case "random":
            if (trueTimeCounter - enemy.lastCall >= enemy.delay) {
                if (Math.random() < 0.5) enemy.xSpeed = Math.random() * originXSpeed;
                else enemy.xSpeed = -Math.random() * originXSpeed;
                if (Math.random() < 0.5) enemy.ySpeed = Math.random() * originYSpeed;
                else enemy.ySpeed = -Math.random() * originYSpeed;
                enemy.lastCall = trueTimeCounter;
            }
            enemy.y += enemy.ySpeed;
            enemy.x += enemy.xSpeed;
            enemy.x = Math.min(enemy.x, canvas.width - enemy.width);
            enemy.x = Math.max(enemy.x, 0);
            break;
        case "jitter":
            if (trueTimeCounter - enemy.lastCall >= enemy.delay) {
                if (Math.random() < 0.5) enemy.x += Math.random() * enemy.amplitude;
                else enemy.x -= Math.random() * enemy.amplitude;
                enemy.y += enemy.ySpeed;
                enemy.x = Math.min(enemy.x, canvas.width - enemy.width);
                enemy.x = Math.max(enemy.x, 0);
                enemy.lastCall = trueTimeCounter;
            }
            break;
        case "zigzag":
            enemy.y += enemy.ySpeed;
            enemy.x += enemy.xSpeed;
            if (
                enemy.x + enemy.xSpeed >= canvas.width - enemy.width ||
                enemy.x + enemy.xSpeed < 0 ||
                enemy.x + enemy.xSpeed >= enemy.originX + enemy.amplitude - enemy.width ||
                enemy.x + enemy.xSpeed < enemy.originX - enemy.amplitude
            )
                enemy.xSpeed = -enemy.xSpeed;
            enemy.x = Math.min(enemy.x, canvas.width - enemy.width);
            enemy.x = Math.max(enemy.x, 0);
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
    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].health <= 0) {
            if (trueTimeCounter - previousKill <= streakTimeReq || previousKill == 0) {
                streak++;
                streakAlpha = 0;
                streakCounter = 0;
                streakTimeReq = 80 + 220 * Math.pow(0.7, streak - 1);
                previousKill = trueTimeCounter;
            } else {
                streak = 1;
                streakTimeReq = 300;
                previousKill = trueTimeCounter;
            }
            score += enemies[i].point * Math.round((currentMultiplier * 10) / 10);
            if (streak <= 1) currentMultiplier = 1;
            else currentMultiplier = Math.round((Math.min(50, 1 + Math.exp((Math.log(49) / 24) * (streak - 1))) * 10) / 10);
        }
    }
    playerProjectiles = playerProjectiles.filter((bullet) => bullet.health > 0);
    enemies = enemies.filter((enemy) => enemy.health > 0);
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        if (enemy.x + enemy.width >= playerX + 17 && enemy.x <= playerX + 47 && enemy.y + enemy.height >= playerY + 34 && enemy.y <= playerY + 64) {
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
        ctx.textAlign = "center";
        ctx.strokeStyle = "rgba(255 0 0 1)";
        ctx.font = "bold 100px Arial";
        ctx.fillText("YOU LOST!", canvas.width / 2, canvas.height / 2);
        ctx.textAlign = "left";
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

    for (let i = 0; i < playerProjectiles.length; i++) {
        let bullet = playerProjectiles[i];
        ctx.drawImage(playerBullet, bullet.x, bullet.y, bullet.width, bullet.height);
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

    ctx.font = "30px monospace";
    ctx.fillText("Score: " + score, canvas.width - 250, 40);

    if (streak >= 2) {
        if (streakCounter < streakDisplayTime) streakAlpha = Math.min(streakAlpha + streakFadeSpeed, 1);
        else streakAlpha = Math.max(streakAlpha - streakFadeSpeed, 0);
        streakCounter++;
        ctx.fillStyle = `rgba(255, 215, 0, ${streakAlpha})`;
        ctx.font = "bold 35px monospace";
        ctx.textAlign = "center";
        ctx.fillText(streakNames[streak - 2], canvas.width / 2, 100);
        ctx.fillText("Current multiplier: " + currentMultiplier + "x", canvas.width / 2, 150);
        ctx.textAlign = "left";
    }

    endScreen();
    window.requestAnimationFrame(draw);
}
