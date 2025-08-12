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
