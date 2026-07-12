export function createJoystick(size = 100, dir) {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.width = size + 'px';
    container.style.height = size + 'px';
    container.style.border = '2px solid #666';
    container.style.borderRadius = '50%';
    container.style.touchAction = 'none';
    container.style.bottom = '10%';
    container.style[dir] = '80px';
    const thumb = document.createElement('div');
    const thumbSize = size / 3;
    thumb.style.position = 'absolute';
    thumb.style.width = thumbSize + 'px';
    thumb.style.height = thumbSize + 'px';
    thumb.style.background = '#333';
    thumb.style.borderRadius = '50%';
    thumb.style.top = (size - thumbSize) / 2 + 'px';
    thumb.style.left = (size - thumbSize) / 2 + 'px';
    thumb.style.touchAction = 'none';
    container.appendChild(thumb);

    let dragging = false;

    // เก็บสถานะตำแหน่ง input ที่ normalized แล้ว
    const input = { x: 0, y: 0 };

    function clampToCircle(x, y, radius) {
        const len = Math.sqrt(x * x + y * y);
        if (len > radius) {
            const scale = radius / len;
            return { x: x * scale, y: y * scale };
        }
        return { x, y };
    }

    function updateThumb(x, y) {
        const half = size / 2;
        const maxRadius = half - thumbSize / 2;
        const clamped = clampToCircle(x, y, maxRadius);

        thumb.style.left = clamped.x + half - thumbSize / 2 + 'px';
        thumb.style.top = clamped.y + half - thumbSize / 2 + 'px';

        input.x = clamped.x / maxRadius;
        input.y = clamped.y / maxRadius;
    }

    function resetThumb() {
        updateThumb(0, 0);
    }

    function onPointerDown(e) {
        dragging = true;
        container.setPointerCapture(e.pointerId);
        onPointerMove(e);
    }
    function onPointerMove(e) {
        if (!dragging) return;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        updateThumb(x, y);
    }
    function onPointerUp(e) {
        dragging = false;
        input.x = 0; input.y = 0;
        container.releasePointerCapture(e.pointerId);
        resetThumb();
    }

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
    container.addEventListener('pointerleave', onPointerUp);

    resetThumb();
    input.yaw = 0;

    return {
        div: container,
        input,
        getInput() {
            return { ...input };
        }
    };
}
