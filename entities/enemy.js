/*
    enemy.js

    Manages enemy creation
*/

let enemies = [],
    temporaryEnemies = [],
    enemyDrops = [];

//Selects an enemy to create from the array of available enemies based on current available power from the current wave
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

//Creates an enemy and scale it with the wave and player ship level
function createEnemy(enemy) {
    let tempDifficulty = (playerShipLevel - 1) * 5 + Math.max(1, currentWave * 0.075);
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
