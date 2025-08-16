/*
    ui.js

    Manages drawings of menus, health bar, sprites, background,...
*/
let buttons = [];
function drawMenu() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawStars();

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
                playSFX("../audio/sfx/gameStart.wav", 0.5);
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
        if (score + timeScore >= 10000 && playerShipLevel == 1) {
            playerShipLevel++;
            playSFX("../audio/sfx/shipUnlock.wav", 0.5);
            window.alert("You've unlocked the second ship!");
        } else if (score + timeScore >= 100000 && playerShipLevel == 2) {
            playerShipLevel++;
            playSFX("../audio/sfx/shipUnlock.wav", 0.5);
            window.alert("You've unlocked the third ship!");
        } else if (score + timeScore >= 1000000 && playerShipLevel == 3) {
            playerShipLevel++;
            playSFX("../audio/sfx/shipUnlock.wav", 0.5);
            window.alert("You've unlocked the final ship!");
        }
        if (score + timeScore >= 10000000) {
            playSFX("../audio/sfx/shipUnlock.wav", 0.5);
            window.alert("You've beaten the game!");
        }
        drawBackButton();
    }
}
function drawInventory() {
    let slotSize = 70;
    let padding = 10;

    for (let i = 0; i < playerShipLevel; i++) {
        let x = 50 + i * (slotSize + padding);
        let y = canvas.height - slotSize - padding - 10;

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
function drawBarriers() {
    ctx.fillStyle = "rgb(102, 68, 51)";
    ctx.font = "bold 15px serif";
    for (let i = 0; i < barriers.length; i++) {
        const barrier = barriers[i];
        ctx.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
        ctx.fillText(barrier.health, barrier.x + barrier.width / 8, barrier.y - 15);
    }
}

function drawTopBars() {
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

    ctx.textAlign = "left";
}

function drawBoostOverlayIfNeeded() {
    if (boosted && currentPowerup && currentPowerup.id == "swd") {
        ctx.fillStyle = "rgb(0, 240, 0)";
        ctx.fillRect(playerX, playerY, playerWidth, playerHeight);
    }
}

function drawPlayerSpriteAndBox() {
    ctx.textAlign = "left";
    if (playerInvincible) ctx.globalAlpha = 0.5;
    ctx.drawImage(playerShip, playerX, playerY, playerWidth, playerHeight);
    ctx.globalAlpha = 1.0;

    ctx.beginPath();
    ctx.rect(playerX + 17, playerY + 34, 30, 30);
    ctx.stroke();
}

function drawUpgradesList() {
    let tempHeight = canvas.height / 15;
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.font = "20px monospace";
    ctx.textAlign = "left";

    for (let i = 0; i < currentUpgrades.length; i++) {
        const upgrade = upgrades[i];
        if (currentUpgrades[i] > 0) {
            ctx.fillText(upgrade.id.toUpperCase() + ": " + currentUpgrades[i], 20, tempHeight);
            tempHeight += canvas.height / 20;
        }
    }
}

function drawPlayerProjectiles() {
    for (let i = 0; i < playerProjectiles.length; i++) {
        const bullet = playerProjectiles[i];
        if (bullet.type == "laser") {
            ctx.fillStyle = "rgb(0, 150, 255)";
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        } else if (bullet.type == "exp") {
            ctx.drawImage(playerExpBullet, bullet.x, bullet.y, bullet.width, bullet.height);
        } else if (bullet.type == "aoe") {
            ctx.fillStyle = "rgb(200, 69, 0)";
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        } else {
            ctx.drawImage(playerBullet, bullet.x, bullet.y, bullet.width, bullet.height);
        }
    }
}

function drawEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
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

        if (enemy.shield > 0) {
            ctx.fillText("Shield: " + enemy.shield, enemy.x + enemy.width / 8, enemy.y - 30);
        }
    }
}

function drawEnemyProjectiles() {
    for (let i = 0; i < enemyProjectiles.length; i++) {
        const bullet = enemyProjectiles[i];
        ctx.drawImage(bullet.image, bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

function drawDrops() {
    for (let i = 0; i < enemyDrops.length; i++) {
        const drop = enemyDrops[i];
        ctx.drawImage(drop.image, drop.x, drop.y, 48, 48);
    }
}

function drawHUDText() {
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
}

function drawUpgradeNotifications() {
    if (upgradesQueue.length > 0) {
        if (upgradeCounter < upgradeDisplayTime) upgradeAlpha = Math.min(upgradeAlpha + upgradeFadeSpeed, 1);
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
}

function drawStreakNotification() {
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
}

function drawPowerup() {
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
}

function drawPauseOverlay() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Paused", canvas.width / 2, canvas.height / 2);
    ctx.textAlign = "left";
    drawBackButton();
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

function initStars() {
    stars = [];
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speed: starSpeed + Math.random() * 0.5,
        });
    }
}

function updateStars() {
    for (let star of stars) {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.x = Math.random() * canvas.width;
            star.y = -star.size;
            star.speed = starSpeed + Math.random() * 0.5;
        }
    }
}

function drawStars() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    for (let star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
