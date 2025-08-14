/*
    player.js

    Manages player-related state, input, shooting, upgrades, powerups,...
*/
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
    lastBoostedCall = 0;
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
let exp = 0,
    expReq = 5,
    expMultiplier = 1,
    inventory = [],
    upgradesQueue = [];
//Manages powerups, movement for the player
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
        playSFX("../audio/sfx/powerupUse.wav", 0.5);
    }
    if (boosted) {
        if (
            currentPowerup != null &&
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
        } else if (currentPowerup != null) {
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
                playSFX("../audio/sfx/powerupPickup.wav", 0.5);
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
    if (playerHealth <= 0) {
        endTime = Date.now();
        playing = false;
        playSFX("../audio/sfx/gameOver.wav", 0.5);
    }
}

//Manages all upgrades for the player
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
