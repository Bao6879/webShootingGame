/*
    projectile.js

    Manages projectile movement, behavior, and collisions
*/
let enemyProjectiles = [],
    playerProjectiles = [];
//Moves projectiles, enemy drops; check for collision for enemy projectiles
function projectileUpdate() {
    let hit = false;
    for (let i = 0; i < enemyDrops.length; i++) {
        enemyDrops[i].y += 1;
    }
    for (let i = 0; i < enemyProjectiles.length; i++) {
        let bullet = enemyProjectiles[i];
        if (bullet.health <= 0) continue;
        if (bullet.bulletType == "homing") {
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
                playSFX("../audio/sfx/playerDamage.wav", 0.5);
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
    if (hit) playerInvincible = true;
    playerProjectiles = playerProjectiles.filter(
        (bullet) =>
            bullet.health > 0 &&
            bullet.y >= -20 &&
            bullet.y <= canvas.height + 20 &&
            bullet.x >= -20 &&
            bullet.x <= canvas.width + 20
    );
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

//Check for collision from player projectiles
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
                playSFX("../audio/sfx/enemyHit.wav", 0.05);
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
            if (enemy.health <= 0) playSFX("../audio/sfx/enemyDeath.wav", 0.05);
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
                playSFX("../audio/sfx/powerupSpawn.wav", 0.3);
                enemyDrops[enemyDrops.length - 1].x = enemies[i].x;
                enemyDrops[enemyDrops.length - 1].y = enemies[i].y;
            }
            if (trueTimeCounter - previousKill <= streakTimeReq || previousKill == 0) {
                streak++;
                streakAlpha = 0;
                streakCounter = 0;
                streakTimeReq = 80 + 220 * Math.pow(0.8, streak - 1);
                previousKill = trueTimeCounter;
                playSFX("../audio/sfx/streak.wav", 0.2);
            } else {
                streak = 1;
                streakTimeReq = originStreakTimeReq;
                previousKill = trueTimeCounter;
            }
            let tempDifficulty = (playerShipLevel - 1) * 5 + Math.max(1, currentWave * 0.075);
            score += Math.floor(
                enemies[i].point *
                    Math.round((currentMultiplier * 10) / 10) *
                    Math.max(1, tempDifficulty / 10)
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
                    playSFX("../audio/sfx/upgrade.wav", 0.3);
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
                playSFX("../audio/sfx/playerDamage.wav", 0.5);
                enemy.health = 0;
                playerInvincible = true;
                playerLastHit = trueTimeCounter;
            }
            playSFX("../audio/sfx/enemyDeath.wav", 0.1);
        }
        if (trueTimeCounter - enemy.lastHitTime >= enemy.invincibleDuration) {
            enemy.isInvincible = false;
        }
    }
}
