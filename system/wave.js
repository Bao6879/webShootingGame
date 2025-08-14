/*
    wave.js

    Manages wave spawning mechanic
*/
let waveSpawnCounter = 0,
    waveSpawnDelay = 500,
    enemySpawnDelay = 30,
    enemySpawnCounter = 0,
    currentWave = 0,
    currentWaveTotalPower = 0,
    spawnCounter = 0;

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
