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
    else if (key == "'") ePressed = true;
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
    else if (key == "'") ePressed = false;
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
    playerBullet = null,
    playerExpBullet = null,
    normalBullet = null,
    bounceBullet = null,
    homingBullet = null;
function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}
function init() {
    enemyTypes[0].image = loadImage("images/enemy/tank01.png");
    enemyTypes[1].image = loadImage("images/enemy/tank02.png");
    enemyTypes[2].image = loadImage("images/enemy/tank03.png");
    enemyTypes[3].image = loadImage("images/enemy/tank04.png");
    enemyTypes[4].image = loadImage("images/enemy/charge01.png");
    enemyTypes[5].image = loadImage("images/enemy/charge02.png");
    enemyTypes[6].image = loadImage("images/enemy/charge03.png");
    enemyTypes[7].image = loadImage("images/enemy/charge04.png");
    enemyTypes[8].image = loadImage("images/enemy/shoot01.png");
    enemyTypes[9].image = loadImage("images/enemy/shoot02.png");
    enemyTypes[10].image = loadImage("images/enemy/shoot03.png");
    enemyTypes[11].image = loadImage("images/enemy/shoot04.png");
    enemyTypes[12].image = loadImage("images/enemy/sniper01.png");
    enemyTypes[13].image = loadImage("images/enemy/sniper02.png");
    enemyTypes[14].image = loadImage("images/enemy/sniper03.png");
    enemyTypes[15].image = loadImage("images/enemy/sniper04.png");
    normalBullet = loadImage("images/enemy/normalBullet.png");
    homingBullet = loadImage("images/enemy/homingBullet.png");
    bounceBullet = loadImage("images/enemy/bounceBullet.png");
    playerShip = loadImage("images/player/player1.png");
    playerBullet = loadImage("images/player/bullet01.png");
    playerExpBullet = loadImage("images/player/expBullet.png");

    for (let i = 0; i < powerups.length; i++) {
        if (powerups[i].req <= playerShipLevel) {
            availablePowerups.push({ ...powerups[i] });
            availablePowerups[availablePowerups.length - 1].image = loadImage(
                "images/player/" + powerups[i].id + ".png"
            );
        }
    }
    initMenu();
}

//Game variables
let aPressed = false,
    sPressed = false,
    dPressed = false,
    wPressed = false,
    ePressed = false,
    shooting = false,
    playing = true,
    paused = false,
    boosted = false;
let startTime = Date.now(),
    pauseStartTime = null,
    totalPausedTime = 0,
    endTime = null;
let playerFrontShots = 1,
    playerSideShots = 0,
    playerBounceCount = 0;
let playerShipLevel = 1,
    playerWidth = 64,
    playerHeight = 64,
    playerMaxHealth = 100,
    playerHealth = 100,
    playerMaxArmor = 100,
    playerArmor = 100,
    playerArmorRegen = 10,
    playerLastArmorRegen = 0,
    playerArmorRegenDelay = 200,
    playerInvincible = false,
    playerLastHit = 0,
    playerInvincibleDuration = 10,
    playerMovementSpeed = 3,
    projectileSpeed = 10,
    projectileDamage = 20,
    projectileHealth = 1,
    shootingCounter = 0,
    originShootingCooldown = 20,
    shootingCooldown = 20,
    lastBoostedCall = 0,
    waveSpawnCounter = 0,
    waveSpawnDelay = 500,
    enemySpawnDelay = 30,
    enemySpawnCounter = 0,
    currentWave = 0,
    currentWaveTotalPower = 0,
    spawnCounter = 0,
    trueTimeCounter = 0;
let currentUpgrades = [0, 0, 0, 0, 0, 0, 0, 0];
let totalStacks = 0;
let pickedPowerup = null,
    powerupPickCounter = 0,
    powerupUseCounter = 0;
let currentPowerup = null,
    powerupCount = 0,
    score = 0,
    totalTime = 0,
    streak = 0,
    previousKill = 0,
    originStreakTimeReq = 300,
    streakTimeReq = 300,
    streakAlpha = 0,
    streakCounter = 0,
    originMultiplier = 1,
    currentMultiplier = 1,
    upgradeAlpha = 0,
    upgradeCounter = 0;
let gameState = "menu";
let exp = 0,
    expReq = 5,
    expMultiplier = 1;
let playerProjectiles = [],
    enemies = [],
    temporaryEnemies = [],
    enemyProjectiles = [],
    upgradesQueue = [],
    inventory = [],
    availablePowerups = [],
    barriers = [],
    enemyDrops = [],
    buttons = [];
