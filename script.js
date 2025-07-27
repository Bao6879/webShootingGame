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
    else if (key == "Escape") {
        if (!paused) pauseStartTime = Date.now();
        else totalPausedTime += Date.now() - pauseStartTime;
        paused = !paused;
    } else if (key == "R" || key == "r") restartGame();
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
    enemyTypes[4].image = loadImage("images/charge01.png");
    enemyTypes[5].image = loadImage("images/charge02.png");
    enemyTypes[6].image = loadImage("images/charge03.png");
    enemyTypes[7].image = loadImage("images/charge04.png");
    enemyTypes[8].image = loadImage("images/shoot01.png");
    enemyTypes[9].image = loadImage("images/shoot02.png");
    enemyTypes[10].image = loadImage("images/shoot03.png");
    enemyTypes[11].image = loadImage("images/shoot04.png");
    playerShip = loadImage("images/player01.png");
    playerBullet = loadImage("images/bullet.png");
}

//Game variables
let aPressed = false,
    sPressed = false,
    dPressed = false,
    wPressed = false,
    shooting = false,
    playing = true,
    paused = false;
let startTime = Date.now(),
    pauseStartTime = null,
    totalPausedTime = 0,
    endTime = null;
let playerMovementSpeed = 3,
    projectileSpeed = 10,
    projectileDamage = 20,
    shootingCounter = 0,
    shootingCooldown = 20,
    waveSpawnCounter = 0,
    waveSpawnDelay = 500,
    enemySpawnDelay = 30,
    enemySpawnCounter = 0,
    currentWave = 0,
    currentWaveTotalHealth = 0,
    spawnCounter = 0,
    trueTimeCounter = 0;
let score = 0,
    totalTime = 0,
    streak = 0,
    previousKill = 0,
    streakTimeReq = 300,
    streakAlpha = 0,
    streakCounter = 0,
    currentMultiplier = 1;
