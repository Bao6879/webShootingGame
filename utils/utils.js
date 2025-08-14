/*
    utils.js

    Utility functions, manages audio
*/
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const gainNode = audioCtx.createGain();
gainNode.connect(audioCtx.destination);

function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}

function updateFPS() {
    const now = performance.now();
    const delta = (now - lastCalled) / 1000;
    lastCalled = now;
    fps = 1 / delta;
}

function playBGM(url, volume = 0.5) {
    fetch(url)
        .then((r) => r.arrayBuffer())
        .then((b) => audioCtx.decodeAudioData(b))
        .then((buffer) => {
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            source.connect(gainNode);
            gainNode.gain.value = volume;
            source.start(0);
        });
}

function playSFX(url, volume = 1.0) {
    fetch(url)
        .then((r) => r.arrayBuffer())
        .then((b) => audioCtx.decodeAudioData(b))
        .then((buffer) => {
            const sfxGain = audioCtx.createGain();
            sfxGain.gain.value = volume;
            sfxGain.connect(audioCtx.destination);

            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(sfxGain);
            source.start(0);
        });
}