const streakDisplayTime = 300,
    upgradeDisplayTime = 300,
    streakFadeSpeed = 0.02,
    upgradeFadeSpeed = 0.02;
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
const playerShips = [
    {
        id: 1,
        image: loadImage("images/player/player1.png"),
        frontShots: 1,
        sideShots: 0,
        bounceCount: 0,
        width: 64,
        height: 64,
        maxHealth: 100,
        maxArmor: 100,
        armorRegen: 10,
        movementSpeed: 3,
        originShootingCooldown: 20,
        projectileDamage: 20,
        projectileHealth: 1,
        projectileSpeed: 10,
    },
    {
        id: 2,
        image: loadImage("images/player/player2.png"),
        frontShots: 1,
        sideShots: 1,
        bounceCount: 0,
        width: 64,
        height: 64,
        maxHealth: 300,
        maxArmor: 300,
        armorRegen: 50,
        movementSpeed: 5,
        originShootingCooldown: 13,
        projectileDamage: 50,
        projectileHealth: 1,
        projectileSpeed: 11,
    },
    {
        id: 3,
        image: loadImage("images/player/player3.png"),
        frontShots: 2,
        sideShots: 1,
        bounceCount: 1,
        width: 64,
        height: 64,
        maxHealth: 600,
        maxArmor: 600,
        armorRegen: 100,
        movementSpeed: 7,
        originShootingCooldown: 10,
        projectileDamage: 80,
        projectileHealth: 2,
        projectileSpeed: 12,
    },
    {
        id: 4,
        image: loadImage("images/player/player4.png"),
        frontShots: 3,
        sideShots: 2,
        bounceCount: 2,
        width: 64,
        height: 128,
        maxHealth: 2000,
        maxArmor: 2000,
        armorRegen: 300,
        movementSpeed: 9,
        originShootingCooldown: 8,
        projectileDamage: 150,
        projectileHealth: 3,
        projectileSpeed: 13,
    },
];
const powerups = [
    {
        name: "Laser",
        id: "lsr",
        req: 1,
        duration: 60,
    },
    {
        name: "Explosive",
        id: "exp",
        req: 1,
        duration: 500,
    },
    {
        name: "Swords",
        id: "swd",
        req: 2,
        duration: 500,
        count: 3,
    },
    {
        name: "Barrier",
        id: "bar",
        req: 2,
        duration: 2000,
    },
    {
        name: "Scatter",
        id: "sca",
        req: 3,
    },
    {
        name: "Invincibility",
        id: "inv",
        req: 3,
        duration: 300,
    },
    {
        name: "Triple Shot",
        id: "tri",
        req: 4,
        duration: 300,
    },
    {
        name: "Boost",
        id: "bst",
        req: 4,
        duration: 300,
    },
];
const upgrades = [
    {
        name: "Damage",
        id: "dmg",
        maxStacks: 10,
        weight: 3,
        multiplier: 1.5,
    },
    {
        name: "Attack Speed",
        id: "spd",
        maxStacks: 10,
        weight: 3,
    },
    {
        name: "Armor",
        id: "arm",
        maxStacks: 10,
        weight: 3,
        multiplier: 1.5,
    },
    {
        name: "Front Shots",
        id: "frt",
        maxStacks: 5,
        weight: 1.5,
        multiplier: 1.1,
    },
    {
        name: "Side Shots",
        id: "sid",
        maxStacks: 5,
        weight: 1.5,
        multiplier: 1.1,
    },
    {
        name: "Bounce Count + Pierce",
        id: "bou",
        maxStacks: 5,
        weight: 1,
    },
    {
        name: "Score Multiplier + Streak Allowed Time",
        id: "sco",
        maxStacks: 5,
        weight: 2,
        multiplier: 1.2,
    },
    {
        name: "Exp gain",
        id: "exp",
        maxStacks: 5,
        weight: 2,
        multiplier: 1.2,
    },
];
const abilities = [
    {
        name: "shield",
        compatible: 1,
    },
    {
        name: "berserk",
        compatible: 1,
    },
    {
        name: "preserve",
        compatible: 3,
    },
    {
        name: "revive",
        compatible: 3,
    },
    {
        name: "heal",
        compatible: 2,
    },
];
const enemyTypes = [
    {
        id: "tank01",
        type: "melee",
        maxHealth: 50,
        weight: 2.75,
        xSpeed: 4,
        ySpeed: 1,
        width: 50,
        height: 50,
        image: null,
        point: 10,
        power: 2,
        movement: ["straight", "sine", "hold", "bounce"],
    },
    {
        id: "tank02",
        type: "melee",
        maxHealth: 200,
        weight: 2.5,
        xSpeed: 3,
        ySpeed: 2,
        width: 64,
        height: 64,
        image: null,
        point: 30,
        power: 5,
        movement: ["straight", "sine", "zigzag", "hold", "bounce", "semiHoming"],
    },
    {
        id: "tank03",
        type: "melee",
        maxHealth: 500,
        weight: 2.5,
        xSpeed: 7,
        ySpeed: 5,
        width: 75,
        height: 75,
        image: null,
        point: 70,
        power: 25,
        movement: ["loop", "hold", "bounce", "zigzag", "spread", "random"],
    },
    {
        id: "tank04",
        type: "melee",
        maxHealth: 5000,
        weight: 1.25,
        xSpeed: 10,
        ySpeed: 5,
        width: 100,
        height: 100,
        image: null,
        point: 100,
        power: 50,
        movement: ["spread", "hold", "loop", "random"],
    },
    {
        id: "charge01",
        type: "melee",
        maxHealth: 20,
        weight: 3.5,
        xSpeed: 3,
        ySpeed: 4,
        width: 50,
        height: 50,
        image: null,
        point: 5,
        power: 1,
        movement: ["straight", "jitter", "accel", "zigzag", "semiHoming", "charge"],
    },
    {
        id: "charge02",
        type: "melee",
        maxHealth: 50,
        weight: 2,
        xSpeed: 4,
        ySpeed: 5,
        width: 45,
        height: 45,
        image: null,
        point: 20,
        power: 3,
        movement: ["random", "accel", "zigzag", "semiHoming", "charge"],
    },
    {
        id: "charge03",
        type: "melee",
        maxHealth: 200,
        weight: 1.5,
        xSpeed: 8,
        ySpeed: 7,
        width: 40,
        height: 40,
        image: null,
        point: 50,
        power: 35,
        movement: ["random", "accel", "randomZigzag", "trueHoming", "superCharge", "spreadHoming"],
    },
    {
        id: "charge04",
        type: "melee",
        maxHealth: 500,
        weight: 1,
        xSpeed: 10,
        ySpeed: 8,
        width: 35,
        height: 35,
        image: null,
        point: 70,
        power: 60,
        movement: ["spreadHoming", "random", "randomZigzag", "trueHoming", "hyperCharge"],
    },
    {
        id: "shoot01",
        type: "range",
        maxHealth: 20,
        weight: 3.5,
        xSpeed: 3,
        ySpeed: 4,
        width: 50,
        height: 50,
        image: null,
        point: 15,
        track: false,
        bulletSpeed: 3,
        shotDelay: 80,
        damage: 5,
        power: 3,
        bulletTypes: ["normal"],
        shooting: ["straight1"],
        movement: ["loop", "hold", "retreat"],
    },
    {
        id: "shoot02",
        type: "range",
        maxHealth: 50,
        weight: 2,
        xSpeed: 5,
        ySpeed: 4,
        width: 50,
        height: 50,
        image: null,
        point: 40,
        track: false,
        bulletSpeed: 3.5,
        shotDelay: 60,
        damage: 10,
        power: 8,
        bulletTypes: ["normal", "homing"],
        shooting: ["side1"],
        movement: ["loop", "hold", "retreat"],
    },
    {
        id: "shoot03",
        type: "range",
        maxHealth: 200,
        weight: 1.5,
        xSpeed: 7,
        ySpeed: 4,
        width: 50,
        height: 50,
        image: null,
        point: 100,
        track: false,
        bulletSpeed: 4,
        shotDelay: 40,
        damage: 20,
        power: 40,
        bulletTypes: ["normal", "bounce"],
        shooting: ["straight1", "side1"],
        movement: ["loop", "hold", "retreat", "semiMirror"],
    },
    {
        id: "shoot04",
        type: "range",
        maxHealth: 500,
        weight: 1,
        xSpeed: 9,
        ySpeed: 4,
        width: 50,
        height: 50,
        image: null,
        point: 150,
        track: false,
        bulletSpeed: 4.5,
        shotDelay: 30,
        damage: 50,
        power: 70,
        bulletTypes: ["normal", "bounce"],
        shooting: ["straight2", "side2"],
        movement: ["loop", "hold", "trueMirror"],
    },
    {
        id: "snipe01",
        type: "range",
        maxHealth: 20,
        weight: 3.5,
        xSpeed: 3,
        ySpeed: 4,
        width: 50,
        height: 50,
        image: null,
        point: 15,
        track: true,
        bulletSpeed: 5,
        shotDelay: 150,
        damage: 10,
        power: 4,
        bulletTypes: ["normal", "bounce", "homing"],
        shooting: ["straight1"],
        movement: ["loop", "hold", "retreat"],
    },
    {
        id: "snipe02",
        type: "range",
        maxHealth: 50,
        weight: 2,
        xSpeed: 5,
        ySpeed: 4,
        width: 50,
        height: 50,
        image: null,
        point: 40,
        track: true,
        bulletSpeed: 5.5,
        shotDelay: 120,
        damage: 20,
        power: 15,
        bulletTypes: ["normal", "bounce", "homing"],
        shooting: ["side1"],
        movement: ["loop", "hold", "retreat"],
    },
    {
        id: "snipe03",
        type: "range",
        maxHealth: 200,
        weight: 1.5,
        xSpeed: 7,
        ySpeed: 4,
        width: 50,
        height: 50,
        image: null,
        point: 100,
        track: true,
        bulletSpeed: 6,
        shotDelay: 70,
        damage: 50,
        power: 50,
        bulletTypes: ["normal", "bounce"],
        shooting: ["straight1", "multi"],
        movement: ["loop", "hold", "retreat", "semiMirror"],
    },
    {
        id: "snipe04",
        type: "range",
        maxHealth: 500,
        weight: 1,
        xSpeed: 9,
        ySpeed: 4,
        width: 50,
        height: 50,
        image: null,
        point: 150,
        track: true,
        bulletSpeed: 7,
        shotDelay: 60,
        damage: 200,
        power: 70,
        bulletTypes: ["normal", "bounce"],
        shooting: ["straight1", "side1", "multi"],
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
        projectileUpdate();
    }
}