let playerProjectiles = [],
    enemies = [],
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
        type: "melee",
        health: 50,
        weight: 2.75,
        xSpeed: 4,
        ySpeed: 1,
        width: 50,
        height: 50,
        image: null,
        point: 10,
        movement: ["straight", "sine", "hold", "bounce"],
    },
    {
        id: "tank02",
        type: "melee",
        health: 200,
        weight: 2.5,
        xSpeed: 3,
        ySpeed: 2,
        width: 64,
        height: 64,
        image: null,
        point: 30,
        movement: ["straight", "sine", "zigzag", "hold", "bounce", "semiHoming"],
    },
    {
        id: "tank03",
        type: "melee",
        health: 500,
        weight: 2.5,
        xSpeed: 7,
        ySpeed: 5,
        width: 75,
        height: 75,
        image: null,
        point: 70,
        movement: ["loop", "hold", "bounce", "zigzag", "spread", "semiHoming", "random"],
    },
    {
        id: "tank04",
        type: "melee",
        health: 5000,
        weight: 1.25,
        xSpeed: 10,
        ySpeed: 5,
        width: 100,
        height: 100,
        image: null,
        point: 100,
        movement: ["spread", "hold", "loop", "random", "semiHoming"],
    },
    {
        id: "charge01",
        type: "melee",
        health: 20,
        weight: 3.5,
        xSpeed: 3,
        ySpeed: 4,
        width: 50,
        height: 50,
        image: null,
        point: 5,
        movement: ["straight", "jitter", "accel", "zigzag", "semiHoming", "charge"],
    },
    {
        id: "charge02",
        type: "melee",
        health: 50,
        weight: 2,
        xSpeed: 4,
        ySpeed: 5,
        width: 45,
        height: 45,
        image: null,
        point: 20,
        movement: ["random", "accel", "zigzag", "semiHoming", "charge"],
    },
    {
        id: "charge03",
        type: "melee",
        health: 200,
        weight: 1.5,
        xSpeed: 8,
        ySpeed: 7,
        width: 40,
        height: 40,
        image: null,
        point: 50,
        movement: ["random", "accel", "randomZigzag", "trueHoming", "superCharge", "spreadHoming"],
    },
    {
        id: "charge04",
        type: "melee",
        health: 500,
        weight: 1,
        xSpeed: 10,
        ySpeed: 8,
        width: 35,
        height: 35,
        image: null,
        point: 70,
        movement: ["spreadHoming", "random", "randomZigzag", "trueHoming", "hyperCharge"],
    },
    {
        id: "shoot01",
        type: "range",
        health: 20,
        weight: 3.5,
        xSpeed: 3,
        ySpeed: 4,
        width: 50,
        height: 50,
        image: null,
        point: 15,
        movement: ["loop", "hold", "retreat"],
    },
    {
        id: "shoot02",
        type: "range",
        health: 50,
        weight: 2,
        xSpeed: 3,
        ySpeed: 4,
        width: 50,
        height: 50,
        image: null,
        point: 40,
        movement: ["loop", "hold", "retreat"],
    },
    {
        id: "shoot03",
        type: "range",
        health: 200,
        weight: 1.5,
        xSpeed: 3,
        ySpeed: 4,
        width: 50,
        height: 50,
        image: null,
        point: 100,
        movement: ["loop", "hold", "retreat", "semiMirror"],
    },
    {
        id: "shoot04",
        type: "range",
        health: 500,
        weight: 1,
        xSpeed: 3,
        ySpeed: 4,
        width: 50,
        height: 50,
        image: null,
        point: 150,
        movement: ["loop", "hold", "trueMirror"],
    },
];
//Game processing
function process() {
    if (playing && !paused) {
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
        currentWaveTotalHealth = 20 + 20 * Math.pow(currentWave, 1.1);
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
        invincibleDuration: 5,
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
            if (enemy.type == "melee") newEnemy.yLimit = (Math.random() + 1) * canvas.height * 0.4;
            else newEnemy.yLimit = Math.random() * canvas.height * 0.3;
            break;
        case "semiHoming":
            newEnemy.maxTurn = Math.random() * 2;
            newEnemy.speed = ((enemy.xSpeed + enemy.ySpeed) / 2) * Math.random();
            break;
        case "trueHoming":
            newEnemy.speed = ((enemy.xSpeed + enemy.ySpeed) / 4) * Math.random();
            break;
        case "spreadHoming":
            newEnemy.yLimit = Math.random() * canvas.height * 0.4;
            let dice = Math.floor(Math.random() * 101),
                number = 3;
            if (dice <= 70) number = 3;
            else if (dice <= 95) number = 5;
            else number = Math.floor(canvas.width / newEnemy.width);
            newEnemy.spreadCount = number;
            newEnemy.speed = ((enemy.xSpeed + enemy.ySpeed) / 3) * Math.random();
            newEnemy.spreaded = false;
        case "spread":
            if (enemy.type == "melee") newEnemy.yLimit = (Math.random() + 1) * canvas.height * 0.4;
            else newEnemy.yLimit = Math.random() * canvas.height * 0.3;
            let temp = Math.floor(Math.random() * 101),
                count = 3;
            if (temp <= 70) count = 3;
            else if (temp <= 95) count = 5;
            else count = Math.floor(canvas.width / newEnemy.width);
            newEnemy.spreadCount = count;
            newEnemy.spreaded = false;
            break;
        case "lowSpread":
        case "loop":
            if (enemy.type == "melee") newEnemy.yLimit = (Math.random() + 1) * canvas.height * 0.4;
            else newEnemy.yLimit = Math.random() * canvas.height * 0.3;
            newEnemy.increased = false;
            newEnemy.speed = enemy.xSpeed * Math.random();
            break;
        case "accel":
            newEnemy.lastCall = 0;
            newEnemy.acceleration = Math.random() * 0.5;
            newEnemy.delay = Math.floor(Math.random() * 10 + 10);
            break;
        case "random":
            newEnemy.lastCall = 0;
            newEnemy.originYSpeed = enemy.ySpeed;
            newEnemy.originXSpeed = enemy.xSpeed;
            newEnemy.xSpeed = enemy.xSpeed;
            newEnemy.delay = Math.floor(Math.random() * 20 + 30);
            break;
        case "jitter":
            newEnemy.amplitude = enemy.xSpeed * Math.random() * 5;
            newEnemy.lastCall = 0;
            newEnemy.delay = Math.floor(Math.random() * 10 + 10);
            break;
        case "zigzag":
            newEnemy.amplitude = (canvas.width / 2) * Math.random();
            newEnemy.originX = newEnemy.x;
            newEnemy.xSpeed = enemy.xSpeed;
            break;
        case "randomZigzag":
            newEnemy.amplitude = (canvas.width / 2) * (Math.random() + 0.2);
            newEnemy.originX = newEnemy.x;
            newEnemy.xSpeed = enemy.xSpeed;
            newEnemy.lastCall = 0;
            newEnemy.delay = Math.floor(Math.random() * 20 + 20);
            break;
        case "charge":
            newEnemy.speed = ((enemy.xSpeed + enemy.ySpeed) / 3) * (Math.random() + 1);
            newEnemy.yLimit = Math.random() * canvas.height * 0.4;
            newEnemy.charged = false;
            newEnemy.lastCall = 0;
            newEnemy.delay = (Math.random() + 1) * 60;
            newEnemy.xSpeed = enemy.xSpeed;
            break;
        case "superCharge":
            newEnemy.xSpeed = enemy.xSpeed;
            newEnemy.speed = ((enemy.xSpeed + enemy.ySpeed) / 3) * (Math.random() + 2);
            newEnemy.yLimit = Math.random() * canvas.height * 0.4;
            newEnemy.charged = false;
            newEnemy.lastCall = 0;
            newEnemy.delay = (Math.random() + 1) * 60;
            newEnemy.acceleration = Math.random() + 1.5;
            break;
        case "hyperCharge":
            newEnemy.xSpeed = enemy.xSpeed;
            newEnemy.speed = ((enemy.xSpeed + enemy.ySpeed) / 3) * (Math.random() + 2);
            newEnemy.yLimit = Math.random() * canvas.height * 0.4;
            newEnemy.charged = false;
            newEnemy.lastCall = 0;
            newEnemy.delay = (Math.random() + 1) * 60;
            newEnemy.acceleration = Math.random() + 1.5;
            break;
        case "retreat":
            newEnemy.retreated = false;
            newEnemy.yLimit = Math.random() * canvas.height * 0.3;
            break;
        case "semiMirror":
            newEnemy.yLimit = Math.random() * canvas.height * 0.3;
            newEnemy.maxTurn = Math.random() * 5;
            break;
        case "trueMirror":
            newEnemy.yLimit = Math.random() * canvas.height * 0.4;
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
        case "trueHoming":
            let dx = playerX - enemy.x;
            let dy = playerY - enemy.y;
            let angle = Math.atan2(dy, dx);
            enemy.x += Math.cos(angle) * enemy.speed;
            enemy.y += Math.sin(angle) * enemy.speed;
            break;
        case "spread":
            if (enemy.y < enemy.yLimit) enemy.y += enemy.ySpeed;
            else if (!enemy.spreaded) {
                enemy.spreaded = true;
                let additional = 0;
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
        case "spreadHoming":
            if (enemy.y < enemy.yLimit && !enemy.spreaded) enemy.y += enemy.ySpeed;
            else if (!enemy.spreaded) {
                enemy.spreaded = true;
                let additional = 0;
                for (let i = 0; i < Math.floor(enemy.spreadCount / 2); i++) {
                    let newEnemyRight = { ...enemy },
                        newEnemyLeft = { ...enemy };
                    newEnemyLeft.speed += Math.random();
                    newEnemyRight.speed += Math.random();
                    newEnemyRight.x = Math.min(enemy.x + enemy.width + additional, canvas.width - enemy.width);
                    newEnemyLeft.x = Math.max(enemy.x - enemy.width - additional, 0);
                    temporaryEnemies.push(newEnemyRight);
                    temporaryEnemies.push(newEnemyLeft);
                    additional += enemy.width;
                }
            } else {
                let dx = playerX - enemy.x;
                let dy = playerY - enemy.y;
                let angle = Math.atan2(dy, dx);
                enemy.x += Math.cos(angle) * enemy.speed;
                enemy.y += Math.sin(angle) * enemy.speed;
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
                if (Math.random() < 0.5) enemy.xSpeed = Math.random() * enemy.originXSpeed;
                else enemy.xSpeed = -Math.random() * enemy.originXSpeed;
                if (Math.random() < 0.7) enemy.ySpeed = Math.random() * enemy.originYSpeed;
                else enemy.ySpeed = -Math.random() * enemy.originYSpeed;
                enemy.lastCall = trueTimeCounter;
            }
            enemy.y += enemy.ySpeed;
            enemy.x += enemy.xSpeed;
            enemy.x = Math.min(enemy.x, canvas.width - enemy.width);
            enemy.x = Math.max(enemy.x, 0);
            break;
        case "jitter":
            enemy.y += enemy.ySpeed;
            if (trueTimeCounter - enemy.lastCall >= enemy.delay) {
                if (Math.random() < 0.5) enemy.x += Math.random() * enemy.amplitude;
                else enemy.x -= Math.random() * enemy.amplitude;
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
        case "randomZigzag":
            enemy.y += enemy.ySpeed;
            enemy.x += enemy.xSpeed;
            if (trueTimeCounter - enemy.lastCall >= enemy.delay) {
                enemy.amplitude = (canvas.width / 2) * (Math.random() + 0.2);
                enemy.lastCall = trueTimeCounter;
            }
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
        case "charge":
            if (enemy.y < enemy.yLimit && !enemy.charged) enemy.y += enemy.ySpeed;
            else if (!enemy.charged) {
                enemy.charged = true;
                let dx = playerX - enemy.x;
                let dy = playerY - enemy.y;
                let angle = Math.atan2(dy, dx);
                enemy.xSpeed = Math.cos(angle) * enemy.speed;
                enemy.ySpeed = Math.sin(angle) * enemy.speed;
                enemy.lastCall = trueTimeCounter;
            } else if (trueTimeCounter - enemy.lastCall >= enemy.delay) {
                enemy.y += enemy.ySpeed;
                enemy.x += enemy.xSpeed;
            }
            break;
        case "superCharge":
            if (enemy.y < enemy.yLimit && !enemy.charged) enemy.y += enemy.ySpeed;
            else if (!enemy.charged) {
                enemy.speed *= enemy.acceleration;
                enemy.charged = true;
                let dx = playerX - enemy.x;
                let dy = playerY - enemy.y;
                let angle = Math.atan2(dy, dx);
                enemy.xSpeed = Math.cos(angle) * enemy.speed;
                enemy.ySpeed = Math.sin(angle) * enemy.speed;
                enemy.lastCall = trueTimeCounter;
            } else if (trueTimeCounter - enemy.lastCall >= enemy.delay) {
                enemy.y += enemy.ySpeed;
                enemy.x += enemy.xSpeed;
            }
            break;
        case "hyperCharge":
            if (enemy.y < enemy.yLimit && !enemy.charged) enemy.y += enemy.ySpeed;
            else if (!enemy.charged) {
                enemy.speed *= enemy.acceleration;
                enemy.charged = true;
                let dx = playerX - enemy.x;
                let dy = playerY - enemy.y;
                let angle = Math.atan2(dy, dx);
                enemy.xSpeed = Math.cos(angle) * enemy.speed;
                enemy.ySpeed = Math.sin(angle) * enemy.speed;
                enemy.lastCall = trueTimeCounter;
            } else if (trueTimeCounter - enemy.lastCall >= enemy.delay) {
                enemy.y += enemy.ySpeed;
                enemy.x += enemy.xSpeed;
            }
            if (enemy.charged && trueTimeCounter - enemy.lastCall >= 200) enemy.y = 10000;
            if (enemy.y + enemy.height + enemy.ySpeed >= canvas.height || enemy.y + enemy.ySpeed <= 0) enemy.ySpeed = -enemy.ySpeed;
            if (enemy.x + enemy.width + enemy.xSpeed >= canvas.width || enemy.x + enemy.xSpeed <= 0) enemy.xSpeed = -enemy.xSpeed;
            break;
        case "retreat":
            if (enemy.y < enemy.yLimit && !enemy.retreated) enemy.y += enemy.ySpeed;
            else if (!enemy.retreated) {
                enemy.ySpeed = -enemy.ySpeed;
                enemy.retreated = true;
            }
            enemy.y += enemy.ySpeed;
            if (enemy.retreated && enemy.y == 0) enemy.ySpeed = 0;
        case "semiMirror":
            if (enemy.y < enemy.yLimit) enemy.y += enemy.ySpeed;
            let deltaX = playerX - enemy.x;
            if (deltaX < 0) deltaX = Math.max(deltaX, -enemy.maxTurn);
            else deltaX = Math.min(deltaX, enemy.maxTurn);
            enemy.x += deltaX;
        case "trueMirror":
            if (enemy.y < enemy.yLimit) enemy.y += enemy.ySpeed;
            let dX = playerX - enemy.x;
            enemy.x += dX;
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
                streakTimeReq = 80 + 220 * Math.pow(0.8, streak - 1);
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
            endTime = Date.now();
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

function restartGame() {
    aPressed = false;
    sPressed = false;
    dPressed = false;
    wPressed = false;
    shooting = false;
    playing = true;
    paused = false;
    startTime = Date.now();
    pauseStartTime = null;
    totalPausedTime = 0;
    endTime = null;
    playerMovementSpeed = 3;
    projectileSpeed = 10;
    projectileDamage = 30;
    shootingCounter = 0;
    shootingCooldown = 10;
    waveSpawnCounter = 0;
    waveSpawnDelay = 200;
    enemySpawnDelay = 60;
    enemySpawnCounter = 0;
    currentWave = 0;
    currentWaveTotalHealth = 0;
    spawnCounter = 0;
    trueTimeCounter = 0;
    score = 0;
    totalTime = 0;
    streak = 0;
    previousKill = 0;
    streakTimeReq = 300;
    streakAlpha = 0;
    streakCounter = 0;
    currentMultiplier = 1;
    playerProjectiles = [];
    enemies = [];
    temporaryEnemies = [];
    playerX = 0;
    playerY = canvas.height - 100;
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
    if (!paused && playing) {
        let elapsedTime = Math.floor((Date.now() - startTime - totalPausedTime) / 1000);
        let minutes = Math.floor(elapsedTime / 60);
        let seconds = elapsedTime % 60;
        let timeText = `Time: ${minutes}:${seconds.toString().padStart(2, "0")}`;
        ctx.fillText(timeText, canvas.width - 250, 80);
    }

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

    if (paused) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "30px Arial";
        ctx.fillText("Paused", canvas.width / 2 - 50, canvas.height / 2);
    }
    window.requestAnimationFrame(draw);
}

function endScreen() {
    if (!playing) {
        ctx.textAlign = "center";
        ctx.fillStyle = `rgb(255 0 0)`;
        ctx.font = "bold 100px Arial";
        ctx.fillText("YOU LOST!", canvas.width / 2, canvas.height / 2);
        ctx.fillStyle = `rgb(255 215 0)`;
        ctx.font = "50px Arial";
        let elapsedTime = (endTime - startTime - totalPausedTime) / 1000;
        let timeScore = Math.floor(elapsedTime * 5);
        ctx.fillStyle = `rgb(0 255 0)`;
        ctx.fillText("You survived for: " + `${elapsedTime.toFixed(2)}` + " seconds", canvas.width / 2, canvas.height / 2 + 80);
        ctx.fillStyle = `rgb(0 0 255)`;
        ctx.fillText("Game score: " + score, canvas.width / 2, canvas.height / 2 + 130);
        ctx.fillText("Time score: " + timeScore, canvas.width / 2, canvas.height / 2 + 180);
        ctx.fillStyle = `rgb(255 255 255)`;
        ctx.fillText("Total score: " + (score + timeScore), canvas.width / 2, canvas.height / 2 + 230);
        ctx.fillText("Click R to Restart...", canvas.width / 2, canvas.height / 2 + 280);
        ctx.textAlign = "left";
    }
}
