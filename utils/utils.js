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