function playerFunctions() {
    if (dPressed && playerX <= canvas.width - playerMovementSpeed - 64) playerX += playerMovementSpeed;
    if (aPressed && playerX >= playerMovementSpeed) playerX -= playerMovementSpeed;
    if (wPressed && playerY >= playerMovementSpeed) playerY -= playerMovementSpeed;
    if (sPressed && playerY <= canvas.height - playerMovementSpeed - 64) playerY += playerMovementSpeed;
    let tempType = null;
    if (ePressed && inventory.length > 0 && !boosted) {
        currentPowerup = inventory.shift();
        lastBoostedCall = trueTimeCounter;
        powerupCount++;
        powerupUseCounter = 0;
        boosted = true;
    }
    if (boosted) {
        if (
            currentPowerup == null ||
            trueTimeCounter - lastBoostedCall >=
                currentPowerup.duration + (Math.floor(Math.max(1, powerupCount / 2)) + 30)
        ) {
            boosted = false;
            switch (currentPowerup.id) {
                case "lsr":
                    playerProjectiles = playerProjectiles.filter((bullet) => bullet.type !== "laser");
                    break;
                case "inv":
                    playerInvincible = false;
                    break;
                case "tri":
                    playerFrontShots -= 3;
                    playerSideShots -= 3;
                    break;
                case "bst":
                    playerArmor /= 3;
                    playerArmorRegen /= 3;
                    projectileDamage /= 3;
                    projectileHealth -= 5;
                    playerBounceCount -= 5;
                    playerMovementSpeed /= 2;
                    playerInvincibleDuration /= 3;
                    break;
            }
            currentPowerup = null;
        } else {
            switch (currentPowerup.id) {
                case "lsr":
                    playerProjectiles = playerProjectiles.filter((bullet) => bullet.health == -10000);
                    playerProjectiles.push({
                        x: playerX,
                        y: 0,
                        xSpeed: 0,
                        ySpeed: 0,
                        width: 50,
                        height: playerY,
                        health: 10000,
                        damage: projectileDamage * 2 * Math.floor(Math.max(1, powerupCount / 2)),
                        type: "laser",
                    });
                    break;
                case "exp":
                    tempType = "exp";
                    break;
                case "bar":
                    barriers.push({
                        x: playerX,
                        y: playerY - 20,
                        width: canvas.width / 8,
                        height: 50,
                        health: playerArmor * 10 * Math.floor(Math.max(1, powerupCount / 2)),
                        created: trueTimeCounter,
                        duration: currentPowerup.duration * Math.floor(Math.max(1, powerupCount / 2)),
                    });
                    boosted = false;
                    break;
                case "sca":
                    let scatterCount = 18 + Math.floor(Math.max(1, powerupCount / 2));
                    let angleStep = (Math.PI * 2) / scatterCount;
                    for (let i = 0; i < scatterCount; i++) {
                        let angle = i * angleStep;
                        let vx = Math.cos(angle) * projectileSpeed;
                        let vy = Math.sin(angle) * projectileSpeed;

                        playerProjectiles.push({
                            x: playerX + playerWidth / 2,
                            y: playerY + playerHeight / 2,
                            xSpeed: vx,
                            ySpeed: vy,
                            width: 10,
                            height: 10,
                            health: 1,
                            damage: projectileDamage * Math.floor(Math.max(1, powerupCount / 2)),
                            bounceCount: playerBounceCount + 3,
                        });
                    }
                    boosted = false;
                    break;
                case "inv":
                    playerInvincible = true;
                    break;
                case "tri":
                    if (lastBoostedCall == trueTimeCounter) {
                        playerFrontShots += 3;
                        playerSideShots += 3;
                    }
                    break;
                case "bst":
                    if (lastBoostedCall == trueTimeCounter) {
                        playerArmor *= 3;
                        playerArmorRegen *= 3;
                        projectileDamage *= 3;
                        projectileHealth += 5;
                        playerBounceCount += 5;
                        playerMovementSpeed *= 2;
                        playerInvincibleDuration *= 3;
                    }
                    break;
            }
        }
    }
    if (shooting) {
        if (shootingCounter >= shootingCooldown) {
            let offset = 0;
            for (let i = 0; i < playerFrontShots; i++) {
                playerProjectiles.push({
                    x: playerX + playerWidth / 2 + offset,
                    y: playerY,
                    xSpeed: 0,
                    ySpeed: -projectileSpeed,
                    width: 10,
                    height: 10,
                    health: projectileHealth,
                    damage: projectileDamage,
                    bounceCount: playerBounceCount,
                    type: tempType,
                });
                offset = Math.pow(-1, i) * (Math.abs(offset) + 10);
            }
            offset = 0;
            for (let i = 0; i < playerSideShots; i++) {
                playerProjectiles.push({
                    x: playerX + playerWidth,
                    y: playerY + playerHeight / 2 + offset,
                    xSpeed: projectileSpeed / 2,
                    ySpeed: -projectileSpeed / 2,
                    width: 10,
                    height: 10,
                    health: projectileHealth,
                    damage: projectileDamage,
                    bounceCount: playerBounceCount,
                    type: tempType,
                });
                playerProjectiles.push({
                    x: playerX,
                    y: playerY + playerHeight / 2 + offset,
                    xSpeed: -projectileSpeed / 2,
                    ySpeed: -projectileSpeed / 2,
                    width: 10,
                    height: 10,
                    health: projectileHealth,
                    damage: projectileDamage,
                    bounceCount: playerBounceCount,
                    type: tempType,
                });
                offset = Math.pow(-1, i) * (Math.abs(offset) + 10);
            }
            shootingCounter = 0;
        } else shootingCounter++;
    }
    for (let i = 0; i < enemyDrops.length; i++) {
        let drop = enemyDrops[i];
        if (
            drop.x + 48 >= playerX + 17 &&
            drop.x <= playerX + 47 &&
            drop.y + 48 >= playerY + 34 &&
            drop.y <= playerY + 64
        ) {
            if (inventory.length < playerShipLevel) {
                inventory.push(drop);
                pickedPowerup = drop;
                enemyDrops.splice(i, 1);
                i--;
            }
        }
    }
    if (!boosted && trueTimeCounter - playerLastHit >= playerInvincibleDuration) playerInvincible = false;
    if (trueTimeCounter - playerLastArmorRegen >= playerArmorRegenDelay) {
        playerArmor = Math.min(playerArmor + playerArmorRegen, playerMaxArmor);
        playerLastArmorRegen = trueTimeCounter;
    }
    for (let i = 0; i < playerProjectiles.length; i++) {
        let bullet = playerProjectiles[i];
        bullet.x += bullet.xSpeed;
        bullet.y += bullet.ySpeed;
        if (bullet.bounceCount > 0) {
            if (bullet.x + bullet.xSpeed + bullet.width >= canvas.width || bullet.x + bullet.xSpeed <= 0) {
                bullet.xSpeed = -bullet.xSpeed;
                bullet.bounceCount--;
            }
            if (
                bullet.y + bullet.ySpeed + bullet.height >= canvas.height ||
                (bullet.y + bullet.ySpeed <= 0 && bullet.bounceCount > 0)
            ) {
                bullet.ySpeed = -bullet.ySpeed;
                bullet.bounceCount--;
            }
        }
    }
    playerProjectiles = playerProjectiles.filter(
        (bullet) =>
            bullet.health > 0 &&
            bullet.y >= -20 &&
            bullet.y <= canvas.height + 20 &&
            bullet.x >= -20 &&
            bullet.x <= canvas.width + 20
    );
    if (playerHealth <= 0) {
        endTime = Date.now();
        playing = false;
    }
}

function waveSpawn() {
    let powerCount = 0;
    trueTimeCounter++;
    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].wave == currentWave) powerCount += enemies[i].power;
    }
    for (let i = 0; i < temporaryEnemies.length; i++) {
        if (temporaryEnemies[i].wave == currentWave) powerCount += temporaryEnemies[i].power;
    }
    if (powerCount <= currentWaveTotalPower * 0.5 || waveSpawnCounter >= waveSpawnDelay) {
        currentWave++;
        console.log(currentWave, currentWaveTotalPower);
        if (currentWave <= 20) currentWaveTotalPower = Math.floor(1 + currentWaveTotalPower * 1.15);
        else if (currentWave <= 40) currentWaveTotalPower = Math.floor(1 + currentWaveTotalPower * 1.1);
        else currentWaveTotalPower = Math.floor(1 + currentWaveTotalPower * 1.05);
        let temp = currentWaveTotalPower;
        while (temp > 0) {
            let enemy = selectEnemy(temp);
            if (enemy == null) break;
            temporaryEnemies.push(createEnemy(enemy));
            temp -= enemy.power;
        }
        waveSpawnCounter = 0;
    } else waveSpawnCounter++;
    if (enemySpawnCounter >= enemySpawnDelay && temporaryEnemies.length > 0) {
        enemies.push(temporaryEnemies.shift());
        enemySpawnCounter = 0;
    } else enemySpawnCounter++;
    for (let i = 0; i < enemies.length; i++) {
        let enemy = enemies[i];
        enemyMovement(enemy);
        enemyBehavior(enemy);
    }
    enemies = enemies.filter((enemy) => enemy.y <= canvas.height - enemy.height);
}

