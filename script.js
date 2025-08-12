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

let playerShip = null,
    playerBullet = null,
    playerExpBullet = null,
    normalBullet = null,
    bounceBullet = null,
    homingBullet = null;

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
let trueTimeCounter = 0;
let gameState = "menu";
let availablePowerups = [],
    barriers = [];

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

        drawBarriers();
        drawTopBars();
        drawBoostOverlayIfNeeded();
        drawPlayerSpriteAndBox();
        drawUpgradesList();
        drawPlayerProjectiles();
        drawEnemies();
        drawInventory();
        drawEnemyProjectiles();
        drawDrops();
        drawHUDText();
        drawUpgradeNotifications();
        drawStreakNotification();
        drawPowerup();
        endScreen();

        if (paused) drawPauseOverlay();
    }
    window.requestAnimationFrame(draw);
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