function selectEnemy(totalPower) {
    let sumWeight = 0,
        flag = 0;
    let availableEnemyTypes = [];
    for (let i = 0; i < enemyTypes.length; i++) {
        if (enemyTypes[i].power <= totalPower) {
            availableEnemyTypes.push({ ...enemyTypes[i] });
            sumWeight += enemyTypes[i].weight;
        }
    }
    while (flag < 3) {
        let number = sumWeight * Math.random();
        let select = 0;
        for (let i = 0; i < availableEnemyTypes.length; i++) {
            select += availableEnemyTypes[i].weight;
            if (number < select) {
                return { ...availableEnemyTypes[i] };
            }
        }
        flag++;
    }
    return null;
}

function createEnemy(enemy) {
    let tempDifficulty = (playerShipLevel - 1) * 5 + Math.max(1, currentWave * 0.075);
    console.log(tempDifficulty);
    let newEnemy = {
        type: enemy.type,
        x: Math.random() * (canvas.width - enemy.width),
        y: 0,
        ySpeed: Math.random() * enemy.ySpeed,
        isInvincible: false,
        invincibleDuration: 5,
        lastHitTime: 0,
        image: enemy.image,
        movement: enemy.movement[Math.floor(Math.random() * enemy.movement.length)],
        wave: currentWave,
        maxHealth: Math.floor(enemy.maxHealth * tempDifficulty),
        health: Math.floor(enemy.maxHealth * tempDifficulty),
        power: enemy.power,
        width: enemy.width,
        height: enemy.height,
        point: enemy.point,
    };
    if (enemy.type == "range") {
        newEnemy.track = enemy.track;
        newEnemy.shotDelay = enemy.shotDelay;
        newEnemy.lastShot = 0;
        newEnemy.bulletSpeed = enemy.bulletSpeed;
        newEnemy.damage = enemy.damage * Math.max(1, Math.floor(tempDifficulty / 2));
        newEnemy.multishot = 1;
        newEnemy.bulletType = enemy.bulletTypes[Math.floor(Math.random() * enemy.bulletTypes.length)];
        for (let i = 0; i < enemy.shooting.length; i++) {
            let dice = Math.floor(Math.random() * 101);
            switch (enemy.shooting[i]) {
                case "straight1":
                    if (dice <= 60) newEnemy.straightProjectiles = 1;
                    else if (dice <= 95) newEnemy.straightProjectiles = 2;
                    else newEnemy.straightProjectiles = 3;
                    break;
                case "straight2":
                    if (dice <= 50) newEnemy.straightProjectiles = 2;
                    else if (dice <= 75) newEnemy.straightProjectiles = 3;
                    else if (dice <= 95) newEnemy.straightProjectiles = 4;
                    else newEnemy.straightProjectiles = 5;
                    break;
                case "side1":
                    if (dice <= 60) newEnemy.sideProjectiles = 1;
                    else if (dice <= 95) newEnemy.sideProjectiles = 2;
                    else newEnemy.sideProjectiles = 3;
                    break;
                case "side2":
                    if (dice <= 50) newEnemy.sideProjectiles = 2;
                    else if (dice <= 75) newEnemy.sideProjectiles = 3;
                    else if (dice <= 95) newEnemy.sideProjectiles = 4;
                    else newEnemy.sideProjectiles = 5;
                    break;
                case "multi":
                    if (dice <= 40) newEnemy.multishot = 2;
                    else if (dice <= 70) newEnemy.multishot = 3;
                    else if (dice <= 95) newEnemy.multishot = 4;
                    else newEnemy.multishot = 5;
                    break;
            }
        }
    } else newEnemy.damage = newEnemy.maxHealth;
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
    newEnemy.abilities = [];
    let numberString = enemy.id.at(enemy.id.length - 1);
    let number = parseInt(numberString);
    let availableAbilities = [];
    for (let i = 0; i < abilities.length; i++) {
        if (abilities[i].compatible <= number) availableAbilities.push({ ...abilities[i] });
    }
    let chance = Math.floor(32 + tempDifficulty * 1.5);
    while (Math.floor(Math.random() * 101) <= chance) {
        if (newEnemy.abilities.length == availableAbilities.length) break;
        while (true) {
            let temporaryAbility = availableAbilities[Math.floor(Math.random() * availableAbilities.length)];
            if (newEnemy.abilities.indexOf(temporaryAbility) == -1) {
                newEnemy.abilities.push(temporaryAbility);
                break;
            }
        }
        chance = -1;
    }
    for (let i = 0; i < newEnemy.abilities.length; i++) {
        switch (newEnemy.abilities[i].name) {
            case "shield":
                newEnemy.shield = 3;
                break;
            case "heal":
                newEnemy.lastHeal = 0;
                newEnemy.healDelay = Math.floor(Math.random() * 300 + 300);
                newEnemy.heal = Math.floor(Math.random() * 10 + 20);
                break;
            case "revive":
                newEnemy.revived = false;
                break;
            case "berserk":
                newEnemy.berserk = false;
                newEnemy.hpThreshold = Math.floor(Math.random() * 20 + 10);
                break;
            case "preserve":
                newEnemy.preserved = false;
                newEnemy.hpThreshold = Math.floor(Math.random() * 20 + 30);
                break;
        }
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
            if (enemy.x + enemy.xSpeed >= canvas.width - enemy.width || enemy.x + enemy.xSpeed < 0)
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
                    newEnemyRight.x = Math.min(
                        enemy.x + enemy.width + additional,
                        canvas.width - enemy.width
                    );
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
                    newEnemyRight.x = Math.min(
                        enemy.x + enemy.width + additional,
                        canvas.width - enemy.width
                    );
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
                if (enemy.x + enemy.xSpeed >= canvas.width - enemy.width || enemy.x + enemy.xSpeed < 0)
                    enemy.xSpeed = -enemy.xSpeed;
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
            if (enemy.y + enemy.height + enemy.ySpeed >= canvas.height || enemy.y + enemy.ySpeed <= 0)
                enemy.ySpeed = -enemy.ySpeed;
            if (enemy.x + enemy.width + enemy.xSpeed >= canvas.width || enemy.x + enemy.xSpeed <= 0)
                enemy.xSpeed = -enemy.xSpeed;
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

function enemyBehavior(enemy) {
    if (enemy.type == "range") {
        if (trueTimeCounter - enemy.lastShot >= enemy.shotDelay) {
            let projectileImage = null;
            switch (enemy.bulletType) {
                case "normal":
                    projectileImage = normalBullet;
                    break;
                case "bounce":
                    projectileImage = bounceBullet;
                    break;
                case "homing":
                    projectileImage = homingBullet;
                    break;
            }
            if (enemy.track) {
                let dx = playerX - enemy.x;
                let dy = playerY - enemy.y;
                let angle = Math.atan2(dy, dx);
                let offset = 0;
                for (let i = 0; i < enemy.multishot; i++) {
                    for (let j = 0; j < enemy.straightProjectiles; j++) {
                        let tempBullet = {
                            x: enemy.x + enemy.width / 2 + offset,
                            y: enemy.y + enemy.height,
                            xSpeed: Math.cos(angle) * enemy.bulletSpeed,
                            ySpeed: Math.sin(angle) * enemy.bulletSpeed,
                            bulletType: enemy.bulletType,
                            width: 10,
                            height: 10,
                            health: 1,
                            image: projectileImage,
                            damage: enemy.damage,
                        };
                        offset = Math.pow(-1, j) * (Math.abs(offset) + 10);
                        if (enemy.bulletType == "bounce")
                            tempBullet.bounceCount = Math.floor(Math.random() * 3 + 1);
                        else if (enemy.bulletType == "homing") {
                            tempBullet.speed = enemy.bulletSpeed;
                            tempBullet.homingStrength = 0.01;
                        }
                        enemyProjectiles.push(tempBullet);
                    }
                    offset = 0;
                    for (let j = 0; j < enemy.sideProjectiles; j++) {
                        let tempBullet = {
                            x: enemy.x,
                            y: enemy.y + enemy.height / 2 + offset,
                            xSpeed: Math.cos(angle - Math.PI / 4) * enemy.bulletSpeed,
                            ySpeed: Math.sin(angle - Math.PI / 4) * enemy.bulletSpeed,
                            bulletType: enemy.bulletType,
                            width: 10,
                            height: 10,
                            health: 1,
                            image: projectileImage,
                            damage: enemy.damage,
                        };
                        if (enemy.bulletType == "bounce")
                            tempBullet.bounceCount = Math.floor(Math.random() * 3 + 1);
                        else if (enemy.bulletType == "homing") {
                            tempBullet.speed = enemy.bulletSpeed;
                            tempBullet.homingStrength = 0.01;
                        }
                        enemyProjectiles.push({ ...tempBullet });
                        tempBullet.x = enemy.x + enemy.width;
                        tempBullet.xSpeed = Math.cos(angle + Math.PI / 4) * enemy.bulletSpeed;
                        tempBullet.ySpeed = Math.sin(angle + Math.PI / 4) * enemy.bulletSpeed;
                        enemyProjectiles.push({ ...tempBullet });
                        offset = Math.pow(-1, j) * (Math.abs(offset) + 10);
                    }
                }
            } else {
                let offset = 0;
                for (let i = 0; i < enemy.multishot; i++) {
                    for (let j = 0; j < enemy.straightProjectiles; j++) {
                        let tempBullet = {
                            x: enemy.x + enemy.width / 2 + offset,
                            y: enemy.y + enemy.height,
                            xSpeed: 0,
                            ySpeed: enemy.bulletSpeed,
                            bulletType: enemy.bulletType,
                            width: 10,
                            height: 10,
                            health: 1,
                            image: projectileImage,
                            damage: enemy.damage,
                        };
                        if (enemy.bulletType == "bounce")
                            tempBullet.bounceCount = Math.floor(Math.random() * 3 + 1);
                        else if (enemy.bulletType == "homing") {
                            tempBullet.speed = enemy.bulletSpeed;
                            tempBullet.homingStrength = 0.01;
                        }
                        offset = Math.pow(-1, j) * (Math.abs(offset) + 10);
                        enemyProjectiles.push(tempBullet);
                    }
                    for (let j = 0; j < enemy.sideProjectiles; j++) {
                        let tempBullet = {
                            x: enemy.x + enemy.width,
                            y: enemy.y + enemy.height / 2 + offset,
                            xSpeed: enemy.bulletSpeed / 2,
                            ySpeed: enemy.bulletSpeed / 2,
                            bulletType: enemy.bulletType,
                            width: 10,
                            height: 10,
                            health: 1,
                            image: projectileImage,
                            damage: enemy.damage,
                        };
                        if (enemy.bulletType == "bounce")
                            tempBullet.bounceCount = Math.floor(Math.random() * 3 + 1);
                        else if (enemy.bulletType == "homing") {
                            tempBullet.speed = enemy.bulletSpeed;
                            tempBullet.homingStrength = 0.01;
                        }
                        enemyProjectiles.push({ ...tempBullet });
                        tempBullet.y = enemy.y + enemy.height / 2 + offset;
                        tempBullet.xSpeed = -enemy.bulletSpeed / 2;
                        tempBullet.ySpeed = enemy.bulletSpeed / 2;
                        enemyProjectiles.push({ ...tempBullet });
                        offset = Math.pow(-1, j) * (Math.abs(offset) + 10);
                    }
                }
            }
            enemy.lastShot = trueTimeCounter;
        }
    }
    for (let i = 0; i < enemy.abilities.length; i++) {
        if (enemy.abilities[i].name == "heal") {
            if (trueTimeCounter - enemy.lastHeal >= enemy.healDelay) {
                enemy.health = Math.min(
                    enemy.maxHealth,
                    Math.floor(enemy.health + (enemy.heal * enemy.maxHealth) / 100)
                );
                enemy.lastHeal = trueTimeCounter;
            }
        }
    }
}

function projectileUpdate() {
    let hit = false;
    for (let i = 0; i < enemyDrops.length; i++) {
        enemyDrops[i].y += 1;
    }
    for (let i = 0; i < enemyProjectiles.length; i++) {
        let bullet = enemyProjectiles[i];
        if (bullet.health <= 0) continue;
        if (bullet.bulletType == "bounce" || bullet.bulletType == "normal") {
        } else {
            if (playerY + 64 >= bullet.y) {
                let dx = playerX + 32 - bullet.x;
                let dy = playerY + 49 - bullet.y;
                let dist = Math.hypot(dx, dy);
                dx /= dist;
                dy /= dist;
                bullet.xSpeed =
                    (1 - bullet.homingStrength) * bullet.xSpeed + bullet.homingStrength * dx * bullet.speed;
                bullet.ySpeed =
                    (1 - bullet.homingStrength) * bullet.ySpeed + bullet.homingStrength * dy * bullet.speed;
            } else {
                bullet.xSpeed = 0;
                bullet.ySpeed = bullet.speed;
            }
        }
        bullet.x += bullet.xSpeed;
        bullet.y += bullet.ySpeed;
        for (let j = 0; j < barriers.length; j++) {
            if (bullet.health <= 0) continue;
            let barrier = barriers[j];
            if (barrier.health < 0) continue;
            if (
                bullet.x + bullet.width >= barrier.x &&
                bullet.x <= barrier.x + barrier.width &&
                bullet.y + bullet.height >= barrier.y &&
                bullet.y <= barrier.y + barrier.height
            ) {
                barrier.health -= bullet.damage;
                bullet.health--;
            }
        }
        if (bullet.health <= 0) continue;
        if (
            bullet.x + bullet.width >= playerX + 17 &&
            bullet.x <= playerX + 47 &&
            bullet.y + bullet.height >= playerY + 34 &&
            bullet.y <= playerY + 64
        ) {
            if (!playerInvincible) {
                if (playerArmor >= bullet.damage) playerArmor -= bullet.damage;
                else {
                    playerHealth -= bullet.damage - playerArmor;
                    playerArmor = 0;
                }
                hit = true;
                playerLastHit = trueTimeCounter;
                bullet.health--;
            } else {
                bullet.health--;
            }
        }
        if (bullet.bulletType == "bounce") {
            if (bullet.bounceCount <= 0) bullet.health = 0;
            if (bullet.x + bullet.width + bullet.xSpeed >= canvas.width || bullet.x + bullet.xSpeed <= 0) {
                bullet.bounceCount--;
                bullet.xSpeed = -bullet.xSpeed;
            }
            if (bullet.y + bullet.height + bullet.ySpeed >= canvas.height || bullet.y + bullet.ySpeed <= 0) {
                bullet.bounceCount--;
                bullet.ySpeed = -bullet.ySpeed;
            }
        }
    }
    if (hit) playerInvincible = true;
    enemyDrops = enemyDrops.filter((drop) => drop.y <= canvas.height + 20);
    enemyProjectiles = enemyProjectiles.filter(
        (bullet) =>
            bullet.health > 0 &&
            bullet.y >= -20 &&
            bullet.y <= canvas.height + 20 &&
            bullet.x >= -20 &&
            bullet.x <= canvas.width + 20
    );
    barriers = barriers.filter(
        (barrier) => barrier.health > 0 && trueTimeCounter - barrier.created < barrier.duration
    );
}

function collision() {
    let invincibilityQueue = [];
    for (let i = 0; i < playerProjectiles.length; i++) {
        let bullet = playerProjectiles[i];
        if (bullet.type == "aoe") bullet.health--;
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
                if (enemy.shield > 0) enemy.shield--;
                else enemy.health -= bullet.damage;
                if (invincibilityQueue.indexOf(j) == -1) invincibilityQueue.push(j);
                if (bullet.type == "exp") {
                    playerProjectiles.push({
                        x: bullet.x - 50,
                        y: bullet.y - 50,
                        xSpeed: 0,
                        ySpeed: 0,
                        width: 100,
                        height: 100,
                        health: 50,
                        damage: Math.floor(
                            projectileDamage * 0.05 * Math.floor(Math.max(1, powerupCount / 2))
                        ),
                        type: "aoe",
                    });
                }
                bullet.health--;
            }
            if (enemy.health <= 0 && enemy.revived == false) {
                enemy.health = enemy.maxHealth;
                enemy.revived = true;
                temporaryEnemies.push({ ...enemy });
                enemy.health = 0;
            }
            if (enemy.health > 0 && enemy.health <= (enemy.maxHealth * enemy.hpThreshold) / 100) {
                if (enemy.berserk == false) {
                    enemy.damage = Math.floor(enemy.damage * 1.5);
                    enemy.berserk = true;
                }
                if (enemy.preserved == false) {
                    enemy.health = enemy.maxHealth;
                    enemy.preserved = true;
                }
            }
        }
    }
    for (let i = 0; i < invincibilityQueue.length; i++) {
        enemies[invincibilityQueue[i]].isInvincible = true;
        enemies[invincibilityQueue[i]].lastHitTime = trueTimeCounter;
    }
    for (let i = 0; i < enemies.length; i++) {
        if (enemies[i].health <= 0) {
            if (Math.random() * 100 <= 10) {
                enemyDrops.push({
                    ...availablePowerups[Math.floor(Math.random() * availablePowerups.length)],
                });
                enemyDrops[enemyDrops.length - 1].x = enemies[i].x;
                enemyDrops[enemyDrops.length - 1].y = enemies[i].y;
            }
            if (trueTimeCounter - previousKill <= streakTimeReq || previousKill == 0) {
                streak++;
                streakAlpha = 0;
                streakCounter = 0;
                streakTimeReq = 80 + 220 * Math.pow(0.8, streak - 1);
                previousKill = trueTimeCounter;
            } else {
                streak = 1;
                streakTimeReq = originStreakTimeReq;
                previousKill = trueTimeCounter;
            }
            let tempDifficulty = (playerShipLevel - 1) * 5 + Math.max(1, currentWave * 0.075);
            score += Math.floor(
                enemies[i].point *
                    Math.round((currentMultiplier * 10) / 10) *
                    Math.max(1, tempDifficulty / 100)
            );
            if (streak <= 1) currentMultiplier = originMultiplier;
            else
                currentMultiplier = Math.round(
                    (Math.min(50, 1 + Math.exp((Math.log(49) / 24) * (streak - 1))) * 10) / 10
                );
            exp += Math.floor(enemies[i].maxHealth / 10) * expMultiplier;
            if (exp >= expReq) {
                while (exp >= expReq) {
                    exp -= expReq;
                    if (totalStacks <= 20) {
                        for (let k = 0; k < Math.max(1, Math.floor((playerShipLevel + 1) / 2)); k++)
                            expReq *= 1.5;
                    } else if (totalStacks <= 40) expReq *= 1.4;
                    else expReq *= 1.3;
                    expReq = Math.floor(expReq);
                    totalStacks++;
                    upgradesQueue.push(upgradePlayer());
                }
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
            enemy.y <= playerY + 64 &&
            !playerInvincible
        ) {
            if (boosted && currentPowerup.id == "swd") {
                enemy.health = 0;
                currentPowerup.count--;
                if (currentPowerup.count <= 0) boosted = false;
            } else {
                if (playerArmor >= enemy.health) playerArmor -= enemy.health;
                else {
                    playerHealth -= enemy.health - playerArmor;
                    playerArmor = 0;
                }
                enemy.health = 0;
                playerInvincible = true;
                playerLastHit = trueTimeCounter;
            }
        }
        if (trueTimeCounter - enemy.lastHitTime >= enemy.invincibleDuration) {
            enemy.isInvincible = false;
        }
    }
}

function upgradePlayer() {
    let sumWeight = 0,
        flag = 0;
    let availableUpgrades = [];
    for (let i = 0; i < upgrades.length; i++) {
        if (currentUpgrades[i] < upgrades[i].maxStacks) {
            availableUpgrades.push({ ...upgrades[i] });
            availableUpgrades[availableUpgrades.length - 1].index = i;
            sumWeight += upgrades[i].weight;
        }
    }
    while (flag < 3) {
        let number = sumWeight * Math.random();
        let select = 0;
        for (let i = 0; i < availableUpgrades.length; i++) {
            select += availableUpgrades[i].weight;
            if (number < select) {
                let upgrade = { ...availableUpgrades[i] };
                currentUpgrades[upgrade.index]++;
                switch (upgrade.id) {
                    case "dmg":
                        projectileDamage = Math.floor(projectileDamage * upgrade.multiplier);
                        break;
                    case "spd":
                        shootingCooldown = Math.floor(shootingCooldown - originShootingCooldown * 0.07);
                        break;
                    case "arm":
                        playerMaxArmor = Math.floor(playerMaxArmor * upgrade.multiplier);
                        playerArmor = playerMaxArmor;
                        playerArmorRegen = Math.floor(playerArmorRegen * upgrade.multiplier);
                        break;
                    case "frt":
                        playerFrontShots++;
                        projectileDamage = Math.floor(projectileDamage * upgrade.multiplier);
                        break;
                    case "sid":
                        playerSideShots++;
                        projectileDamage = Math.floor(projectileDamage * upgrade.multiplier);
                        break;
                    case "bou":
                        projectileHealth++;
                        playerBounceCount++;
                        break;
                    case "sco":
                        originStreakTimeReq = Math.floor(originStreakTimeReq * upgrade.multiplier);
                        originMultiplier = Math.floor(originMultiplier * upgrade.multiplier);
                        break;
                    case "exp":
                        expMultiplier = Math.floor(expMultiplier * upgrade.multiplier);
                        break;
                }
                return upgrade;
            }
        }
        flag++;
    }
    return null;
}

function resetStats() {
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

    playerFrontShots = playerShips[playerShipLevel - 1].frontShots;
    playerSideShots = playerShips[playerShipLevel - 1].sideShots;
    playerBounceCount = playerShips[playerShipLevel - 1].bounceCount;
    playerWidth = playerShips[playerShipLevel - 1].width;
    playerHeight = playerShips[playerShipLevel - 1].height;
    playerMaxHealth = playerShips[playerShipLevel - 1].maxHealth;
    playerHealth = playerMaxHealth;
    playerMaxArmor = playerShips[playerShipLevel - 1].maxArmor;
    playerArmor = playerMaxArmor;
    playerArmorRegen = playerShips[playerShipLevel - 1].armorRegen;
    playerMovementSpeed = playerShips[playerShipLevel - 1].movementSpeed;
    originShootingCooldown = playerShips[playerShipLevel - 1].originShootingCooldown;
    shootingCooldown = originShootingCooldown;
    projectileDamage = playerShips[playerShipLevel - 1].projectileDamage;
    projectileHealth = playerShips[playerShipLevel - 1].projectileHealth;
    projectileSpeed = playerShips[playerShipLevel - 1].projectileSpeed;
    playerLastArmorRegen = 0;
    playerArmorRegenDelay = 200;
    playerInvincible = false;
    playerLastHit = 0;
    playerInvincibleDuration = 10;

    lastBoostedCall = 0;
    waveSpawnCounter = 0;
    waveSpawnDelay = 500;
    enemySpawnDelay = 30;
    enemySpawnCounter = 0;
    currentWave = 0;
    currentWaveTotalPower = 0;
    currentUpgrades = [0, 0, 0, 0, 0, 0, 0, 0];
    totalStacks = 0;
    spawnCounter = 0;
    trueTimeCounter = 0;

    pickedPowerup = null;
    powerupPickCounter = 0;
    powerupUseCounter = 0;

    currentPowerup = null;
    powerupCount = 0;
    score = 0;
    totalTime = 0;
    streak = 0;
    previousKill = 0;
    originStreakTimeReq = 300;
    streakTimeReq = 300;
    streakAlpha = 0;
    streakCounter = 0;
    originMultiplier = 1;
    currentMultiplier = 1;
    upgradeAlpha = 0;
    upgradeCounter = 0;

    exp = 0;
    expReq = 5;
    expMultiplier = 1;

    playerProjectiles = [];
    enemies = [];
    temporaryEnemies = [];
    enemyProjectiles = [];
    upgradesQueue = [];
    inventory = [];
    availablePowerups = [];
    barriers = [];
    enemyDrops = [];

    playerX = 0;
    playerY = canvas.height - 100;

    init();
    playerShip = playerShips[playerShipLevel - 1].image;
}

function restartGame() {
    resetStats();
}

//Drawing
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
let playerX = 0,
    playerY = canvas.height - 100;

init();
window.requestAnimationFrame(draw);

function draw() {
    if (gameState == "menu") {
        drawMenu();
    } else if (gameState == "controls") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.font = "bold 48px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Controls", canvas.width / 2, 80);

        ctx.font = "28px Arial";
        const controlsList = ["W / A / S / D - Move", "Enter - Shoot", "' - Use Power Up"];

        controlsList.forEach((text, i) => {
            ctx.fillText(text, canvas.width / 2, 180 + i * 50);
        });

        const btnWidth = 150;
        const btnHeight = 50;
        const btnX = canvas.width / 2 - btnWidth / 2;
        const btnY = canvas.height - 100;

        ctx.fillStyle = "gray";
        ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
        ctx.strokeStyle = "black";
        ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);

        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Back", btnX + btnWidth / 2, btnY + btnHeight / 2);

        canvas.onclick = function (e) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            if (mouseX >= btnX && mouseX <= btnX + btnWidth && mouseY >= btnY && mouseY <= btnY + btnHeight) {
                gameState = "menu";
                canvas.onclick = null;
            }
        };
    } else if (gameState == "help") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.font = "bold 48px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.fillText("Help", canvas.width / 2, 80);

        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        const helpText = [
            "Shoot them up",
            "Upgrade as you kill more enemies",
            "Powerups have a chance of dropping",
            "Unlock more ships and powerups as you get higher scores",
            "Enemies and powerups scale with time",
        ];

        helpText.forEach((line, i) => {
            ctx.fillText(line, canvas.width / 2, 160 + i * 40);
        });

        const btnWidth = 150;
        const btnHeight = 50;
        const btnX = canvas.width / 2 - btnWidth / 2;
        const btnY = canvas.height - 100;

        ctx.fillStyle = "gray";
        ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
        ctx.strokeStyle = "black";
        ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);

        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Back", btnX + btnWidth / 2, btnY + btnHeight / 2);

        canvas.onclick = function (e) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            if (mouseX >= btnX && mouseX <= btnX + btnWidth && mouseY >= btnY && mouseY <= btnY + btnHeight) {
                gameState = "menu";
                canvas.onclick = null;
            }
        };
    } else if (gameState == "playing") {
        process();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
        ctx.save();

        ctx.fillStyle = "rgb(102, 68, 51)";
        ctx.font = "bold 15px serif";
        for (let i = 0; i < barriers.length; i++) {
            let barrier = barriers[i];
            ctx.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
            ctx.fillText(barrier.health, barrier.x + barrier.width / 8, barrier.y - 15);
        }

        ctx.textAlign = "center";
        ctx.font = "15px serif";
        ctx.fillStyle = "rgb(150, 150, 150)";
        ctx.fillRect(0, 0, canvas.width / 3.5, 40);
        ctx.fillStyle = "rgb(200, 0, 0)";
        ctx.fillRect(10, 5, (canvas.width / 3.5 - 20) * (playerHealth / playerMaxHealth), 30);
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText(playerHealth + "/" + playerMaxHealth, canvas.width / 7, 25);

        ctx.fillStyle = "rgb(150, 150, 150)";
        ctx.fillRect((canvas.width * 3) / 4, 0, canvas.width / 3.5, 40);
        ctx.fillStyle = "rgb(80, 80, 80)";
        ctx.fillRect(
            (canvas.width * 3) / 4 + 10,
            5,
            (canvas.width / 3.5 - 20) * (playerArmor / playerMaxArmor),
            30
        );
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText(playerArmor + "/" + playerMaxArmor, (canvas.width * 25) / 28, 25);

        ctx.fillStyle = "rgb(150, 150, 150)";
        ctx.fillRect((canvas.width * 5) / 14, 0, canvas.width / 3.5, 40);
        ctx.fillStyle = "rgb(0, 200, 0)";
        ctx.fillRect((canvas.width * 5) / 14 + 10, 5, (canvas.width / 3.5 - 20) * (exp / expReq), 30);
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillText(exp + "/" + expReq, canvas.width / 2, 25);

        if (boosted && currentPowerup.id == "swd") {
            ctx.fillStyle = "rgb(0, 240, 0)";
            ctx.fillRect(playerX, playerY, playerWidth, playerHeight);
        }

        ctx.textAlign = "left";
        if (playerInvincible) ctx.globalAlpha = 0.5;
        ctx.drawImage(playerShip, playerX, playerY, playerWidth, playerHeight);
        ctx.globalAlpha = 1.0;
        ctx.beginPath();
        ctx.rect(playerX + 17, playerY + 34, 30, 30);
        ctx.stroke();

        let tempHeight = canvas.height / 15;
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.font = "20px monospace";
        for (let i = 0; i < currentUpgrades.length; i++) {
            let upgrade = upgrades[i];
            if (currentUpgrades[i] > 0) {
                ctx.fillText(upgrade.id.toUpperCase() + ": " + currentUpgrades[i], 20, tempHeight);
                tempHeight += canvas.height / 20;
            }
        }

        for (let i = 0; i < playerProjectiles.length; i++) {
            let bullet = playerProjectiles[i];
            if (bullet.type == "laser") {
                ctx.fillStyle = "rgb(0, 150, 255)";
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            } else if (bullet.type == "exp") {
                ctx.drawImage(playerExpBullet, bullet.x, bullet.y, bullet.width, bullet.height);
            } else if (bullet.type == "aoe") {
                ctx.fillStyle = "rgb(200, 69, 0)";
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            } else ctx.drawImage(playerBullet, bullet.x, bullet.y, bullet.width, bullet.height);
        }

        for (let i = 0; i < enemies.length; i++) {
            let enemy = enemies[i];
            if (enemy.isInvincible) ctx.globalAlpha = 0.5;
            ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
            ctx.globalAlpha = 1.0;
            if (enemy.berserk == true) ctx.fillStyle = "rgb(255, 0, 0)";
            else if (enemy.preserved == true) ctx.fillStyle = "rgb(0, 0, 125)";
            else if (enemy.heal > 0) ctx.fillStyle = "rgb(0, 255, 0)";
            else if (enemy.revived === true) ctx.fillStyle = "rgb(255, 255, 255)";
            else ctx.fillStyle = "rgb(255, 215, 0)";
            ctx.font = "bold 15px serif";
            ctx.fillText(enemy.health + "/" + enemy.maxHealth, enemy.x + enemy.width / 8, enemy.y - 15);
            if (enemy.shield > 0)
                ctx.fillText("Shield: " + enemy.shield, enemy.x + enemy.width / 8, enemy.y - 30);
        }

        drawInventory();

        for (let i = 0; i < enemyProjectiles.length; i++) {
            let bullet = enemyProjectiles[i];
            ctx.drawImage(bullet.image, bullet.x, bullet.y, bullet.width, bullet.height);
        }

        for (let i = 0; i < enemyDrops.length; i++) {
            let drop = enemyDrops[i];
            ctx.drawImage(drop.image, drop.x, drop.y, 48, 48);
        }

        ctx.fillStyle = "white";
        ctx.font = "30px monospace";
        ctx.fillText(`FPS: ${fps.toFixed(1)}`, canvas.width - 200, 150);

        ctx.font = "30px monospace";
        ctx.fillText("Score: " + score, canvas.width - 200, 70);
        if (!paused && playing) {
            let elapsedTime = Math.floor((Date.now() - startTime - totalPausedTime) / 1000);
            let minutes = Math.floor(elapsedTime / 60);
            let seconds = elapsedTime % 60;
            let timeText = `Time: ${minutes}:${seconds.toString().padStart(2, "0")}`;
            ctx.fillText(timeText, canvas.width - 200, 110);
        }

        if (upgradesQueue.length > 0) {
            if (upgradeCounter < upgradeDisplayTime)
                upgradeAlpha = Math.min(upgradeAlpha + upgradeFadeSpeed, 1);
            else upgradeAlpha = Math.max(upgradeAlpha - upgradeFadeSpeed, 0);
            upgradeCounter++;
            ctx.fillStyle = `rgba(220, 20, 60, ${upgradeAlpha})`;
            ctx.font = "bold 20px monospace";
            ctx.textAlign = "center";
            ctx.fillText(upgradesQueue[0].name + " upgraded!", canvas.width / 2, 70);
            ctx.textAlign = "left";
            if (upgradeAlpha == 0) {
                upgradesQueue.shift();
                upgradeCounter = 0;
            }
        }
        if (streak >= 2) {
            if (streakCounter < streakDisplayTime) streakAlpha = Math.min(streakAlpha + streakFadeSpeed, 1);
            else streakAlpha = Math.max(streakAlpha - streakFadeSpeed, 0);
            streakCounter++;
            ctx.fillStyle = `rgba(255, 215, 0, ${streakAlpha})`;
            ctx.font = "bold 35px monospace";
            ctx.textAlign = "center";
            ctx.fillText(streakNames[Math.min(streak - 2, streakNames.length - 1)], canvas.width / 2, 100);
            ctx.fillText("Current multiplier: " + currentMultiplier + "x", canvas.width / 2, 150);
            ctx.textAlign = "left";
        }

        if (pickedPowerup != null) {
            powerupPickCounter++;
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.font = "bold 25px monospace";
            ctx.textAlign = "center";
            ctx.fillText("You picked up " + pickedPowerup.name + "!", canvas.width / 2, canvas.height - 100);
            ctx.textAlign = "left";
            if (powerupPickCounter >= streakDisplayTime) {
                powerupPickCounter = 0;
                pickedPowerup = null;
            }
        }

        if (currentPowerup != null && powerupUseCounter < streakDisplayTime) {
            powerupUseCounter++;
            ctx.fillStyle = "rgb(255, 255, 255)";
            ctx.font = "bold 15px monospace";
            ctx.textAlign = "center";
            ctx.fillText(
                "You used " +
                    currentPowerup.name +
                    "! Current additional multiplier: " +
                    Math.floor(Math.max(1, powerupCount / 2)),
                canvas.width / 2,
                canvas.height - 50
            );
            ctx.textAlign = "left";
        }

        endScreen();

        if (paused) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";
            ctx.font = "30px Arial";
            ctx.fillText("Paused", canvas.width / 2 - 50, canvas.height / 2);
            drawBackButton();
        }
    }
    window.requestAnimationFrame(draw);
}

function drawInventory() {
    let slotSize = 70;
    let padding = 10;

    for (let i = 0; i < playerShipLevel; i++) {
        let x = canvas.width - slotSize - 50;
        let y = 170 + i * (slotSize + padding);

        ctx.fillStyle = "rgb(150, 150, 150)";
        ctx.fillRect(x, y, slotSize, slotSize);

        ctx.strokeStyle = "rgb(0, 0, 0)";
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, slotSize, slotSize);

        if (inventory.length > i) {
            if (inventory[i].image) {
                ctx.drawImage(inventory[i].image, x + 5, y + 5, slotSize - 10, slotSize - 10);
            }
        }
    }
}

function initMenu() {
    const centerX = canvas.width / 2;
    const startY = canvas.height / 3;

    const buttonWidth = 200;
    const buttonHeight = 50;
    const gap = 20;

    const labels = ["Start", "Controls", "Help"];
    buttons = labels.map((label, i) => ({
        x: centerX - buttonWidth / 2,
        y: startY + i * (buttonHeight + gap),
        width: buttonWidth,
        height: buttonHeight,
        text: label,
    }));

    canvas.addEventListener("click", handleMenuClick);
}

function drawMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 48px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Shapes of War", canvas.width / 2, 80);

    ctx.font = "28px Arial";
    buttons.forEach((b) => {
        ctx.fillStyle = "gray";
        ctx.fillRect(b.x, b.y, b.width, b.height);

        ctx.strokeStyle = "black";
        ctx.strokeRect(b.x, b.y, b.width, b.height);

        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(b.text, b.x + b.width / 2, b.y + b.height / 2);
    });

    ctx.drawImage(playerShip, canvas.width / 2 - 50, buttons[2].y + 100, 100, 100);
}

function handleMenuClick(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    buttons.forEach((b) => {
        if (
            mouseX >= b.x &&
            mouseX <= b.x + b.width &&
            mouseY >= b.y &&
            mouseY <= b.y + b.height &&
            gameState != "playing"
        ) {
            if (b.text === "Start") {
                gameState = "playing";
            } else if (b.text === "Controls") {
                gameState = "controls";
            } else if (b.text === "Help") {
                gameState = "help";
            }
        }
    });
}

function drawBackButton() {
    const btnWidth = 200;
    const btnHeight = 50;
    const btnX = canvas.width / 2 - btnWidth / 2;
    const btnY = canvas.height - 100;

    ctx.fillStyle = "gray";
    ctx.fillRect(btnX, btnY, btnWidth, btnHeight);

    ctx.strokeStyle = "black";
    ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);

    ctx.fillStyle = "white";
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Back to Menu", btnX + btnWidth / 2, btnY + btnHeight / 2);

    canvas.onclick = function (e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        if (mouseX >= btnX && mouseX <= btnX + btnWidth && mouseY >= btnY && mouseY <= btnY + btnHeight) {
            gameState = "menu";
            resetStats();
            canvas.onclick = null;
        }
    };
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
        ctx.fillText(
            "You survived for: " + `${elapsedTime.toFixed(2)}` + " seconds",
            canvas.width / 2,
            canvas.height / 2 + 80
        );
        ctx.fillStyle = `rgb(0 0 255)`;
        ctx.fillText("Game score: " + score, canvas.width / 2, canvas.height / 2 + 130);
        ctx.fillText("Time score: " + timeScore, canvas.width / 2, canvas.height / 2 + 180);
        ctx.fillStyle = `rgb(255 255 255)`;
        ctx.fillText("Total score: " + (score + timeScore), canvas.width / 2, canvas.height / 2 + 230);
        ctx.fillText("Click R to Restart...", canvas.width / 2, canvas.height / 2 + 280);
        ctx.textAlign = "left";
        if (score >= 10000 && playerShipLevel == 1) {
            playerShipLevel++;
            window.alert("You've unlocked the second ship!");
        } else if (score >= 100000 && playerShipLevel == 2) {
            playerShipLevel++;
            window.alert("You've unlocked the third ship!");
        } else if (score >= 1000000 && playerShipLevel == 3) {
            playerShipLevel++;
            window.alert("You've unlocked the final ship!");
        }
        drawBackButton();
    }
}
